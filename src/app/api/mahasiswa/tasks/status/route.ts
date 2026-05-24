import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { Role, TaskStatus } from '@prisma/client';

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

    const { taskId, status } = await request.json();

    if (!taskId || !status) {
      return NextResponse.json({ error: 'Task ID dan Status wajib diisi.' }, { status: 400 });
    }

    if (!Object.values(TaskStatus).includes(status as TaskStatus)) {
      return NextResponse.json({ error: 'Status tugas tidak valid.' }, { status: 400 });
    }

    // Check if task exists and student is enrolled in the task's course
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { course: true },
    });

    if (!task) {
      return NextResponse.json({ error: 'Tugas tidak ditemukan.' }, { status: 404 });
    }

    const enrollment = await prisma.enrollment.findFirst({
      where: {
        studentId: student.id,
        courseId: task.courseId,
        status: 'AKTIF',
      },
    });

    if (!enrollment) {
      return NextResponse.json({ error: 'Anda tidak terdaftar aktif di mata kuliah ini.' }, { status: 403 });
    }

    // Check if submission record already exists
    const existingSubmission = await prisma.submission.findFirst({
      where: {
        taskId,
        studentId: student.id,
      },
    });

    let submission;

    if (existingSubmission) {
      // Update existing submission status
      submission = await prisma.submission.update({
        where: { id: existingSubmission.id },
        data: { status: status as TaskStatus },
      });
    } else {
      // Create new submission record with empty fileUrl to comply with DB constraints
      submission = await prisma.submission.create({
        data: {
          taskId,
          studentId: student.id,
          fileUrl: '', // Initial empty URL representing no file yet
          status: status as TaskStatus,
        },
      });
    }

    return NextResponse.json({
      message: 'Status tugas berhasil diperbarui.',
      submission,
    });
  } catch (error: any) {
    console.error('Error updating task status:', error);
    return NextResponse.json({ error: 'Gagal memperbarui status tugas.' }, { status: 500 });
  }
}
export const dynamic = 'force-dynamic';
