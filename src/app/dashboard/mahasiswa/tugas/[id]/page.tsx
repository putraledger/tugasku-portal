'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  GraduationCap, 
  Calendar, 
  Clock, 
  FileText, 
  UploadCloud, 
  AlertCircle, 
  CheckCircle2, 
  Download, 
  Award,
  ExternalLink,
  RefreshCw,
  HelpCircle
} from 'lucide-react';

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
    lecturer: {
      name: string;
      email: string;
    };
  };
}

interface SubmissionData {
  id: string | null;
  fileUrl: string;
  status: 'BELUM_DIMULAI' | 'SEDANG_DIKERJAKAN' | 'SELESAI';
  grade: number | null;
  feedback: string | null;
  submittedAt: string | null;
}

export default function StudentTaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: taskId } = use(params);

  const [task, setTask] = useState<TaskData | null>(null);
  const [submission, setSubmission] = useState<SubmissionData | null>(null);
  const [loading, setLoading] = useState(true);

  // Uploading State
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Countdown State
  const [countdown, setCountdown] = useState({ text: 'Mengitung...', isExpired: false });

  // Status Alerts
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch Task Details
  const fetchTaskDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/mahasiswa/submissions?taskId=${taskId}`);
      if (res.ok) {
        const data = await res.json();
        setTask(data.task);
        setSubmission(data.submission || {
          id: null,
          fileUrl: '',
          status: 'BELUM_DIMULAI',
          grade: null,
          feedback: null,
          submittedAt: null,
        });
      } else {
        setError('Gagal memuat detail tugas.');
      }
    } catch (err) {
      console.error('Error details page:', err);
      setError('Terjadi kesalahan koneksi server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaskDetails();
  }, [taskId]);

  // Alive Countdown Timer
  useEffect(() => {
    if (!task) return;

    const interval = setInterval(() => {
      const deadline = new Date(task.deadline).getTime();
      const now = new Date().getTime();
      const diff = deadline - now;

      if (diff < 0) {
        setCountdown({ text: 'Batas Waktu Telah Terlewati', isExpired: true });
        clearInterval(interval);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      let text = '';
      if (days > 0) text += `${days} Hari `;
      text += `${hours} Jam ${minutes} Menit ${seconds} Detik`;

      setCountdown({ text, isExpired: false });
    }, 1000);

    return () => clearInterval(interval);
  }, [task]);

  // Drag and Drop events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleFileSelection = (file: File) => {
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Ukuran berkas melebihi batasan maksimum (10 MB).');
      return;
    }
    setSelectedFile(file);
    setError(null);
  };

  // Upload File & Submit Task
  const handleUploadAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    try {
      setUploading(true);
      setError(null);
      setSuccess(null);
      setUploadProgress(20);

      // 1. Upload to Supabase/Local API
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

      // 2. Submit task details to DB
      const submitRes = await fetch('/api/mahasiswa/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId,
          fileUrl,
        }),
      });

      const submitData = await submitRes.json();
      setUploadProgress(100);

      if (submitRes.ok) {
        setSuccess('Berkas tugas berhasil dikumpulkan!');
        setSelectedFile(null);
        fetchTaskDetails();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error(submitData.error || 'Gagal meregistrasi pengumpulan berkas.');
      }
    } catch (err: any) {
      console.error('Submission error:', err);
      setError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Convert bytes helper
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = 2;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16">
      {/* Top Navbar */}
      <nav className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-tr from-emerald-500 to-teal-600 p-2 rounded-xl text-white shadow-lg shadow-emerald-500/20">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white">TugasKu Portal</h1>
            <p className="text-[10px] text-emerald-400 font-medium">Detail & Kumpul Tugas</p>
          </div>
        </div>

        <Link
          href="/dashboard/mahasiswa"
          className="flex items-center space-x-1 text-slate-400 hover:text-white transition-colors text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Board</span>
        </Link>
      </nav>

      {/* Content Container */}
      <main className="max-w-6xl mx-auto px-6 mt-8 space-y-8">
        
        {loading ? (
          <div className="py-24 text-center text-slate-500 text-sm">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-3 text-emerald-500" />
            Memuat lembar penugasan...
          </div>
        ) : !task ? (
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 text-center text-slate-500 text-sm">
            Tugas tidak ditemukan.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Column 1 & 2: Task Detail & Evaluation Card */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Task Detail Card */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 relative overflow-hidden shadow-xl">
                <div className="absolute right-0 bottom-0 top-0 w-96 bg-gradient-to-l from-emerald-500/5 to-transparent blur-3xl rounded-full -mr-20 pointer-events-none" />
                
                <div className="relative z-10 space-y-4">
                  {/* Subject Badges */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-[10px] bg-slate-850 text-slate-400 font-bold px-2 py-0.5 rounded">
                      {task.course.code}
                    </span>
                    <span className="text-[10px] bg-slate-850 text-slate-300 font-bold px-2 py-0.5 rounded">
                      {task.course.name}
                    </span>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold px-2.5 py-0.5 rounded-full">
                      Semester {task.course.semester}
                    </span>
                  </div>

                  <h2 className="text-xl md:text-2xl font-extrabold text-white">{task.title}</h2>
                  
                  {/* Lecturer Info */}
                  <div className="text-xs text-slate-400 flex items-center space-x-2">
                    <span className="font-semibold text-slate-300">Dosen Pengampu:</span>
                    <span>{task.course.lecturer.name}</span>
                  </div>

                  {/* Deadline Section */}
                  <div className="border-t border-b border-slate-800/80 py-4 my-2 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Batas Waktu Pengumpulan</p>
                      <p className="text-xs font-semibold text-slate-300">
                        {new Date(task.deadline).toLocaleString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} WIB
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Sisa Waktu Pengerjaan</p>
                      <span className={`text-xs font-bold inline-flex items-center space-x-1 ${
                        countdown.isExpired ? 'text-red-400' : 'text-emerald-400'
                      }`}>
                        <Clock className="w-3.5 h-3.5" />
                        <span>{countdown.text}</span>
                      </span>
                    </div>
                  </div>

                  {/* Description Box */}
                  <div className="space-y-2">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Instruksi Tugas:</p>
                    <p className="text-slate-300 text-xs leading-relaxed whitespace-pre-line">
                      {task.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Evaluation Card from Dosen if Graded */}
              {submission && submission.grade !== null && (
                <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 rounded-3xl p-6 md:p-8 space-y-6 relative overflow-hidden shadow-2xl">
                  <div className="absolute right-0 bottom-0 top-0 w-80 bg-gradient-to-l from-emerald-500/10 to-transparent blur-3xl rounded-full pointer-events-none" />
                  
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Award className="w-5 h-5 text-emerald-400 animate-bounce" />
                        <h3 className="text-base font-extrabold text-white">Lembar Nilai & Ulasan Dosen</h3>
                      </div>
                      
                      {submission.feedback ? (
                        <div className="p-4 bg-slate-950/80 border border-slate-800/80 rounded-xl leading-relaxed">
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Feedback Dosen:</p>
                          <p className="text-xs text-slate-200 italic">
                            "{submission.feedback}"
                          </p>
                        </div>
                      ) : (
                        <p className="text-slate-400 text-xs italic">Tidak ada catatan tambahan dari dosen.</p>
                      )}
                    </div>

                    <div className="shrink-0 bg-slate-950/90 border border-slate-800 p-6 rounded-2xl flex flex-col items-center justify-center text-center shadow-lg w-full md:w-36">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Nilai Angka</span>
                      <div className="flex items-baseline space-x-1">
                        <span className="text-4xl font-black bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">{submission.grade}</span>
                        <span className="text-[11px] text-slate-500 font-bold">/100</span>
                      </div>
                      <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider mt-2.5 bg-emerald-500/10 px-2 py-0.5 rounded">
                        Lulus
                      </span>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Column 3: Submission & Upload Panel */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Submission Status Box */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Status Pengumpulan</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Kelola berkas pengumpulan Anda.</p>
                </div>

                {submission && submission.fileUrl ? (
                  <div className="space-y-4">
                    {/* File Info */}
                    <div className="bg-slate-950 border border-slate-850 p-4 rounded-2xl space-y-3">
                      <div className="flex items-start space-x-2.5">
                        <FileText className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                        <div className="space-y-0.5 truncate">
                          <p className="text-xs font-semibold text-white truncate" title={submission.fileUrl.split('/').pop()}>
                            {submission.fileUrl.split('/').pop()}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            Dikumpul: {submission.submittedAt ? new Date(submission.submittedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-'} WIB
                          </p>
                        </div>
                      </div>

                      {/* Download Link */}
                      <a
                        href={submission.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center space-x-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 py-2 rounded-xl border border-emerald-500/20 transition-all select-none"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Unduh Berkas</span>
                      </a>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center space-x-2 bg-slate-950 p-3.5 rounded-xl border border-slate-850 text-xs">
                      <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400" />
                      <span className="font-semibold text-slate-300">Tugas Berhasil Dikumpul</span>
                    </div>

                    {/* If NOT graded yet, allowed to overwrite/update */}
                    {submission.grade === null && !countdown.isExpired ? (
                      <div className="space-y-2 pt-2 border-t border-slate-800/80">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Perbarui Pengumpulan Berkas:</p>
                        <form onSubmit={handleUploadAndSubmit} className="space-y-3">
                          {/* File input */}
                          <div className="bg-slate-950 border border-slate-850 p-2.5 rounded-xl flex items-center justify-between text-xs gap-3">
                            <input
                              type="file"
                              onChange={handleFileChange}
                              className="hidden"
                              id="update-file-input"
                              accept=".pdf,.zip,.rar,.doc,.docx"
                            />
                            <label
                              htmlFor="update-file-input"
                              className="cursor-pointer font-bold text-[10px] text-slate-400 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded transition-all select-none whitespace-nowrap"
                            >
                              Pilih File
                            </label>
                            <span className="text-[10px] text-slate-500 truncate">
                              {selectedFile ? selectedFile.name : 'Belum pilih file baru...'}
                            </span>
                          </div>

                          {selectedFile && (
                            <button
                              type="submit"
                              disabled={uploading}
                              className="w-full py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl text-xs transition-colors shadow shadow-indigo-500/10 cursor-pointer"
                            >
                              {uploading ? 'Mengunggah...' : 'Unggah & Ganti Berkas'}
                            </button>
                          )}
                        </form>
                      </div>
                    ) : (
                      submission.grade !== null ? (
                        <div className="text-[10px] text-slate-500 italic text-center pt-2">
                          Pengumpulan ditutup karena lembar tugas telah dinilai.
                        </div>
                      ) : (
                        <div className="text-[10px] text-slate-500 italic text-center pt-2">
                          Batas waktu pengumpulan telah berakhir.
                        </div>
                      )
                    )}

                  </div>
                ) : (
                  // Upload Form
                  <div className="space-y-4">
                    {countdown.isExpired ? (
                      <div className="p-4 bg-red-950/20 border border-red-900/40 text-red-400 rounded-xl text-xs flex items-center space-x-2">
                        <AlertCircle className="w-4.5 h-4.5" />
                        <span>Batas waktu terlewati. Pengumpulan berkas dikunci.</span>
                      </div>
                    ) : (
                      <form onSubmit={handleUploadAndSubmit} className="space-y-4">
                        
                        {/* Status Alerts */}
                        {error && (
                          <div className="p-3 bg-red-950/20 border border-red-900/40 text-red-400 rounded-xl text-[11px] flex items-center space-x-2">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{error}</span>
                          </div>
                        )}

                        {success && (
                          <div className="p-3 bg-emerald-950/20 border border-emerald-900/40 text-emerald-400 rounded-xl text-[11px] flex items-center space-x-2">
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                            <span>{success}</span>
                          </div>
                        )}

                        {/* Drag and Drop Zone */}
                        <div
                          onDragEnter={handleDrag}
                          onDragOver={handleDrag}
                          onDragLeave={handleDrag}
                          onDrop={handleDrop}
                          className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-300 relative ${
                            dragActive
                              ? 'border-emerald-500 bg-emerald-500/5 shadow-inner'
                              : 'border-slate-800 hover:border-slate-700/60'
                          }`}
                        >
                          <input
                            type="file"
                            onChange={handleFileChange}
                            className="hidden"
                            id="file-input-upload"
                            accept=".pdf,.zip,.rar,.doc,.docx"
                          />
                          <label
                            htmlFor="file-input-upload"
                            className="cursor-pointer space-y-3 block"
                          >
                            <UploadCloud className="w-10 h-10 text-slate-500 mx-auto group-hover:text-emerald-400 transition-colors" />
                            
                            <div className="space-y-1">
                              <p className="text-xs font-bold text-white">
                                {selectedFile ? selectedFile.name : 'Tarik Berkas ke Sini'}
                              </p>
                              <p className="text-[10px] text-slate-500">
                                {selectedFile ? formatBytes(selectedFile.size) : 'PDF, ZIP (Maks. 10MB)'}
                              </p>
                            </div>

                            {!selectedFile && (
                              <span className="inline-block bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[10px] px-3.5 py-1.5 rounded-lg border border-slate-700 select-none transition-colors">
                                Pilih File Dokumen
                              </span>
                            )}
                          </label>
                        </div>

                        {/* Uploading progress bar */}
                        {uploading && (
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-[10px] font-bold text-indigo-400">
                              <span>Mengunggah dokumen tugas...</span>
                              <span>{uploadProgress}%</span>
                            </div>
                            <div className="w-full bg-slate-950 border border-slate-850 h-2 rounded-full overflow-hidden">
                              <div 
                                className="bg-indigo-500 h-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {selectedFile && (
                          <button
                            type="submit"
                            disabled={uploading}
                            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/10 disabled:opacity-50 select-none cursor-pointer"
                          >
                            {uploading ? 'Menyelesaikan...' : 'Kumpulkan Tugas Sekarang'}
                          </button>
                        )}

                      </form>
                    )}
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

      </main>
    </div>
  );
}
