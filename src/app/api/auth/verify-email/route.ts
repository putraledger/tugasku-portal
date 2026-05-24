import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(`${appUrl}/verify-failed?error=missing`);
    }

    // Find the user with matching verification token
    const user = await prisma.user.findUnique({
      where: { verificationToken: token },
    });

    if (!user) {
      return NextResponse.redirect(`${appUrl}/verify-failed?error=invalid`);
    }

    // Decode stateful verification token to check 24-hour expiry
    try {
      const parts = token.split('_');
      if (parts.length !== 2) {
        return NextResponse.redirect(`${appUrl}/verify-failed?error=invalid`);
      }

      const timestampStr = parts[0];
      const createdAt = parseInt(timestampStr, 36);

      if (isNaN(createdAt)) {
        return NextResponse.redirect(`${appUrl}/verify-failed?error=invalid`);
      }

      const now = Date.now();
      const diffMs = now - createdAt;
      const twentyFourHoursMs = 24 * 60 * 60 * 1000;

      if (diffMs > twentyFourHoursMs) {
        return NextResponse.redirect(
          `${appUrl}/verify-failed?error=expired&email=${encodeURIComponent(user.email)}`
        );
      }
    } catch (parseError) {
      console.error('Gagal mem-parse timestamp token verifikasi:', parseError);
      return NextResponse.redirect(`${appUrl}/verify-failed?error=invalid`);
    }

    // Update user: set verified status and clear token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verificationToken: null,
      },
    });

    // Redirect to success screen
    return NextResponse.redirect(`${appUrl}/verify-success`);
  } catch (error: any) {
    console.error('Error pada API verify-email:', error);
    return NextResponse.redirect(`${appUrl}/verify-failed?error=server`);
  }
}

export const dynamic = 'force-dynamic';
