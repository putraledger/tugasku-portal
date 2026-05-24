'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, ArrowRight, Shield, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

function ResendVerificationForm() {
  const searchParams = useSearchParams();
  const defaultEmail = searchParams.get('email') || '';
  const isUnverifiedRedirect = searchParams.get('unverified') === 'true';

  const [email, setEmail] = useState(defaultEmail);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(data.message || 'Tautan verifikasi baru berhasil dikirim.');
        setEmail('');
      } else {
        setError(data.error || 'Gagal mengirim ulang tautan verifikasi.');
      }
    } catch (err) {
      console.error('Resend verification error:', err);
      setError('Terjadi kesalahan koneksi ke server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 shadow-2xl space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-white">Verifikasi Email</h2>
        <p className="text-xs text-slate-400">
          Masukkan email mahasiswa Anda untuk menerima ulang tautan aktivasi akun TugasKu.
        </p>
      </div>

      {isUnverifiedRedirect && !success && !error && (
        <div className="flex items-start space-x-2 bg-amber-950/20 border border-amber-900/40 p-3.5 rounded-xl text-xs text-amber-400">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>Akses Ditolak: Email Anda belum terverifikasi. Silakan periksa email Anda atau masukkan alamat email di bawah ini untuk mengirim ulang tautan verifikasi.</span>
        </div>
      )}

      {error && (
        <div className="flex items-start space-x-2 bg-red-950/20 border border-red-900/40 p-3.5 rounded-xl text-xs text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success ? (
        <div className="space-y-4">
          <div className="flex items-start space-x-2 bg-emerald-950/20 border border-emerald-900/40 p-3.5 rounded-xl text-xs text-emerald-400">
            <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
          <Link
            href="/login"
            className="w-full flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3.5 px-4 rounded-xl text-sm transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Halaman Login</span>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Terdaftar</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500/80 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none transition-all duration-300 shadow-inner"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-semibold py-3.5 px-4 rounded-xl text-sm transition-all duration-300 shadow-lg shadow-indigo-500/20 disabled:opacity-50 select-none cursor-pointer"
          >
            <span>{loading ? 'Mengirim...' : 'Kirim Ulang Email Aktivasi'}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>

          {/* Back to Login */}
          <div className="text-center mt-2">
            <Link href="/login" className="inline-flex items-center space-x-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors font-medium">
              <ArrowLeft className="w-3 h-3" />
              <span>Kembali ke Login</span>
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}

export default function ResendVerificationPage() {
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

        {/* Suspense Wrapper to prevent Next.js build errors for useSearchParams */}
        <Suspense fallback={
          <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 shadow-2xl text-center text-slate-400 text-sm">
            Memuat formulir verifikasi...
          </div>
        }>
          <ResendVerificationForm />
        </Suspense>

        {/* Footnote */}
        <p className="text-center text-xs text-slate-500 mt-6">
          © 2026 TugasKu. Hak Cipta Dilindungi.
        </p>
      </div>
    </div>
  );
}
