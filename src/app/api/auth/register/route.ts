import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Role, EnrollmentStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendEmail } from '@/lib/email';
import { getVerificationHtml } from '@/lib/email-templates';

export async function POST(request: Request) {
  try {
    const { name, email, password, semester } = await request.json();
    const role = Role.MAHASISWA;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Semua field wajib diisi.' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Format email tidak valid.' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar.' },
        { status: 400 }
      );
    }

    // Prepare student semester
    let parsedSemester: number | null = null;
    if (role === Role.MAHASISWA) {
      if (!semester) {
        return NextResponse.json(
          { error: 'Semester berjalan wajib diisi untuk mahasiswa.' },
          { status: 400 }
        );
      }
      parsedSemester = parseInt(semester.toString());
      if (isNaN(parsedSemester) || parsedSemester < 1 || parsedSemester > 8) {
        return NextResponse.json(
          { error: 'Semester harus berupa angka antara 1 sampai 8.' },
          { status: 400 }
        );
      }
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Generate stateful verification token if MAHASISWA
    const isStudent = role === Role.MAHASISWA;
    const token = isStudent
      ? Date.now().toString(36) + '_' + crypto.randomBytes(16).toString('hex')
      : null;

    // Create user in database
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role as Role,
        semester: parsedSemester,
        emailVerified: isStudent ? null : new Date(), // Dosen/Admin auto-verified
        verificationToken: token,
      },
    });

    // Auto-enroll student to existing courses in their semester
    if (role === Role.MAHASISWA && parsedSemester !== null) {
      const activeCourses = await prisma.course.findMany({
        where: { semester: parsedSemester },
      });

      if (activeCourses.length > 0) {
        await prisma.enrollment.createMany({
          data: activeCourses.map((course) => ({
            studentId: user.id,
            courseId: course.id,
            status: EnrollmentStatus.AKTIF,
          })),
        });
      }
    }

    // Send verification email if MAHASISWA
    if (isStudent && token) {
      try {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const verificationUrl = `${appUrl}/api/auth/verify-email?token=${token}`;

        await sendEmail({
          to: email,
          subject: '[StudyPulse] Verifikasi Alamat Email Anda',
          html: getVerificationHtml({
            verificationUrl,
            name,
          }),
        });
      } catch (emailError) {
        console.error('Gagal mengirim email verifikasi:', emailError);
      }
    }

    return NextResponse.json(
      {
        message: isStudent
          ? 'Registrasi berhasil. Silakan periksa kotak masuk email Anda untuk melakukan verifikasi akun sebelum masuk ke portal.'
          : 'Registrasi berhasil. Akun Anda telah aktif, silakan login.',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          semester: user.semester,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error during registration API:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server.' },
      { status: 500 }
    );
  }
}

