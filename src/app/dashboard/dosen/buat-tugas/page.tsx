'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft, 
  Calendar, 
  FileText, 
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import { AnimatedButton } from '@/components/ui/AnimatedButton';

interface CourseData {
  id: string;
  code: string;
  name: string;
  semester: number;
}

function BuatTugasForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedCourseId = searchParams.get('courseId') || '';

  const [courses, setCourses] = useState<CourseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [courseId, setCourseId] = useState(preselectedCourseId);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');

  // Status State
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch Courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/dosen/courses');
        if (res.ok) {
          const data = await res.json();
          setCourses(data);
          if (!preselectedCourseId && data.length > 0) {
            setCourseId(data[0].id);
          }
        }
      } catch (err) {
        console.error('Error fetching courses:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [preselectedCourseId]);

  // Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!courseId || !title || !description || !deadline) {
      setError('Seluruh formulir wajib diisi.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/dosen/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          title,
          description,
          deadline,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('Tugas berhasil dibuat! Mengalihkan ke dashboard...');
        setTimeout(() => {
          router.push('/dashboard/dosen');
          router.refresh();
        }, 1500);
      } else {
        setError(data.error || 'Gagal membuat tugas.');
      }
    } catch (err) {
      console.error('Error creating task:', err);
      setError('Terjadi kesalahan pada server.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 max-w-2xl mx-auto shadow-2xl relative overflow-hidden animate-slideUp">
      <div className="absolute right-0 bottom-0 top-0 w-96 bg-gradient-to-l from-indigo-500/5 to-transparent blur-3xl rounded-full -mr-20 pointer-events-none" />
      
      <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
        {/* Status Alerts */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-650 dark:text-red-400 rounded-xl text-xs flex items-center space-x-2.5">
            <AlertCircle className="w-4.5 h-4.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-650 dark:text-emerald-400 rounded-xl text-xs flex items-center space-x-2.5 animate-bounce-success">
            <CheckCircle2 className="w-4.5 h-4.5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Input Course */}
        <div className="space-y-2">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Pilih Mata Kuliah</label>
          {loading ? (
            <div className="h-11 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl animate-pulse" />
          ) : (
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-550 transition-colors cursor-pointer"
            >
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  [{course.code}] {course.name} - Semester {course.semester}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Input Title */}
        <div className="space-y-2">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Judul Tugas</label>
          <input
            type="text"
            placeholder="Contoh: Desain ERD Database Perpustakaan"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-650 focus:outline-none focus:border-indigo-550 transition-colors"
            required
          />
        </div>

        {/* Input Deadline */}
        <div className="space-y-2">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Batas Waktu (Deadline)</label>
          <input
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-550 transition-colors cursor-pointer"
            required
          />
        </div>

        {/* Input Description */}
        <div className="space-y-2">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Instruksi & Deskripsi Tugas</label>
          <textarea
            placeholder="Tuliskan instruksi pengerjaan tugas secara lengkap di sini. Cantumkan kriteria penilaian, format file, dan petunjuk lainnya..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-650 focus:outline-none focus:border-indigo-550 transition-colors resize-none leading-relaxed"
            required
          />
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 bg-gradient-to-r from-indigo-500 to-violet-650 hover:from-indigo-600 hover:to-violet-750 text-white font-bold rounded-xl text-xs transition-all duration-300 shadow-lg shadow-indigo-500/20 disabled:opacity-50 select-none cursor-pointer"
        >
          {submitting ? 'Mempublikasikan...' : 'Publikasikan Tugas Akademik'}
        </button>
      </form>
    </div>
  );
}

export default function BuatTugasPage() {

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans pb-16">
      
      {/* Top Navbar */}
      <nav className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="relative w-8 h-8 rounded-lg overflow-hidden shadow border border-indigo-500/20 bg-slate-950 flex items-center justify-center">
            <Image src="/logo.png" alt="StudyPulse Logo" fill className="object-cover" />
          </div>
          <div>
            <h1 className="text-sm font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-650 bg-clip-text text-transparent">
              StudyPulse
            </h1>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Lecturer Console</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/dashboard/dosen"
            className="flex items-center space-x-1 text-slate-400 hover:text-white transition-colors text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Dasbor</span>
          </Link>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 mt-8 space-y-6">
        <div className="space-y-1 text-center sm:text-left">
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white">Publikasikan Tugas Baru</h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs">Buat lembar evaluasi penugasan akademik dan kirimkan langsung ke seluruh mahasiswa aktif kelas.</p>
        </div>

        <Suspense fallback={
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-2xl mx-auto text-center text-slate-550 text-xs">
            Memuat formulir...
          </div>
        }>
          <BuatTugasForm />
        </Suspense>
      </main>
    </div>
  );
}
