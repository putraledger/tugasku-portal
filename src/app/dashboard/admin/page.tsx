'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
  UserCheck 
} from 'lucide-react';

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
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal & Edit State
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState('');
  const [editSemester, setEditSemester] = useState<number | null>(null);
  
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

  // Start Inline Editing
  const startEdit = (user: UserData) => {
    setEditingUserId(user.id);
    setEditRole(user.role);
    setEditSemester(user.semester);
  };

  // Save Inline Editing
  const saveEdit = async (userId: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          role: editRole,
          semester: editRole === 'MAHASISWA' ? editSemester : null,
        }),
      });

      if (res.ok) {
        setEditingUserId(null);
        fetchUsers();
      } else {
        const data = await res.json();
        alert(data.error || 'Gagal memperbarui pengguna');
      }
    } catch (err) {
      console.error('Save edit error:', err);
      alert('Terjadi kesalahan pada server.');
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
  const totalUsers = users.length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-12">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-tr from-indigo-500 to-violet-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-500/20">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                TugasKu Portal
              </h1>
              <p className="text-xs text-indigo-400 font-medium">Administrator Console</p>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-2 pl-4 border-l border-slate-800">
            <Link 
              href="/dashboard/admin" 
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-slate-800 transition-colors"
            >
              Kelola Pengguna
            </Link>
            <Link 
              href="/dashboard/admin/courses" 
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white transition-colors hover:bg-slate-800/40"
            >
              Kelola Mata Kuliah
            </Link>
          </div>
        </div>

        <button 
          onClick={() => setShowLogoutModal(true)}
          className="flex items-center space-x-2 bg-slate-800/80 hover:bg-red-950/40 hover:text-red-400 border border-slate-700/60 hover:border-red-900/50 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar</span>
        </button>
      </nav>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 mt-8 space-y-8">
        
        {/* Header Hero */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/40 border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="absolute right-0 bottom-0 top-0 w-96 bg-gradient-to-l from-indigo-500/5 to-transparent blur-3xl rounded-full -mr-20 pointer-events-none" />
          <div className="relative z-10 space-y-2">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">Selamat Datang, Admin Portal</h2>
            <p className="text-slate-400 max-w-2xl text-sm leading-relaxed">
              Kelola penugasan, akun pengguna, semester mahasiswa, serta eksekusi migrasi semester massal dengan aman dan terstruktur.
            </p>
          </div>
        </div>

        {/* Statistics Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 flex items-center space-x-5 hover:border-slate-700/60 transition-all duration-300 shadow-lg">
            <div className="p-4 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Total Pengguna</p>
              <h3 className="text-2xl font-bold text-white mt-1">{totalUsers} <span className="text-xs text-slate-500 font-normal">akun</span></h3>
            </div>
          </div>
          {/* Card 2 */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 flex items-center space-x-5 hover:border-slate-700/60 transition-all duration-300 shadow-lg">
            <div className="p-4 rounded-xl bg-emerald-500/10 text-emerald-400">
              <GraduationCap className="w-8 h-8" />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Total Mahasiswa</p>
              <h3 className="text-2xl font-bold text-white mt-1">{totalStudents} <span className="text-xs text-slate-500 font-normal">aktif</span></h3>
            </div>
          </div>
          {/* Card 3 */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 flex items-center space-x-5 hover:border-slate-700/60 transition-all duration-300 shadow-lg">
            <div className="p-4 rounded-xl bg-amber-500/10 text-amber-400">
              <BookOpen className="w-8 h-8" />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Total Dosen</p>
              <h3 className="text-2xl font-bold text-white mt-1">{totalLecturers} <span className="text-xs text-slate-500 font-normal">pengajar</span></h3>
            </div>
          </div>
        </div>

        {/* Semester Migration Console */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
                <h3 className="text-lg font-bold text-white">Konsol Migrasi Semester Massal</h3>
              </div>
              <p className="text-slate-400 text-xs max-w-3xl leading-relaxed">
                Tindakan krusial untuk menaikkan tingkat semester berjalan seluruh Mahasiswa aktif secara massal (**sebesar +1**). 
                Proses ini akan mengarsipkan seluruh kelas aktif mahasiswa lama menjadi **ARCHIVED**, 
                serta secara otomatis mendaftarkan mereka ke mata kuliah di semester baru yang sesuai.
              </p>
            </div>
            <button
              onClick={() => setShowConfirmModal(true)}
              disabled={isMigrating}
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-semibold px-6 py-3.5 rounded-xl text-sm transition-all duration-300 shadow-lg shadow-indigo-500/20 disabled:opacity-50 select-none whitespace-nowrap"
            >
              <RefreshCw className={`w-4 h-4 ${isMigrating ? 'animate-spin' : ''}`} />
              <span>{isMigrating ? 'Memproses...' : 'Migrasi Semester'}</span>
            </button>
          </div>

          {migrationMessage && (
            <div className={`mt-4 p-4 rounded-xl text-xs border ${
              migrationMessage.startsWith('Error') 
                ? 'bg-red-950/20 border-red-900/40 text-red-400' 
                : 'bg-emerald-950/20 border-emerald-900/40 text-emerald-400'
            }`}>
              {migrationMessage}
            </div>
          )}
        </div>

        {/* User Management Table */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          {/* Header Table */}
          <div className="p-6 border-b border-slate-800 bg-slate-900/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white">Manajemen Kredensial Pengguna</h3>
              <p className="text-xs text-slate-500 mt-0.5">Daftar lengkap pengguna terdaftar sistem.</p>
            </div>

            {/* Search Input */}
            <div className="relative max-w-sm w-full">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Cari nama, email, atau peran..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-20 text-center text-slate-500 text-sm">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-3 text-indigo-500" />
                Memuat data pengguna...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="py-20 text-center text-slate-500 text-sm">
                Tidak ada pengguna yang cocok dengan kriteria pencarian.
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/20 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    <th className="px-6 py-4">Nama Lengkap</th>
                    <th className="px-6 py-4">Alamat Email</th>
                    <th className="px-6 py-4">Peran Akun</th>
                    <th className="px-6 py-4">Semester Aktif</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {filteredUsers.map((user) => {
                    const isEditing = editingUserId === user.id;

                    return (
                      <tr 
                        key={user.id} 
                        className={`hover:bg-slate-900/20 transition-colors ${
                          isEditing ? 'bg-indigo-950/10' : ''
                        }`}
                      >
                        {/* Name */}
                        <td className="px-6 py-4 font-semibold text-white">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-indigo-400 text-xs uppercase">
                              {user.name.charAt(0)}
                            </div>
                            <span>{user.name}</span>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="px-6 py-4 text-slate-400">{user.email}</td>

                        {/* Role */}
                        <td className="px-6 py-4">
                          {isEditing ? (
                            <select
                              value={editRole}
                              onChange={(e) => {
                                setEditRole(e.target.value);
                                if (e.target.value !== 'MAHASISWA') setEditSemester(null);
                                else if (!editSemester) setEditSemester(1);
                              }}
                              className="bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                            >
                              <option value="MAHASISWA">MAHASISWA</option>
                              <option value="DOSEN">DOSEN</option>
                              <option value="ADMIN">ADMIN</option>
                            </select>
                          ) : (
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                              user.role === 'ADMIN' 
                                ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                                : user.role === 'DOSEN'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            }`}>
                              {user.role}
                            </span>
                          )}
                        </td>

                        {/* Semester */}
                        <td className="px-6 py-4">
                          {isEditing ? (
                            editRole === 'MAHASISWA' ? (
                              <select
                                value={editSemester || 1}
                                onChange={(e) => setEditSemester(parseInt(e.target.value))}
                                className="bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                              >
                                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                                  <option key={num} value={num}>Semester {num}</option>
                                ))}
                              </select>
                            ) : (
                              <span className="text-slate-600">-</span>
                            )
                          ) : user.semester ? (
                            <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-medium">
                              Smt {user.semester}
                            </span>
                          ) : (
                            <span className="text-slate-600">-</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          {isEditing ? (
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => saveEdit(user.id)}
                                className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg transition-colors"
                                title="Simpan Perubahan"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setEditingUserId(null)}
                                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700 rounded-lg transition-colors"
                                title="Batal"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => startEdit(user)}
                              className="p-1.5 bg-slate-800 hover:bg-indigo-950/40 text-slate-400 hover:text-indigo-400 border border-slate-700 hover:border-indigo-900/50 rounded-lg transition-all"
                              title="Ubah Data"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {/* Confirmation Migration Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl p-6 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-3 text-amber-500">
                <RefreshCw className="w-6 h-6 animate-spin" />
                <h4 className="text-lg font-bold text-white">Konfirmasi Tindakan Krusial</h4>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Apakah Anda benar-benar yakin ingin mengeksekusi **Migrasi Semester Massal**? 
                Seluruh mahasiswa akan naik +1 semester secara permanen dan kelas lama berstatus **ARCHIVED**.
              </p>
            </div>

            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 border border-slate-700 text-slate-400 hover:text-white rounded-lg text-xs font-semibold bg-slate-800/40 hover:bg-slate-800 transition-colors"
              >
                Batalkan
              </button>
              <button
                onClick={runMigration}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white rounded-lg text-xs font-semibold shadow-lg shadow-red-500/20 transition-all"
              >
                Ya, Eksekusi Sekarang
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
