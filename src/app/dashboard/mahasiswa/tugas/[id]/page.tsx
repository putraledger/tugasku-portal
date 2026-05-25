'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  FileText, 
  UploadCloud, 
  AlertCircle, 
  CheckCircle2, 
  Download, 
  Award,
  RefreshCw
} from 'lucide-react';
import { AnimatedCard } from '@/components/ui/AnimatedCard';

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
  const [countdown, setCountdown] = useState({ text: 'Menghitung...', isExpired: false });

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

      // 1. Upload to Local API/Supabase
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

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = 2;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans py-0 flex flex-col justify-start">
      
      {/* Mobile Shell Frame */}
      <div className="w-full max-w-md mx-auto min-h-screen bg-slate-900 border-x border-slate-800/80 shadow-2xl relative flex flex-col pb-16">
        
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
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Tugas Detail</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              href="/dashboard/mahasiswa"
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-indigo-500 transition-colors border border-slate-700/40"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 overflow-y-auto space-y-5">
          
          {loading ? (
            <div className="py-24 text-center text-slate-400 text-xs">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-3 text-indigo-500" />
              Memuat lembar penugasan...
            </div>
          ) : !task ? (
            <div className="bg-white dark:bg-slate-900/30 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl py-20 text-center text-slate-400 text-xs">
              Tugas tidak ditemukan.
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* Task Header & Instructions */}
              <AnimatedCard className="p-5 space-y-4 relative overflow-hidden">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[9px] bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-500 font-extrabold px-1.5 py-0.5 rounded">
                      {task.course.code}
                    </span>
                    <span className="text-[9px] bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 font-bold px-2.5 py-0.5 rounded-full">
                      Smt {task.course.semester}
                    </span>
                  </div>
                  
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-snug">
                    {task.title}
                  </h3>
                  
                  <p className="text-[10px] text-slate-500">Mata Kuliah: {task.course.name}</p>
                  <p className="text-[10px] text-slate-400">Dosen Pengampu: {task.course.lecturer.name}</p>
                </div>

                {/* Deadlines Widget */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-center space-x-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span className="font-medium text-slate-700 dark:text-slate-350">Batas: {new Date(task.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} WIB</span>
                  </div>

                  <div className={`flex items-center space-x-1.5 text-[10px] font-bold ${
                    countdown.isExpired ? 'text-red-500' : 'text-emerald-500'
                  }`}>
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span>{countdown.text}</span>
                  </div>
                </div>

                {/* Description */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1">
                  <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide">Instruksi:</p>
                  <p className="text-[11px] text-slate-650 dark:text-slate-300 leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-100 dark:border-slate-900">
                    {task.description}
                  </p>
                </div>
              </AnimatedCard>

              {/* Evaluation Card from Lecturer */}
              {submission && submission.grade !== null && (
                <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 space-y-3 shadow-md">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-1.5 text-slate-850 dark:text-white">
                      <Award className="w-4 h-4 text-emerald-500" />
                      <h4 className="font-extrabold text-xs">Ulasan & Nilai Dosen</h4>
                    </div>
                    <span className="bg-emerald-500 text-white font-black text-xs px-2 py-0.5 rounded shadow">
                      Grade: {submission.grade}
                    </span>
                  </div>

                  {submission.feedback ? (
                    <div className="p-3 bg-white/90 dark:bg-slate-950/80 border border-slate-200/60 dark:border-slate-850 rounded-xl leading-relaxed text-[11px] text-slate-600 dark:text-slate-350 italic">
                      "{submission.feedback}"
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-400 italic">Tidak ada catatan ulasan tambahan.</p>
                  )}
                </div>
              )}

              {/* Submission Panel */}
              <AnimatedCard className="p-5 space-y-4">
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Status Pengumpulan</h4>
                
                {submission && submission.fileUrl ? (
                  <div className="space-y-4">
                    
                    {/* File Box */}
                    <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-850 p-3.5 rounded-2xl space-y-3">
                      <div className="flex items-start space-x-2.5">
                        <FileText className="w-4.5 h-4.5 text-emerald-500 shrink-0 mt-0.5" />
                        <div className="space-y-0.5 truncate">
                          <p className="text-xs font-bold text-slate-800 dark:text-white truncate">
                            {submission.fileUrl.split('/').pop()}
                          </p>
                          <p className="text-[9px] text-slate-400">
                            Terverifikasi Sistem
                          </p>
                        </div>
                      </div>

                      <a
                        href={submission.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center space-x-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 py-2 rounded-xl border border-emerald-500/20 transition-all select-none"
                      >
                        <span>Unduh Dokumen</span>
                      </a>
                    </div>

                    <div className="flex items-center space-x-2 bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-xl text-[10px] text-emerald-600 dark:text-emerald-400 font-bold justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Berkas Berhasil Terkumpul</span>
                    </div>

                    {/* Resubmit form if not graded */}
                    {submission.grade === null && !countdown.isExpired ? (
                      <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">Perbarui Berkas:</p>
                        <form onSubmit={handleUploadAndSubmit} className="space-y-3">
                          <div className="bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-850 p-2.5 rounded-xl flex items-center justify-between text-xs gap-3">
                            <input
                              type="file"
                              onChange={handleFileChange}
                              className="hidden"
                              id="update-file-input"
                              accept=".pdf,.zip,.rar,.doc,.docx"
                            />
                            <label
                              htmlFor="update-file-input"
                              className="cursor-pointer font-bold text-[9px] text-slate-450 dark:text-slate-400 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 px-3 py-1.5 rounded transition-all select-none whitespace-nowrap"
                            >
                              Ganti File
                            </label>
                            <span className="text-[9.5px] text-slate-450 truncate">
                              {selectedFile ? selectedFile.name : 'Pilih dokumen baru...'}
                            </span>
                          </div>

                          {selectedFile && (
                            <button
                              type="submit"
                              disabled={uploading}
                              className="w-full py-2.5 bg-indigo-500 hover:bg-indigo-650 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                            >
                              {uploading ? 'Mengunggah...' : 'Unggah & Ganti File'}
                            </button>
                          )}
                        </form>
                      </div>
                    ) : null}

                  </div>
                ) : (
                  // File upload form
                  <div className="space-y-3">
                    {countdown.isExpired ? (
                      <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-[10px] flex items-center space-x-1.5 justify-center leading-relaxed">
                        <AlertCircle className="w-4.5 h-4.5 shrink-0" />
                        <span>Batas waktu pengumpulan habis. Pengumpulan ditutup.</span>
                      </div>
                    ) : (
                      <form onSubmit={handleUploadAndSubmit} className="space-y-4">
                        {error && (
                          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-[10px] flex items-center space-x-1.5">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{error}</span>
                          </div>
                        )}

                        {success && (
                          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl text-[10px] flex items-center space-x-1.5">
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                            <span>{success}</span>
                          </div>
                        )}

                        {/* File drop box */}
                        <div
                          onDragEnter={handleDrag}
                          onDragOver={handleDrag}
                          onDragLeave={handleDrag}
                          onDrop={handleDrop}
                          className={`border border-dashed rounded-2xl p-6 text-center transition-all bg-slate-50 dark:bg-slate-950/40 relative ${
                            dragActive
                              ? 'border-indigo-500 bg-indigo-500/5'
                              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                          }`}
                        >
                          <input
                            type="file"
                            onChange={handleFileChange}
                            className="hidden"
                            id="file-input-detail"
                            accept=".pdf,.zip,.rar,.doc,.docx"
                          />
                          <label htmlFor="file-input-detail" className="cursor-pointer space-y-2 block">
                            <UploadCloud className="w-9 h-9 text-slate-400 dark:text-slate-500 mx-auto" />
                            <div className="space-y-0.5">
                              <p className="text-xs font-bold text-slate-750 dark:text-white truncate">
                                {selectedFile ? selectedFile.name : 'Pilih Berkas Tugas'}
                              </p>
                              <p className="text-[9px] text-slate-400">
                                {selectedFile ? formatBytes(selectedFile.size) : 'PDF, ZIP, DOC (Maks. 10MB)'}
                              </p>
                            </div>
                          </label>
                        </div>

                        {uploading && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[9px] font-bold text-indigo-500">
                              <span>Mengirim berkas tugas...</span>
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

                        {selectedFile && (
                          <button
                            type="submit"
                            disabled={uploading}
                            className="w-full py-3 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-650 hover:to-violet-750 text-white font-bold rounded-xl text-xs transition-all shadow shadow-indigo-500/10 cursor-pointer"
                          >
                            {uploading ? 'Memproses...' : 'Kumpulkan Tugas Sekarang'}
                          </button>
                        )}

                      </form>
                    )}
                  </div>
                )}
              </AnimatedCard>

            </div>
          )}

        </main>
      </div>
    </div>
  );
}
