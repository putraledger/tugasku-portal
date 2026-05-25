'use client';

import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle, ArrowRight } from 'lucide-react';

export default function VerifySuccessPage() {
  return (
    <div className="relative min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4 overflow-hidden font-sans">
      {/* Background Decorative Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-violet-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <div className="relative w-full max-w-md z-10 animate-slideUp">
        
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

        {/* Card Content */}
        <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-8 shadow-2xl space-y-6 text-center">
          <div className="inline-flex bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-full text-emerald-650 dark:text-emerald-400 mb-2 animate-bounce-success">
            <CheckCircle className="w-12 h-12" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Aktivasi Berhasil!</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Email Anda telah berhasil diverifikasi. Akun StudyPulse Anda sekarang telah aktif sepenuhnya dan siap digunakan untuk mengelola tugas perkuliahan Anda.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/login"
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-semibold py-3.5 px-4 rounded-xl text-sm transition-all duration-300 shadow-lg shadow-indigo-500/20 select-none cursor-pointer"
            >
              <span>Masuk ke Dasbor</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Footnote */}
        <p className="text-center text-[10px] text-slate-400 dark:text-slate-500 mt-8">
          © 2026 StudyPulse. Hak Cipta Dilindungi.
        </p>
      </div>
    </div>
  );
}
