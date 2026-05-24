import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { Role } from '@prisma/client';
import { sendEmail } from '@/lib/email';
import { getTaskNotificationHtml } from '@/lib/email-templates';

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

export async function POST(request: Request) {
  try {
    const lecturer = await checkLecturer(request);
    if (!lecturer) {
      return NextResponse.json({ error: 'Unauthorized. Khusus Dosen.' }, { status: 401 });
    }

    const { title, description, deadline, courseId } = await request.json();

    if (!title || !description || !deadline || !courseId) {
      return NextResponse.json({ error: 'Semua field tugas wajib diisi.' }, { status: 400 });
    }

    // Verify course belongs to lecturer
    const course = await prisma.course.findFirst({
      where: { id: courseId, lecturerId: lecturer.id },
    });

    if (!course) {
      return NextResponse.json({ error: 'Mata kuliah tidak ditemukan atau Anda tidak mengampu kelas ini.' }, { status: 403 });
    }

    // Create Task
    const task = await prisma.task.create({
      data: {
        title,
        description,
        deadline: new Date(deadline),
        courseId,
      },
    });

    // Kirim notifikasi email ke mahasiswa aktif yang mengambil kelas tsb
    try {
      const enrollments = await prisma.enrollment.findMany({
        where: {
          courseId,
          status: 'AKTIF',
        },
        include: {
          student: true,
        },
      });

      const studentEmails = enrollments
        .map((e) => e.student.email)
        .filter((email): email is string => !!email);

      if (studentEmails.length > 0) {
        const formattedDeadline = new Date(task.deadline).toLocaleDateString('id-ID', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }) + ' WIB';

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const taskUrl = `${appUrl}/dashboard/mahasiswa/tugas/${task.id}`;

        await sendEmail({
          to: studentEmails,
          subject: `[Tugas Baru] ${course.code} - ${task.title}`,
          html: getTaskNotificationHtml({
            courseName: course.name,
            courseCode: course.code,
            taskTitle: task.title,
            description: task.description,
            deadline: formattedDeadline,
            taskUrl,
          }),
        });
      }
    } catch (emailError) {
      // Jika kirim email gagal, log error tapi jangan menggagalkan respons sukses pembuatan tugas
      console.error('Gagal mengirim email notifikasi tugas baru:', emailError);
    }

    return NextResponse.json({
      message: 'Tugas berhasil dibuat.',
      task,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Gagal membuat tugas baru.' }, { status: 500 });
  }
}


export async function GET(request: Request) {
  try {
    const lecturer = await checkLecturer(request);
    if (!lecturer) {
      return NextResponse.json({ error: 'Unauthorized. Khusus Dosen.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID wajib disertakan.' }, { status: 400 });
    }

    // Verify course belongs to lecturer
    const course = await prisma.course.findFirst({
      where: { id: courseId, lecturerId: lecturer.id },
    });

    if (!course) {
      return NextResponse.json({ error: 'Mata kuliah tidak ditemukan.' }, { status: 403 });
    }

    const tasks = await prisma.task.findMany({
      where: { courseId },
      include: {
        _count: {
          select: { submissions: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(tasks);
  } catch (error: any) {
    console.error('Error fetching course tasks:', error);
    return NextResponse.json({ error: 'Gagal mengambil daftar tugas.' }, { status: 500 });
  }
}
export const dynamic = 'force-dynamic';
