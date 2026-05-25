'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  RefreshCw, 
  Search, 
  Edit2, 
  Check, 
  X, 
  LogOut, 
  Shield, 
  Trash2,
  AlertTriangle,
  Menu,
  Sparkles
} from 'lucide-react';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import { AnimatedButton } from '@/components/ui/AnimatedButton';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  semester: number | null;
  createdAt: string;
}

export default function AdminDashboard() {
  const router = useRouter();

  // Sidebar navigation state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Core Data States
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal & Edit State
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null);
  
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editSemester, setEditSemester] = useState<number | null>(null);
  
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  
  // Migration State
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationMessage, setMigrationMessage] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Fetch Users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        console.error('Failed to fetch users');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle Logout
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

  // Start Edit Modal
  const openEditModal = (user: UserData) => {
    setSelectedUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role);
    setEditSemester(user.semester);
    setSaveError(null);
    setShowEditModal(true);
  };

  // Submit Edit Form
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    try {
      setSaveLoading(true);
      setSaveError(null);

      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          email: editEmail,
          role: editRole,
          semester: editRole === 'MAHASISWA' ? editSemester : null,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setShowEditModal(false);
        setSelectedUser(null);
        fetchUsers();
      } else {
        setSaveError(data.error || 'Gagal memperbarui pengguna.');
      }
    } catch (err) {
      console.error('Save edit error:', err);
      setSaveError('Terjadi kesalahan koneksi server.');
    } finally {
      setSaveLoading(false);
    }
  };

  // Start Delete Modal
  const openDeleteModal = (user: UserData) => {
    setUserToDelete(user);
    setDeleteError(null);
    setShowDeleteModal(true);
  };

  // Submit Delete
  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      setDeleteLoading(true);
      setDeleteError(null);

      const res = await fetch(`/api/admin/users/${userToDelete.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (res.ok) {
        setShowDeleteModal(false);
        setUserToDelete(null);
        fetchUsers();
      } else {
        setDeleteError(data.error || 'Gagal menghapus pengguna.');
      }
    } catch (err) {
      console.error('Delete user error:', err);
      setDeleteError('Terjadi kesalahan koneksi server.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Trigger Migration
  const runMigration = async () => {
    try {
      setIsMigrating(true);
      setMigrationMessage(null);
      setShowConfirmModal(false);

      const res = await fetch('/api/admin/migrate-semester', { method: 'POST' });
      const data = await res.json();

      if (res.ok) {
        setMigrationMessage(
          `Sukses! ${data.message || ''} (Dimigrasi: ${data.details?.migrated || 0}, Lulus: ${data.details?.graduated || 0})`
        );
        fetchUsers();
      } else {
        setMigrationMessage(`Error: ${data.error || 'Gagal melakukan migrasi.'}`);
      }
    } catch (err) {
      console.error('Migration error:', err);
      setMigrationMessage('Terjadi kesalahan koneksi server.');
    } finally {
      setIsMigrating(false);
    }
  };

  // Filtered Users
  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Statistics
  const totalStudents = users.filter((u) => u.role === 'MAHASISWA').length;
  const totalLecturers = users.filter((u) => u.role === 'DOSEN').length;
  const totalAdmins = users.filter((u) => u.role === 'ADMIN').length;
  const totalUsers = users.length;

  // Simple Chart Math Percentages
  const studentPercent = totalUsers > 0 ? Math.round((totalStudents / totalUsers) * 100) : 0;
  const lecturerPercent = totalUsers > 0 ? Math.round((totalLecturers / totalUsers) * 100) : 0;
  const adminPercent = totalUsers > 0 ? 100 - studentPercent - lecturerPercent : 0;

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
          className="p-1.5 rounded-lg bg-slate-100 hover:bg-red-500/10 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-red-500 transition-colors border border-slate-200/40 dark:border-slate-700/40 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* RESPONSIVE FIXED SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 transform lg:transform-none transition-transform duration-300 flex flex-col justify-between ${
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
              className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 dark:text-slate-500 transition-colors cursor-pointer"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <Link 
              href="/dashboard/admin" 
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold text-indigo-500 dark:text-indigo-400 bg-indigo-500/5 border border-indigo-500/10 transition-all select-none"
            >
              <Users className="w-4.5 h-4.5" />
              <span>Kelola Pengguna</span>
            </Link>
            <Link 
              href="/dashboard/admin/courses" 
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-550 hover:bg-slate-100 dark:hover:bg-slate-900 border border-transparent transition-all select-none"
            >
              <BookOpen className="w-4.5 h-4.5" />
              <span>Kelola Mata Kuliah</span>
            </Link>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 font-bold flex items-center justify-center text-xs uppercase shadow-sm">
              A
            </div>
            <div className="truncate space-y-0.5">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">Administrator</p>
              <span className="text-[9px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider">Root Admin</span>
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
          <div className="relative z-10 space-y-2">
            <span className="text-[9px] bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 font-extrabold px-3 py-1 rounded-full uppercase tracking-wider flex items-center space-x-1 w-max">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sistem Pusat StudyPulse</span>
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">Selamat Datang, Admin Portal</h2>
            <p className="text-slate-550 dark:text-slate-450 max-w-xl text-sm leading-relaxed">
              Kelola penugasan, akun pengguna, semester mahasiswa, serta eksekusi migrasi semester massal dengan aman dan terstruktur.
            </p>
          </div>
        </div>

        {/* Dynamic Statistics Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AnimatedCard delay={50} className="p-5 flex items-center space-x-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="p-3.5 rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] text-slate-450 dark:text-slate-500 font-extrabold uppercase tracking-wider">Total Pengguna</p>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">{totalUsers} Akun</h3>
            </div>
          </AnimatedCard>

          <AnimatedCard delay={100} className="p-5 flex items-center space-x-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="p-3.5 rounded-xl bg-emerald-500/10 text-emerald-650 dark:text-emerald-400 border border-emerald-500/25">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] text-slate-450 dark:text-slate-500 font-extrabold uppercase tracking-wider">Total Mahasiswa</p>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">{totalStudents} Aktif</h3>
            </div>
          </AnimatedCard>

          <AnimatedCard delay={150} className="p-5 flex items-center space-x-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="p-3.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] text-slate-450 dark:text-slate-500 font-extrabold uppercase tracking-wider">Total Dosen</p>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">{totalLecturers} Pengajar</h3>
            </div>
          </AnimatedCard>
        </div>

        {/* DEMOGRAPHIC DISTRIBUTION CHART (TAMPILAN ADMIN CHART SEDERHANA) */}
        <AnimatedCard delay={200} className="p-6 space-y-4">
          <div className="space-y-1">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">Distribusi Peran Pengguna</h3>
            <p className="text-xs text-slate-550 dark:text-slate-500">Visualisasi demografis perbandingan jumlah Mahasiswa, Dosen, dan Admin.</p>
          </div>

          {/* Simple Stacked Progress Bar Chart */}
          <div className="space-y-4 pt-2">
            <div className="w-full h-8 bg-slate-100 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden flex shadow-inner">
              <div 
                style={{ width: `${studentPercent}%` }} 
                className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 hover:opacity-90 transition-all flex items-center justify-center text-[10px] font-black text-white" 
                title={`Mahasiswa: ${totalStudents} (${studentPercent}%)`}
              >
                {studentPercent > 10 ? `${studentPercent}%` : ''}
              </div>
              <div 
                style={{ width: `${lecturerPercent}%` }} 
                className="h-full bg-gradient-to-r from-amber-400 to-orange-500 hover:opacity-90 transition-all flex items-center justify-center text-[10px] font-black text-slate-950" 
                title={`Dosen: ${totalLecturers} (${lecturerPercent}%)`}
              >
                {lecturerPercent > 10 ? `${lecturerPercent}%` : ''}
              </div>
              <div 
                style={{ width: `${adminPercent}%` }} 
                className="h-full bg-gradient-to-r from-red-500 to-rose-600 hover:opacity-90 transition-all flex items-center justify-center text-[10px] font-black text-white" 
                title={`Admin: ${totalAdmins} (${adminPercent}%)`}
              >
                {adminPercent > 10 ? `${adminPercent}%` : ''}
              </div>
            </div>

            {/* Chart Legends */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-550 dark:text-slate-400">
              <div className="flex items-center space-x-2">
                <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-emerald-450 to-teal-550 shrink-0" />
                <span>Mahasiswa: {totalStudents} ({studentPercent}%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-amber-450 to-orange-550 shrink-0" />
                <span>Dosen: {totalLecturers} ({lecturerPercent}%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-red-550 to-rose-550 shrink-0" />
                <span>Admin: {totalAdmins} ({adminPercent}%)</span>
              </div>
            </div>
          </div>
        </AnimatedCard>

        {/* Semester Migration Console */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm relative overflow-hidden">
          <div className="absolute right-0 bottom-0 top-0 w-96 bg-gradient-to-l from-indigo-500/5 to-transparent blur-3xl rounded-full -mr-20 pointer-events-none" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="h-2.5 w-2.5 rounded-full bg-indigo-500 animate-pulse" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Konsol Migrasi Semester Massal</h3>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-xs max-w-3xl leading-relaxed">
                Tindakan krusial untuk menaikkan tingkat semester berjalan seluruh Mahasiswa aktif secara massal (**sebesar +1**). 
                Proses ini akan mengarsipkan seluruh kelas aktif mahasiswa lama menjadi **ARCHIVED**, 
                serta secara otomatis mendaftarkan mereka ke mata kuliah di semester baru yang sesuai.
              </p>
            </div>
            
            <button
              onClick={() => setShowConfirmModal(true)}
              disabled={isMigrating}
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-500 to-violet-650 hover:from-indigo-600 hover:to-violet-755 text-white font-bold px-6 py-3.5 rounded-xl text-xs transition-all duration-300 shadow-md shadow-indigo-500/10 disabled:opacity-50 select-none whitespace-nowrap cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isMigrating ? 'animate-spin' : ''}`} />
              <span>{isMigrating ? 'Memproses...' : 'Migrasi Semester'}</span>
            </button>
          </div>

          {migrationMessage && (
            <div className={`mt-4 p-4 rounded-xl text-xs border relative z-10 ${
              migrationMessage.startsWith('Error') 
                ? 'bg-red-500/10 border-red-500/20 text-red-650' 
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-650'
            }`}>
              {migrationMessage}
            </div>
          )}
        </div>

        {/* User Management Table */}
        <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          {/* Header Table */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Manajemen Kredensial Pengguna</h3>
              <p className="text-xs text-slate-500 mt-0.5">Daftar lengkap pengguna terdaftar sistem.</p>
            </div>

            {/* Search Input */}
            <div className="relative max-w-sm w-full">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-655">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Cari nama, email, atau peran..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-650 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-20 text-center text-slate-400 text-sm">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-3 text-indigo-550" />
                Memuat data pengguna...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="py-20 text-center text-slate-450 text-sm">
                Tidak ada pengguna yang cocok dengan kriteria pencarian.
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/20 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                    <th className="px-6 py-4">Nama Lengkap</th>
                    <th className="px-6 py-4">Alamat Email</th>
                    <th className="px-6 py-4">Peran Akun</th>
                    <th className="px-6 py-4">Semester Aktif</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-xs text-slate-700 dark:text-slate-300">
                  {filteredUsers.map((user) => (
                    <tr 
                      key={user.id} 
                      className="hover:bg-slate-50 dark:hover:bg-slate-900/20 transition-colors"
                    >
                      {/* Name */}
                      <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-bold text-indigo-500 text-xs uppercase shadow-sm shrink-0">
                            {user.name.charAt(0)}
                          </div>
                          <span>{user.name}</span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{user.email}</td>

                      {/* Role */}
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold tracking-wide uppercase ${
                          user.role === 'ADMIN' 
                            ? 'bg-red-500/10 text-red-550 dark:text-red-400 border border-red-500/20' 
                            : user.role === 'DOSEN'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-450 border border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-650 dark:text-emerald-450 border border-emerald-500/20'
                        }`}>
                          {user.role}
                        </span>
                      </td>

                      {/* Semester */}
                      <td className="px-6 py-4">
                        {user.semester ? (
                          <span className="bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-300 px-2 py-0.5 rounded font-bold border border-slate-200 dark:border-slate-700">
                            Smt {user.semester}
                          </span>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-600">-</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => openEditModal(user)}
                            className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-500/10 dark:hover:bg-indigo-950/40 text-slate-500 dark:text-slate-400 hover:text-indigo-650 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 rounded-lg transition-all cursor-pointer"
                            title="Ubah Data"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(user)}
                            className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-red-500/10 dark:hover:bg-red-950/40 text-slate-500 dark:text-slate-400 hover:text-red-500 border border-slate-200 dark:border-slate-700 rounded-lg transition-all cursor-pointer"
                            title="Hapus Pengguna"
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

      {/* Confirmation Migration Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl p-6 space-y-6 text-center animate-slideUp">
            <div className="space-y-2">
              <div className="flex items-center space-x-3 text-amber-500 justify-center">
                <RefreshCw className="w-6 h-6 animate-spin text-indigo-550" />
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">Konfirmasi Tindakan Krusial</h4>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                Apakah Anda benar-benar yakin ingin mengeksekusi **Migrasi Semester Massal**? 
                Seluruh mahasiswa akan naik +1 semester secara permanen dan kelas lama berstatus **ARCHIVED**.
              </p>
            </div>

            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2.5 border border-slate-200 dark:border-slate-750 text-slate-550 dark:text-slate-300 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Batalkan
              </button>
              <button
                onClick={runMigration}
                className="px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-650 hover:from-indigo-650 hover:to-violet-755 text-white rounded-xl text-xs font-bold shadow shadow-indigo-500/10 transition-all cursor-pointer"
              >
                Ya, Eksekusi Sekarang
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
              <p className="text-sm text-slate-500 dark:text-slate-450 leading-relaxed">
                Apakah Anda yakin ingin keluar dari dasbor admin StudyPulse Anda?
              </p>
            </div>
            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-slate-550 dark:text-slate-300 transition-all cursor-pointer"
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

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl relative animate-slideUp">
            <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-600" />
            
            {/* Modal Header */}
            <div className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Edit2 className="w-5 h-5 text-indigo-500" />
                  Edit Pengguna
                </h3>
                <p className="text-xs text-slate-400 mt-1">Ubah data kredensial dan peran pengguna ini.</p>
              </div>
              <button 
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedUser(null);
                  setSaveError(null);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              {saveError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-650 dark:text-red-450 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{saveError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-850 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-650 focus:outline-none focus:border-indigo-500"
                  placeholder="Masukkan nama lengkap"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Alamat Email</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-850 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-650 focus:outline-none focus:border-indigo-500"
                  placeholder="nama@unperba.ac.id"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Peran Akun</label>
                  <select
                    value={editRole}
                    onChange={(e) => {
                      setEditRole(e.target.value);
                      if (e.target.value !== 'MAHASISWA') {
                        setEditSemester(null);
                      } else if (!editSemester) {
                        setEditSemester(1);
                      }
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-850 dark:text-slate-200 focus:outline-none cursor-pointer"
                  >
                    <option value="MAHASISWA">MAHASISWA</option>
                    <option value="DOSEN">DOSEN</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>

                {editRole === 'MAHASISWA' && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Semester Aktif</label>
                    <select
                      value={editSemester || 1}
                      onChange={(e) => setEditSemester(parseInt(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-850 dark:text-slate-200 focus:outline-none cursor-pointer"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                        <option key={num} value={num}>Semester {num}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedUser(null);
                    setSaveError(null);
                  }}
                  className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-550 dark:text-slate-300 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Batalkan
                </button>
                
                <AnimatedButton
                  type="submit"
                  loading={saveLoading}
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

      {/* Delete User Modal */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative animate-slideUp">
            <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-red-500" />
            
            {/* Modal Header */}
            <div className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3 text-red-500">
                <div className="p-2 bg-red-550/10 rounded-xl">
                  <Trash2 className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Konfirmasi Hapus</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Tindakan ini tidak dapat dibatalkan.</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowDeleteModal(false);
                  setUserToDelete(null);
                  setDeleteError(null);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {deleteError && (
                <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-650 dark:text-red-450 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{deleteError}</span>
                </div>
              )}

              <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2">
                <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Pengguna yang akan dihapus</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-bold text-indigo-500 text-xs uppercase shadow-sm">
                    {userToDelete.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{userToDelete.name}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{userToDelete.email}</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-200/50 dark:border-slate-800/50 flex gap-2">
                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[9px] font-bold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 uppercase">
                    {userToDelete.role}
                  </span>
                  {userToDelete.semester && (
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[9px] font-bold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                      Semester {userToDelete.semester}
                    </span>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Apakah Anda yakin ingin menghapus pengguna ini? Sistem akan memvalidasi seluruh data relasi sebelum menghapus secara permanen.
              </p>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setUserToDelete(null);
                    setDeleteError(null);
                  }}
                  className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-550 dark:text-slate-300 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Batalkan
                </button>
                
                <AnimatedButton
                  variant="danger"
                  loading={deleteLoading}
                  onClick={handleDeleteUser}
                  className="px-5 py-2.5 flex items-center justify-center space-x-1.5 text-xs font-bold cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Pengguna</span>
                </AnimatedButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
