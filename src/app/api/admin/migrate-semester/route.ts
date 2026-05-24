import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { Role, EnrollmentStatus } from '@prisma/client';

async function checkAdmin(request: Request) {
  const token = request.headers.get('cookie')
    ?.split('; ')
    .find((row) => row.startsWith('token='))
    ?.split('=')[1];

  if (!token) return null;
  const decoded = verifyToken(token);
  if (!decoded || decoded.role !== Role.ADMIN) return null;
  return decoded;
}

export async function POST(request: Request) {
  try {
    const admin = await checkAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized. Khusus Admin.' }, { status: 401 });
    }

    // Fetch all students
    const students = await prisma.user.findMany({
      where: { role: Role.MAHASISWA, semester: { not: null } },
    });

    if (students.length === 0) {
      return NextResponse.json({ message: 'Tidak ada mahasiswa aktif untuk dimigrasikan.' });
    }

    let migratedCount = 0;
    let graduatedCount = 0;

    // We process each student inside a transaction or sequential updates to handle dynamic enrollments
    await prisma.$transaction(async (tx) => {
      for (const student of students) {
        const currentSemester = student.semester as number;

        if (currentSemester < 8) {
          const newSemester = currentSemester + 1;

          // 1. Update student semester
          await tx.user.update({
            where: { id: student.id },
            data: { semester: newSemester },
          });

          // 2. Archive active enrollments for this student (change status to ARCHIVED)
          await tx.enrollment.updateMany({
            where: { studentId: student.id, status: EnrollmentStatus.AKTIF },
            data: { status: EnrollmentStatus.ARCHIVED },
          });

          // 3. Find courses in the new semester and enroll student
          const newCourses = await tx.course.findMany({
            where: { semester: newSemester },
          });

          if (newCourses.length > 0) {
            for (const course of newCourses) {
              await tx.enrollment.create({
                data: {
                  studentId: student.id,
                  courseId: course.id,
                  status: EnrollmentStatus.AKTIF,
                },
              });
            }
          }
          migratedCount++;
        } else {
          // Semester 8 students graduate
          // 1. Update student semester to null (indicating graduated)
          await tx.user.update({
            where: { id: student.id },
            data: { semester: null },
          });

          // 2. Mark active enrollments as LULUS
          await tx.enrollment.updateMany({
            where: { studentId: student.id, status: EnrollmentStatus.AKTIF },
            data: { status: EnrollmentStatus.LULUS },
          });

          graduatedCount++;
        }
      }
    });

    return NextResponse.json({
      message: 'Migrasi semester berhasil diselesaikan.',
      details: {
        totalProcessed: students.length,
        migrated: migratedCount,
        graduated: graduatedCount,
      },
    });
  } catch (error: any) {
    console.error('Error during semester migration:', error);
    return NextResponse.json(
      { error: 'Gagal melakukan migrasi semester: ' + error.message },
      { status: 500 }
    );
  }
}
export const dynamic = 'force-dynamic';
