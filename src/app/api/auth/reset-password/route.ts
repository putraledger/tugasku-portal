import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import * as bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token dan kata sandi baru wajib disertakan.' },
        { status: 400 }
      );
    }

    // Validate password length (minimum 6 characters)
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Kata sandi baru minimal harus 6 karakter.' },
        { status: 400 }
      );
    }

    // Find the password reset record
    const resetRecord = await prisma.passwordReset.findUnique({
      where: { token },
    });

    if (!resetRecord) {
      return NextResponse.json(
        { error: 'Tautan atur ulang kata sandi tidak valid.' },
        { status: 400 }
      );
    }

    // Check if token has already been used
    if (resetRecord.used) {
      return NextResponse.json(
        { error: 'Tautan ini sudah pernah digunakan sebelumnya.' },
        { status: 400 }
      );
    }

    // Check if token has expired
    const now = new Date();
    if (resetRecord.expiresAt < now) {
      return NextResponse.json(
        { error: 'Tautan atur ulang kata sandi telah kadaluarsa (berlaku hanya 1 jam).' },
        { status: 400 }
      );
    }

    // Find the user associated with this reset email
    const user = await prisma.user.findUnique({
      where: { email: resetRecord.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Pengguna dengan email ini tidak ditemukan dalam sistem.' },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Update user's password and mark the token as used in a transaction
    await prisma.$transaction([
      prisma.user.update({
        where: { email: resetRecord.email },
        data: { password: hashedPassword },
      }),
      prisma.passwordReset.update({
        where: { id: resetRecord.id },
        data: { used: true },
      }),
    ]);

    return NextResponse.json({
      message: 'Kata sandi Anda berhasil diperbarui. Silakan login menggunakan kata sandi baru Anda.',
    });
  } catch (error: any) {
    console.error('Error pada API reset-password:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server saat mereset kata sandi.' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
