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
    const tokenStudent = await checkStudent(request);
    if (!tokenStudent) {
      return NextResponse.json({ error: 'Unauthorized. Khusus Mahasiswa.' }, { status: 401 });
    }

    // Always fetch fresh student profile from database
    const student = await prisma.user.findUnique({
      where: { id: tokenStudent.id },
    });

    if (!student || student.semester === null) {
      return NextResponse.json({ error: 'Data mahasiswa atau semester aktif tidak ditemukan.' }, { status: 404 });
    }

    // Fetch active enrollments for this semester
    const enrollments = await prisma.enrollment.findMany({
      where: {
        studentId: student.id,
        status: EnrollmentStatus.AKTIF,
        course: { semester: student.semester },
      },
      include: {
        course: {
          include: {
            lecturer: {
              select: { name: true, email: true },
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
    });

    // Format tasks and integrate submissions
    const activeTasks: any[] = [];
    const activeCourses = enrollments.map((enroll) => {
      const course = enroll.course;
      
      course.tasks.forEach((task) => {
        const submission = task.submissions[0] || null;
        
        activeTasks.push({
          id: task.id,
          title: task.title,
          description: task.description,
          deadline: task.deadline,
          courseId: course.id,
          courseCode: course.code,
          courseName: course.name,
          lecturerName: course.lecturer.name,
          submission: submission ? {
            id: submission.id,
            status: submission.status,
            fileUrl: submission.fileUrl,
            grade: submission.grade,
            feedback: submission.feedback,
            submittedAt: submission.submittedAt,
          } : {
            id: null,
            status: 'BELUM_DIMULAI',
            fileUrl: '',
            grade: null,
            feedback: null,
            submittedAt: null,
          },
        });
      });

      return {
        id: course.id,
        code: course.code,
        name: course.name,
        lecturerName: course.lecturer.name,
      };
    });

    return NextResponse.json({
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        semester: student.semester,
      },
      courses: activeCourses,
      tasks: activeTasks,
    });
  } catch (error: any) {
    console.error('Error fetching student tasks:', error);
    return NextResponse.json({ error: 'Gagal mengambil data tugas mahasiswa.' }, { status: 500 });
  }
}
export const dynamic = 'force-dynamic';
