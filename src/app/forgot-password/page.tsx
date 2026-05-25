'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, ArrowRight, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(data.message || 'Instruksi reset kata sandi telah dikirim.');
        setEmail('');
      } else {
        setError(data.error || 'Gagal memproses permintaan reset kata sandi.');
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      setError('Terjadi kesalahan koneksi ke server.');
    } finally {
      setLoading(false);
    }
  };

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

        {/* Card Form */}
        <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Lupa Kata Sandi?</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Masukkan email terdaftar Anda untuk menerima tautan pengaturan ulang kata sandi.</p>
          </div>

          {error && (
            <div className="flex items-start space-x-2 bg-red-500/10 border border-red-500/20 p-3.5 rounded-xl text-xs text-red-650 dark:text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div className="space-y-4">
              <div className="flex items-start space-x-2 bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-xl text-xs text-emerald-650 dark:text-emerald-450">
                <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{success}</span>
              </div>
              <Link
                href="/login"
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-semibold py-3.5 px-4 rounded-xl text-sm transition-all duration-300 shadow-md shadow-indigo-500/20"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali ke Halaman Login</span>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email Terdaftar</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="name@mahasiswa.ac.id"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:outline-none rounded-xl py-3 pl-11 pr-4 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 transition-all duration-300"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-semibold py-3.5 px-4 rounded-xl text-sm transition-all duration-300 shadow-lg shadow-indigo-500/20 disabled:opacity-50 select-none cursor-pointer"
              >
                <span>{loading ? 'Mengirim...' : 'Kirim Instruksi Reset'}</span>
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>

              {/* Back to Login */}
              <div className="text-center mt-2">
                <Link href="/login" className="inline-flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-450 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors font-semibold">
                  <ArrowLeft className="w-3 h-3" />
                  <span>Kembali ke Login</span>
                </Link>
              </div>
            </form>
          )}
        </div>

        {/* Footnote */}
        <p className="text-center text-[10px] text-slate-400 dark:text-slate-500 mt-8">
          © 2026 StudyPulse. Hak Cipta Dilindungi.
        </p>
      </div>
    </div>
  );
}
