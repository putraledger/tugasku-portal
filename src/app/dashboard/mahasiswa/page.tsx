'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
  MoreVertical,
  CheckCircle2
} from 'lucide-react';

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
  const [student, setStudent] = useState<StudentData | null>(null);
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Fetch student tasks
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/mahasiswa/tasks');
      if (res.ok) {
        const data = await res.json();
        setStudent(data.student);
        setTasks(data.tasks);
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
    // Find task
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
        // Rollback on error
        fetchTasks();
        alert('Gagal memperbarui status tugas.');
      }
    } catch (err) {
      console.error('Error updating task status API:', err);
      fetchTasks();
    }
  };

  // Drag & Drop logic
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggingTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, columnStatus: 'BELUM_DIMULAI' | 'SEDANG_DIKERJAKAN' | 'SELESAI') => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggingTaskId;
    setDraggingTaskId(null);
    
    if (taskId) {
      // If task is completed and moving back, or moving to finished, let details page handle actual file upload.
      // But we can let them change status.
      if (columnStatus === 'SELESAI') {
        // Redirect to detail page to perform proper file upload
        router.push(`/dashboard/mahasiswa/tugas/${taskId}`);
      } else {
        await updateTaskStatus(taskId, columnStatus);
      }
    }
  };

  // Countdown Helper
  const getDeadlineInfo = (deadlineStr: string) => {
    const deadline = new Date(deadlineStr);
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffTime < 0) {
      return { text: 'Sudah Lewat Batas', isLate: true };
    }
    if (diffDays <= 2) {
      return { text: `Sisa ${Math.max(1, Math.round(diffTime / (1000 * 60 * 60)))} Jam`, isLate: true };
    }
    return { text: `Sisa ${diffDays} Hari`, isLate: false };
  };

  // Columns for Kanban Board
  const columns: {
    id: 'BELUM_DIMULAI' | 'SEDANG_DIKERJAKAN' | 'SELESAI';
    title: string;
    bgHeader: string;
    textHeader: string;
    colorGlow: string;
  }[] = [
    { 
      id: 'BELUM_DIMULAI', 
      title: 'Belum Dimulai', 
      bgHeader: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
      textHeader: 'text-amber-400',
      colorGlow: 'hover:border-amber-500/30'
    },
    { 
      id: 'SEDANG_DIKERJAKAN', 
      title: 'Sedang Dikerjakan', 
      bgHeader: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
      textHeader: 'text-indigo-400',
      colorGlow: 'hover:border-indigo-500/30'
    },
    { 
      id: 'SELESAI', 
      title: 'Selesai & Dikumpul', 
      bgHeader: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
      textHeader: 'text-emerald-400',
      colorGlow: 'hover:border-emerald-500/30'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-12">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-tr from-emerald-500 to-teal-600 p-2 rounded-xl text-white shadow-lg shadow-emerald-500/20">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              TugasKu Portal
            </h1>
            <p className="text-xs text-emerald-400 font-medium">Dashboard Mahasiswa</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {student && (
            <div className="hidden md:flex items-center space-x-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-300">
              <User className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-semibold">{student.name} • Smt {student.semester}</span>
            </div>
          )}

          <Link
            href="/dashboard/mahasiswa/arsip"
            className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-all select-none"
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Arsip Nilai</span>
          </Link>

          <button 
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center space-x-2 bg-slate-800/80 hover:bg-red-950/40 hover:text-red-400 border border-slate-700/60 hover:border-red-900/50 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 mt-8 space-y-8">
        
        {/* Student Welcome Header */}
        {student && (
          <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-emerald-950/10 border border-slate-800 shadow-2xl relative overflow-hidden">
            <div className="absolute right-0 bottom-0 top-0 w-96 bg-gradient-to-l from-emerald-500/5 to-transparent blur-3xl rounded-full -mr-20 pointer-events-none" />
            <div className="relative z-10 space-y-2">
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                Mahasiswa Aktif Semester {student.semester}
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-2">Selamat Datang, {student.name}</h2>
              <p className="text-slate-400 max-w-2xl text-sm leading-relaxed">
                Ini adalah papan tugas aktif semester Anda. Geser (*drag and drop*) tugas untuk mengubah status pengerjaan, atau klik tugas untuk membuka lembar pengumpulan berkas.
              </p>
            </div>
          </div>
        )}

        {/* Kanban Board Container */}
        {loading ? (
          <div className="py-28 text-center text-slate-500 text-sm">
            <RefreshCw className="w-7 h-7 animate-spin mx-auto mb-3 text-emerald-500" />
            Menyelaraskan tugas semester Anda...
          </div>
        ) : tasks.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl py-24 text-center text-slate-500 text-sm">
            <ClipboardList className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            Tidak ada tugas aktif di Semester {student?.semester || ''} saat ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {columns.map((col) => {
              const colTasks = tasks.filter(t => t.submission.status === col.id);

              return (
                <div 
                  key={col.id}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, col.id)}
                  className="bg-slate-900/30 border border-slate-900 rounded-2xl p-4 space-y-4 min-h-[500px] flex flex-col transition-colors duration-300"
                >
                  {/* Column Header */}
                  <div className={`p-3.5 border rounded-xl flex items-center justify-between shadow ${col.bgHeader}`}>
                    <span className="font-bold text-xs uppercase tracking-wider">{col.title}</span>
                    <span className="bg-slate-950/60 border border-slate-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                      {colTasks.length}
                    </span>
                  </div>

                  {/* Column Cards Container */}
                  <div className="space-y-3 flex-1 overflow-y-auto">
                    {colTasks.length === 0 ? (
                      <div className="border border-dashed border-slate-800/80 rounded-xl py-12 text-center text-slate-600 text-xs">
                        Tarik tugas ke sini
                      </div>
                    ) : (
                      colTasks.map((task) => {
                        const dl = getDeadlineInfo(task.deadline);
                        
                        return (
                          <div
                            key={task.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, task.id)}
                            className={`bg-slate-900/80 border border-slate-800 rounded-xl p-4.5 space-y-3 shadow hover:shadow-lg cursor-grab active:cursor-grabbing transition-all duration-300 group ${col.colorGlow}`}
                          >
                            {/* Card Header: Course Label */}
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] bg-slate-950 border border-slate-800 text-slate-400 font-extrabold px-1.5 py-0.5 rounded tracking-wide">
                                {task.courseCode}
                              </span>
                              
                              {/* Drag help info on hover */}
                              <span className="text-[8px] text-slate-600 font-semibold group-hover:text-slate-400 transition-colors uppercase">
                                Drag me
                              </span>
                            </div>

                            {/* Card Title & Desc */}
                            <div className="space-y-1">
                              <h5 className="font-bold text-xs text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
                                {task.title}
                              </h5>
                              <p className="text-slate-400 text-[10.5px] line-clamp-2 leading-relaxed">
                                {task.description}
                              </p>
                            </div>

                            {/* Card Footer: Deadline & Actions */}
                            <div className="border-t border-slate-800/80 pt-3 flex items-center justify-between gap-2">
                              {/* Deadline Info */}
                              <span className={`flex items-center space-x-1 text-[9.5px] font-medium ${
                                dl.isLate ? 'text-red-400 font-bold' : 'text-slate-500'
                              }`}>
                                <Clock className="w-3.5 h-3.5" />
                                <span>{dl.text}</span>
                              </span>

                              {/* Grade if completed, or quick link */}
                              {col.id === 'SELESAI' ? (
                                task.submission.grade !== null ? (
                                  <span className="flex items-center space-x-1 text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-black px-1.5 py-0.5 rounded uppercase">
                                    <Award className="w-3 h-3 text-emerald-400" />
                                    <span>Nilai: {task.submission.grade}</span>
                                  </span>
                                ) : (
                                  <span className="text-[9px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold px-1.5 py-0.5 rounded-full uppercase">
                                    Pending
                                  </span>
                                )
                              ) : (
                                <div className="flex items-center space-x-1.5">
                                  {/* Quick Action drop down select instead of drag for accessibility */}
                                  <select
                                    onChange={(e) => updateTaskStatus(task.id, e.target.value as any)}
                                    value={col.id}
                                    className="bg-slate-950 border border-slate-800 text-[9px] text-slate-500 font-bold rounded p-0.5 focus:outline-none"
                                    onClick={(e) => e.stopPropagation()} // Prevent card navigation trigger
                                  >
                                    <option value="BELUM_DIMULAI">Belum</option>
                                    <option value="SEDANG_DIKERJAKAN">Kerja</option>
                                    <option value="SELESAI">Selesai</option>
                                  </select>
                                </div>
                              )}
                            </div>

                            {/* Clickable Detail link */}
                            <Link
                              href={`/dashboard/mahasiswa/tugas/${task.id}`}
                              className="mt-1 flex items-center justify-end space-x-1 text-[9px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors uppercase pt-1"
                              onClick={(e) => e.stopPropagation()} // Safe click
                            >
                              <span>Buka Pengumpulan</span>
                              <ChevronRight className="w-3 h-3" />
                            </Link>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}

          </div>
        )}

      </main>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-6">
            <div className="flex items-center space-x-3 text-red-400">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <LogOut className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Konfirmasi Keluar</h3>
            </div>
            <p className="text-sm text-slate-400">
              Apakah Anda yakin ingin keluar?
            </p>
            <div className="flex space-x-3 justify-end">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-xs font-semibold text-white transition-all cursor-pointer shadow-lg shadow-red-500/20"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
