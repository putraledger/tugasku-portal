'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  BookOpen, 
  Users, 
  X, 
  User, 
  RefreshCw, 
  LogOut,
  FileText,
  GraduationCap
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

interface EnrollmentData {
  id: string;
  studentId: string;
  student: {
    id: string;
    name: string;
    email: string;
    semester: number;
  };
}

export default function DosenCoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lecturerName, setLecturerName] = useState('Dosen');

  // Modal Student Details State
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<CourseData | null>(null);
  const [enrolledStudents, setEnrolledStudents] = useState<EnrollmentData[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Fetch lecturer courses
  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/dosen/courses');
      if (res.ok) {
        const data = await res.json();
        setCourses(data);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();

    // Read lecturer name from cookie for greet
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

  // Open Students Modal
  const openStudentsModal = async (course: CourseData) => {
    setSelectedCourse(course);
    setModalError(null);
    setShowStudentsModal(true);
    setLoadingStudents(true);

    try {
      const res = await fetch(`/api/dosen/courses/${course.id}/enrollments`);
      if (res.ok) {
        const data = await res.json();
        setEnrolledStudents(data.enrolled);
      } else {
        const errData = await res.json();
        setModalError(errData.error || 'Gagal memuat daftar mahasiswa.');
      }
    } catch (err) {
      console.error('Error loading course enrollments:', err);
      setModalError('Koneksi server gagal.');
    } finally {
      setLoadingStudents(false);
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
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white transition-colors hover:bg-slate-800/40"
            >
              Dashboard
            </Link>
            <Link 
              href="/dashboard/dosen/courses" 
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-slate-800 transition-colors"
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
            className="flex items-center space-x-2 bg-slate-800/80 hover:bg-red-950/40 hover:text-red-400 border border-slate-700/60 hover:border-red-900/50 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 mt-8 space-y-8">
        
        {/* Header Hero */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-amber-950/20 border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="absolute right-0 bottom-0 top-0 w-96 bg-gradient-to-l from-amber-500/5 to-transparent blur-3xl rounded-full -mr-20 pointer-events-none" />
          <div className="relative z-10 space-y-2">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">Mata Kuliah Diampu</h2>
            <p className="text-slate-400 max-w-2xl text-sm leading-relaxed">
              Daftar seluruh kurikulum mata kuliah aktif yang Anda ampu pada semester ini. Anda dapat meninjau daftar mahasiswa aktif yang terdaftar di masing-masing kelas secara langsung.
            </p>
          </div>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="py-20 text-center text-slate-500 text-sm">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-3 text-amber-500" />
            Memuat data mata kuliah...
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-sm">
            Belum ada mata kuliah yang diampu didelegasikan kepada Anda oleh Administrator.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div 
                key={course.id}
                className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 hover:border-slate-700/60 hover:bg-slate-900/60 transition-all duration-300 flex flex-col justify-between space-y-6 shadow-xl relative overflow-hidden group"
              >
                <div className="space-y-4">
                  {/* Top badges */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-slate-800 text-slate-300 font-extrabold px-2.5 py-1 rounded">
                      {course.code}
                    </span>
                    <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 font-extrabold px-3 py-1 rounded-full">
                      Semester {course.semester}
                    </span>
                  </div>

                  {/* Course Info */}
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-lg text-white group-hover:text-amber-400 transition-colors">
                      {course.name}
                    </h3>
                    <p className="text-slate-500 text-xs">
                      Universitas Pembangunan Nasional
                    </p>
                  </div>
                </div>

                {/* Counter Stats & Action button */}
                <div className="space-y-4 pt-4 border-t border-slate-800/60">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-950/40 border border-slate-800/40 rounded-xl p-3 flex items-center space-x-2.5">
                      <Users className="w-4 h-4 text-amber-500/60 shrink-0" />
                      <div className="text-[11px]">
                        <p className="text-slate-500 uppercase font-semibold">Mahasiswa</p>
                        <p className="text-slate-200 font-bold">{course._count.enrollments}</p>
                      </div>
                    </div>
                    
                    <div className="bg-slate-950/40 border border-slate-800/40 rounded-xl p-3 flex items-center space-x-2.5">
                      <FileText className="w-4 h-4 text-indigo-500/60 shrink-0" />
                      <div className="text-[11px]">
                        <p className="text-slate-500 uppercase font-semibold">Tugas</p>
                        <p className="text-slate-200 font-bold">{course._count.tasks}</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => openStudentsModal(course)}
                    className="w-full py-2.5 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 border border-slate-700/60 hover:border-amber-500 text-slate-300 text-xs font-bold rounded-xl transition-all duration-300 cursor-pointer flex items-center justify-center space-x-1.5"
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>Lihat Daftar Mahasiswa</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>

      {/* Read-Only Enrolled Students Modal */}
      {showStudentsModal && selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl p-6 space-y-6 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
              <div>
                <h4 className="text-lg font-bold text-white">Daftar Mahasiswa Terdaftar</h4>
                <p className="text-xs text-slate-500 mt-0.5">{selectedCourse.code} • {selectedCourse.name}</p>
              </div>
              <button 
                onClick={() => setShowStudentsModal(false)}
                className="text-slate-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Indicator */}
            {modalError && (
              <div className="bg-red-950/20 border border-red-900/40 p-3.5 rounded-xl text-xs text-red-400 shrink-0">
                {modalError}
              </div>
            )}

            {/* Enrolled Students Table */}
            <div className="flex-1 overflow-y-auto space-y-3">
              {loadingStudents ? (
                <div className="py-16 text-center text-slate-500 text-xs">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-amber-500" />
                  Memuat data mahasiswa...
                </div>
              ) : enrolledStudents.length === 0 ? (
                <div className="py-16 text-center text-slate-600 text-xs italic">
                  Belum ada mahasiswa yang didaftarkan pada mata kuliah ini oleh Administrator.
                </div>
              ) : (
                <div className="border border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-500 font-bold">
                        <th className="px-4 py-3">Nama Lengkap</th>
                        <th className="px-4 py-3">Alamat Email</th>
                        <th className="px-4 py-3">Semester</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {enrolledStudents.map((e) => (
                        <tr key={e.id} className="hover:bg-slate-850/30 transition-colors">
                          <td className="px-4 py-3 font-semibold text-white">
                            <div className="flex items-center space-x-3">
                              <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center font-bold text-amber-400 text-[10px] uppercase">
                                {e.student.name.charAt(0)}
                              </div>
                              <span>{e.student.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-400">{e.student.email}</td>
                          <td className="px-4 py-3">
                            <span className="bg-slate-850 text-slate-300 px-2 py-0.5 rounded text-[10px] font-bold border border-slate-800">
                              Smt {e.student.semester}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="shrink-0 pt-3 border-t border-slate-800/80 text-right">
              <button
                type="button"
                onClick={() => setShowStudentsModal(false)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

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
