import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { getDeadlineReminderHtml } from '@/lib/email-templates';

export async function GET(request: Request) {
  try {
    const now = new Date();

    // Fetch all active tasks with deadline in the future
    const tasks = await prisma.task.findMany({
      where: {
        deadline: {
          gt: now,
        },
      },
      include: {
        course: true,
      },
    });

    const sentReminders: Array<{ task: string; student: string; daysRemaining: number }> = [];

    for (const task of tasks) {
      // Hitung selisih waktu dalam jam
      const diffHours = (task.deadline.getTime() - now.getTime()) / (1000 * 60 * 60);

      let daysRemaining: 1 | 3 | null = null;
      if (diffHours > 0 && diffHours <= 24) {
        daysRemaining = 1; // H-1
      } else if (diffHours > 48 && diffHours <= 72) {
        daysRemaining = 3; // H-3
      }

      // Jika tidak masuk kriteria H-1 atau H-3, lewati tugas ini
      if (!daysRemaining) continue;

      // Ambil mahasiswa yang terdaftar aktif di kelas bersangkutan
      const enrollments = await prisma.enrollment.findMany({
        where: {
          courseId: task.courseId,
          status: 'AKTIF',
        },
        include: {
          student: true,
        },
      });

      // Ambil mahasiswa yang sudah mengumpulkan tugas ini
      const submissions = await prisma.submission.findMany({
        where: {
          taskId: task.id,
          status: 'SELESAI',
        },
        select: {
          studentId: true,
        },
      });

      const submittedStudentIds = new Set(submissions.map((s) => s.studentId));

      // Filter mahasiswa yang belum mengumpulkan dan memiliki email
      const studentsToRemind = enrollments
        .map((e) => e.student)
        .filter((student) => !submittedStudentIds.has(student.id) && !!student.email);

      if (studentsToRemind.length === 0) continue;

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

      // Kirim email pengingat secara individual agar kegagalan satu email tidak mempengaruhi lainnya
      for (const student of studentsToRemind) {
        try {
          await sendEmail({
            to: student.email,
            subject: `[Pengingat Batas Waktu] ${task.course.code} - ${task.title} (${daysRemaining} Hari Lagi!)`,
            html: getDeadlineReminderHtml({
              courseName: task.course.name,
              courseCode: task.course.code,
              taskTitle: task.title,
              daysRemaining,
              deadline: formattedDeadline,
              taskUrl,
            }),
          });

          sentReminders.push({
            task: task.title,
            student: student.email,
            daysRemaining,
          });
        } catch (emailErr) {
          console.error(`Gagal mengirim pengingat deadline ke ${student.email} untuk tugas ${task.title}:`, emailErr);
        }
      }
    }

    return NextResponse.json({
      message: 'Proses pengiriman pengingat deadline selesai.',
      totalRemindersSent: sentReminders.length,
      sentReminders,
    });
  } catch (error: any) {
    console.error('Error running deadline reminder cron:', error);
    return NextResponse.json(
      { error: 'Gagal menjalankan cron job deadline reminder.', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  return GET(request);
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;
