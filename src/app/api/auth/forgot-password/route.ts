import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';
import { sendEmail } from '@/lib/email';
import { getPasswordResetHtml } from '@/lib/email-templates';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email wajib diisi.' },
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

    // Generic response message for security (prevents user enumeration)
    const successResponse = {
      message: 'Jika email Anda terdaftar dalam sistem kami, instruksi untuk mengatur ulang kata sandi telah dikirimkan ke email Anda.',
    };

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Just return success silently for security
      return NextResponse.json(successResponse);
    }

    // Generate secure random token
    const token = crypto.randomBytes(32).toString('hex');
    // Set expiry date: 1 hour from now
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    // Save token to database
    await prisma.passwordReset.create({
      data: {
        email,
        token,
        expiresAt,
      },
    });

    // Create reset URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetUrl = `${appUrl}/reset-password?token=${token}`;

    // Send email notification (non-blocking)
    try {
      await sendEmail({
        to: email,
        subject: '[StudyPulse] Permintaan Atur Ulang Kata Sandi',
        html: getPasswordResetHtml({
          resetUrl,
          name: user.name,
        }),
      });
    } catch (emailError) {
      console.error('Gagal mengirim email reset password:', emailError);
      // We still return success because the database token was generated and they can retry, or it's a transient failure
    }

    return NextResponse.json(successResponse);
  } catch (error: any) {
    console.error('Error pada API forgot-password:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server saat memproses permintaan.' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
