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

export async function GET(request: Request) {
  try {
    const lecturer = await checkLecturer(request);
    if (!lecturer) {
      return NextResponse.json({ error: 'Unauthorized. Khusus Dosen.' }, { status: 401 });
    }

    const courses = await prisma.course.findMany({
      where: { lecturerId: lecturer.id },
      include: {
        _count: {
          select: { tasks: true, enrollments: true },
        },
      },
      orderBy: { semester: 'asc' },
    });

    return NextResponse.json(courses);
  } catch (error: any) {
    console.error('Error fetching lecturer courses:', error);
    return NextResponse.json({ error: 'Gagal mengambil data kelas.' }, { status: 500 });
  }
}
export const dynamic = 'force-dynamic';
