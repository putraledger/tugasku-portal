import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { Role, TaskStatus, EnrollmentStatus } from '@prisma/client';

async function checkStudent(request: Request) {
  const token = request.headers.get('cookie')
    ?.split('; ')
    .find((row) => row.startsWith('token='))
    ?.split('=')[1];

  if (!token) return null;
  const decoded = verifyToken(token);
  if (!decoded || decoded.role !== Role.MAHASISWA) return null;
  return decoded;
}

export async function POST(request: Request) {
  try {
    const student = await checkStudent(request);
    if (!student) {
      return NextResponse.json({ error: 'Unauthorized. Khusus Mahasiswa.' }, { status: 401 });
    }

    const { taskId, fileUrl } = await request.json();

    if (!taskId || !fileUrl) {
      return NextResponse.json({ error: 'Task ID dan Tautan Berkas wajib diisi.' }, { status: 400 });
    }

    // Check if task exists
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { course: true },
    });

    if (!task) {
      return NextResponse.json({ error: 'Tugas tidak ditemukan.' }, { status: 404 });
    }

    // Verify student is enrolled (either active or archived, though active is standard for submissions)
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        studentId: student.id,
        courseId: task.courseId,
      },
    });

    if (!enrollment) {
      return NextResponse.json({ error: 'Anda tidak terdaftar dalam kelas mata kuliah ini.' }, { status: 403 });
    }

    // Check if submission already exists
    const existingSubmission = await prisma.submission.findFirst({
      where: {
        taskId,
        studentId: student.id,
      },
    });

    let submission;

    if (existingSubmission) {
      // If already graded, prevent resubmission unless they contact lecturer (or we can just overwrite, but let's keep it safe)
      if (existingSubmission.grade !== null) {
        return NextResponse.json(
          { error: 'Tugas Anda sudah dinilai oleh dosen pengampu dan tidak dapat diunggah ulang.' },
          { status: 400 }
        );
      }

      // Update existing submission
      submission = await prisma.submission.update({
        where: { id: existingSubmission.id },
        data: {
          fileUrl,
          status: TaskStatus.SELESAI,
          submittedAt: new Date(),
        },
      });
    } else {
      // Create new submission record
      submission = await prisma.submission.create({
        data: {
          taskId,
          studentId: student.id,
          fileUrl,
          status: TaskStatus.SELESAI,
          submittedAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      message: 'Berkas tugas berhasil dikumpulkan.',
      submission,
    });
  } catch (error: any) {
    console.error('Error during student task submission:', error);
    return NextResponse.json({ error: 'Gagal mengumpulkan berkas tugas.' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const student = await checkStudent(request);
    if (!student) {
      return NextResponse.json({ error: 'Unauthorized. Khusus Mahasiswa.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');

    if (!taskId) {
      return NextResponse.json({ error: 'Task ID wajib disertakan.' }, { status: 400 });
    }

    // Fetch task along with student's specific submission
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        course: {
          include: {
            lecturer: {
              select: { name: true, email: true },
            },
          },
        },
      },
    });

    if (!task) {
      return NextResponse.json({ error: 'Tugas tidak ditemukan.' }, { status: 404 });
    }

    const submission = await prisma.submission.findFirst({
      where: {
        taskId,
        studentId: student.id,
      },
    });

    return NextResponse.json({
      task,
      submission,
    });
  } catch (error: any) {
    console.error('Error fetching student task detail:', error);
    return NextResponse.json({ error: 'Gagal mengambil detail tugas.' }, { status: 500 });
  }
}
export const dynamic = 'force-dynamic';
