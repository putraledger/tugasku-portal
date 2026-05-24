import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { Role, EnrollmentStatus } from '@prisma/client';

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

export async function GET(request: Request) {
  try {
    const student = await checkStudent(request);
    if (!student) {
      return NextResponse.json({ error: 'Unauthorized. Khusus Mahasiswa.' }, { status: 401 });
    }

    // Fetch archived and completed (LULUS) enrollments
    const enrollments = await prisma.enrollment.findMany({
      where: {
        studentId: student.id,
        status: { in: [EnrollmentStatus.ARCHIVED, EnrollmentStatus.LULUS] },
      },
      include: {
        course: {
          include: {
            lecturer: {
              select: { name: true },
            },
            tasks: {
              include: {
                submissions: {
                  where: { studentId: student.id },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Format output grouped by Semester and Course
    const archivedData = enrollments.map((enroll) => {
      const course = enroll.course;
      
      const courseTasks = course.tasks.map((task) => {
        const submission = task.submissions[0] || null;
        
        return {
          id: task.id,
          title: task.title,
          deadline: task.deadline,
          submission: submission ? {
            id: submission.id,
            fileUrl: submission.fileUrl,
            grade: submission.grade,
            feedback: submission.feedback,
            submittedAt: submission.submittedAt,
          } : null,
        };
      });

      return {
        id: course.id,
        code: course.code,
        name: course.name,
        semester: course.semester,
        lecturerName: course.lecturer.name,
        enrollmentStatus: enroll.status,
        tasks: courseTasks,
      };
    });

    return NextResponse.json(archivedData);
  } catch (error: any) {
    console.error('Error fetching student archives:', error);
    return NextResponse.json({ error: 'Gagal mengambil arsip data.' }, { status: 500 });
  }
}
export const dynamic = 'force-dynamic';
