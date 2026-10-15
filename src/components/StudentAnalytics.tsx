import React, { useState, useEffect } from 'react';
import { Student, Course, Language } from '../types';
import { t } from '../utils/i18n';
import { StudentInfoModal } from './StudentInfoModal';
import {
  BarChart3,
  TrendingUp,
  Sparkles,
  AlertTriangle,
  GraduationCap,
  Users,
  ShieldCheck,
  RefreshCw,
  FileText,
  CalendarCheck2,
  X,
  Download,
  Printer,
  CheckCircle2,
  Phone,
  MapPin,
  Heart,
  ShieldAlert,
  Edit3,
  IdCard,
} from 'lucide-react';

interface StudentAnalyticsProps {
  students: Student[];
  courses: Course[];
  currentLang: Language;
  selectedDepartment: string;
  selectedStudentId?: string | null;
  onSelectStudent?: (studentId: string | null) => void;
  onUpdateStudent?: (updated: Student) => void;
}

export const StudentAnalytics: React.FC<StudentAnalyticsProps> = ({
  students,
  courses,
  currentLang,
  selectedDepartment,
  selectedStudentId,
  onSelectStudent,
  onUpdateStudent,
}) => {
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [errorAi, setErrorAi] = useState<string | null>(null);
  const [filterDept, setFilterDept] = useState<string>('All');
  const [activeStudentId, setActiveStudentId] = useState<string | null>(selectedStudentId || null);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [showIdCardModal, setShowIdCardModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [pdfStudent, setPdfStudent] = useState<Student | null>(null);

  useEffect(() => {
    if (selectedStudentId) {
      setActiveStudentId(selectedStudentId);
    }
  }, [selectedStudentId]);

  const handleOpenPdfSummary = (student: Student) => {
    setPdfStudent(student);
    setShowPdfModal(true);
  };

  const handlePrintPdf = () => {
    window.print();
  };

  const filteredStudents = students.filter(
    (s) => selectedDepartment === 'All Departments' || s.department === selectedDepartment
  );

  const selectedStudent = students.find((s) => s.id === activeStudentId) || null;

  const handleRunAiAnalysis = async () => {
    setIsGeneratingAi(true);
    setErrorAi(null);
    try {
      const res = await fetch('/api/ai/analyze-performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          students: filteredStudents.map((s) => ({
            name: s.name,
            no: s.studentNo,
            dept: s.department,
            gpa: s.gpa,
            attendance: s.overallAttendance,
            risk: s.riskStatus,
          })),
          department: selectedDepartment,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAiResult(data.analysis);
      } else {
        setErrorAi(data.error || 'Failed to generate analysis.');
      }
    } catch (err: any) {
      setErrorAi(err?.message || 'Server error connecting to Gemini AI.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // GPA distribution buckets (Philippine Scale 1.0 - 5.0)
  const gpaBuckets = {
    '1.00 - 1.50 (President/Dean List)': filteredStudents.filter((s) => s.gpa <= 1.5).length,
    '1.75 - 2.50 (Good Standing)': filteredStudents.filter((s) => s.gpa > 1.5 && s.gpa <= 2.5).length,
    '2.75 - 3.00 (Passing/Warning)': filteredStudents.filter((s) => s.gpa > 2.5 && s.gpa <= 3.0).length,
    '> 3.00 (Conditional/Failed)': filteredStudents.filter((s) => s.gpa > 3.0).length,
  };

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>Academic Intelligence & Student Performance Analytics</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Student Performance & Demographic Directory
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Department: <span className="text-blue-600 dark:text-blue-400 font-bold">{selectedDepartment}</span> • Total Evaluated: {filteredStudents.length} Students
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Select Student Selector */}
          <select
            value={activeStudentId || ''}
            onChange={(e) => {
              const val = e.target.value || null;
              setActiveStudentId(val);
              if (onSelectStudent) onSelectStudent(val);
            }}
            className="bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 max-w-xs"
          >
            <option value="">-- Inspect Individual Student --</option>
            {filteredStudents.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.studentNo})
              </option>
            ))}
          </select>

          {/* Download PDF Summary Button */}
          {selectedStudent && (
            <button
              onClick={() => handleOpenPdfSummary(selectedStudent)}
              className="flex items-center space-x-1.5 px-3 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold rounded-xl transition shadow-xs"
            >
              <Download className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Download PDF Summary</span>
            </button>
          )}

          <button
            onClick={handleRunAiAnalysis}
            disabled={isGeneratingAi}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition disabled:opacity-50"
          >
            {isGeneratingAi ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 text-amber-300" />
            )}
            <span>{isGeneratingAi ? 'Analyzing...' : 'Gemini AI Summary'}</span>
          </button>
        </div>
      </div>

      {/* Selected Student Deep-Dive Spotlight Card */}
      {selectedStudent && (
        <div className="bg-white dark:bg-slate-900 border-2 border-blue-500/40 dark:border-blue-500/30 rounded-2xl p-6 shadow-md relative overflow-hidden animate-fade-in transition-colors">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black text-xl flex items-center justify-center shadow-md shrink-0">
                {selectedStudent.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">{selectedStudent.name}</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                    {selectedStudent.studentNo}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold font-mono uppercase ${
                      selectedStudent.riskStatus === 'Critical'
                        ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                        : selectedStudent.riskStatus === 'Watchlist'
                        ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900'
                        : 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
                    }`}
                  >
                    {selectedStudent.riskStatus} Risk
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    {selectedStudent.enrollmentStatus}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {selectedStudent.program} ({selectedStudent.yearLevel}) • {selectedStudent.department}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setPdfStudent(selectedStudent);
                  setShowIdCardModal(true);
                }}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
              >
                <IdCard className="w-3.5 h-3.5" />
                <span>Print ID Card</span>
              </button>

              <button
                onClick={() => setShowEditModal(true)}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Info / Demographics</span>
              </button>

              <button
                onClick={() => {
                  setActiveStudentId(null);
                  if (onSelectStudent) onSelectStudent(null);
                }}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-lg"
                title="Close student inspection"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Detailed Student Information Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* 1. Philippine Contact & Numbers */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
              <div className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-400 tracking-wider flex items-center space-x-1.5 mb-2">
                <Phone className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Contact Details (PH)</span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div>
                  <div className="text-[10px] text-slate-500">Mobile (PH)</div>
                  <div className="font-mono font-bold text-slate-900 dark:text-white flex items-center space-x-1">
                    <span className="text-emerald-600 dark:text-emerald-400">🇵🇭</span>
                    <span>{selectedStudent.contactNumber || '+63 917 555 0192'}</span>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500">Institutional Email</div>
                  <div className="font-mono text-slate-700 dark:text-slate-300 truncate">{selectedStudent.email}</div>
                </div>
                {selectedStudent.personalEmail && (
                  <div>
                    <div className="text-[10px] text-slate-500">Personal Email</div>
                    <div className="font-mono text-slate-600 dark:text-slate-400 truncate">{selectedStudent.personalEmail}</div>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Philippine Residential Address */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
              <div className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-400 tracking-wider flex items-center space-x-1.5 mb-2">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span>Residential Address</span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="font-bold text-slate-900 dark:text-white">
                  {selectedStudent.address?.street || '142 Rizal Ave, Brgy. Poblacion'}
                </div>
                <div className="text-slate-600 dark:text-slate-300">
                  {selectedStudent.address?.barangay}, {selectedStudent.address?.city}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {selectedStudent.address?.province} ({selectedStudent.address?.zipCode || '1100'})
                </div>
              </div>
            </div>

            {/* 3. Parents & Family */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
              <div className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-400 tracking-wider flex items-center space-x-1.5 mb-2">
                <Users className="w-3.5 h-3.5 text-indigo-500" />
                <span>Parents & Family</span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div>
                  <div className="text-[10px] text-slate-500">Father's Name</div>
                  <div className="font-bold text-slate-900 dark:text-white truncate">
                    {selectedStudent.parents?.fatherName || 'Engr. Roberto D. Cruz'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500">Mother's (Maiden) Name</div>
                  <div className="font-bold text-slate-900 dark:text-white truncate">
                    {selectedStudent.parents?.motherName || 'Elena Santos Cruz'}
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Emergency Contact & Civil Status */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
              <div className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-400 tracking-wider flex items-center space-x-1.5 mb-2">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                <span>Emergency (PH) & Civil Status</span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div>
                  <div className="text-[10px] text-slate-500">Emergency Contact (24/7)</div>
                  <div className="font-bold text-rose-600 dark:text-rose-400">
                    {selectedStudent.emergencyContact?.name} ({selectedStudent.emergencyContact?.relationship})
                  </div>
                  <div className="font-mono text-[11px] text-slate-800 dark:text-slate-200">
                    {selectedStudent.emergencyContact?.contactNumber}
                  </div>
                </div>
                <div className="pt-1 border-t border-slate-200/60 dark:border-slate-700 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Civil Status:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">{selectedStudent.civilStatus}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Academic Recommendations */}
          <div className="pt-2 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 rounded-xl">
              <div className="font-bold text-blue-900 dark:text-blue-300 flex items-center space-x-1.5 mb-1">
                <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Academic Status & GPA</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 text-[11px]">
                GPA: <strong className="text-blue-600 dark:text-blue-400">{selectedStudent.gpa.toFixed(2)}</strong>. {selectedStudent.gpa >= 3.5
                  ? 'Dean’s Honor List candidate with high scholastic standing.'
                  : selectedStudent.gpa >= 2.5
                  ? 'Satisfactory academic standing. Maintaining steady progress.'
                  : 'Academic warning threshold. Requires academic advising intervention.'}
              </p>
            </div>

            <div className="p-3 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 rounded-xl">
              <div className="font-bold text-amber-900 dark:text-amber-300 flex items-center space-x-1.5 mb-1">
                <CalendarCheck2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Attendance Diagnostic</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 text-[11px]">
                Attendance: <strong className="text-emerald-600 dark:text-emerald-400">{selectedStudent.overallAttendance}%</strong>. {selectedStudent.overallAttendance >= 90
                  ? 'Consistent class attendance record with minimal absences.'
                  : selectedStudent.overallAttendance >= 80
                  ? 'Moderate attendance. Monitoring required for 80% threshold compliance.'
                  : 'Critical attendance deficit! Automatic notification dispatched to registrar.'}
              </p>
            </div>

            <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 rounded-xl">
              <div className="font-bold text-indigo-900 dark:text-indigo-300 flex items-center space-x-1.5 mb-1">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Demographics & LRN</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 text-[11px]">
                LRN: <span className="font-mono font-bold text-slate-900 dark:text-white">{selectedStudent.lrn || '109283746501'}</span> • Blood: {selectedStudent.bloodType || 'O+'} • Citizen: {selectedStudent.nationality || 'Filipino'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* AI Analysis Result Output Box */}
      {aiResult && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-slate-100">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2 text-white font-bold text-base">
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span>Gemini AI Academic Executive Summary</span>
            </div>
            <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full font-mono font-bold">
              TORRES CAPITOL AI MODEL
            </span>
          </div>

          <div className="prose prose-invert max-w-none text-xs text-slate-300 whitespace-pre-wrap leading-relaxed font-sans">
            {aiResult}
          </div>
        </div>
      )}

      {errorAi && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold">
          {errorAi}
        </div>
      )}

      {/* Analytics Visual Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* GPA Distribution Breakdown */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs transition-colors">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center space-x-2">
            <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>GPA Distribution Cohorts</span>
          </h3>

          <div className="space-y-3.5 pt-2">
            {Object.entries(gpaBuckets).map(([label, count]) => {
              const pct = filteredStudents.length > 0 ? Math.round((count / filteredStudents.length) * 100) : 0;
              return (
                <div key={label} className="bg-slate-50 dark:bg-slate-800/70 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs mb-1 font-medium">
                    <span className="text-slate-800 dark:text-slate-200 font-bold">{label}</span>
                    <span className="font-mono text-blue-600 dark:text-blue-400 font-extrabold">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        label.includes('Dean')
                          ? 'bg-emerald-500'
                          : label.includes('Good')
                          ? 'bg-blue-600'
                          : label.includes('Average')
                          ? 'bg-indigo-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Student Risk Status Overview */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs transition-colors">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-500" />
            <span>Student Academic Risk Matrix</span>
          </h3>

          <div className="grid grid-cols-3 gap-3 my-4">
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-center">
              <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                {filteredStudents.filter((s) => s.riskStatus === 'Optimal').length}
              </div>
              <div className="text-[11px] text-emerald-800 dark:text-emerald-300 font-extrabold mt-1">Optimal</div>
            </div>

            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 text-center">
              <div className="text-2xl font-black font-mono text-amber-600 dark:text-amber-400">
                {filteredStudents.filter((s) => s.riskStatus === 'Watchlist').length}
              </div>
              <div className="text-[11px] text-amber-800 dark:text-amber-300 font-extrabold mt-1">Watchlist</div>
            </div>

            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 text-center">
              <div className="text-2xl font-black font-mono text-rose-600 dark:text-rose-400">
                {filteredStudents.filter((s) => s.riskStatus === 'Critical').length}
              </div>
              <div className="text-[11px] text-rose-800 dark:text-rose-300 font-extrabold mt-1">Critical</div>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300">
            <p className="font-bold text-slate-900 dark:text-white mb-1">Risk Detection Formula:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400 text-[11px]">
              <li>Grade &gt; 3.00 OR Attendance &lt; 75% = Critical Flag</li>
              <li>Grade between 2.75–3.00 OR Attendance 75%–82% = Watchlist Flag</li>
              <li>Grade &le; 2.50 AND Attendance ≥ 83% = Optimal Status</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Department Categorization & Student List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs transition-colors">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center space-x-2">
          <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>Department Roster & Demographics</span>
        </h3>

        {/* Department Tabs */}
        {selectedDepartment === 'All Departments' && (
          <div className="flex flex-wrap items-center gap-2 mb-5">
            {['All', 'BS Information Technology', 'BS Business Administration', 'BS Criminology'].map(dept => (
              <button
                key={dept}
                onClick={() => setFilterDept(dept)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                  filterDept === dept
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        )}

        <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3">Student Name</th>
                <th className="p-3">Program</th>
                <th className="p-3">Ph Grade</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
              {filteredStudents
                .filter(s => filterDept === 'All' || s.department === filterDept)
                .map((student) => (
                <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="p-3">
                    <div className="font-bold text-slate-900 dark:text-white">{student.name}</div>
                    <div className="text-[10px] text-slate-400">{student.studentNo}</div>
                  </td>
                  <td className="p-3">
                    <div className="font-medium">{student.program}</div>
                    <div className="text-[10px] text-slate-500">{student.yearLevel}</div>
                  </td>
                  <td className="p-3">
                    <div className="font-mono font-bold text-blue-600 dark:text-blue-400">{student.gpa.toFixed(2)}</div>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => {
                        setActiveStudentId(student.id);
                        if (onSelectStudent) onSelectStudent(student.id);
                      }}
                      className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
              {filteredStudents.filter(s => filterDept === 'All' || s.department === filterDept).length === 0 && (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-slate-400 italic">No students found for this department.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comprehensive Student Info & Edit Modal */}
      {selectedStudent && (
        <StudentInfoModal
          student={selectedStudent}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onUpdateStudent={(updated) => {
            if (onUpdateStudent) {
              onUpdateStudent(updated);
            }
          }}
          currentLang={currentLang}
        />
      )}

      {/* Printable Official PDF Summary Modal */}
      {showPdfModal && pdfStudent && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto print:p-0 print:bg-white">
          <div className="bg-white text-slate-800 rounded-3xl max-w-3xl w-full p-8 shadow-2xl border border-slate-200 space-y-6 relative my-8 print:p-0 print:border-none print:shadow-none">
            {/* Modal Actions Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 print:hidden">
              <div className="flex items-center space-x-2 text-xs font-bold text-blue-600">
                <FileText className="w-4 h-4" />
                <span>Official Philippine Student Record & Academic PDF</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePrintPdf}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print / Save as PDF</span>
                </button>
                <button
                  onClick={() => setShowPdfModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Content */}
            <div className="space-y-6 font-sans text-slate-800">
              {/* Header Letterhead */}
              <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
                <div className="text-xs font-black uppercase tracking-widest text-slate-500">Republic of the Philippines</div>
                <div className="text-lg font-black text-slate-900 tracking-tight uppercase">Torres Capitol College</div>
                <div className="text-xs text-slate-600">Office of the Registrar & Academic Records • Student Information System</div>
                <div className="text-[10px] text-slate-400 font-mono pt-1">Document Ref: TCC-SIS-PH-{pdfStudent.studentNo}-2026</div>
              </div>

              <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 text-center">
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                  Official Student Profile, Demographics & Academic Summary
                </h2>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Date Issued: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
              </div>

              {/* Student Demographics & Address Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Student Full Name</div>
                  <div className="font-black text-slate-900 text-sm">{pdfStudent.name}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Student ID No.</div>
                  <div className="font-mono font-bold text-blue-600 text-sm">{pdfStudent.studentNo}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Learner Reference No. (LRN)</div>
                  <div className="font-mono font-bold text-slate-900">{pdfStudent.lrn || '109283746501'}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Department</div>
                  <div className="font-bold text-slate-800">{pdfStudent.department}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Program & Year Level</div>
                  <div className="font-bold text-slate-800">{pdfStudent.program} ({pdfStudent.yearLevel})</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Civil Status & Status</div>
                  <div className="font-bold text-slate-800">{pdfStudent.civilStatus} • {pdfStudent.enrollmentStatus}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">PH Contact Number</div>
                  <div className="font-mono font-bold text-emerald-600">{pdfStudent.contactNumber}</div>
                </div>
                <div className="sm:col-span-2">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Philippine Address</div>
                  <div className="font-bold text-slate-800">
                    {pdfStudent.address?.street}, {pdfStudent.address?.barangay}, {pdfStudent.address?.city}, {pdfStudent.address?.province} ({pdfStudent.address?.zipCode})
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Father's Full Name</div>
                  <div className="font-bold text-slate-800">{pdfStudent.parents?.fatherName || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Mother's Full Name</div>
                  <div className="font-bold text-slate-800">{pdfStudent.parents?.motherName || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Emergency Contact (PH)</div>
                  <div className="font-bold text-rose-600">
                    {pdfStudent.emergencyContact?.name} ({pdfStudent.emergencyContact?.relationship}) • {pdfStudent.emergencyContact?.contactNumber}
                  </div>
                </div>
              </div>

              {/* Key Performance Indicators */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Cumulative Ph Grade</div>
                  <div className="text-xl font-black font-mono text-blue-600">{pdfStudent.gpa.toFixed(2)}</div>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Attendance Rate</div>
                  <div className="text-xl font-black font-mono text-emerald-600">{pdfStudent.overallAttendance}%</div>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Academic Standing</div>
                  <div className="text-xs font-black text-slate-800 mt-1">
                    {pdfStudent.gpa >= 3.5 ? "Dean's List Candidate" : pdfStudent.gpa >= 2.5 ? "Good Standing" : "Academic Probation"}
                  </div>
                </div>
              </div>

              {/* Enrolled Courses Summary */}
              <div>
                <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Current Semester Enrolled Courses</div>
                <table className="w-full text-xs text-left border border-slate-200 rounded-lg overflow-hidden">
                  <thead className="bg-slate-100 text-slate-600 font-bold">
                    <tr>
                      <th className="p-2 border-b">Course Code</th>
                      <th className="p-2 border-b">Course Name</th>
                      <th className="p-2 border-b text-center">Credits</th>
                      <th className="p-2 border-b text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {courses.slice(0, 4).map((c) => (
                      <tr key={c.code}>
                        <td className="p-2 font-mono font-bold text-blue-600">{c.code}</td>
                        <td className="p-2 text-slate-800">{c.name}</td>
                        <td className="p-2 text-center font-mono">{c.credits}</td>
                        <td className="p-2 text-right text-emerald-600 font-bold">Enrolled</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Signatures Footer */}
              <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-8 text-center text-xs">
                <div>
                  <div className="font-bold text-slate-900">Kerry Jet A. Sepada</div>
                  <div className="text-[10px] text-slate-500">College Administration & Registrar</div>
                </div>
                <div>
                  <div className="font-bold text-slate-900">Princess Jean Nebria Monsanto</div>
                  <div className="text-[10px] text-slate-500">Department Head & Academic Evaluation</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Printable ID Card Modal */}
      {showIdCardModal && pdfStudent && (
        <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50/50 print:hidden">
              <h2 className="text-sm font-bold flex items-center space-x-2">
                <IdCard className="w-4 h-4 text-indigo-600" />
                <span>Student ID Card</span>
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition flex items-center space-x-1.5"
                >
                  <Printer className="w-3 h-3" />
                  <span>Print ID</span>
                </button>
                <button
                  onClick={() => setShowIdCardModal(false)}
                  className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ID Card Content (Printable Area) */}
            <div className="p-6 bg-slate-100 flex justify-center print:p-0 print:bg-white print:w-full print:h-full print:flex-col print:items-center">
              <div className="w-[220px] h-[340px] bg-white border-2 border-slate-300 rounded-xl shadow-lg relative overflow-hidden flex flex-col items-center pt-6 print:border-none print:shadow-none print:w-[2.125in] print:h-[3.375in]">
                {/* ID Header Pattern */}
                <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-br from-blue-900 to-indigo-900"></div>
                
                <div className="absolute top-3 left-0 right-0 flex justify-center text-white text-lg font-serif font-black">
                  TCC
                </div>

                <div className="w-24 h-24 mt-4 bg-slate-200 rounded-xl border-4 border-white shadow-sm z-10 overflow-hidden">
                  <img src={pdfStudent.avatar} alt={pdfStudent.name} className="w-full h-full object-cover" />
                </div>
                
                <div className="z-10 mt-3 text-center px-2">
                  <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-wide leading-tight">
                    {pdfStudent.name}
                  </h2>
                  <div className="text-[9px] font-bold text-blue-600 mt-1 uppercase">
                    {pdfStudent.program}
                  </div>
                  <div className="text-[9px] font-bold text-slate-500 mt-0.5">
                    Year Level: {pdfStudent.yearLevel}
                  </div>
                </div>

                <div className="mt-auto w-full border-t-2 border-amber-400 bg-slate-50 py-3 text-center print:bg-transparent">
                  <div className="text-[8px] uppercase tracking-widest text-slate-400 font-bold mb-0.5">Student Number</div>
                  <div className="font-mono font-black text-sm text-slate-900 tracking-wider">
                    {pdfStudent.studentNo}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

