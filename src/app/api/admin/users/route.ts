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

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        semester: true,
        createdAt: true,
      },
      orderBy: [
        { role: 'asc' },
        { name: 'asc' },
      ],
    });

    return NextResponse.json(users);
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Gagal mengambil data pengguna.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const admin = await checkAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized. Khusus Admin.' }, { status: 401 });
    }

    const { userId, role, semester } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID wajib diisi.' }, { status: 400 });
    }

    // Check if role is valid
    if (role && !Object.values(Role).includes(role as Role)) {
      return NextResponse.json({ error: 'Role tidak valid.' }, { status: 400 });
    }

    // Prepare update data
    const updateData: any = {};
    if (role) {
      updateData.role = role as Role;
      if (role !== Role.MAHASISWA) {
        updateData.semester = null; // Clear semester for Dosen/Admin
      }
    }

    if (role === Role.MAHASISWA || (!role && semester !== undefined)) {
      if (semester !== null) {
        const parsedSemester = parseInt(semester.toString());
        if (isNaN(parsedSemester) || parsedSemester < 1 || parsedSemester > 8) {
          return NextResponse.json({ error: 'Semester harus angka 1-8.' }, { status: 400 });
        }
        updateData.semester = parsedSemester;
      } else if (role === Role.MAHASISWA) {
        return NextResponse.json({ error: 'Semester wajib ditentukan untuk Mahasiswa.' }, { status: 400 });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    // If changing role to student or updating semester, auto enroll them in new semester courses
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
        // Check if enrollment already exists
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
        role: updatedUser.role,
        semester: updatedUser.semester,
      },
    });
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Gagal memperbarui data pengguna.' }, { status: 500 });
  }
}
export const dynamic = 'force-dynamic';
