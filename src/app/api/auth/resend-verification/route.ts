import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';
import { sendEmail } from '@/lib/email';
import { getVerificationHtml } from '@/lib/email-templates';

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

    // Generic secure message to prevent user enumeration
    const genericSuccess = {
      message: 'Jika email Anda terdaftar dan belum terverifikasi, tautan verifikasi baru telah dikirimkan ke email Anda.',
    };

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Return safe generic response
      return NextResponse.json(genericSuccess);
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Akun dengan email ini sudah terverifikasi sebelumnya. Silakan login langsung.' },
        { status: 400 }
      );
    }

    // Generate new stateful token (expires in 24 hours)
    const token = Date.now().toString(36) + '_' + crypto.randomBytes(16).toString('hex');

    // Save new verification token to database
    await prisma.user.update({
      where: { id: user.id },
      data: { verificationToken: token },
    });

    // Create verification URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const verificationUrl = `${appUrl}/api/auth/verify-email?token=${token}`;

    // Send verification email (non-blocking)
    try {
      await sendEmail({
        to: email,
        subject: '[TugasKu Portal] Verifikasi Alamat Email Anda',
        html: getVerificationHtml({
          verificationUrl,
          name: user.name,
        }),
      });
    } catch (emailError) {
      console.error('Gagal mengirim email verifikasi ulang:', emailError);
    }

    return NextResponse.json(genericSuccess);
  } catch (error: any) {
    console.error('Error pada API resend-verification:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server saat mengirim ulang tautan verifikasi.' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
