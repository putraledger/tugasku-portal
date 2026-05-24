'use client';

import Link from 'next/link';
import { Shield, CheckCircle, ArrowRight } from 'lucide-react';

export default function VerifySuccessPage() {
  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 overflow-hidden font-sans">
      {/* Background Decorative Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-violet-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Glassmorphic Container */}
      <div className="relative w-full max-w-md z-10">
        
        {/* Logo and Header */}
        <div className="text-center mb-8 space-y-3">
          <div className="inline-flex bg-gradient-to-tr from-indigo-500 to-violet-600 p-3.5 rounded-2xl text-white shadow-xl shadow-indigo-500/20 mb-2">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            TugasKu Portal
          </h1>
          <p className="text-sm text-slate-400 font-medium">
            Sistem Manajemen Tugas Mahasiswa Terintegrasi
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 shadow-2xl space-y-6 text-center">
          <div className="inline-flex bg-emerald-950/20 border border-emerald-900/40 p-4 rounded-full text-emerald-500 mb-2 animate-bounce">
            <CheckCircle className="w-12 h-12" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Verifikasi Berhasil!</h2>
            <p className="text-sm text-slate-400">
              Email Anda telah berhasil diverifikasi. Akun Anda sekarang telah aktif sepenuhnya dan siap digunakan.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/login"
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-semibold py-3.5 px-4 rounded-xl text-sm transition-all duration-300 shadow-lg shadow-indigo-500/20 select-none cursor-pointer"
            >
              <span>Masuk ke Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Footnote */}
        <p className="text-center text-xs text-slate-500 mt-6">
          © 2026 TugasKu. Hak Cipta Dilindungi.
        </p>
      </div>
    </div>
  );
}
