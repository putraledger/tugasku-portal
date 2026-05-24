'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  BookOpen, 
  ArrowLeft, 
  Calendar, 
  FileText, 
  ClipboardList, 
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

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
          // If no preselected ID but we have courses, select first
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
    <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-2xl mx-auto shadow-2xl relative overflow-hidden">
      <div className="absolute right-0 bottom-0 top-0 w-96 bg-gradient-to-l from-amber-500/5 to-transparent blur-3xl rounded-full -mr-20 pointer-events-none" />
      
      <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
        {/* Status Alerts */}
        {error && (
          <div className="p-4 bg-red-950/20 border border-red-900/40 text-red-400 rounded-xl text-xs flex items-center space-x-2.5">
            <AlertCircle className="w-4.5 h-4.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-950/20 border border-emerald-900/40 text-emerald-400 rounded-xl text-xs flex items-center space-x-2.5">
            <CheckCircle2 className="w-4.5 h-4.5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Input Course */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Pilih Mata Kuliah</label>
          {loading ? (
            <div className="h-10 bg-slate-950 border border-slate-800 rounded-xl animate-pulse" />
          ) : (
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-300 focus:outline-none focus:border-amber-500 transition-colors cursor-pointer"
            >
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.code} - {course.name} (Semester {course.semester})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Input Title */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Judul Tugas</label>
          <input
            type="text"
            placeholder="Contoh: Desain ERD Database Perpustakaan"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
            required
          />
        </div>

        {/* Input Deadline */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Batas Waktu (Deadline)</label>
          <div className="relative">
            <input
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-300 focus:outline-none focus:border-amber-500 transition-colors cursor-pointer"
              required
            />
          </div>
        </div>

        {/* Input Description */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Instruksi & Deskripsi Tugas</label>
          <textarea
            placeholder="Tuliskan instruksi pengerjaan tugas secara lengkap di sini. Cantumkan kriteria penilaian, format file, dan petunjuk lainnya..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-colors resize-none leading-relaxed"
            required
          />
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold rounded-xl text-sm transition-all duration-300 shadow-lg shadow-amber-500/20 disabled:opacity-50 select-none cursor-pointer"
        >
          {submitting ? 'Mempublikasikan...' : 'Publikasikan Tugas'}
        </button>
      </form>
    </div>
  );
}

export default function BuatTugasPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16">
      {/* Top Navbar */}
      <nav className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-tr from-amber-500 to-orange-600 p-2 rounded-xl text-white shadow-lg shadow-amber-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-white">TugasKu Portal</h1>
              <p className="text-[10px] text-amber-400 font-medium">Dashboard Dosen</p>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-2 pl-4 border-l border-slate-800">
            <Link 
              href="/dashboard/dosen" 
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white transition-colors hover:bg-slate-800/40"
            >
              Dashboard
            </Link>
            <Link 
              href="/dashboard/dosen/courses" 
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white transition-colors hover:bg-slate-800/40"
            >
              Mata Kuliah
            </Link>
          </div>
        </div>

        <Link
          href="/dashboard/dosen"
          className="flex items-center space-x-1 text-slate-400 hover:text-white transition-colors text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </Link>
      </nav>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 mt-8 space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl md:text-2xl font-extrabold text-white">Buat Penugasan Baru</h2>
          <p className="text-slate-500 text-xs">Isi formulir di bawah ini untuk menerbitkan tugas akademik ke mahasiswa.</p>
        </div>

        <Suspense fallback={
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 max-w-2xl mx-auto text-center text-slate-500 text-xs">
            Memuat formulir...
          </div>
        }>
          <BuatTugasForm />
        </Suspense>
      </main>
    </div>
  );
}
