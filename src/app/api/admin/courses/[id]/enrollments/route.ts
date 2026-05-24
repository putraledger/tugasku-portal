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

export async function GET(
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
    });

    if (!course) {
      return NextResponse.json({ error: 'Mata kuliah tidak ditemukan.' }, { status: 404 });
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

    // Get all students to populate the dropdown selection
    const allStudents = await prisma.user.findMany({
      where: { role: Role.MAHASISWA },
      select: {
        id: true,
        name: true,
        email: true,
        semester: true,
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({
      course,
      enrolled: enrollments,
      allStudents,
    });

  } catch (error: any) {
    console.error('Error fetching course enrollments:', error);
    return NextResponse.json({ error: 'Gagal mengambil data pendaftaran.' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await checkAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized. Khusus Admin.' }, { status: 401 });
    }

    const { id } = await params;
    const { studentId } = await request.json();

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID wajib ditentukan.' }, { status: 400 });
    }

    // Check course
    const course = await prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      return NextResponse.json({ error: 'Mata kuliah tidak ditemukan.' }, { status: 404 });
    }

    // Check student
    const student = await prisma.user.findUnique({
      where: { id: studentId },
    });

    if (!student || student.role !== Role.MAHASISWA) {
      return NextResponse.json({ error: 'Pengguna harus merupakan MAHASISWA aktif.' }, { status: 400 });
    }

    // Check if enrollment already exists
    const existingEnrollment = await prisma.enrollment.findFirst({
      where: {
        courseId: id,
        studentId,
      },
    });

    if (existingEnrollment) {
      if (existingEnrollment.status === EnrollmentStatus.AKTIF) {
        return NextResponse.json({ error: 'Mahasiswa sudah aktif terdaftar di kelas ini.' }, { status: 400 });
      }

      // If enrollment existed but was archived/lulus, reactivate it!
      const updated = await prisma.enrollment.update({
        where: { id: existingEnrollment.id },
        data: { status: EnrollmentStatus.AKTIF },
        include: {
          student: {
            select: { id: true, name: true, email: true, semester: true },
          },
        },
      });

      return NextResponse.json({
        message: 'Pendaftaran mahasiswa diaktifkan kembali.',
        enrollment: updated,
      });
    }

    // Create a new enrollment
    const newEnrollment = await prisma.enrollment.create({
      data: {
        courseId: id,
        studentId,
        status: EnrollmentStatus.AKTIF,
      },
      include: {
        student: {
          select: { id: true, name: true, email: true, semester: true },
        },
      },
    });

    return NextResponse.json({
      message: 'Mahasiswa berhasil didaftarkan ke kelas.',
      enrollment: newEnrollment,
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error enrolling student:', error);
    return NextResponse.json({ error: 'Gagal mendaftarkan mahasiswa.' }, { status: 500 });
  }
}
export const dynamic = 'force-dynamic';
