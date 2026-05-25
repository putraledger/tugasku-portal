'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  GraduationCap, 
  LogOut, 
  Calendar, 
  FileText, 
  Award, 
  User, 
  ArrowRight, 
  Clock, 
  Archive, 
  ChevronRight,
  ClipboardList,
  AlertCircle,
  PlusCircle,
  RefreshCw,
  CheckCircle2,
  UploadCloud,
  X,
  Sparkles
} from 'lucide-react';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import { AnimatedButton } from '@/components/ui/AnimatedButton';

interface TaskData {
  id: string;
  title: string;
  description: string;
  deadline: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  lecturerName: string;
  submission: {
    id: string | null;
    status: 'BELUM_DIMULAI' | 'SEDANG_DIKERJAKAN' | 'SELESAI';
    fileUrl: string;
    grade: number | null;
    feedback: string | null;
    submittedAt: string | null;
  };
}

interface StudentData {
  id: string;
  name: string;
  email: string;
  semester: number;
}

export default function MahasiswaDashboard() {
  const router = useRouter();
  // Navigation State
  const [activeTab, setActiveTab] = useState<'home' | 'tugas' | 'arsip' | 'profil'>('home');
  
  // Data States
  const [student, setStudent] = useState<StudentData | null>(null);
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // FAB Quick Upload Modal States
  const [showQuickUploadModal, setShowQuickUploadModal] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  
  // Tugas tab local filter state
  const [tugasFilter, setTugasFilter] = useState<'BELUM_DIMULAI' | 'SEDANG_DIKERJAKAN' | 'SELESAI'>('BELUM_DIMULAI');

  // Fetch student tasks
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/mahasiswa/tasks');
      if (res.ok) {
        const data = await res.json();
        setStudent(data.student);
        setTasks(data.tasks);
        
        // Auto select first task for FAB if available
        const activeTasks = data.tasks.filter((t: TaskData) => t.submission.status !== 'SELESAI');
        if (activeTasks.length > 0) {
          setSelectedTaskId(activeTasks[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching student tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);



  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        router.push('/login');
        router.refresh();
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Update status locally & on DB
  const updateTaskStatus = async (taskId: string, newStatus: 'BELUM_DIMULAI' | 'SEDANG_DIKERJAKAN' | 'SELESAI') => {
    const targetTask = tasks.find(t => t.id === taskId);
    if (!targetTask) return;

    // Optimistic UI update
    const updatedTasks = tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          submission: {
            ...t.submission,
            status: newStatus
          }
        };
      }
      return t;
    });
    setTasks(updatedTasks);

    try {
      const res = await fetch('/api/mahasiswa/tasks/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, status: newStatus }),
      });

      if (!res.ok) {
        fetchTasks();
        alert('Gagal memperbarui status tugas.');
      }
    } catch (err) {
      console.error('Error updating task status API:', err);
      fetchTasks();
    }
  };

  // Countdown Helper
  const getDeadlineInfo = (deadlineStr: string) => {
    const deadline = new Date(deadlineStr);
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffTime < 0) {
      return { text: 'Batas Waktu Lewat', isLate: true, daysLeft: -1 };
    }
    if (diffDays <= 2) {
      const hours = Math.max(1, Math.round(diffTime / (1000 * 60 * 60)));
      return { text: `Urgen: Sisa ${hours} Jam`, isLate: true, daysLeft: 0 };
    }
    return { text: `Sisa ${diffDays} Hari`, isLate: false, daysLeft: diffDays };
  };

  // Quick upload handler
  const handleQuickUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskId || !selectedFile) {
      setUploadError('Silakan pilih tugas dan file terlebih dahulu.');
      return;
    }

    try {
      setUploading(true);
      setUploadError(null);
      setUploadSuccess(null);
      setUploadProgress(20);

      // 1. Upload file
      const formData = new FormData();
      formData.append('file', selectedFile);

      setUploadProgress(40);
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const uploadData = await uploadRes.json();
      setUploadProgress(70);

      if (!uploadRes.ok) {
        throw new Error(uploadData.error || 'Gagal mengunggah berkas.');
      }

      const fileUrl = uploadData.fileUrl;

      // 2. Submit task details
      const submitRes = await fetch('/api/mahasiswa/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: selectedTaskId,
          fileUrl,
        }),
      });

      const submitData = await submitRes.json();
      setUploadProgress(100);

      if (submitRes.ok) {
        setUploadSuccess('Tugas berhasil dikumpulkan!');
        setSelectedFile(null);
        fetchTasks();
        setTimeout(() => {
          setShowQuickUploadModal(false);
          setUploadSuccess(null);
        }, 1500);
      } else {
        throw new Error(submitData.error || 'Gagal meregistrasi pengumpulan berkas.');
      }
    } catch (err: any) {
      console.error('Quick upload error:', err);
      setUploadError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Math stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.submission.status === 'SELESAI').length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Tasks needing urgent action (< 3 days, not finished)
  const urgentTasks = tasks.filter(t => {
    if (t.submission.status === 'SELESAI') return false;
    const info = getDeadlineInfo(t.deadline);
    return info.isLate || (info.daysLeft !== -1 && info.daysLeft <= 3);
  });

  return (
    <div className="min-h-screen bg-slate-950 font-sans py-0 flex flex-col justify-start">
      
      {/* Mobile Shell Frame */}
      <div className="w-full max-w-md mx-auto min-h-screen bg-slate-900 border-x border-slate-800/80 shadow-2xl relative flex flex-col pb-24">
        
        {/* Mobile Header Banner */}
        <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 px-4 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-2">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden shadow border border-indigo-500/20 bg-slate-950 flex items-center justify-center">
              <Image 
                src="/logo.png" 
                alt="StudyPulse Logo" 
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h1 className="text-sm font-extrabold tracking-tight bg-gradient-to-r from-indigo-500 to-violet-600 bg-clip-text text-transparent">
                StudyPulse
              </h1>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Student Console</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setShowLogoutModal(true)}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:bg-red-500/10 hover:text-red-550 transition-colors border border-slate-700/40"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* Dynamic Main Body Content */}
        <main className="flex-1 p-4 overflow-y-auto space-y-5">
          
          {loading ? (
            <div className="py-32 text-center text-slate-400 text-xs">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-3 text-indigo-500" />
              Menyelaraskan data tugas Anda...
            </div>
          ) : (
            <>
              {/* TAB 1: HOME */}
              {activeTab === 'home' && (
                <div className="space-y-5 animate-fadeIn">
                  
                  {/* Greeting Block */}
                  {student && (
                    <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-xl shadow-indigo-500/15 relative overflow-hidden">
                      <div className="absolute right-[-20px] bottom-[-20px] w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none" />
                      <div className="relative z-10 space-y-1">
                        <span className="text-[9px] bg-white/20 border border-white/20 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          Semester {student.semester}
                        </span>
                        <h2 className="text-lg font-black mt-1">Halo, {student.name.split(' ')[0]}!</h2>
                        <p className="text-[11px] text-indigo-100">
                          Mari selesaikan target pengerjaan tugas akademik Anda hari ini.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Semester Progress Card */}
                  <AnimatedCard className="p-4 space-y-3">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-200">
                      <span className="flex items-center space-x-1">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Progress Kelulusan Tugas</span>
                      </span>
                      <span className="text-indigo-500 font-extrabold">{progressPercent}%</span>
                    </div>

                    <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full transition-all duration-500" 
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                      <div className="space-y-0.5">
                        <p className="text-[9px] text-slate-400 font-semibold uppercase">Total</p>
                        <p className="text-xs font-bold text-slate-700 dark:text-white">{totalTasks}</p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[9px] text-slate-400 font-semibold uppercase">Selesai</p>
                        <p className="text-xs font-bold text-emerald-500">{completedTasks}</p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[9px] text-slate-400 font-semibold uppercase">Sisa</p>
                        <p className="text-xs font-bold text-amber-500">{totalTasks - completedTasks}</p>
                      </div>
                    </div>
                  </AnimatedCard>

                  {/* Urgent Deadlines Section */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-red-500" />
                      <span>Deadline Mendekat (&le; 3 Hari)</span>
                    </h3>

                    {urgentTasks.length === 0 ? (
                      <div className="bg-white dark:bg-slate-900/30 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl py-8 text-center text-slate-400 text-xs">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500/80 mx-auto mb-2" />
                        Semua aman! Tidak ada deadline urgen terdekat.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {urgentTasks.map((task) => {
                          const dl = getDeadlineInfo(task.deadline);
                          return (
                            <div 
                              key={task.id}
                              className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-4.5 space-y-2.5 animate-pulse-deadline relative overflow-hidden"
                            >
                              <div className="flex justify-between items-center">
                                <span className="text-[9px] bg-red-500/10 text-red-500 border border-red-500/20 font-bold px-2 py-0.5 rounded">
                                  {task.courseCode}
                                </span>
                                <span className="text-[9.5px] text-red-500 font-black flex items-center space-x-0.5">
                                  <Clock className="w-3 h-3" />
                                  <span>{dl.text}</span>
                                </span>
                              </div>
                              <div className="space-y-1">
                                <h4 className="font-bold text-xs text-slate-800 dark:text-white line-clamp-1">{task.title}</h4>
                                <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">{task.description}</p>
                              </div>
                              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                <span className="text-[9px] text-slate-400">Dosen: {task.lecturerName}</span>
                                <Link 
                                  href={`/dashboard/mahasiswa/tugas/${task.id}`}
                                  className="text-[9px] font-bold text-indigo-500 flex items-center space-x-0.5 uppercase"
                                >
                                  <span>Buka Detail</span>
                                  <ChevronRight className="w-3 h-3" />
                                </Link>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: TUGAS */}
              {activeTab === 'tugas' && (
                <div className="space-y-4 animate-fadeIn relative">
                  
                  {/* Tugas Filters Tab Bar */}
                  <div className="bg-white dark:bg-slate-900/60 p-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 grid grid-cols-3 gap-1">
                    {(['BELUM_DIMULAI', 'SEDANG_DIKERJAKAN', 'SELESAI'] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => setTugasFilter(status)}
                        className={`py-2 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                          tugasFilter === status
                            ? 'bg-indigo-500 text-white shadow-sm'
                            : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                        }`}
                      >
                        {status === 'BELUM_DIMULAI' ? 'Belum' : status === 'SEDANG_DIKERJAKAN' ? 'Kerja' : 'Selesai'}
                      </button>
                    ))}
                  </div>

                  {/* Tasks List */}
                  {tasks.filter(t => t.submission.status === tugasFilter).length === 0 ? (
                    <div className="bg-white dark:bg-slate-900/30 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl py-20 text-center text-slate-400 text-xs">
                      <ClipboardList className="w-10 h-10 text-slate-350 dark:text-slate-700 mx-auto mb-2.5" />
                      Tidak ada tugas dalam kategori ini.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {tasks.filter(t => t.submission.status === tugasFilter).map((task) => {
                        const dl = getDeadlineInfo(task.deadline);
                        
                        // Progress bar calculations based on status
                        let progress = 10;
                        let progressColor = 'bg-amber-400';
                        if (task.submission.status === 'SEDANG_DIKERJAKAN') {
                          progress = 50;
                          progressColor = 'bg-indigo-500';
                        } else if (task.submission.status === 'SELESAI') {
                          progress = 100;
                          progressColor = 'bg-emerald-500';
                        }

                        return (
                          <div 
                            key={task.id}
                            className="bg-white dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4.5 space-y-3 shadow-sm hover:shadow-md transition-all relative overflow-hidden"
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-[9px] bg-slate-100 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-extrabold px-1.5 py-0.5 rounded">
                                {task.courseCode}
                              </span>
                              <span className={`text-[9.5px] font-bold ${
                                dl.isLate ? 'text-red-500' : 'text-slate-400'
                              }`}>
                                {dl.text}
                              </span>
                            </div>

                            <div className="space-y-1">
                              <h4 className="font-bold text-xs text-slate-850 dark:text-white line-clamp-1">{task.title}</h4>
                              <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">{task.description}</p>
                            </div>

                            {/* Progress bar representing status */}
                            <div className="space-y-1 pt-1.5">
                              <div className="flex justify-between text-[9px] font-bold">
                                <span className="text-slate-400">Progress Pengerjaan</span>
                                <span className="text-slate-600 dark:text-slate-300">{progress}%</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-800/40 rounded-full overflow-hidden">
                                <div className={`h-full ${progressColor} rounded-full transition-all`} style={{ width: `${progress}%` }} />
                              </div>
                            </div>

                            {/* Action selector */}
                            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
                              <div className="flex items-center space-x-1">
                                <span className="text-[8px] text-slate-400 font-bold uppercase">Status:</span>
                                <select
                                  value={task.submission.status}
                                  onChange={(e) => updateTaskStatus(task.id, e.target.value as any)}
                                  className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-[9px] text-slate-600 dark:text-slate-300 font-bold rounded p-0.5 focus:outline-none"
                                >
                                  <option value="BELUM_DIMULAI">Belum</option>
                                  <option value="SEDANG_DIKERJAKAN">Kerja</option>
                                  <option value="SELESAI">Selesai</option>
                                </select>
                              </div>

                              <Link 
                                href={`/dashboard/mahasiswa/tugas/${task.id}`}
                                className="text-[9px] font-bold text-indigo-500 dark:text-indigo-400 flex items-center space-x-0.5 uppercase"
                              >
                                <span>Kumpul Berkas</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* FLOATING ACTION BUTTON (FAB) FOR QUICK UPLOAD */}
                  {tugasFilter !== 'SELESAI' && tasks.filter(t => t.submission.status !== 'SELESAI').length > 0 && (
                    <button
                      onClick={() => {
                        // Choose first unfinished task as default
                        const unfinished = tasks.find(t => t.submission.status !== 'SELESAI');
                        if (unfinished) setSelectedTaskId(unfinished.id);
                        setShowQuickUploadModal(true);
                      }}
                      className="fixed bottom-24 right-6 sm:relative sm:float-right sm:bottom-auto sm:right-auto bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-650 hover:to-violet-750 text-white p-3.5 rounded-full shadow-2xl shadow-indigo-500/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer z-40 border border-indigo-400/20"
                      title="Upload Cepat"
                    >
                      <PlusCircle className="w-6 h-6" />
                    </button>
                  )}

                </div>
              )}

              {/* TAB 3: ARSIP */}
              {activeTab === 'arsip' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Arsip Nilai Akademik</h3>
                    <span className="bg-indigo-500/10 text-indigo-500 text-[9px] font-bold px-2 py-0.5 rounded-full border border-indigo-500/20">
                      {tasks.filter(t => t.submission.status === 'SELESAI' && t.submission.grade !== null).length} Nilai
                    </span>
                  </div>

                  {tasks.filter(t => t.submission.status === 'SELESAI').length === 0 ? (
                    <div className="bg-white dark:bg-slate-900/30 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl py-20 text-center text-slate-400 text-xs">
                      <Archive className="w-10 h-10 text-slate-350 dark:text-slate-700 mx-auto mb-2.5" />
                      Belum ada tugas terkumpul atau terarsip.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {tasks.filter(t => t.submission.status === 'SELESAI').map((task) => (
                        <div 
                          key={task.id}
                          className="bg-white dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4.5 space-y-3 shadow-sm"
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-500 font-extrabold px-1.5 py-0.5 rounded">
                              {task.courseCode}
                            </span>
                            <span className="text-[9px] text-slate-400">
                              Kumpul: {task.submission.submittedAt ? new Date(task.submission.submittedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '-'}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <h4 className="font-bold text-xs text-slate-800 dark:text-white line-clamp-1">{task.title}</h4>
                            <p className="text-[10px] text-slate-400 truncate">Kelas: {task.courseName}</p>
                          </div>

                          <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                            {task.submission.grade !== null ? (
                              <div className="flex items-center space-x-1 text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-black px-2 py-0.5 rounded uppercase">
                                <Award className="w-3.5 h-3.5" />
                                <span>Nilai: {task.submission.grade}</span>
                              </div>
                            ) : (
                              <span className="text-[9px] bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-500 font-bold px-2 py-0.5 rounded-full uppercase">
                                Pending Review
                              </span>
                            )}

                            <Link 
                              href={`/dashboard/mahasiswa/tugas/${task.id}`}
                              className="text-[9px] font-bold text-indigo-500 dark:text-indigo-400 flex items-center space-x-0.5 uppercase"
                            >
                              <span>Buka Ulasan</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: PROFIL */}
              {activeTab === 'profil' && (
                <div className="space-y-5 animate-fadeIn">
                  {/* Profile Card */}
                  {student && (
                    <AnimatedCard className="p-6 text-center space-y-4">
                      <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-black text-indigo-500 text-xl mx-auto shadow-sm">
                        {student.name.charAt(0)}
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-extrabold text-base text-slate-900 dark:text-white">{student.name}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{student.email}</p>
                      </div>
                      
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-4 text-left">
                        <div className="space-y-0.5">
                          <p className="text-[9px] text-slate-400 font-bold uppercase">Role Akun</p>
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">MAHASISWA</p>
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-[9px] text-slate-400 font-bold uppercase">Semester Berjalan</p>
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Semester {student.semester}</p>
                        </div>
                      </div>
                    </AnimatedCard>
                  )}



                  {/* Logout Button */}
                  <button
                    onClick={() => setShowLogoutModal(true)}
                    className="w-full py-3.5 rounded-2xl bg-red-500/10 hover:bg-red-500 border border-red-500/20 hover:border-red-650 text-red-650 hover:text-white text-xs font-extrabold select-none transition-all duration-300 cursor-pointer text-center"
                  >
                    Keluar dari Akun
                  </button>
                </div>
              )}

            </>
          )}

        </main>

        {/* PERSISTENT BOTTOM NAVIGATION BAR */}
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-50 bg-slate-800/90 backdrop-blur-md border-t border-slate-700 px-2 py-2.5 flex items-center justify-around shadow-lg">
          
          {/* Item 1: Home */}
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center space-y-1.5 hover:scale-105 transition-all duration-200 cursor-pointer select-none ${
              activeTab === 'home' ? 'text-indigo-500' : 'text-slate-500 hover:text-indigo-400'
            }`}
          >
            <GraduationCap className="w-5 h-5" />
            <span className="text-[9px] font-bold uppercase tracking-wide">Home</span>
          </button>

          {/* Item 2: Tugas */}
          <button
            onClick={() => setActiveTab('tugas')}
            className={`flex flex-col items-center space-y-1.5 hover:scale-105 transition-all duration-200 cursor-pointer select-none ${
              activeTab === 'tugas' ? 'text-indigo-500' : 'text-slate-500 hover:text-indigo-400'
            }`}
          >
            <ClipboardList className="w-5 h-5" />
            <span className="text-[9px] font-bold uppercase tracking-wide">Tugas</span>
          </button>

          {/* Item 3: Arsip */}
          <button
            onClick={() => setActiveTab('arsip')}
            className={`flex flex-col items-center space-y-1.5 hover:scale-105 transition-all duration-200 cursor-pointer select-none ${
              activeTab === 'arsip' ? 'text-indigo-500' : 'text-slate-500 hover:text-indigo-400'
            }`}
          >
            <Archive className="w-5 h-5" />
            <span className="text-[9px] font-bold uppercase tracking-wide">Arsip</span>
          </button>

          {/* Item 4: Profil */}
          <button
            onClick={() => setActiveTab('profil')}
            className={`flex flex-col items-center space-y-1.5 hover:scale-105 transition-all duration-200 cursor-pointer select-none ${
              activeTab === 'profil' ? 'text-indigo-500' : 'text-slate-500 hover:text-indigo-400'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-[9px] font-bold uppercase tracking-wide">Profil</span>
          </button>

        </nav>

        {/* FAB QUICK UPLOAD FILE SUBMISSION MODAL */}
        {showQuickUploadModal && (
          <div className="absolute inset-0 z-50 flex items-end justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 w-full rounded-3xl p-6 shadow-2xl space-y-5 animate-slideUp mb-12">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <UploadCloud className="w-4 h-4 text-indigo-500" />
                    Pengumpulan Cepat
                  </h4>
                  <p className="text-[9px] text-slate-400 font-bold uppercase">Unggah File Tugas Instan</p>
                </div>
                <button
                  onClick={() => {
                    setShowQuickUploadModal(false);
                    setSelectedFile(null);
                    setUploadError(null);
                    setUploadSuccess(null);
                  }}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleQuickUploadSubmit} className="space-y-4">
                
                {uploadError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-650 dark:text-red-450 rounded-xl text-[10px] flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {uploadSuccess && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-650 dark:text-emerald-450 rounded-xl text-[10px] flex items-center gap-1.5 animate-bounce-success">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>{uploadSuccess}</span>
                  </div>
                )}

                {/* Dropdown Task Picker */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pilih Tugas Aktif</label>
                  <select
                    value={selectedTaskId}
                    onChange={(e) => setSelectedTaskId(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2.5 text-xs text-slate-850 dark:text-slate-200 focus:outline-none cursor-pointer"
                  >
                    {tasks.filter(t => t.submission.status !== 'SELESAI').map((task) => (
                      <option key={task.id} value={task.id}>
                        [{task.courseCode}] {task.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* File Upload Zone */}
                <div className="border border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-2xl p-5 text-center transition-all bg-slate-50 dark:bg-slate-950/40 relative">
                  <input
                    type="file"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        if (file.size > 10 * 1024 * 1024) {
                          setUploadError('Ukuran berkas melebihi batasan maksimum (10 MB).');
                          return;
                        }
                        setSelectedFile(file);
                        setUploadError(null);
                      }
                    }}
                    className="hidden"
                    id="quick-file-input"
                    accept=".pdf,.zip,.rar,.doc,.docx"
                  />
                  <label htmlFor="quick-file-input" className="cursor-pointer space-y-2 block">
                    <UploadCloud className="w-8 h-8 text-slate-400 dark:text-slate-500 mx-auto" />
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-700 dark:text-white truncate">
                        {selectedFile ? selectedFile.name : 'Pilih Berkas Tugas'}
                      </p>
                      <p className="text-[9px] text-slate-400">
                        {selectedFile ? 'Siap diunggah' : 'PDF, ZIP, DOC (Maks. 10MB)'}
                      </p>
                    </div>
                  </label>
                </div>

                {/* Upload Progress */}
                {uploading && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[9px] font-bold text-indigo-500">
                      <span>Mengirim berkas...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-950 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-indigo-500 h-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Submit Action */}
                {selectedFile && (
                  <button
                    type="submit"
                    disabled={uploading}
                    className="w-full py-3 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-650 hover:to-violet-750 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-indigo-500/10 cursor-pointer"
                  >
                    {uploading ? 'Memproses...' : 'Kumpulkan Tugas Sekarang'}
                  </button>
                )}

              </form>
            </div>
          </div>
        )}

        {/* LOGOUT CONFIRMATION MODAL */}
        {showLogoutModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl max-w-xs w-full p-5 shadow-2xl space-y-5 text-center animate-slideUp">
              <div className="p-3 bg-red-500/10 text-red-550 dark:text-red-400 rounded-2xl inline-flex mx-auto">
                <LogOut className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Konfirmasi Keluar</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Apakah Anda yakin ingin keluar dari akun StudyPulse Anda?
                </p>
              </div>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-[10px] font-bold text-slate-550 dark:text-slate-300 transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-650 hover:to-rose-750 text-[10px] font-bold text-white transition-all cursor-pointer shadow shadow-red-500/20"
                >
                  Ya, Keluar
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
