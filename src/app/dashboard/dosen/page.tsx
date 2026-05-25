'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  BookOpen, 
  PlusCircle, 
  Calendar, 
  FileText, 
  LogOut, 
  User, 
  ChevronRight, 
  ArrowRight,
  ClipboardList,
  Search,
  Filter,
  Menu,
  X,
  Sparkles
} from 'lucide-react';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import { AnimatedButton } from '@/components/ui/AnimatedButton';

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
  
  // Navigation sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Data states
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<CourseData | null>(null);
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [lecturerName, setLecturerName] = useState('Dosen Pengajar');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Filtering & Sorting State
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'alphabet'>('date');

  // Fetch lecturer courses
  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/dosen/courses');
      if (res.ok) {
        const data = await res.json();
        setCourses(data);
        if (data.length > 0) {
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
    
    // Read lecturer name from token cookie
    try {
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
    // Close sidebar on mobile after selecting
    setIsSidebarOpen(false);
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

  // Filter & Sort Tasks
  const filteredAndSortedTasks = tasks
    .filter(task => 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      } else {
        return a.title.localeCompare(b.title);
      }
    });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans pb-12 flex">
      
      {/* MOBILE TOP NAVBAR BANNER */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-500 transition-colors cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-2">
            <div className="relative w-7 h-7 rounded-lg overflow-hidden bg-slate-950 flex items-center justify-center border border-indigo-500/20">
              <Image src="/logo.png" alt="StudyPulse Logo" fill className="object-cover" />
            </div>
            <h1 className="text-sm font-bold tracking-tight bg-gradient-to-r from-indigo-500 to-violet-650 bg-clip-text text-transparent">StudyPulse</h1>
          </div>
        </div>

        <button 
          onClick={() => setShowLogoutModal(true)}
          className="p-1.5 rounded-lg bg-slate-100 hover:bg-red-500/10 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-red-500 transition-colors border border-slate-200/40 dark:border-slate-700/40 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* RESPONSIVE RESPONSIVE SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 transform lg:transform-none transition-transform duration-300 flex flex-col justify-between ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Sidebar Upper Section */}
        <div className="p-6 space-y-8">
          
          {/* Header Branding */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative w-9 h-9 rounded-xl overflow-hidden shadow border border-indigo-500/20 bg-slate-950 flex items-center justify-center">
                <Image src="/logo.png" alt="StudyPulse Logo" fill className="object-cover" />
              </div>
              <div>
                <h1 className="text-base font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-600 bg-clip-text text-transparent leading-none">
                  StudyPulse
                </h1>
                <span className="text-[9px] text-indigo-500 font-extrabold uppercase tracking-widest mt-1 block">Dosen Console</span>
              </div>
            </div>

            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 dark:text-slate-500 transition-colors cursor-pointer"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <Link 
              href="/dashboard/dosen" 
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold text-indigo-500 dark:text-indigo-400 bg-indigo-500/5 border border-indigo-500/10 transition-all select-none"
            >
              <BookOpen className="w-4.5 h-4.5" />
              <span>Dashboard Kelas</span>
            </Link>
            <Link 
              href="/dashboard/dosen/courses" 
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-550 hover:bg-slate-100 dark:hover:bg-slate-900 border border-transparent transition-all select-none"
            >
              <ClipboardList className="w-4.5 h-4.5" />
              <span>Daftar Mata Kuliah</span>
            </Link>
          </nav>
        </div>

        {/* Sidebar Footer Section */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
          {/* User Profile Summary */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 font-bold flex items-center justify-center text-xs uppercase shadow-sm">
              {lecturerName.charAt(0)}
            </div>
            <div className="truncate space-y-0.5">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{lecturerName}</p>
              <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Lecturer</span>
            </div>
          </div>



          {/* Logout Trigger */}
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold text-red-500 hover:bg-red-500/10 border border-transparent transition-all select-none cursor-pointer"
          >
            <LogOut className="w-4.5 h-4.5" />
            <span>Keluar Akun</span>
          </button>
        </div>
      </aside>

      {/* BACKGROUND SHADOW FOR MOBILE SIDEBAR DRAWER */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm transition-opacity"
        />
      )}

      {/* MAIN MAIN CONTENT CONTAINER */}
      <main className="flex-grow max-w-7xl mx-auto px-6 mt-24 lg:mt-8 space-y-8 lg:pl-72 transition-all">
        
        {/* Welcome Header Hero Banner */}
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="absolute right-0 bottom-0 top-0 w-96 bg-gradient-to-l from-indigo-500/5 to-transparent blur-3xl rounded-full -mr-20 pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="text-[9px] bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 font-extrabold px-3 py-1 rounded-full uppercase tracking-wider flex items-center space-x-1 w-max">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Pendidikan Berkualitas</span>
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">Selamat Datang, {lecturerName}</h2>
              <p className="text-slate-550 dark:text-slate-450 max-w-xl text-sm leading-relaxed">
                Kelola silabus pengajaran kelas, buat lembar evaluasi penugasan baru secara instan, dan lakukan penilaian tugas secara real-time.
              </p>
            </div>
            
            <Link href="/dashboard/dosen/buat-tugas" className="whitespace-nowrap">
              <AnimatedButton variant="gradient" className="px-6 py-3.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center space-x-2">
                <PlusCircle className="w-4.5 h-4.5" />
                <span>Buat Tugas Baru</span>
              </AnimatedButton>
            </Link>
          </div>
        </div>

        {/* Dashboard Dynamic Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Section A: Lecturer Course list (Mata Kuliah Diampu) */}
          <div className="space-y-4 lg:col-span-1">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Mata Kuliah Diampu</h3>
              <span className="bg-slate-200 dark:bg-slate-800 text-[10px] text-indigo-500 dark:text-indigo-400 font-extrabold px-2.5 py-0.5 rounded-full">
                {courses.length} Kelas
              </span>
            </div>

            {loading ? (
              <div className="py-20 text-center text-slate-400 text-xs">
                Memuat kelas aktif...
              </div>
            ) : courses.length === 0 ? (
              <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center text-slate-450 text-xs">
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
                      className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden group hover:scale-[1.02] cursor-pointer ${
                        isSelected 
                          ? 'bg-white dark:bg-slate-900 border-indigo-500 shadow-md' 
                          : 'bg-white/40 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-violet-600" />
                      )}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-500 font-extrabold px-2 py-0.5 rounded">
                            {course.code}
                          </span>
                          <span className="text-[9px] bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 font-bold px-2 py-0.5 rounded-full">
                            Semester {course.semester}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-sm text-slate-800 dark:text-white group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors mt-2">
                          {course.name}
                        </h4>
                        <div className="flex items-center justify-between text-[10px] text-slate-450 dark:text-slate-550 pt-2 border-t border-slate-100 dark:border-slate-800/60 mt-2">
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

          {/* Section B: Selected Course Tasks Panel (Tabel tugas dengan sorting & filter) */}
          <div className="lg:col-span-2 space-y-4">
            {selectedCourse ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-6 shadow-sm">
                
                {/* Active Course Details Header */}
                <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[9px] bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 font-bold px-2 py-0.5 rounded uppercase">
                      Kelas Terpilih
                    </span>
                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mt-1.5">{selectedCourse.name}</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      Kode: {selectedCourse.code} • Semester: {selectedCourse.semester} • Terdaftar: {selectedCourse._count.enrollments} Mahasiswa
                    </p>
                  </div>
                  
                  <Link href={`/dashboard/dosen/buat-tugas?courseId=${selectedCourse.id}`}>
                    <AnimatedButton variant="outline" className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Tambah Tugas</span>
                    </AnimatedButton>
                  </Link>
                </div>

                {/* Filters & Search Control Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-950/45 p-3 rounded-2xl border border-slate-200/60 dark:border-slate-850">
                  {/* Search query input */}
                  <div className="relative flex-grow max-w-xs">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-450 dark:text-slate-550">
                      <Search className="w-3.5 h-3.5" />
                    </span>
                    <input
                      type="text"
                      placeholder="Cari judul tugas..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-1.5 pl-9 pr-3 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-650 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  {/* Sort By Dropdown */}
                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="text-[9px] font-bold text-slate-450 dark:text-slate-500 uppercase flex items-center gap-1">
                      <Filter className="w-3 h-3" />
                      <span>Urutkan:</span>
                    </span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-750 dark:text-slate-350 focus:outline-none cursor-pointer"
                    >
                      <option value="date">Batas Waktu</option>
                      <option value="alphabet">Nama Tugas</option>
                    </select>
                  </div>
                </div>

                {/* Tasks Tabular / Cards List */}
                <div className="space-y-4">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Daftar Tugas Kelas</h4>

                  {loadingTasks ? (
                    <div className="py-16 text-center text-slate-400 text-xs">
                      Memuat daftar tugas...
                    </div>
                  ) : filteredAndSortedTasks.length === 0 ? (
                    <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center text-slate-450 text-xs">
                      Belum ada tugas yang cocok atau dibuat untuk kelas ini.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredAndSortedTasks.map((task) => (
                        <div 
                          key={task.id} 
                          className="bg-white/40 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-850 rounded-2xl p-5 hover:border-indigo-550/20 dark:hover:border-indigo-500/20 hover:bg-white dark:hover:bg-slate-950 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                        >
                          <div className="space-y-2 max-w-md">
                            <h5 className="font-extrabold text-sm text-slate-850 dark:text-white group-hover:text-indigo-550 dark:group-hover:text-indigo-400 transition-colors">
                              {task.title}
                            </h5>
                            <p className="text-slate-450 dark:text-slate-400 text-xs line-clamp-2 leading-relaxed">
                              {task.description}
                            </p>
                            <div className="flex flex-wrap items-center gap-4 text-[10px] text-slate-500 font-medium">
                              <span className="flex items-center space-x-1">
                                <Calendar className="w-3.5 h-3.5 text-indigo-500/60" />
                                <span>Batas: {new Date(task.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })} WIB</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <FileText className="w-3.5 h-3.5 text-violet-500/60" />
                                <span className="font-semibold text-slate-700 dark:text-slate-350">{task._count.submissions} Mengumpulkan</span>
                              </span>
                            </div>
                          </div>

                          <Link href={`/dashboard/dosen/nilai/${task.id}`} className="shrink-0 whitespace-nowrap self-start md:self-auto">
                            <AnimatedButton variant="gradient" className="px-4 py-2.5 shadow shadow-indigo-500/10 flex items-center justify-center space-x-1.5 text-xs font-bold">
                              <span>Nilai Tugas</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </AnimatedButton>
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800 rounded-3xl py-24 text-center text-slate-450 text-xs shadow-sm">
                Pilih mata kuliah di sebelah kiri untuk melihat daftar tugas.
              </div>
            )}
          </div>

        </div>

      </main>

      {/* CONFIRMATION LOGOUT MODAL */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-6 text-center animate-slideUp">
            <div className="p-3 bg-red-500/10 text-red-550 dark:text-red-400 rounded-2xl inline-flex mx-auto">
              <LogOut className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-1.5">
              <h4 className="font-extrabold text-base text-slate-900 dark:text-white">Konfirmasi Keluar</h4>
              <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed">
                Apakah Anda benar-benar yakin ingin keluar dari dasbor dosen StudyPulse Anda?
              </p>
            </div>
            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-slate-550 dark:text-slate-300 transition-all cursor-pointer"
              >
                Batalkan
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-650 hover:to-rose-750 text-xs font-bold text-white transition-all cursor-pointer shadow shadow-red-500/20"
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
