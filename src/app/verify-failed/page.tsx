'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { AlertTriangle, ArrowRight, ArrowLeft } from 'lucide-react';

function VerifyFailedContent() {
  const searchParams = useSearchParams();
  const errorType = searchParams.get('error');
  const email = searchParams.get('email') || '';

  let errorMessage = 'Tautan verifikasi tidak valid, sudah digunakan, atau tidak terdaftar dalam sistem.';
  
  if (errorType === 'expired') {
    errorMessage = 'Tautan verifikasi Anda telah kadaluarsa (melebihi batas waktu 24 jam). Silakan minta tautan baru di bawah ini.';
  } else if (errorType === 'missing') {
    errorMessage = 'Token verifikasi tidak ditemukan dalam URL. Pastikan Anda mengklik tautan penuh yang ada dalam email.';
  }

  const resendUrl = email 
    ? `/resend-verification?email=${encodeURIComponent(email)}`
    : '/resend-verification';

  return (
    <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-8 shadow-2xl space-y-6 text-center animate-slideUp">
      <div className="inline-flex bg-red-500/10 border border-red-500/20 p-4 rounded-full text-red-600 dark:text-red-400 mb-2">
        <AlertTriangle className="w-12 h-12" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Aktivasi Gagal</h2>
        <p className="text-sm text-slate-505 dark:text-slate-400 leading-relaxed">
          {errorMessage}
        </p>
      </div>

      <div className="pt-2 space-y-4">
        <Link
          href={resendUrl}
          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-semibold py-3.5 px-4 rounded-xl text-sm transition-all duration-300 shadow-lg shadow-indigo-500/20 select-none cursor-pointer"
        >
          <span>Kirim Ulang Tautan Aktivasi</span>
          <ArrowRight className="w-4 h-4" />
        </Link>

        <Link
          href="/login"
          className="w-full flex items-center justify-center space-x-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold py-3.5 px-4 rounded-xl text-sm transition-all duration-300"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Login</span>
        </Link>
      </div>
    </div>
  );
}

export default function VerifyFailedPage() {
  return (
    <div className="relative min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4 overflow-hidden font-sans">
      {/* Background Decorative Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-violet-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <div className="relative w-full max-w-md z-10">
        
        {/* Logo and Header */}
        <div className="text-center mb-6 space-y-2">
          <div className="inline-flex relative w-16 h-16 rounded-2xl overflow-hidden shadow-xl border border-indigo-500/20 bg-slate-950 flex items-center justify-center mb-2">
            <Image 
              src="/logo.png" 
              alt="StudyPulse Logo" 
              fill
              className="object-cover"
            />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-650 via-purple-650 to-violet-650 dark:from-white dark:via-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
            StudyPulse
          </h1>
          <p className="text-xs text-slate-500 dark:text-indigo-400 font-semibold uppercase tracking-wider">
            Student Task Management
          </p>
        </div>

        {/* Suspense Boundary for Query Params parsing */}
        <Suspense fallback={
          <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-8 shadow-2xl text-center text-slate-450 text-sm">
            Memproses informasi verifikasi...
          </div>
        }>
          <VerifyFailedContent />
        </Suspense>

        {/* Footnote */}
        <p className="text-center text-[10px] text-slate-400 dark:text-slate-500 mt-8">
          © 2026 StudyPulse. Hak Cipta Dilindungi.
        </p>
      </div>
    </div>
  );
}
