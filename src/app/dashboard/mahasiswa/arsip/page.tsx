'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft, 
  Archive, 
  FileText, 
  Award, 
  ChevronDown, 
  ChevronUp, 
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { AnimatedCard } from '@/components/ui/AnimatedCard';

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
  const semesters = Array.from(new Set(archives.map(a => a.semester))).sort((a, b) => b - a);

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
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Arsip Nilai</p>
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
          
          {/* Header Info */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-650 text-white shadow-xl shadow-emerald-500/15 relative overflow-hidden">
            <div className="absolute right-[-20px] bottom-[-20px] w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none" />
            <div className="relative z-10 space-y-1">
              <span className="text-[9px] bg-white/20 border border-white/20 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center space-x-1 w-max">
                <Archive className="w-3 h-3" />
                <span>Akademik Terintegrasi</span>
              </span>
              <h2 className="text-lg font-black mt-1">Arsip Riwayat Nilai</h2>
              <p className="text-[11px] text-emerald-100 leading-relaxed">
                Tinjau kembali nilai lembar kerja dan umpan balik tugas akademik semester terdahulu Anda.
              </p>
            </div>
          </div>

          {/* Archives Display */}
          {loading ? (
            <div className="py-20 text-center text-slate-400 text-xs">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-3 text-emerald-500" />
              Mengkompilasi data riwayat nilai...
            </div>
          ) : archives.length === 0 ? (
            <div className="bg-white dark:bg-slate-900/30 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl py-16 text-center text-slate-400 text-xs">
              <Archive className="w-10 h-10 text-slate-350 dark:text-slate-755 mx-auto mb-2" />
              Belum ada riwayat kelas terarsip.
            </div>
          ) : (
            <div className="space-y-6">
              {semesters.map((sem) => {
                const semCourses = archives.filter(c => c.semester === sem);

                return (
                  <div key={sem} className="space-y-3">
                    {/* Semester Section Divider */}
                    <div className="flex items-center space-x-2">
                      <span className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
                      <h3 className="text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-450 select-none whitespace-nowrap bg-transparent px-2">
                        Semester {sem}
                      </h3>
                      <span className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
                    </div>

                    {/* Course Cards */}
                    <div className="space-y-3">
                      {semCourses.map((course) => {
                        const isExpanded = expandedCourseId === course.id;
                        
                        const gradedTasks = course.tasks.filter(t => t.submission?.grade !== null && t.submission?.grade !== undefined);
                        const averageGrade = gradedTasks.length > 0
                          ? Math.round(gradedTasks.reduce((sum, t) => sum + (t.submission!.grade || 0), 0) / gradedTasks.length)
                          : null;

                        return (
                          <div 
                            key={course.id}
                            className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm"
                          >
                            {/* Course Accordion Header */}
                            <button
                              onClick={() => toggleExpand(course.id)}
                              className="w-full flex items-center justify-between p-4 text-left bg-white/20 dark:bg-slate-900/10 hover:bg-slate-100 dark:hover:bg-slate-900/80 transition-colors select-none cursor-pointer"
                            >
                              <div className="space-y-1 max-w-[280px]">
                                <div className="flex items-center space-x-1.5">
                                  <span className="text-[9px] bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-500 font-extrabold px-1.5 py-0.5 rounded">
                                    {course.code}
                                  </span>
                                  <span className={`text-[8.5px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                                    course.enrollmentStatus === 'LULUS' 
                                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                                      : 'bg-slate-100 dark:bg-slate-850 text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700'
                                  }`}>
                                    {course.enrollmentStatus}
                                  </span>
                                </div>
                                <h4 className="font-extrabold text-xs text-slate-800 dark:text-white mt-1 leading-snug">{course.name}</h4>
                                <p className="text-[9.5px] text-slate-400">Dosen: {course.lecturerName}</p>
                              </div>

                              <div className="flex items-center space-x-3">
                                {averageGrade !== null && (
                                  <div className="text-right">
                                    <span className="text-[9px] text-slate-450 dark:text-slate-500 font-bold block uppercase tracking-wide">Rata-rata</span>
                                    <span className="text-[11.5px] font-black text-emerald-500 block">{averageGrade}</span>
                                  </div>
                                )}
                                {isExpanded ? (
                                  <ChevronUp className="w-4 h-4 text-slate-400" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 text-slate-400" />
                                )}
                              </div>
                            </button>

                            {/* Expanded Course Task Sheet */}
                            {isExpanded && (
                              <div className="border-t border-slate-100 dark:border-slate-800/80 p-4 bg-slate-50/50 dark:bg-slate-950/20 space-y-3">
                                <h5 className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">Rincian Tugas Semester</h5>

                                {course.tasks.length === 0 ? (
                                  <div className="text-center py-4 text-slate-400 text-[10px] italic">
                                    Tidak ada tugas terdaftar.
                                  </div>
                                ) : (
                                  <div className="space-y-3">
                                    {course.tasks.map((task) => (
                                      <div 
                                        key={task.id}
                                        className="bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-850 rounded-xl p-3 space-y-2.5 shadow-sm"
                                      >
                                        <div className="space-y-0.5">
                                          <div className="flex items-start gap-1">
                                            <FileText className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                                            <h6 className="font-bold text-[11px] text-slate-800 dark:text-white leading-tight">{task.title}</h6>
                                          </div>
                                          
                                          {task.submission ? (
                                            <div className="flex items-center space-x-2 pt-1 text-[9px] text-slate-400 font-medium">
                                              <span>
                                                Kumpul: {new Date(task.submission.submittedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                              </span>
                                              <a 
                                                href={task.submission.fileUrl} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="flex items-center space-x-0.5 text-indigo-500 dark:text-indigo-400 font-bold select-none cursor-pointer"
                                              >
                                                <span>Unduh File</span>
                                                <ExternalLink className="w-2.5 h-2.5" />
                                              </a>
                                            </div>
                                          ) : (
                                            <span className="text-[8px] text-red-500 font-extrabold uppercase tracking-wider mt-1.5 block bg-red-500/10 px-1.5 py-0.5 rounded w-max">
                                              Tidak Kumpul
                                            </span>
                                          )}
                                        </div>

                                        {/* Task Grade & Feedback */}
                                        {task.submission && (
                                          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-lg p-2.5 space-y-1.5">
                                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-1.5">
                                              <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wide">Hasil Evaluasi</span>
                                              {task.submission.grade !== null ? (
                                                <span className="text-[10px] font-black text-emerald-500">{task.submission.grade} / 100</span>
                                              ) : (
                                                <span className="text-[8px] bg-slate-200 dark:bg-slate-950 border border-slate-300 dark:border-slate-850 text-slate-500 font-bold px-1.5 py-0.2 rounded uppercase">Reviewing</span>
                                              )}
                                            </div>
                                            
                                            {task.submission.grade !== null ? (
                                              task.submission.feedback ? (
                                                <p className="text-[9.5px] text-slate-500 dark:text-slate-400 italic leading-relaxed">
                                                  "{task.submission.feedback}"
                                                </p>
                                              ) : (
                                                <span className="text-[9px] text-slate-400 italic">Lolos evaluasi dosen.</span>
                                              )
                                            ) : (
                                              <span className="text-[9px] text-slate-400 italic">Menunggu pemeriksaan dosen.</span>
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
    </div>
  );
}
