import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { Role, EnrollmentStatus } from '@prisma/client';

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
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const admin = await checkAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized. Khusus Admin.' }, { status: 401 });
    }

    const { userId } = await params;
    const { name, email, role, semester } = await request.json();

    if (!name || !email || !role) {
      return NextResponse.json({ error: 'Field Nama, Email, dan Peran wajib diisi.' }, { status: 400 });
    }

    // Validate role
    if (!Object.values(Role).includes(role as Role)) {
      return NextResponse.json({ error: 'Role tidak valid.' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Format email tidak valid.' }, { status: 400 });
    }

    // Check if email already in use by another user
    const existingEmail = await prisma.user.findFirst({
      where: {
        email,
        NOT: { id: userId },
      },
    });

    if (existingEmail) {
      return NextResponse.json({ error: 'Email sudah terdaftar pada pengguna lain.' }, { status: 400 });
    }

    // Prepare update data
    const updateData: any = {
      name,
      email,
      role: role as Role,
    };

    if (role === Role.MAHASISWA) {
      if (semester === undefined || semester === null) {
        return NextResponse.json({ error: 'Semester wajib diisi untuk mahasiswa.' }, { status: 400 });
      }
      const parsedSemester = parseInt(semester.toString());
      if (isNaN(parsedSemester) || parsedSemester < 1 || parsedSemester > 8) {
        return NextResponse.json({ error: 'Semester harus berupa angka antara 1 sampai 8.' }, { status: 400 });
      }
      updateData.semester = parsedSemester;
    } else {
      updateData.semester = null; // Clear semester for Dosen/Admin
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    // Auto-enrollment logic if role is Student and semester is set
    if (updatedUser.role === Role.MAHASISWA && updatedUser.semester !== null) {
      // Archive old active enrollments first
      await prisma.enrollment.updateMany({
        where: {
          studentId: updatedUser.id,
          status: 'AKTIF',
        },
        data: {
          status: 'ARCHIVED',
        },
      });

      // Enroll in the new semester courses
      const courses = await prisma.course.findMany({
        where: { semester: updatedUser.semester },
      });

      for (const course of courses) {
        const existing = await prisma.enrollment.findFirst({
          where: {
            studentId: updatedUser.id,
            courseId: course.id,
          },
        });

        if (!existing) {
          await prisma.enrollment.create({
            data: {
              studentId: updatedUser.id,
              courseId: course.id,
              status: 'AKTIF',
            },
          });
        } else if (existing.status !== 'AKTIF') {
          await prisma.enrollment.update({
            where: { id: existing.id },
            data: { status: 'AKTIF' },
          });
        }
      }
    }

    return NextResponse.json({
      message: 'Data pengguna berhasil diperbarui.',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        semester: updatedUser.semester,
      },
    });

  } catch (error: any) {
    console.error('Error updating user by admin:', error);
    return NextResponse.json({ error: 'Gagal memperbarui data pengguna.' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const admin = await checkAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized. Khusus Admin.' }, { status: 401 });
    }

    const { userId } = await params;

    // Prevent self-deletion
    if (admin.id === userId) {
      return NextResponse.json({ error: 'Anda tidak dapat menghapus akun Anda sendiri.' }, { status: 400 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'Pengguna tidak ditemukan.' }, { status: 404 });
    }

    // Security & Integrity check: verify related records
    const enrollmentsCount = await prisma.enrollment.count({ where: { studentId: userId } });
    const submissionsCount = await prisma.submission.count({ where: { studentId: userId } });
    const coursesCount = await prisma.course.count({ where: { lecturerId: userId } });

    if (enrollmentsCount > 0 || submissionsCount > 0 || coursesCount > 0) {
      return NextResponse.json({
        error: 'Tidak dapat menghapus pengguna karena memiliki data relasi aktif (Pendaftaran Kuliah, Tugas dikumpulkan, atau Kelas yang diampu).'
      }, { status: 400 });
    }

    // Delete user
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({
      message: 'Pengguna berhasil dihapus.',
    });

  } catch (error: any) {
    console.error('Error deleting user by admin:', error);
    return NextResponse.json({ error: 'Gagal menghapus pengguna.' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
