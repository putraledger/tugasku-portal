import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { Role } from '@prisma/client';

// Helper to check admin permission
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

export async function GET(request: Request) {
  try {
    const admin = await checkAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized. Khusus Admin.' }, { status: 401 });
    }

    const courses = await prisma.course.findMany({
      include: {
        lecturer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            tasks: true,
            enrollments: true,
          },
        },
      },
      orderBy: [
        { semester: 'asc' },
        { code: 'asc' },
      ],
    });

    return NextResponse.json(courses);
  } catch (error: any) {
    console.error('Error fetching courses:', error);
    return NextResponse.json({ error: 'Gagal mengambil data mata kuliah.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await checkAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized. Khusus Admin.' }, { status: 401 });
    }

    const { code, name, semester, lecturerId } = await request.json();

    if (!code || !name || !semester || !lecturerId) {
      return NextResponse.json({ error: 'Semua field wajib diisi.' }, { status: 400 });
    }

    // Validate semester (1-8)
    const parsedSemester = parseInt(semester.toString());
    if (isNaN(parsedSemester) || parsedSemester < 1 || parsedSemester > 8) {
      return NextResponse.json({ error: 'Semester harus berupa angka antara 1 sampai 8.' }, { status: 400 });
    }

    // Check if course code is already registered
    const existingCourse = await prisma.course.findUnique({
      where: { code },
    });

    if (existingCourse) {
      return NextResponse.json({ error: `Mata kuliah dengan kode ${code} sudah terdaftar.` }, { status: 400 });
    }

    // Validate lecturer role
    const lecturer = await prisma.user.findUnique({
      where: { id: lecturerId },
    });

    if (!lecturer || lecturer.role !== Role.DOSEN) {
      return NextResponse.json({ error: 'Pengguna yang dipilih harus berperan sebagai DOSEN.' }, { status: 400 });
    }

    // Create course
    const newCourse = await prisma.course.create({
      data: {
        code,
        name,
        semester: parsedSemester,
        lecturerId,
      },
    });

    return NextResponse.json({
      message: 'Mata kuliah berhasil ditambahkan.',
      course: newCourse,
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating course:', error);
    return NextResponse.json({ error: 'Gagal menambahkan mata kuliah.' }, { status: 500 });
  }
}
export const dynamic = 'force-dynamic';
