'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Users, 
  Check, 
  X, 
  ArrowLeft, 
  UserCheck, 
  RefreshCw, 
  GraduationCap,
  Shield,
  LogOut,
  PlusCircle,
  Menu,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import { AnimatedButton } from '@/components/ui/AnimatedButton';

interface LecturerData {
  id: string;
  name: string;
  email: string;
}

interface CourseData {
  id: string;
  code: string;
  name: string;
  semester: number;
  lecturerId: string;
  lecturer: LecturerData;
  _count: {
    tasks: number;
    enrollments: number;
  };
}

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  semester: number | null;
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

export default function AdminCoursesPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [lecturers, setLecturers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Course Modal State
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [modalMode, setModalMode] = useState<'ADD' | 'EDIT'>('ADD');
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [courseSemester, setCourseSemester] = useState(1);
  const [courseLecturerId, setCourseLecturerId] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Enrollments Modal State
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<CourseData | null>(null);
  const [enrolledStudents, setEnrolledStudents] = useState<EnrollmentData[]>([]);
  const [allStudents, setAllStudents] = useState<UserData[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [enrollError, setEnrollError] = useState<string | null>(null);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Fetch all initial data
  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch courses
      const coursesRes = await fetch('/api/admin/courses');
      if (coursesRes.ok) {
        const coursesData = await coursesRes.json();
        setCourses(coursesData);
      }

      // Fetch users to filter for lecturers
      const usersRes = await fetch('/api/admin/users');
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        const docs = usersData.filter((u: any) => u.role === 'DOSEN');
        setLecturers(docs);
        if (docs.length > 0) {
          setCourseLecturerId(docs[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching admin courses page data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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

  // Open Add Course Modal
  const openAddModal = () => {
    setModalMode('ADD');
    setEditingCourseId(null);
    setCourseCode('');
    setCourseName('');
    setCourseSemester(1);
    if (lecturers.length > 0) {
      setCourseLecturerId(lecturers[0].id);
    } else {
      setCourseLecturerId('');
    }
    setFormError(null);
    setShowCourseModal(true);
  };

  // Open Edit Course Modal
  const openEditModal = (course: CourseData) => {
    setModalMode('EDIT');
    setEditingCourseId(course.id);
    setCourseCode(course.code);
    setCourseName(course.name);
    setCourseSemester(course.semester);
    setCourseLecturerId(course.lecturerId);
    setFormError(null);
    setShowCourseModal(true);
  };

  // Submit Course Form (Create / Update)
  const handleCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!courseCode || !courseName || !courseSemester || !courseLecturerId) {
      setFormError('Semua field wajib diisi.');
      return;
    }

    try {
      const url = modalMode === 'ADD' 
        ? '/api/admin/courses' 
        : `/api/admin/courses/${editingCourseId}`;
      const method = modalMode === 'ADD' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: courseCode,
          name: courseName,
          semester: courseSemester,
          lecturerId: courseLecturerId,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setShowCourseModal(false);
        fetchData();
      } else {
        setFormError(data.error || 'Terjadi kesalahan saat memproses data.');
      }
    } catch (err) {
      console.error('Error submitting course form:', err);
      setFormError('Koneksi server gagal.');
    }
  };

  // Delete Course
  const handleDeleteCourse = async (courseId: string) => {
    const confirmDelete = window.confirm('Apakah Anda yakin ingin menghapus mata kuliah ini?');
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (res.ok) {
        fetchData();
      } else {
        alert(data.error || 'Gagal menghapus mata kuliah.');
      }
    } catch (err) {
      console.error('Error deleting course:', err);
      alert('Koneksi server gagal.');
    }
  };

  // Open Manage Students Modal
  const openEnrollModal = async (course: CourseData) => {
    setSelectedCourse(course);
    setEnrollError(null);
    setShowEnrollModal(true);
    setLoadingEnrollments(true);

    try {
      const res = await fetch(`/api/admin/courses/${course.id}/enrollments`);
      if (res.ok) {
        const data = await res.json();
        setEnrolledStudents(data.enrolled);
        
        // Filter out students who are already enrolled
        const enrolledIds = new Set(data.enrolled.map((e: EnrollmentData) => e.studentId));
        const filteredAllStudents = data.allStudents.filter((s: UserData) => !enrolledIds.has(s.id));
        setAllStudents(filteredAllStudents);

        if (filteredAllStudents.length > 0) {
          setSelectedStudentId(filteredAllStudents[0].id);
        } else {
          setSelectedStudentId('');
        }
      }
    } catch (err) {
      console.error('Error loading course enrollments:', err);
      setEnrollError('Gagal memuat daftar mahasiswa terdaftar.');
    } finally {
      setLoadingEnrollments(false);
    }
  };

  // Enroll Student to Course
  const handleEnrollStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnrollError(null);

    if (!selectedStudentId || !selectedCourse) return;

    try {
      const res = await fetch(`/api/admin/courses/${selectedCourse.id}/enrollments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: selectedStudentId }),
      });

      const data = await res.json();

      if (res.ok) {
        // Refresh enrollments modal lists
        openEnrollModal(selectedCourse);
        // Refresh outer screen metrics
        fetchData();
      } else {
        setEnrollError(data.error || 'Gagal mendaftarkan mahasiswa.');
      }
    } catch (err) {
      console.error('Error enrolling student:', err);
      setEnrollError('Koneksi server gagal.');
    }
  };

  // Remove Student Enrollment
  const handleUnenrollStudent = async (studentId: string) => {
    if (!selectedCourse) return;

    const confirmUnenroll = window.confirm('Apakah Anda yakin ingin membatalkan pendaftaran mahasiswa ini dari kelas?');
    if (!confirmUnenroll) return;

    try {
      const res = await fetch(`/api/admin/courses/${selectedCourse.id}/enrollments/${studentId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (res.ok) {
        openEnrollModal(selectedCourse);
        fetchData();
      } else {
        setEnrollError(data.error || 'Gagal mengeluarkan mahasiswa.');
      }
    } catch (err) {
      console.error('Error unenrolling student:', err);
      setEnrollError('Koneksi server gagal.');
    }
  };

  const filteredCourses = courses.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.lecturer.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans pb-12 flex">
      
      {/* MOBILE TOP NAVBAR BANNER */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-indigo-500 transition-colors cursor-pointer"
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
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors border border-slate-700/40 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* RESPONSIVE FIXED SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-950 border-r border-slate-800 transform lg:transform-none transition-transform duration-300 flex flex-col justify-between ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Sidebar Header & Links */}
        <div className="p-6 space-y-8">
          
          {/* Header logo */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative w-9 h-9 rounded-xl overflow-hidden shadow border border-indigo-500/20 bg-slate-950 flex items-center justify-center">
                <Image src="/logo.png" alt="StudyPulse Logo" fill className="object-cover" />
              </div>
              <div>
                <h1 className="text-base font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-600 bg-clip-text text-transparent leading-none">
                  StudyPulse
                </h1>
                <span className="text-[9px] text-indigo-500 font-extrabold uppercase tracking-widest mt-1 block font-heading">Admin Panel</span>
              </div>
            </div>

            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg hover:bg-slate-900 text-slate-500 transition-colors cursor-pointer"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <Link 
              href="/dashboard/admin" 
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold text-slate-400 hover:text-indigo-400 hover:bg-slate-900 border border-transparent transition-all select-none"
            >
              <Users className="w-4.5 h-4.5" />
              <span>Kelola Pengguna</span>
            </Link>
            <Link 
              href="/dashboard/admin/courses" 
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold text-indigo-400 bg-indigo-500/5 border border-indigo-500/10 transition-all select-none"
            >
              <BookOpen className="w-4.5 h-4.5" />
              <span>Kelola Mata Kuliah</span>
            </Link>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-6 border-t border-slate-800 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 font-bold flex items-center justify-center text-xs uppercase shadow-sm">
              A
            </div>
            <div className="truncate space-y-0.5">
              <p className="text-xs font-bold text-white truncate">Administrator</p>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Root Admin</span>
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

      {/* MAIN ADMIN WORKSPACE */}
      <main className="flex-grow max-w-7xl mx-auto px-6 mt-24 lg:mt-8 space-y-8 lg:pl-72 transition-all">
        
        {/* Welcome Header Hero Banner */}
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden animate-fadeIn">
          <div className="absolute right-0 bottom-0 top-0 w-96 bg-gradient-to-l from-indigo-500/5 to-transparent blur-3xl rounded-full -mr-20 pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="text-[9px] bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 font-extrabold px-3 py-1 rounded-full uppercase tracking-wider flex items-center space-x-1 w-max">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Sistem Kurikulum StudyPulse</span>
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">Manajemen Mata Kuliah</h2>
              <p className="text-slate-550 dark:text-slate-450 max-w-xl text-sm leading-relaxed">
                Kelola daftar kurikulum mata kuliah aktif, tugaskan dosen pengampu yang berwenang, serta daftarkan mahasiswa ke dalam kelas yang sesuai.
              </p>
            </div>
            
            <button
              onClick={openAddModal}
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-500 to-violet-650 hover:from-indigo-600 hover:to-violet-755 text-white font-bold px-6 py-3.5 rounded-xl text-xs transition-all duration-300 shadow-md shadow-indigo-500/10 select-none whitespace-nowrap cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Tambah Mata Kuliah</span>
            </button>
          </div>
        </div>

        {/* Courses Table Container */}
        <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          {/* Header Table */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Daftar Mata Kuliah Sistem</h3>
              <p className="text-xs text-slate-500 mt-0.5">Daftar seluruh kurikulum mata kuliah aktif beserta dosen dan kuota mahasiswa.</p>
            </div>

            {/* Search Input */}
            <div className="relative max-w-sm w-full">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-655">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Cari kode, mata kuliah, atau dosen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-850 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-650 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-20 text-center text-slate-400 text-sm">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-3 text-indigo-550" />
                Memuat data mata kuliah...
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="py-20 text-center text-slate-450 text-sm">
                Tidak ada data mata kuliah yang sesuai.
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/20 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                    <th className="px-6 py-4">Kode Kelas</th>
                    <th className="px-6 py-4">Nama Mata Kuliah</th>
                    <th className="px-6 py-4">Semester</th>
                    <th className="px-6 py-4">Dosen Pengampu</th>
                    <th className="px-6 py-4">Jumlah Terdaftar</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-xs text-slate-700 dark:text-slate-355">
                  {filteredCourses.map((course) => (
                    <tr key={course.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/20 transition-colors">
                      {/* Code */}
                      <td className="px-6 py-4 font-extrabold text-indigo-500 dark:text-indigo-400">
                        {course.code}
                      </td>

                      {/* Name */}
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                        {course.name}
                      </td>

                      {/* Semester */}
                      <td className="px-6 py-4">
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-655 dark:text-slate-300 px-2 py-0.5 rounded font-bold border border-slate-200 dark:border-slate-700">
                          Smt {course.semester}
                        </span>
                      </td>

                      {/* Lecturer */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{course.lecturer.name}</span>
                          <span className="text-[10px] text-slate-450 dark:text-slate-500 mt-0.5">{course.lecturer.email}</span>
                        </div>
                      </td>

                      {/* Enrollments Count */}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300 font-semibold">
                          <Users className="w-3.5 h-3.5 text-indigo-500/60" />
                          <span>{course._count.enrollments} Mahasiswa</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => openEnrollModal(course)}
                            className="px-2.5 py-1.5 bg-indigo-500/10 hover:bg-indigo-500 hover:text-white text-indigo-500 dark:text-indigo-400 border border-indigo-500/20 rounded-lg transition-all text-[11px] font-bold flex items-center space-x-1 cursor-pointer"
                            title="Kelola Mahasiswa Terdaftar"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Mahasiswa</span>
                          </button>

                          <button
                            onClick={() => openEditModal(course)}
                            className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg transition-all cursor-pointer"
                            title="Ubah Kelas"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteCourse(course.id)}
                            className="p-1.5 bg-red-500/10 hover:bg-red-650 hover:text-white text-red-500 border border-red-500/20 rounded-lg transition-all cursor-pointer"
                            title="Hapus Kelas"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </main>

      {/* Course CRUD Modal */}
      {showCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative p-6 space-y-6 animate-slideUp">
            <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-600" />
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                {modalMode === 'ADD' ? 'Tambah Mata Kuliah' : 'Ubah Mata Kuliah'}
              </h4>
              <button 
                onClick={() => setShowCourseModal(false)}
                className="text-slate-400 hover:text-slate-650 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="bg-red-500/10 border border-red-500/20 p-3.5 rounded-xl text-xs text-red-650 dark:text-red-450 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCourseSubmit} className="space-y-4">
              {/* Code */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Kode Mata Kuliah</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: IF101"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value.toUpperCase())}
                  className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 focus:border-indigo-500/80 rounded-xl py-2.5 px-4 text-xs text-slate-850 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-650 focus:outline-none transition-all duration-300"
                />
              </div>

              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nama Mata Kuliah</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pemrograman Web Lanjut"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 focus:border-indigo-500/80 rounded-xl py-2.5 px-4 text-xs text-slate-850 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-650 focus:outline-none transition-all duration-300"
                />
              </div>

              {/* Semester */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Semester Berlaku</label>
                <select
                  value={courseSemester}
                  onChange={(e) => setCourseSemester(parseInt(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 focus:border-indigo-500/80 rounded-xl py-2.5 px-4 text-xs text-slate-850 dark:text-slate-200 focus:outline-none cursor-pointer"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                    <option key={num} value={num}>Semester {num}</option>
                  ))}
                </select>
              </div>

              {/* Lecturer */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Dosen Pengampu</label>
                {lecturers.length === 0 ? (
                  <p className="text-xs text-amber-550 font-bold italic">Belum ada akun Dosen terdaftar di sistem. Daftarkan dosen terlebih dahulu.</p>
                ) : (
                  <select
                    value={courseLecturerId}
                    onChange={(e) => setCourseLecturerId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 focus:border-indigo-500/80 rounded-xl py-2.5 px-4 text-xs text-slate-850 dark:text-slate-200 focus:outline-none cursor-pointer"
                  >
                    {lecturers.map((doc) => (
                      <option key={doc.id} value={doc.id}>{doc.name} ({doc.email})</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setShowCourseModal(false)}
                  className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-550 dark:text-slate-300 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-250 transition-colors cursor-pointer"
                >
                  Batalkan
                </button>
                
                <AnimatedButton
                  type="submit"
                  disabled={lecturers.length === 0}
                  className="px-5 py-2.5 flex items-center justify-center space-x-1.5 text-xs font-bold cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Simpan Perubahan</span>
                </AnimatedButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enrollments Management Modal */}
      {showEnrollModal && selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl relative p-6 space-y-6 flex flex-col max-h-[90vh] animate-slideUp">
            <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-600" />
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 shrink-0">
              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">Kelola Mahasiswa Terdaftar</h4>
                <p className="text-xs text-slate-450 dark:text-slate-550 mt-0.5">{selectedCourse.code} • {selectedCourse.name}</p>
              </div>
              <button 
                onClick={() => setShowEnrollModal(false)}
                className="text-slate-400 hover:text-slate-655 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Indicator */}
            {enrollError && (
              <div className="bg-red-500/10 border border-red-500/20 p-3.5 rounded-xl text-xs text-red-650 dark:text-red-455 flex items-start gap-2 shrink-0">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{enrollError}</span>
              </div>
            )}

            {/* Form Section: Add Student */}
            <form onSubmit={handleEnrollStudent} className="p-4 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-850 rounded-2xl space-y-3 shrink-0">
              <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-450 dark:text-slate-400">Daftarkan Mahasiswa Baru</h5>
              <div className="flex flex-col sm:flex-row gap-3">
                {allStudents.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-2">Semua mahasiswa aktif sistem sudah terdaftar di kelas ini.</p>
                ) : (
                  <>
                    <select
                      value={selectedStudentId}
                      onChange={(e) => setSelectedStudentId(e.target.value)}
                      className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500/80 rounded-xl py-2 px-3.5 text-xs text-slate-850 dark:text-slate-200 focus:outline-none cursor-pointer"
                    >
                      {allStudents.map((stud) => (
                        <option key={stud.id} value={stud.id}>
                          {stud.name} (Smt {stud.semester || '-'}) - {stud.email}
                        </option>
                      ))}
                    </select>
                    
                    <button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2 px-5 rounded-xl transition-all shadow shadow-indigo-650/15 cursor-pointer flex items-center justify-center space-x-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Daftarkan</span>
                    </button>
                  </>
                )}
              </div>
            </form>

            {/* Enrolled Students Table */}
            <div className="flex-1 overflow-y-auto space-y-3">
              <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-450 dark:text-slate-400">Daftar Mahasiswa Aktif Kelas</h5>
              
              {loadingEnrollments ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-550" />
                  Memuat lembar pendaftaran...
                </div>
              ) : enrolledStudents.length === 0 ? (
                <div className="py-12 text-center text-slate-500 dark:text-slate-650 text-xs italic">
                  Belum ada mahasiswa yang didaftarkan pada kelas ini.
                </div>
              ) : (
                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-955">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 text-slate-505 dark:text-slate-450 font-bold">
                        <th className="px-4 py-3">Nama Mahasiswa</th>
                        <th className="px-4 py-3">Semester</th>
                        <th className="px-4 py-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800/50 text-slate-700 dark:text-slate-350">
                      {enrolledStudents.map((e) => (
                        <tr key={e.id} className="hover:bg-slate-100/45 dark:hover:bg-slate-900/30 transition-colors">
                          <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                            <div className="flex flex-col">
                              <span>{e.student.name}</span>
                              <span className="text-[10px] text-slate-450 dark:text-slate-500 font-normal">{e.student.email}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="bg-slate-100 dark:bg-slate-800 text-slate-655 dark:text-slate-300 px-2 py-0.5 rounded text-[10px] font-bold border border-slate-200 dark:border-slate-750">
                              Semester {e.student.semester}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleUnenrollStudent(e.studentId)}
                              className="text-red-500 hover:text-red-650 transition-colors text-[11px] font-bold cursor-pointer"
                            >
                              Keluarkan
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="shrink-0 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-right">
              <button
                type="button"
                onClick={() => setShowEnrollModal(false)}
                className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Selesai
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-6 text-center animate-slideUp">
            <div className="p-3 bg-red-500/10 text-red-550 dark:text-red-400 rounded-2xl inline-flex mx-auto">
              <LogOut className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Konfirmasi Keluar</h3>
              <p className="text-sm text-slate-550 dark:text-slate-450 leading-relaxed">
                Apakah Anda yakin ingin keluar dari dasbor admin StudyPulse Anda?
              </p>
            </div>
            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-250 text-xs font-bold text-slate-550 dark:text-slate-300 transition-all cursor-pointer"
              >
                Batal
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
