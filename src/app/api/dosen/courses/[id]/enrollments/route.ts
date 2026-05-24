import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { Role } from '@prisma/client';

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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const lecturer = await checkLecturer(request);
    if (!lecturer) {
      return NextResponse.json({ error: 'Unauthorized. Khusus Dosen.' }, { status: 401 });
    }

    const { id } = await params;

    // Check if course exists and belongs to this lecturer
    const course = await prisma.course.findFirst({
      where: {
        id,
        lecturerId: lecturer.id,
      },
    });

    if (!course) {
      return NextResponse.json({ error: 'Mata kuliah tidak ditemukan atau Anda bukan pengampunya.' }, { status: 404 });
    }

    // Get current enrollments
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId: id },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            semester: true,
          },
        },
      },
      orderBy: {
        student: {
          name: 'asc',
        },
      },
    });

    return NextResponse.json({
      course,
      enrolled: enrollments.map((e) => ({
        id: e.id,
        studentId: e.studentId,
        student: e.student,
      })),
    });

  } catch (error: any) {
    console.error('Error fetching lecturer course enrollments:', error);
    return NextResponse.json({ error: 'Gagal mengambil data pendaftaran.' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
