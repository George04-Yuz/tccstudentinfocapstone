import React, { useState } from 'react';
import { Student, Course, AttendanceRecord, AttendanceStatus, Language } from '../types';
import { t } from '../utils/i18n';
import { exportToCsv } from '../utils/encryption';
import {
  CalendarCheck2,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Download,
  AlertTriangle,
  Search,
  Users,
  Building2,
  Sparkles,
} from 'lucide-react';

interface AttendanceTrackerProps {
  students: Student[];
  courses: Course[];
  attendanceRecords: AttendanceRecord[];
  currentLang: Language;
  selectedDepartment: string;
  onRecordAttendance: (records: AttendanceRecord[]) => void;
}

export const AttendanceTracker: React.FC<AttendanceTrackerProps> = ({
  students,
  courses,
  attendanceRecords,
  currentLang,
  selectedDepartment,
  onRecordAttendance,
}) => {
  const [selectedCourseCode, setSelectedCourseCode] = useState(courses[0]?.code || 'CS-301');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [searchQuery, setSearchQuery] = useState('');

  // Local state for today's active register
  const [activeRegister, setActiveRegister] = useState<Record<string, { status: AttendanceStatus; notes: string }>>(() => {
    const initial: Record<string, { status: AttendanceStatus; notes: string }> = {};
    students.forEach((s) => {
      const existing = attendanceRecords.find(
        (a) => a.studentId === s.id && a.courseCode === selectedCourseCode && a.date === selectedDate
      );
      initial[s.id] = {
        status: existing ? existing.status : 'Present',
        notes: existing ? existing.notes || '' : '',
      };
    });
    return initial;
  });

  const filteredStudents = students.filter((s) => {
    const matchesDept = selectedDepartment === 'All Departments' || s.department === selectedDepartment;
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentNo.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setActiveRegister((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  const handleNotesChange = (studentId: string, notes: string) => {
    setActiveRegister((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        notes,
      },
    }));
  };

  const handleBatchMarkAll = (status: AttendanceStatus) => {
    const updated: Record<string, { status: AttendanceStatus; notes: string }> = {};
    filteredStudents.forEach((s) => {
      updated[s.id] = {
        status,
        notes: activeRegister[s.id]?.notes || '',
      };
    });
    setActiveRegister((prev) => ({ ...prev, ...updated }));
  };

  const handleSaveRegister = () => {
    const newRecords: AttendanceRecord[] = filteredStudents.map((s) => ({
      id: `att-${s.id}-${selectedCourseCode}-${selectedDate}`,
      studentId: s.id,
      courseCode: selectedCourseCode,
      date: selectedDate,
      status: activeRegister[s.id]?.status || 'Present',
      notes: activeRegister[s.id]?.notes || '',
    }));
    onRecordAttendance(newRecords);
    alert('Attendance register successfully saved and synced to cloud backup!');
  };

  const handleExportAttendanceCsv = () => {
    const headers = ['Student ID', 'Student Name', 'Course', 'Date', 'Status', 'Notes'];
    const rows = filteredStudents.map((s) => [
      s.studentNo,
      s.name,
      selectedCourseCode,
      selectedDate,
      activeRegister[s.id]?.status || 'Present',
      activeRegister[s.id]?.notes || '',
    ]);
    exportToCsv(`TCC_Attendance_${selectedCourseCode}_${selectedDate}`, headers, rows);
  };

  // Status counts
  const presentCount = filteredStudents.filter((s) => (activeRegister[s.id]?.status || 'Present') === 'Present').length;
  const absentCount = filteredStudents.filter((s) => activeRegister[s.id]?.status === 'Absent').length;
  const lateCount = filteredStudents.filter((s) => activeRegister[s.id]?.status === 'Late').length;
  const excusedCount = filteredStudents.filter((s) => activeRegister[s.id]?.status === 'Excused').length;

  // Calendar Heatmap Semester Dates dataset generator (16 weeks, 5 days per week)
  const semesterHeatmapDays = React.useMemo(() => {
    const days = [];
    const startDate = new Date('2026-05-04'); // Semester start
    for (let i = 0; i < 80; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + Math.floor(i / 5) * 7 + (i % 5)); // skip weekends
      const dateStr = d.toISOString().slice(0, 10);
      
      // Calculate attendance matching mock data
      let rate = 92;
      if (i % 14 === 3) rate = 68; // Absenteeism spike day
      else if (i % 9 === 2) rate = 78;
      else if (i % 5 === 0) rate = 98;
      else rate = Math.min(100, Math.max(70, 88 + (i % 7) * 2 - (i % 3) * 4));

      days.push({
        date: dateStr,
        dayNum: d.getDate(),
        monthName: d.toLocaleDateString('en-US', { month: 'short' }),
        rate,
        absentCount: Math.round((filteredStudents.length * (100 - rate)) / 100),
        presentCount: Math.round((filteredStudents.length * rate) / 100),
      });
    }
    return days;
  }, [filteredStudents.length]);

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100 transition-colors">
      {/* Header Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
            <CalendarCheck2 className="w-4 h-4" />
            <span>Faculty Daily Attendance & Class Register</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Attendance Register ({selectedCourseCode})
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Batch record attendance with real-time risk alert warnings when student attendance drops below 80%.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Course Selector */}
          <select
            value={selectedCourseCode}
            onChange={(e) => setSelectedCourseCode(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            {courses.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} - {c.name}
              </option>
            ))}
          </select>

          {/* Date Picker */}
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
          />

          {/* Save Attendance Register */}
          <button
            onClick={handleSaveRegister}
            className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{t(currentLang, 'saveChanges')}</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportAttendanceCsv}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold rounded-xl transition"
          >
            <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{t(currentLang, 'exportCsv')}</span>
          </button>
        </div>
      </div>

      {/* Register Summary Counters & Batch Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3.5 shadow-xs flex items-center justify-between transition-colors">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Present</span>
            <div className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">{presentCount}</div>
          </div>
          <button
            onClick={() => handleBatchMarkAll('Present')}
            className="text-[10px] px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-lg border border-emerald-200 dark:border-emerald-800 font-bold"
          >
            Mark All
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3.5 shadow-xs flex items-center justify-between transition-colors">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Absent</span>
            <div className="text-xl font-black font-mono text-rose-600 dark:text-rose-400">{absentCount}</div>
          </div>
          <button
            onClick={() => handleBatchMarkAll('Absent')}
            className="text-[10px] px-2.5 py-1 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 rounded-lg border border-rose-200 dark:border-rose-800 font-bold"
          >
            Mark All
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3.5 shadow-xs flex items-center justify-between transition-colors">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Late</span>
            <div className="text-xl font-black font-mono text-amber-600 dark:text-amber-400">{lateCount}</div>
          </div>
          <button
            onClick={() => handleBatchMarkAll('Late')}
            className="text-[10px] px-2.5 py-1 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-300 rounded-lg border border-amber-200 dark:border-amber-800 font-bold"
          >
            Mark All
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3.5 shadow-xs flex items-center justify-between transition-colors">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Excused</span>
            <div className="text-xl font-black font-mono text-blue-600 dark:text-blue-400">{excusedCount}</div>
          </div>
          <button
            onClick={() => handleBatchMarkAll('Excused')}
            className="text-[10px] px-2.5 py-1 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-lg border border-blue-200 dark:border-blue-800 font-bold"
          >
            Mark All
          </button>
        </div>
      </div>

      {/* Calendar-Based Heatmap Visualizer */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
              <CalendarCheck2 className="w-4 h-4" />
              <span>Semester Attendance Heatmap Matrix</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              16-Week Daily Attendance Frequency & Absenteeism Heatmap ({selectedCourseCode})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Click any calendar day block to view exact attendance rates or filter the daily register to that date.
            </p>
          </div>

          {/* Heatmap Color Legend */}
          <div className="flex items-center space-x-3 text-[11px] font-medium text-slate-600 dark:text-slate-400">
            <span className="text-slate-400">Rate:</span>
            <div className="flex items-center space-x-1">
              <span className="w-3 h-3 rounded bg-emerald-600 inline-block"></span>
              <span>&ge; 95%</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-3 h-3 rounded bg-emerald-400 inline-block"></span>
              <span>85-94%</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-3 h-3 rounded bg-amber-400 inline-block"></span>
              <span>75-84%</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-3 h-3 rounded bg-rose-500 inline-block"></span>
              <span>&lt; 75%</span>
            </div>
          </div>
        </div>

        {/* Heatmap Grid Calendar Blocks */}
        <div className="overflow-x-auto pb-2">
          <div className="min-w-[680px]">
            <div className="grid grid-cols-16 gap-1.5 text-center font-mono text-[10px]">
              {Array.from({ length: 16 }).map((_, wkIdx) => (
                <div key={wkIdx} className="text-slate-400 dark:text-slate-500 font-bold mb-1">
                  Wk {wkIdx + 1}
                </div>
              ))}

              {semesterHeatmapDays.map((hd, idx) => {
                const heatBg =
                  hd.rate >= 95
                    ? 'bg-emerald-600 text-white'
                    : hd.rate >= 85
                    ? 'bg-emerald-400 text-slate-900'
                    : hd.rate >= 75
                    ? 'bg-amber-400 text-slate-900'
                    : 'bg-rose-500 text-white animate-pulse';

                const isCurrentSelected = hd.date === selectedDate;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedDate(hd.date)}
                    className={`h-9 rounded-lg p-1 flex flex-col items-center justify-between transition cursor-pointer hover:scale-105 shadow-xs ${heatBg} ${
                      isCurrentSelected ? 'ring-2 ring-blue-500 dark:ring-blue-400 ring-offset-2 dark:ring-offset-slate-900 font-black' : ''
                    }`}
                    title={`${hd.date} (${hd.monthName} ${hd.dayNum}): ${hd.rate}% Attendance (${hd.absentCount} Absent)`}
                  >
                    <span className="text-[9px] opacity-80">{hd.dayNum}</span>
                    <span className="text-[10px] font-bold">{hd.rate}%</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>
              Active Selected Date: <strong className="text-slate-900 dark:text-white font-mono">{selectedDate}</strong>
            </span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Red blocks highlight high absenteeism days requiring attendance verification.
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={t(currentLang, 'searchStudent')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Mobile Card Roster View (< sm) */}
        <div className="sm:hidden space-y-3">
          {filteredStudents.length === 0 ? (
            <div className="p-6 text-center text-slate-400 dark:text-slate-500 italic bg-slate-50 dark:bg-slate-800/40 rounded-xl">
              No students listed for this roster.
            </div>
          ) : (
            filteredStudents.map((std) => {
              const currentReg = activeRegister[std.id] || { status: 'Present', notes: '' };

              return (
                <div
                  key={std.id}
                  className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-2.5"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center shrink-0">
                        {std.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900 dark:text-white">{std.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          ID: {std.studentNo} {std.department && `• ${std.department}`}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`font-mono text-xs font-bold ${std.overallAttendance < 80 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {std.overallAttendance}%
                      </span>
                      {std.overallAttendance < 80 && (
                        <div className="text-[9px] text-rose-500 font-bold">At-Risk</div>
                      )}
                    </div>
                  </div>

                  {/* 4 Status Buttons in 1 touch-friendly mobile row */}
                  <div className="grid grid-cols-4 gap-1.5">
                    {(['Present', 'Absent', 'Late', 'Excused'] as AttendanceStatus[]).map((st) => {
                      const isSelected = currentReg.status === st;
                      return (
                        <button
                          key={st}
                          onClick={() => handleStatusChange(std.id, st)}
                          className={`py-2 rounded-xl text-xs font-bold transition border min-h-[42px] flex items-center justify-center ${
                            isSelected
                              ? st === 'Present'
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                : st === 'Absent'
                                ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                                : st === 'Late'
                                ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                                : 'bg-blue-600 text-white border-blue-600 shadow-xs'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {st}
                        </button>
                      );
                    })}
                  </div>

                  {/* Notes / Reason input */}
                  <input
                    type="text"
                    value={currentReg.notes}
                    onChange={(e) => handleNotesChange(std.id, e.target.value)}
                    placeholder="Add attendance notes or remarks..."
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              );
            })
          )}
        </div>

        {/* Desktop Table View (>= sm) */}
        <div className="hidden sm:block overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3">Student Name & Identifiers</th>
                <th className="p-3">Cumulative Rate</th>
                <th className="p-3">Attendance Status</th>
                <th className="p-3">Notes & Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-slate-400 dark:text-slate-500 italic">
                    No students listed for this roster.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((std) => {
                  const currentReg = activeRegister[std.id] || { status: 'Present', notes: '' };

                  return (
                    <tr key={std.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition">
                      <td className="p-3">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center shrink-0">
                            {std.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">{std.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 flex-wrap">
                              <span>ID: {std.studentNo}</span>
                              {std.lrn && <span>• LRN: {std.lrn}</span>}
                              <span>• {std.department}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-3">
                        <div className="flex items-center space-x-2 font-mono font-bold">
                          <span className={std.overallAttendance < 80 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}>
                            {std.overallAttendance}%
                          </span>
                          {std.overallAttendance < 80 && (
                            <span className="text-[10px] px-2 py-0.5 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-full font-sans font-bold">
                              Low Attendance Warning
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-3">
                        <div className="flex items-center space-x-1.5">
                          {(['Present', 'Absent', 'Late', 'Excused'] as AttendanceStatus[]).map((st) => {
                            const isSelected = currentReg.status === st;
                            return (
                              <button
                                key={st}
                                onClick={() => handleStatusChange(std.id, st)}
                                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition border ${
                                  isSelected
                                    ? st === 'Present'
                                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                      : st === 'Absent'
                                      ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                                      : st === 'Late'
                                      ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                                      : 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                                }`}
                              >
                                {st}
                              </button>
                            );
                          })}
                        </div>
                      </td>

                      <td className="p-3">
                        <input
                          type="text"
                          value={currentReg.notes}
                          onChange={(e) => handleNotesChange(std.id, e.target.value)}
                          placeholder="e.g. Clinic slip, Late transport..."
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
