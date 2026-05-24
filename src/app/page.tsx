'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Loader2 } from 'lucide-react';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // Instantly navigate to dashboard which will automatically trigger middleware checks
    router.push('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center space-y-4 font-sans relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-violet-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center space-y-4 animate-pulse">
        <div className="bg-gradient-to-tr from-indigo-500 to-violet-600 p-4 rounded-3xl text-white shadow-xl shadow-indigo-500/20">
          <Shield className="w-10 h-10" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            TugasKu Portal
          </h1>
          <p className="text-xs text-indigo-400 font-medium mt-1">Mengalihkan ke Dashboard...</p>
        </div>
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500 mt-4" />
      </div>
    </div>
  );
}
