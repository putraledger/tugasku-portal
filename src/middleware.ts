import { NextResponse, NextRequest } from 'next/server';

// Edge-safe JWT payload decoder
function decodeJwt(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const tokenCookie = request.cookies.get('token');
  const token = tokenCookie?.value;

  // Let public files and API calls pass
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/uploads')
  ) {
    return NextResponse.next();
  }

  const user = token ? decodeJwt(token) : null;

  // 1. If not logged in and accessing dashboard
  if (pathname.startsWith('/dashboard')) {
    if (!user) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Blokir akses jika email belum terverifikasi (kecuali Admin/Dosen)
    const role = user.role?.toUpperCase();
    const isExempt = role === 'ADMIN' || role === 'DOSEN';
    if (!isExempt && !user.emailVerified) {
      const unverifiedUrl = new URL('/resend-verification?unverified=true', request.url);
      if (user.email) {
        unverifiedUrl.searchParams.set('email', user.email);
      }
      return NextResponse.redirect(unverifiedUrl);
    }

    // Role-based path access control
    if (pathname.startsWith('/dashboard/admin') && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    if (pathname.startsWith('/dashboard/dosen') && role !== 'DOSEN') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    if (pathname.startsWith('/dashboard/mahasiswa') && role !== 'MAHASISWA') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Direct dashboard path routing based on Role
    if (pathname === '/dashboard') {
      if (role === 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard/admin', request.url));
      } else if (role === 'DOSEN') {
        return NextResponse.redirect(new URL('/dashboard/dosen', request.url));
      } else if (role === 'MAHASISWA') {
        return NextResponse.redirect(new URL('/dashboard/mahasiswa', request.url));
      }
    }
  }

  // 2. If logged in and accessing auth pages (login/register)
  if (pathname === '/login' || pathname === '/register' || pathname === '/') {
    if (user) {
      const role = user.role?.toUpperCase();
      if (role === 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard/admin', request.url));
      } else if (role === 'DOSEN') {
        return NextResponse.redirect(new URL('/dashboard/dosen', request.url));
      } else if (role === 'MAHASISWA') {
        return NextResponse.redirect(new URL('/dashboard/mahasiswa', request.url));
      }
    } else if (pathname === '/') {
      // Unauthenticated root redirects to login
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|uploads).*)'],
};
