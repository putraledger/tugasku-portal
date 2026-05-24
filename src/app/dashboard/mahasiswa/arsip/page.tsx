'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  GraduationCap, 
  Archive, 
  BookOpen, 
  FileText, 
  Award, 
  HelpCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

interface TaskArchive {
  id: string;
  title: string;
  deadline: string;
  submission: {
    id: string;
    fileUrl: string;
    grade: number | null;
    feedback: string | null;
    submittedAt: string;
  } | null;
}

interface CourseArchive {
  id: string;
  code: string;
  name: string;
  semester: number;
  lecturerName: string;
  enrollmentStatus: string;
  tasks: TaskArchive[];
}

export default function StudentArchivePage() {
  const [archives, setArchives] = useState<CourseArchive[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);

  const fetchArchives = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/mahasiswa/archive');
      if (res.ok) {
        const data = await res.json();
        setArchives(data);
        if (data.length > 0) {
          setExpandedCourseId(data[0].id); // Expand first course by default
        }
      }
    } catch (err) {
      console.error('Error fetching archive page:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchives();
  }, []);

  const toggleExpand = (courseId: string) => {
    setExpandedCourseId(expandedCourseId === courseId ? null : courseId);
  };

  // Group archives by Semester for clean outline
  const semesters = Array.from(new Set(archives.map(a => a.semester))).sort((a, b) => b - a); // Higher/Newer semesters first

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
            <p className="text-[10px] text-emerald-400 font-medium">Riwayat & Arsip Penilaian</p>
          </div>
        </div>

        <Link
          href="/dashboard/mahasiswa"
          className="flex items-center space-x-1 text-slate-400 hover:text-white transition-colors text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Dashboard</span>
        </Link>
      </nav>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-6 mt-8 space-y-8">
        
        {/* Header Hero */}
        <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-emerald-950/10 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 bottom-0 top-0 w-96 bg-gradient-to-l from-emerald-500/5 to-transparent blur-3xl rounded-full -mr-20 pointer-events-none" />
          <div className="relative z-10 space-y-2 flex items-center space-x-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-2xl hidden sm:block shrink-0">
              <Archive className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-extrabold text-white">Arsip Nilai Akademik</h2>
              <p className="text-slate-400 text-xs leading-relaxed max-w-2xl mt-1">
                Tinjau kembali nilai lembar kerja, dokumen tugas terkirim, serta catatan evaluasi khusus dari dosen pengampu Anda pada semester-semester terdahulu.
              </p>
            </div>
          </div>
        </div>

        {/* Archives Display */}
        {loading ? (
          <div className="py-24 text-center text-slate-500 text-sm">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-3 text-emerald-500" />
            Mengkompilasi data riwayat nilai...
          </div>
        ) : archives.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl py-24 text-center text-slate-500 text-sm">
            <Archive className="w-12 h-12 text-slate-800 mx-auto mb-3" />
            Belum ada rekam jejak kelas terdahulu yang diarsipkan.
          </div>
        ) : (
          <div className="space-y-8">
            {semesters.map((sem) => {
              const semCourses = archives.filter(c => c.semester === sem);

              return (
                <div key={sem} className="space-y-4">
                  {/* Semester Section Divider */}
                  <div className="flex items-center space-x-3">
                    <span className="h-px bg-slate-800 flex-1" />
                    <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400 select-none whitespace-nowrap bg-slate-950 px-3">
                      Semester {sem}
                    </h3>
                    <span className="h-px bg-slate-800 flex-1" />
                  </div>

                  {/* Course Cards under this Semester */}
                  <div className="space-y-4">
                    {semCourses.map((course) => {
                      const isExpanded = expandedCourseId === course.id;
                      
                      // Calculate average course score
                      const gradedTasks = course.tasks.filter(t => t.submission?.grade !== null && t.submission?.grade !== undefined);
                      const averageGrade = gradedTasks.length > 0
                        ? Math.round(gradedTasks.reduce((sum, t) => sum + (t.submission!.grade || 0), 0) / gradedTasks.length)
                        : null;

                      return (
                        <div 
                          key={course.id}
                          className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden shadow transition-all duration-300 hover:border-slate-700/60"
                        >
                          {/* Course Accordion Header */}
                          <button
                            onClick={() => toggleExpand(course.id)}
                            className="w-full flex items-center justify-between p-5 text-left bg-slate-900/40 hover:bg-slate-900/80 transition-colors select-none cursor-pointer"
                          >
                            <div className="space-y-1 max-w-xl">
                              <div className="flex items-center space-x-2">
                                <span className="text-[10px] bg-slate-850 text-slate-400 font-extrabold px-1.5 py-0.5 rounded">
                                  {course.code}
                                </span>
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                  course.enrollmentStatus === 'LULUS' 
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                    : 'bg-slate-800 text-slate-500 border border-slate-700'
                                }`}>
                                  Kelas {course.enrollmentStatus}
                                </span>
                              </div>
                              <h4 className="font-extrabold text-sm text-white mt-1.5">{course.name}</h4>
                              <p className="text-[11px] text-slate-500">Dosen: {course.lecturerName}</p>
                            </div>

                            {/* Average Grade & Icon */}
                            <div className="flex items-center space-x-5">
                              {averageGrade !== null && (
                                <div className="text-right hidden sm:block">
                                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Rata-rata Nilai</p>
                                  <span className="text-sm font-black text-emerald-400 mt-0.5 block">{averageGrade} / 100</span>
                                </div>
                              )}

                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-slate-500" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-slate-500" />
                              )}
                            </div>
                          </button>

                          {/* Expanded Course Task Sheet */}
                          {isExpanded && (
                            <div className="border-t border-slate-800/80 p-5 bg-slate-950/20 space-y-4">
                              <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Penilaian Tugas Individu</h5>

                              {course.tasks.length === 0 ? (
                                <div className="text-center py-6 text-slate-600 text-xs italic">
                                  Tidak ada tugas yang terdaftar di kelas ini.
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  {course.tasks.map((task) => (
                                    <div 
                                      key={task.id}
                                      className="bg-slate-950 border border-slate-850 rounded-xl p-4 flex flex-col md:flex-row md:items-start justify-between gap-4"
                                    >
                                      {/* Task Title */}
                                      <div className="space-y-1 max-w-lg">
                                        <div className="flex items-center space-x-1.5">
                                          <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                                          <h6 className="font-bold text-xs text-white">{task.title}</h6>
                                        </div>
                                        {task.submission ? (
                                          <div className="flex items-center space-x-3 pt-2 text-[10px] text-slate-500 font-medium">
                                            <span>
                                              Dikumpul: {new Date(task.submission.submittedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </span>
                                            <a 
                                              href={task.submission.fileUrl} 
                                              target="_blank" 
                                              rel="noopener noreferrer"
                                              className="flex items-center space-x-0.5 text-indigo-400 hover:text-indigo-300 font-bold select-none cursor-pointer"
                                            >
                                              <span>Lihat Berkas</span>
                                              <ExternalLink className="w-2.5 h-2.5" />
                                            </a>
                                          </div>
                                        ) : (
                                          <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider mt-2 block bg-red-500/10 px-2 py-0.5 rounded w-max">
                                            Tidak Mengumpulkan
                                          </span>
                                        )}
                                      </div>

                                      {/* Task Grade & Feedback */}
                                      {task.submission && (
                                        <div className="w-full md:w-72 bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between gap-2 shrink-0">
                                          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Lembar Penilaian</span>
                                            {task.submission.grade !== null ? (
                                              <span className="text-xs font-black text-emerald-400">{task.submission.grade} / 100</span>
                                            ) : (
                                              <span className="text-[9px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold px-1.5 py-0.5 rounded uppercase">Pending</span>
                                            )}
                                          </div>
                                          
                                          {task.submission.grade !== null ? (
                                            task.submission.feedback ? (
                                              <p className="text-[10.5px] text-slate-400 italic leading-relaxed pt-1">
                                                "{task.submission.feedback}"
                                              </p>
                                            ) : (
                                              <span className="text-[10px] text-slate-600 italic">Tidak ada ulasan tambahan.</span>
                                            )
                                          ) : (
                                            <span className="text-[10px] text-slate-500 italic">Lembar kerja belum diperiksa dosen.</span>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>
    </div>
  );
}
