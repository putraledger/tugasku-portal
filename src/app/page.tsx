'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  GraduationCap, 
  BookOpen, 
  Shield, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  Layers, 
  Calendar,
  Sparkles
} from 'lucide-react';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import { AnimatedButton } from '@/components/ui/AnimatedButton';

export default function LandingPage() {

  const features = [
    {
      icon: <GraduationCap className="w-6 h-6 text-indigo-500" />,
      title: 'Tampilan Mobile Mahasiswa',
      desc: 'Desain khusus mobile-first dengan navigasi bawah yang responsif, progress bar visual, dan Floating Action Button untuk pengumpulan cepat.',
    },
    {
      icon: <BookOpen className="w-6 h-6 text-violet-500" />,
      title: 'Tampilan Dosen Interaktif',
      desc: 'Kelola kelas akademik, buat penugasan baru secara instan, dan lakukan penilaian real-time dalam format tabel yang mudah difilter.',
    },
    {
      icon: <Shield className="w-6 h-6 text-emerald-500" />,
      title: 'Administrator Console',
      desc: 'Dasbor statistik visual terintegrasi dengan migrasi semester massal sekali-klik, serta pengelolaan pengguna & kelas terpusat.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans relative overflow-hidden">
      
      {/* Dynamic Glow Decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[50%] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[50%] bg-violet-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Navigation Header */}
      <nav className="sticky top-0 z-50 bg-slate-900/70 backdrop-blur-md border-b border-slate-800/80 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative w-9 h-9 rounded-xl overflow-hidden shadow-lg border border-indigo-500/20 bg-slate-950 flex items-center justify-center">
            <Image 
              src="/logo.png" 
              alt="StudyPulse Logo" 
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-600 bg-clip-text text-transparent">
              StudyPulse
            </h1>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">Student Task Management</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Link href="/login">
            <AnimatedButton variant="outline" className="px-4 py-2">
              Masuk
            </AnimatedButton>
          </Link>
          <Link href="/register" className="hidden sm:inline-block">
            <AnimatedButton variant="gradient" className="px-4 py-2">
              Daftar
            </AnimatedButton>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 lg:py-28 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        
        {/* Hero Left Content */}
        <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
          
          <div className="inline-flex items-center space-x-2 bg-indigo-500/10 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider animate-fadeIn">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Kini Hadir: Rebrand StudyPulse v2.0</span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-slate-900 dark:text-white">
            Kelola Tugas Kuliah Anda dengan{' '}
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-600 bg-clip-text text-transparent">
              Satu Sentuhan
            </span>
          </h2>

          <p className="text-base md:text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
            StudyPulse adalah platform manajemen tugas akademik modern yang didesain khusus untuk menyelaraskan kebutuhan pengerjaan mahasiswa, kontrol penugasan dosen, serta integrasi sistem administrasi kampus dalam satu portal terpadu.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <Link href="/login" className="w-full sm:w-auto">
              <AnimatedButton variant="gradient" className="w-full sm:w-auto px-8 py-3.5 text-sm flex items-center justify-center space-x-2 shadow-xl shadow-indigo-500/25">
                <span>Mulai Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </AnimatedButton>
            </Link>
            <Link href="/register" className="w-full sm:w-auto">
              <AnimatedButton variant="glass" className="w-full sm:w-auto px-8 py-3.5 text-sm flex items-center justify-center border border-slate-300 dark:border-slate-800">
                Aktivasi Akun Baru
              </AnimatedButton>
            </Link>
          </div>

          <div className="pt-4 grid grid-cols-3 gap-6 max-w-md mx-auto lg:mx-0 text-slate-500 dark:text-slate-400 text-xs">
            <div className="flex items-center space-x-1.5 justify-center lg:justify-start">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="font-medium">Mobile-First</span>
            </div>
            <div className="flex items-center space-x-1.5 justify-center lg:justify-start">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="font-medium">Real-Time</span>
            </div>
            <div className="flex items-center space-x-1.5 justify-center lg:justify-start">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="font-medium">Glassmorphic</span>
            </div>
          </div>
        </div>

        {/* Hero Right Visual */}
        <div className="lg:col-span-5 flex justify-center relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-violet-500/10 dark:from-indigo-500/20 dark:to-violet-500/20 rounded-full blur-[80px] pointer-events-none scale-75" />
          
          {/* Card Showcase Widget */}
          <div className="relative w-full max-w-sm">
            <AnimatedCard delay={150} className="p-6 space-y-6 border border-slate-200/80 dark:border-slate-800/80 shadow-2xl relative bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <span className="text-[10px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-bold px-2 py-0.5 rounded">
                  IF-302
                </span>
                <span className="flex items-center space-x-1 text-[10px] text-red-500 font-bold animate-pulse-deadline bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                  <Clock className="w-3 h-3" />
                  <span>Sisa 2 Jam</span>
                </span>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-bold text-base text-slate-900 dark:text-white">Proyek Akhir Rekayasa Perangkat Lunak</h4>
                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                  Kumpulkan berkas dokumen SRS, diagram arsitektur sistem, dan link demo hosting web dashboard Anda.
                </p>
              </div>

              {/* Progress Bar Mock */}
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-slate-400">Progress Pengerjaan</span>
                  <span className="text-indigo-500">75%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full" style={{ width: '75%' }} />
                </div>
              </div>

              <div className="border-t border-slate-200/80 dark:border-slate-800/80 pt-4 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-medium">Pengajar: Budi Santoso, M.T.</span>
                <span className="text-[10px] font-bold text-indigo-500 flex items-center space-x-0.5">
                  <span>Lembar Tugas</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </AnimatedCard>

            {/* Small Overlay Floating Card */}
            <div className="absolute top-[-30px] right-[-20px] bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl flex items-center space-x-3 hidden sm:flex animate-bounce-success">
              <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h5 className="font-bold text-xs text-white">Tugas Terkumpul</h5>
                <p className="text-[9px] text-slate-400">Nilai: 95/100 (A)</p>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* Features Grid Section */}
      <section className="max-w-7xl mx-auto px-6 py-24 relative z-10 border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
            Sistem Terpadu
          </span>
          <h3 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-3">
            Tiga Hak Akses dalam Satu Platform
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Setiap aktor memiliki halaman antarmuka tersendiri yang dirancang secara khusus untuk meningkatkan fungsionalitas dan kenyamanan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feat, index) => (
            <AnimatedCard 
              key={index} 
              delay={index * 100}
              className="p-8 space-y-4 hover:border-indigo-500/30 dark:hover:border-indigo-500/30 transition-all duration-300"
            >
              <div className="p-3 bg-slate-100 dark:bg-slate-900 rounded-xl inline-block border border-slate-200/60 dark:border-slate-800/60">
                {feat.icon}
              </div>
              <h4 className="font-bold text-lg text-slate-900 dark:text-white">{feat.title}</h4>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                {feat.desc}
              </p>
            </AnimatedCard>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 bg-white/40 dark:bg-slate-950/20 py-8 text-center text-xs text-slate-500 dark:text-slate-400 relative z-10">
        <p>© 2026 StudyPulse - Student Task Management. Hak Cipta Dilindungi.</p>
      </footer>

    </div>
  );
}
