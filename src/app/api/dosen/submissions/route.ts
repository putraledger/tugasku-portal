import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { Role } from '@prisma/client';
import { sendEmail } from '@/lib/email';
import { getGradeNotificationHtml } from '@/lib/email-templates';

async function checkLecturer(request: Request) {
  const token = request.headers.get('cookie')
    ?.split('; ')
    .find((row) => row.startsWith('token='))
    ?.split('=')[1];

  if (!token) return null;
  const decoded = verifyToken(token);
  if (!decoded || decoded.role !== Role.DOSEN) return null;
  return decoded;
}

export async function GET(request: Request) {
  try {
    const lecturer = await checkLecturer(request);
    if (!lecturer) {
      return NextResponse.json({ error: 'Unauthorized. Khusus Dosen.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');

    if (!taskId) {
      return NextResponse.json({ error: 'Task ID wajib disertakan.' }, { status: 400 });
    }

    // Verify task belongs to lecturer's course
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        course: true,
      },
    });

    if (!task || task.course.lecturerId !== lecturer.id) {
      return NextResponse.json({ error: 'Tugas tidak ditemukan atau Anda tidak mengampu kelas ini.' }, { status: 403 });
    }

    // Fetch submissions with student info and enrollment status
    const submissions = await prisma.submission.findMany({
      where: { taskId },
      include: {
        student: {
          include: {
            enrollments: {
              where: { courseId: task.courseId },
            },
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    return NextResponse.json({
      task,
      submissions,
    });
  } catch (error: any) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json({ error: 'Gagal mengambil daftar pengumpulan.' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const lecturer = await checkLecturer(request);
    if (!lecturer) {
      return NextResponse.json({ error: 'Unauthorized. Khusus Dosen.' }, { status: 401 });
    }

    const { submissionId, grade, feedback } = await request.json();

    if (!submissionId) {
      return NextResponse.json({ error: 'Submission ID wajib diisi.' }, { status: 400 });
    }

    if (grade === undefined || grade === null) {
      return NextResponse.json({ error: 'Nilai harus diisi.' }, { status: 400 });
    }

    const parsedGrade = parseInt(grade.toString());
    if (isNaN(parsedGrade) || parsedGrade < 0 || parsedGrade > 100) {
      return NextResponse.json({ error: 'Nilai harus berupa angka antara 0 sampai 100.' }, { status: 400 });
    }

    // Verify submission belongs to lecturer's task
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        task: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!submission || submission.task.course.lecturerId !== lecturer.id) {
      return NextResponse.json({ error: 'Pengumpulan tidak ditemukan atau Anda tidak berwenang menilai.' }, { status: 403 });
    }

    // Update submission and fetch student, task, course and lecturer details
    const updated = await prisma.submission.update({
      where: { id: submissionId },
      data: {
        grade: parsedGrade,
        feedback: feedback || '',
      },
      include: {
        student: true,
        task: {
          include: {
            course: {
              include: {
                lecturer: true,
              },
            },
          },
        },
      },
    });

    // Kirim notifikasi email ke mahasiswa secara non-blocking
    try {
      if (updated.student && updated.student.email) {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const gradeUrl = `${appUrl}/dashboard/mahasiswa/tugas/${updated.taskId}`;

        await sendEmail({
          to: updated.student.email,
          subject: `[Nilai Terbit] ${updated.task.course.code} - ${updated.task.title}`,
          html: getGradeNotificationHtml({
            courseName: updated.task.course.name,
            courseCode: updated.task.course.code,
            taskTitle: updated.task.title,
            grade: updated.grade ?? 0,
            feedback: updated.feedback ?? undefined,
            lecturerName: updated.task.course.lecturer.name,
            gradeUrl,
          }),
        });
      }
    } catch (emailError) {
      // Log kegagalan email tetapi jangan ganggu respons sukses penilaian
      console.error('Gagal mengirim email notifikasi nilai:', emailError);
    }

    return NextResponse.json({
      message: 'Penilaian berhasil disimpan.',
      submission: updated,
    });
  } catch (error: any) {
    console.error('Error grading submission:', error);
    return NextResponse.json({ error: 'Gagal menyimpan penilaian.' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
