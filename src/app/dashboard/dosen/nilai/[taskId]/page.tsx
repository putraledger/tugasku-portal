'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft, 
  Calendar, 
  FileText, 
  Download, 
  Save, 
  Edit, 
  Filter, 
  AlertCircle,
  Award
} from 'lucide-react';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import { AnimatedButton } from '@/components/ui/AnimatedButton';

interface StudentData {
  id: string;
  name: string;
  email: string;
  semester: number | null;
  enrollments: {
    status: string;
  }[];
}

interface SubmissionData {
  id: string;
  fileUrl: string;
  status: string;
  grade: number | null;
  feedback: string | null;
  submittedAt: string;
  student: StudentData;
}

interface TaskData {
  id: string;
  title: string;
  description: string;
  deadline: string;
  courseId: string;
  course: {
    code: string;
    name: string;
    semester: number;
  };
}

export default function LecturerGradingPage({ params }: { params: Promise<{ taskId: string }> }) {
  const router = useRouter();
  const { taskId } = use(params);

  const [task, setTask] = useState<TaskData | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter state: "all" | "active" | "archived"
  const [semesterFilter, setSemesterFilter] = useState<'all' | 'active' | 'archived'>('all');

  // Grading states
  const [editingSubmissionId, setEditingSubmissionId] = useState<string | null>(null);
  const [tempGrade, setTempGrade] = useState<number | ''>('');
  const [tempFeedback, setTempFeedback] = useState('');
  const [submittingGradeId, setSubmittingGradeId] = useState<string | null>(null);

  // Fetch Submissions
  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/dosen/submissions?taskId=${taskId}`);
      if (res.ok) {
        const data = await res.json();
        setTask(data.task);
        setSubmissions(data.submissions);
      }
    } catch (err) {
      console.error('Error fetching submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [taskId]);

  // Start Inline Grading Form
  const startGrading = (sub: SubmissionData) => {
    setEditingSubmissionId(sub.id);
    setTempGrade(sub.grade !== null ? sub.grade : '');
    setTempFeedback(sub.feedback || '');
  };

  // Submit Grade API Call
  const handleSaveGrade = async (subId: string) => {
    if (tempGrade === '') {
      alert('Mohon masukkan nilai terlebih dahulu.');
      return;
    }

    try {
      setSubmittingGradeId(subId);
      const res = await fetch('/api/dosen/submissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: subId,
          grade: tempGrade,
          feedback: tempFeedback,
        }),
      });

      if (res.ok) {
        setEditingSubmissionId(null);
        fetchSubmissions();
      } else {
        const data = await res.json();
        alert(data.error || 'Gagal menyimpan nilai.');
      }
    } catch (err) {
      console.error('Grading submit error:', err);
      alert('Terjadi kesalahan pada server.');
    } finally {
      setSubmittingGradeId(null);
    }
  };

  const getEnrollmentStatus = (sub: SubmissionData) => {
    return sub.student.enrollments[0]?.status || 'AKTIF';
  };

  // Apply Filter
  const filteredSubmissions = submissions.filter((sub) => {
    const status = getEnrollmentStatus(sub);
    
    if (semesterFilter === 'active') {
      return status === 'AKTIF';
    }
    if (semesterFilter === 'archived') {
      return status === 'ARCHIVED';
    }
    return true; // "all"
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans pb-16">
      
      {/* Top Navbar */}
      <nav className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-6">
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

          <div className="hidden md:flex items-center space-x-2 pl-4 border-l border-slate-800">
            <Link 
              href="/dashboard/dosen" 
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-indigo-400 transition-colors"
            >
              Dashboard
            </Link>
            <Link 
              href="/dashboard/dosen/courses" 
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-indigo-400 transition-colors"
            >
              Mata Kuliah
            </Link>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/dashboard/dosen"
            className="flex items-center space-x-1 text-slate-400 hover:text-white transition-colors text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Dasbor</span>
          </Link>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 mt-8 space-y-8 animate-fadeIn">
        
        {/* Task Detail Summary */}
        {task && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-sm">
            <div className="absolute right-0 bottom-0 top-0 w-96 bg-gradient-to-l from-indigo-500/5 to-transparent blur-3xl rounded-full -mr-20 pointer-events-none" />
            <div className="relative z-10 space-y-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-[9px] bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-500 font-extrabold px-2 py-0.5 rounded">
                  {task.course.code}
                </span>
                <span className="text-[9px] bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-500 font-bold px-2 py-0.5 rounded">
                  {task.course.name}
                </span>
                <span className="text-[9px] bg-indigo-500/10 text-indigo-550 dark:text-indigo-455 border border-indigo-500/20 font-bold px-2.5 py-0.5 rounded-full">
                  Semester {task.course.semester}
                </span>
              </div>
              
              <div className="space-y-1">
                <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white leading-snug">{task.title}</h2>
                <div className="flex items-center space-x-2 text-xs text-slate-500 pt-1 font-medium">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  <span>Batas Akhir: {new Date(task.deadline).toLocaleString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} WIB</span>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 mt-2">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Instruksi Tugas:</h3>
                <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed max-w-4xl whitespace-pre-line bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-900">
                  {task.description}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Grading Workspace */}
        <div className="space-y-4">
          
          {/* Filters and Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">Daftar Pengumpulan Mahasiswa</h3>
              <p className="text-xs text-slate-500">Nilai lembar kerja dan berikan koreksi balik akademik.</p>
            </div>

            {/* Semester Filter Tab */}
            <div className="flex items-center space-x-1.5 bg-white dark:bg-slate-905 border border-slate-200 dark:border-slate-800 p-1.5 rounded-xl self-start sm:self-auto shadow-sm">
              <button
                onClick={() => setSemesterFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all select-none cursor-pointer ${
                  semesterFilter === 'all' 
                    ? 'bg-indigo-500 text-white font-extrabold shadow' 
                    : 'text-slate-500 hover:text-slate-850 dark:hover:text-white'
                }`}
              >
                Semua ({submissions.length})
              </button>
              <button
                onClick={() => setSemesterFilter('active')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all select-none cursor-pointer ${
                  semesterFilter === 'active' 
                    ? 'bg-indigo-500 text-white font-extrabold shadow' 
                    : 'text-slate-500 hover:text-slate-850 dark:hover:text-white'
                }`}
              >
                Aktif ({submissions.filter(s => getEnrollmentStatus(s) === 'AKTIF').length})
              </button>
              <button
                onClick={() => setSemesterFilter('archived')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all select-none cursor-pointer ${
                  semesterFilter === 'archived' 
                    ? 'bg-indigo-500 text-white font-extrabold shadow' 
                    : 'text-slate-500 hover:text-slate-850 dark:hover:text-white'
                }`}
              >
                Archived ({submissions.filter(s => getEnrollmentStatus(s) === 'ARCHIVED').length})
              </button>
            </div>
          </div>

          {/* Table / List Workspace */}
          {loading ? (
            <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl py-24 text-center text-slate-400 text-sm animate-pulse">
              Memuat lembar pengumpulan...
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="bg-white dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800 rounded-3xl py-20 text-center text-slate-500 text-xs shadow-sm">
              <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-3" />
              Tidak ada data pengumpulan tugas untuk filter ini.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSubmissions.map((sub, idx) => {
                const isEditing = editingSubmissionId === sub.id;
                const isSubmitting = submittingGradeId === sub.id;
                const statusEnroll = getEnrollmentStatus(sub);

                return (
                  <AnimatedCard 
                    key={sub.id} 
                    delay={idx * 100}
                    className={`border rounded-2xl p-5 md:p-6 transition-all duration-300 ${
                      isEditing 
                        ? 'border-indigo-500 bg-indigo-500/5 shadow-md scale-[1.01]' 
                        : sub.grade !== null
                        ? 'border-slate-200 dark:border-slate-800/80 hover:border-slate-350 dark:hover:border-slate-700'
                        : 'border-red-500/20 bg-red-500/5 hover:border-red-500/30'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                      
                      {/* Left Block: Student Info & Attached File */}
                      <div className="space-y-4 max-w-xl flex-grow">
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-bold text-indigo-500 text-sm uppercase shadow-sm shrink-0">
                            {sub.student.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white">{sub.student.name}</h4>
                            <p className="text-slate-450 dark:text-slate-400 text-[11px] font-medium">{sub.student.email}</p>
                            
                            {/* Academic Status Pills */}
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              <span className="text-[9px] bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-500 dark:text-slate-400 font-extrabold px-2 py-0.5 rounded">
                                Smt {sub.student.semester || 'Lulus'}
                              </span>
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                statusEnroll === 'AKTIF' 
                                  ? 'bg-emerald-550/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                                  : 'bg-slate-200 dark:bg-slate-850 text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-700'
                              }`}>
                                {statusEnroll === 'AKTIF' ? 'Kelas Aktif' : 'Archived'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* File Attachment & Time info */}
                        <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center space-x-2 text-xs truncate max-w-sm">
                            <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                            <span className="font-bold text-slate-700 dark:text-slate-300 truncate" title={sub.fileUrl}>
                              {sub.fileUrl.split('/').pop()}
                            </span>
                          </div>
                          <div className="flex items-center space-x-3 shrink-0">
                            <span className="text-[10px] text-slate-450 dark:text-slate-550 font-bold">
                              Dikumpul: {new Date(sub.submittedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <a
                              href={sub.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-1 text-xs font-bold text-indigo-500 dark:text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 px-3.5 py-1.5 rounded-xl border border-indigo-500/20 transition-all select-none"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Unduh</span>
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* Right Block: Grading Interface */}
                      <div className="w-full md:w-80 shrink-0 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 space-y-4 shadow-inner">
                        {isEditing ? (
                          <div className="space-y-3 animate-slideUp">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">Input Nilai (0-100)</span>
                            </div>
                            <input
                              type="number"
                              min={0}
                              max={100}
                              placeholder="Nilai (0-100)"
                              value={tempGrade}
                              onChange={(e) => setTempGrade(e.target.value !== '' ? parseInt(e.target.value) : '')}
                              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-850 dark:text-white focus:outline-none focus:border-indigo-500"
                            />
                            
                            <div className="space-y-1">
                              <span className="text-[9px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">Feedback Koreksi Balik</span>
                              <textarea
                                rows={3}
                                placeholder="Beri catatan perbaikan dan koreksi balik akademik untuk mahasiswa..."
                                value={tempFeedback}
                                onChange={(e) => setTempFeedback(e.target.value)}
                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
                              />
                            </div>

                            <button
                              onClick={() => handleSaveGrade(sub.id)}
                              disabled={isSubmitting}
                              className="w-full flex items-center justify-center space-x-1.5 bg-gradient-to-r from-indigo-500 to-violet-650 hover:from-indigo-600 hover:to-violet-750 text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow shadow-indigo-500/10 cursor-pointer"
                            >
                              <Save className="w-3.5 h-3.5" />
                              <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Penilaian'}</span>
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">Evaluasi Nilai</span>
                              <button
                                onClick={() => startGrading(sub)}
                                className="flex items-center space-x-1 text-[9px] text-indigo-500 dark:text-indigo-400 hover:underline transition-colors font-bold uppercase cursor-pointer"
                              >
                                <Edit className="w-3.5 h-3.5" />
                                <span>{sub.grade !== null ? 'Koreksi' : 'Beri Nilai'}</span>
                              </button>
                            </div>

                            {sub.grade !== null ? (
                              <div className="space-y-2">
                                <div className="flex items-baseline space-x-1">
                                  <span className="text-3xl font-black text-slate-850 dark:text-white">{sub.grade}</span>
                                  <span className="text-slate-400 text-xs font-bold">/ 100</span>
                                </div>
                                {sub.feedback ? (
                                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-xl leading-relaxed text-[11px] text-slate-600 dark:text-slate-350 italic">
                                    "{sub.feedback}"
                                  </div>
                                ) : (
                                  <span className="text-[10px] text-slate-400 italic block">Tidak ada catatan ulasan khusus.</span>
                                )}
                              </div>
                            ) : (
                              <div className="py-2 text-center text-red-500 font-bold text-xs space-y-2">
                                <p className="text-[9px] uppercase tracking-wide text-red-500/70">Belum Dinilai</p>
                                <button
                                  onClick={() => startGrading(sub)}
                                  className="w-full py-2 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-550 border border-red-500/20 hover:border-red-500 rounded-xl transition-all text-xs font-extrabold cursor-pointer"
                                >
                                  Masukkan Nilai
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </AnimatedCard>
                );
              })}
            </div>
          )}

        </div>

      </main>
    </div>
  );
}
