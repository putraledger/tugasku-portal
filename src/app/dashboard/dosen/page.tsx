'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  BookOpen, 
  PlusCircle, 
  Calendar, 
  FileText, 
  Award, 
  LogOut, 
  User, 
  ChevronRight, 
  ArrowRight,
  ClipboardList,
  ChevronDown
} from 'lucide-react';

interface CourseData {
  id: string;
  code: string;
  name: string;
  semester: number;
  _count: {
    tasks: number;
    enrollments: number;
  };
}

interface TaskData {
  id: string;
  title: string;
  description: string;
  deadline: string;
  _count: {
    submissions: number;
  };
}

export default function DosenDashboard() {
  const router = useRouter();
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<CourseData | null>(null);
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [lecturerName, setLecturerName] = useState('Dosen');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Fetch lecturer courses
  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/dosen/courses');
      if (res.ok) {
        const data = await res.json();
        setCourses(data);
        if (data.length > 0) {
          // Select first course by default
          setSelectedCourse(data[0]);
          fetchTasks(data[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch tasks for a selected course
  const fetchTasks = async (courseId: string) => {
    try {
      setLoadingTasks(true);
      const res = await fetch(`/api/dosen/tasks?courseId=${courseId}`);
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    fetchCourses();
    
    // Read lecturer name from cookie or mock
    try {
      // Decode user name from document.cookie just for aesthetic greet
      const tokenRow = document.cookie.split('; ').find(row => row.startsWith('token='));
      if (tokenRow) {
        const token = tokenRow.split('=')[1];
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
        const payload = JSON.parse(jsonPayload);
        if (payload.name) setLecturerName(payload.name);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleCourseSelect = (course: CourseData) => {
    setSelectedCourse(course);
    fetchTasks(course.id);
  };

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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-12">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-tr from-amber-500 to-orange-600 p-2 rounded-xl text-white shadow-lg shadow-amber-500/20">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                TugasKu Portal
              </h1>
              <p className="text-xs text-amber-400 font-medium">Dashboard Dosen</p>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-2 pl-4 border-l border-slate-800">
            <Link 
              href="/dashboard/dosen" 
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-slate-800 transition-colors"
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

        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-300">
            <User className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold">{lecturerName}</span>
          </div>

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
        
        {/* Lecturer Welcome Header */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-amber-950/20 border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="absolute right-0 bottom-0 top-0 w-96 bg-gradient-to-l from-amber-500/5 to-transparent blur-3xl rounded-full -mr-20 pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-extrabold text-white">Selamat Datang, {lecturerName}</h2>
              <p className="text-slate-400 max-w-xl text-sm leading-relaxed">
                Kelola materi pengajaran kelas, publikasikan tugas akademik baru, dan lakukan penilaian tugas secara real-time.
              </p>
            </div>
            <Link
              href="/dashboard/dosen/buat-tugas"
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold px-6 py-3.5 rounded-xl text-sm transition-all duration-300 shadow-lg shadow-amber-500/20 select-none whitespace-nowrap"
            >
              <PlusCircle className="w-4.5 h-4.5" />
              <span>Buat Tugas Baru</span>
            </Link>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Column 1: Lecturer Classes */}
          <div className="space-y-4 lg:col-span-1">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Mata Kuliah Diampu</h3>
              <span className="bg-slate-900 border border-slate-800 text-[10px] text-amber-400 font-bold px-2 py-0.5 rounded-full">
                {courses.length} Kelas
              </span>
            </div>

            {loading ? (
              <div className="py-20 text-center text-slate-500 text-xs">
                Memuat kelas aktif...
              </div>
            ) : courses.length === 0 ? (
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 text-center text-slate-500 text-xs">
                Tidak ada kelas yang diampu saat ini.
              </div>
            ) : (
              <div className="space-y-3">
                {courses.map((course) => {
                  const isSelected = selectedCourse?.id === course.id;
                  return (
                    <button
                      key={course.id}
                      onClick={() => handleCourseSelect(course)}
                      className={`w-full text-left p-4 rounded-xl border transition-all duration-300 relative overflow-hidden group ${
                        isSelected 
                          ? 'bg-slate-900 border-amber-500/60 shadow-lg shadow-amber-500/5' 
                          : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700/60 hover:bg-slate-900/60'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-500 to-orange-500" />
                      )}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] bg-slate-800 text-slate-400 font-bold px-2 py-0.5 rounded">
                            {course.code}
                          </span>
                          <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold px-2.5 py-0.5 rounded-full">
                            Semester {course.semester}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-white group-hover:text-amber-400 transition-colors mt-2">
                          {course.name}
                        </h4>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800/60 mt-2">
                          <span>{course._count.enrollments} Mahasiswa</span>
                          <span>{course._count.tasks} Tugas</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Column 2 & 3: Selected Course Tasks & Action */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Header Selected Course */}
            {selectedCourse ? (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">
                <div className="border-b border-slate-800/80 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold px-2 py-0.5 rounded uppercase">
                      Kelas Aktif
                    </span>
                    <h3 className="text-xl font-bold text-white mt-1.5">{selectedCourse.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Kode: {selectedCourse.code} • Semester: {selectedCourse.semester} • Terdaftar: {selectedCourse._count.enrollments} Mahasiswa
                    </p>
                  </div>
                  
                  <Link
                    href={`/dashboard/dosen/buat-tugas?courseId=${selectedCourse.id}`}
                    className="flex items-center justify-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300 self-start sm:self-auto select-none"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Tambah Tugas</span>
                  </Link>
                </div>

                {/* Task List */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Daftar Tugas Kelas</h4>

                  {loadingTasks ? (
                    <div className="py-16 text-center text-slate-500 text-xs">
                      Memuat daftar tugas...
                    </div>
                  ) : tasks.length === 0 ? (
                    <div className="border border-dashed border-slate-800 rounded-xl p-8 text-center text-slate-500 text-xs">
                      Belum ada tugas yang dibuat untuk kelas ini.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {tasks.map((task) => (
                        <div 
                          key={task.id} 
                          className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-5 hover:border-slate-700/80 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                        >
                          <div className="space-y-2 max-w-md">
                            <h5 className="font-bold text-sm text-white group-hover:text-amber-400 transition-colors">
                              {task.title}
                            </h5>
                            <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">
                              {task.description}
                            </p>
                            <div className="flex items-center space-x-4 text-[10px] text-slate-500 font-medium">
                              <span className="flex items-center space-x-1">
                                <Calendar className="w-3 h-3 text-amber-500/60" />
                                <span>Batas: {new Date(task.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })} WIB</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <FileText className="w-3 h-3 text-indigo-500/60" />
                                <span className="font-semibold text-slate-400">{task._count.submissions} Mengumpulkan</span>
                              </span>
                            </div>
                          </div>

                          <Link
                            href={`/dashboard/dosen/nilai/${task.id}`}
                            className="flex items-center justify-center space-x-1.5 bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-slate-950 border border-amber-500/20 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 select-none whitespace-nowrap self-start md:self-auto"
                          >
                            <span>Nilai Tugas</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className="bg-slate-900/20 border border-slate-800/80 rounded-2xl py-24 text-center text-slate-500 text-xs">
                Pilih mata kuliah di sebelah kiri untuk melihat daftar tugas.
              </div>
            )}

          </div>

        </div>

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
