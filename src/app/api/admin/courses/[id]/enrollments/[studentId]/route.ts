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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string, studentId: string }> }
) {
  try {
    const admin = await checkAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized. Khusus Admin.' }, { status: 401 });
    }

    const { id: courseId, studentId } = await params;

    // Check if enrollment exists
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        courseId,
        studentId,
      },
    });

    if (!enrollment) {
      return NextResponse.json({ error: 'Data pendaftaran mahasiswa tidak ditemukan.' }, { status: 404 });
    }

    // Delete enrollment
    await prisma.enrollment.delete({
      where: { id: enrollment.id },
    });

    return NextResponse.json({
      message: 'Mahasiswa berhasil dihapus dari daftar mata kuliah.',
    });

  } catch (error: any) {
    console.error('Error deleting student enrollment:', error);
    return NextResponse.json({ error: 'Gagal menghapus mahasiswa dari mata kuliah.' }, { status: 500 });
  }
}
export const dynamic = 'force-dynamic';
