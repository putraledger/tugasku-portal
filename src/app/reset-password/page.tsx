'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Eye, EyeOff, ArrowRight, Shield, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';


function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!token) {
      setError('Token atur ulang kata sandi tidak ditemukan di URL.');
      return;
    }

    if (password.length < 6) {
      setError('Kata sandi minimal harus 6 karakter.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(data.message || 'Kata sandi berhasil diperbarui.');
      } else {
        setError(data.error || 'Gagal mereset kata sandi.');
      }
    } catch (err) {
      console.error('Reset password error:', err);
      setError('Terjadi kesalahan koneksi ke server.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 shadow-2xl space-y-6 text-center">
        <div className="inline-flex bg-red-950/20 border border-red-900/40 p-4 rounded-full text-red-500 mb-2">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Tautan Tidak Valid</h2>
        <p className="text-sm text-slate-400">
          Tautan atur ulang kata sandi tidak valid atau tidak memiliki token. Silakan ajukan ulang permintaan lupa password.
        </p>
        <div className="pt-2">
          <a
            href="/forgot-password"
            className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-semibold py-3.5 px-4 rounded-xl text-sm transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Minta Tautan Baru</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 shadow-2xl space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-white">Buat Sandi Baru</h2>
        <p className="text-xs text-slate-400">Masukkan kata sandi baru Anda yang aman (minimal 6 karakter).</p>
      </div>

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
          <a
            href="/login"
            className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-semibold py-3.5 px-4 rounded-xl text-sm transition-all duration-300"
          >
            <span>Masuk Sekarang</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Password Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Kata Sandi Baru</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Kata sandi baru..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500/80 rounded-xl py-3 pl-11 pr-12 text-sm text-slate-200 placeholder-slate-600 focus:outline-none transition-all duration-300 shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Konfirmasi Kata Sandi</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Ketik ulang kata sandi..."
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500/80 rounded-xl py-3 pl-11 pr-12 text-sm text-slate-200 placeholder-slate-600 focus:outline-none transition-all duration-300 shadow-inner"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-semibold py-3.5 px-4 rounded-xl text-sm transition-all duration-300 shadow-lg shadow-indigo-500/20 disabled:opacity-50 select-none cursor-pointer"
          >
            <span>{loading ? 'Menyimpan...' : 'Perbarui Kata Sandi'}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
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
            Memuat halaman reset sandi...
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>

        {/* Footnote */}
        <p className="text-center text-xs text-slate-500 mt-6">
          © 2026 TugasKu. Hak Cipta Dilindungi.
        </p>
      </div>
    </div>
  );
}
