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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await checkAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized. Khusus Admin.' }, { status: 401 });
    }

    const { id } = await params;
    const { code, name, semester, lecturerId } = await request.json();

    if (!code || !name || !semester || !lecturerId) {
      return NextResponse.json({ error: 'Semua field wajib diisi.' }, { status: 400 });
    }

    // Validate semester (1-8)
    const parsedSemester = parseInt(semester.toString());
    if (isNaN(parsedSemester) || parsedSemester < 1 || parsedSemester > 8) {
      return NextResponse.json({ error: 'Semester harus berupa angka antara 1 sampai 8.' }, { status: 400 });
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      return NextResponse.json({ error: 'Mata kuliah tidak ditemukan.' }, { status: 404 });
    }

    // Check if new course code is already registered by another course
    if (code !== course.code) {
      const duplicateCode = await prisma.course.findUnique({
        where: { code },
      });
      if (duplicateCode) {
        return NextResponse.json({ error: `Mata kuliah dengan kode ${code} sudah terdaftar.` }, { status: 400 });
      }
    }

    // Validate lecturer role
    const lecturer = await prisma.user.findUnique({
      where: { id: lecturerId },
    });

    if (!lecturer || lecturer.role !== Role.DOSEN) {
      return NextResponse.json({ error: 'Pengguna yang dipilih harus berperan sebagai DOSEN.' }, { status: 400 });
    }

    // Update course
    const updatedCourse = await prisma.course.update({
      where: { id },
      data: {
        code,
        name,
        semester: parsedSemester,
        lecturerId,
      },
    });

    return NextResponse.json({
      message: 'Mata kuliah berhasil diperbarui.',
      course: updatedCourse,
    });

  } catch (error: any) {
    console.error('Error updating course:', error);
    return NextResponse.json({ error: 'Gagal memperbarui mata kuliah.' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await checkAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized. Khusus Admin.' }, { status: 401 });
    }

    const { id } = await params;

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            tasks: true,
            enrollments: true,
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: 'Mata kuliah tidak ditemukan.' }, { status: 404 });
    }

    // Critical Validation: prevent deletion if active relationships exist
    const hasTasks = course._count.tasks > 0;
    const hasEnrollments = course._count.enrollments > 0;

    if (hasTasks || hasEnrollments) {
      return NextResponse.json({
        error: `Mata kuliah tidak dapat dihapus karena memiliki ${course._count.tasks} tugas terikat dan ${course._count.enrollments} mahasiswa terdaftar. Silakan kosongkan kelas terlebih dahulu.`,
      }, { status: 400 });
    }

    // Delete course
    await prisma.course.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'Mata kuliah berhasil dihapus.',
    });

  } catch (error: any) {
    console.error('Error deleting course:', error);
    return NextResponse.json({ error: 'Gagal menghapus mata kuliah.' }, { status: 500 });
  }
}
export const dynamic = 'force-dynamic';
