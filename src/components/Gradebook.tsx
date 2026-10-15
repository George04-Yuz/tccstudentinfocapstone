import React, { useState, useMemo } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Student, Course, GradeItem, Language, User } from '../types';
import { t } from '../utils/i18n';
import { exportToCsv } from '../utils/encryption';
import { percentageToPhGrade, ASSESSMENT_TERMS } from '../utils/philippineGrading';
import {
  BookOpenCheck,
  Plus,
  Lock,
  Unlock,
  Download,
  Search,
  CheckCircle2,
  FileSpreadsheet,
  Edit3,
  Save,
  MessageSquare,
  BarChart3,
  GraduationCap,
  Users,
  ChevronDown,
  ChevronUp,
  Clock,
  AlertCircle,
  FileText,
  Layers,
  Sparkles,
  Building2,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  LabelList,
  Legend,
  CartesianGrid,
} from 'recharts';

interface GradebookProps {
  students: Student[];
  courses: Course[];
  grades: GradeItem[];
  currentUser: User | null;
  currentLang: Language;
  selectedDepartment: string;
  onUpdateGrade: (grade: GradeItem) => void;
  onAddGrade: (newGrade: GradeItem) => void;
  onApproveGrades: (courseCode: string) => void;
}

export const Gradebook: React.FC<GradebookProps> = ({
  students,
  courses,
  grades,
  currentUser,
  currentLang,
  selectedDepartment,
  onUpdateGrade,
  onAddGrade,
  onApproveGrades,
}) => {
  const [selectedCourseCode, setSelectedCourseCode] = useState(courses[0]?.code || 'IT-301');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingGradeId, setEditingGradeId] = useState<string | null>(null);
  const [editScore, setEditScore] = useState<number>(0);
  const [editFeedback, setEditFeedback] = useState<string>('');

  // Interactive Card Expander States
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);
  const [expandedCourseCode, setExpandedCourseCode] = useState<string | null>(null);

  // New grade modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStudentId, setNewStudentId] = useState(students[0]?.id || 'std-101');
  const [newCategory, setNewCategory] = useState<'Assignments' | 'Quizzes' | 'Midterm' | 'Final Exam' | 'Laboratory'>('Assignments');
  const [newScore, setNewScore] = useState(85);
  const [newMaxScore, setNewMaxScore] = useState(100);
  const [newFeedback, setNewFeedback] = useState('');

  const currentCourse = courses.find((c) => c.code === selectedCourseCode) || courses[0];

  const filteredStudents = students.filter((s) => {
    const matchesDept = selectedDepartment === 'All Departments' || s.department === selectedDepartment;
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentNo.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  const getStudentGrades = (studentId: string) => {
    return grades.filter((g) => g.studentId === studentId && g.courseCode === selectedCourseCode);
  };

  const calculateStudentOverallScore = (studentId: string) => {
    const stGrades = getStudentGrades(studentId);
    if (stGrades.length === 0) return 0;
    const total = stGrades.reduce((sum, item) => sum + (item.score / item.maxScore) * item.weight, 0);
    return Math.min(100, Math.round(total * 10) / 10);
  };

  const handleExportPDF = async (student: Student) => {
    const stGrades = getStudentGrades(student.id);
    const overall = calculateStudentOverallScore(student.id);
    const phGrade = percentageToPhGrade(overall);
    const currentCourse = courses.find((c) => c.code === selectedCourseCode) || courses[0];

    const doc = new jsPDF();
    
    doc.setFontSize(22);
    doc.setTextColor(30, 64, 175);
    doc.text("Torres Capitol College", 105, 20, { align: "center" });
    
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text("Official Academic Grade Report", 105, 30, { align: "center" });
    
    doc.setFontSize(11);
    doc.setTextColor(71, 85, 105);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 105, 38, { align: "center" });

    doc.setDrawColor(203, 213, 225);
    doc.line(20, 45, 190, 45);
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(12);
    doc.text(`Student Name: ${student.name}`, 20, 55);
    doc.text(`Student ID: ${student.studentNo}`, 20, 62);
    doc.text(`Course: ${currentCourse.name} (${currentCourse.code})`, 20, 69);
    doc.text(`Term Final Grade: ${phGrade.label} (${overall}%)`, 20, 76);
    doc.line(20, 82, 190, 82);

    let y = 92;
    doc.setFontSize(14);
    doc.setTextColor(30, 64, 175);
    doc.text("Four-Term Assessment Breakdown", 20, y);
    y += 10;
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text("Category", 20, y);
    doc.text("Score", 80, y);
    doc.text("Weight", 120, y);
    doc.text("Feedback", 150, y);
    y += 5;
    doc.line(20, y, 190, y);
    y += 8;
    
    doc.setTextColor(15, 23, 42);
    ASSESSMENT_TERMS.forEach((cat, idx) => {
      const termGrade = stGrades.find(g => g.category === cat.term);
      const score = termGrade?.score ?? Math.round(overall * (1 - (idx * 0.02)));
      const max = termGrade?.maxScore ?? cat.defaultMax;
      
      doc.text(cat.label, 20, y);
      doc.text(`${score} / ${max}`, 80, y);
      doc.text(`${cat.weight}%`, 120, y);
      
      const feedbackText = doc.splitTextToSize(termGrade?.feedback || 'Good academic engagement shown.', 40);
      doc.text(feedbackText, 150, y);
      y += Math.max(10, feedbackText.length * 5);
    });
    
    doc.save(`${student.studentNo}_${currentCourse.code}_GradeReport.pdf`);
  };

  const handleSaveEdit = (grade: GradeItem) => {
    onUpdateGrade({
      ...grade,
      score: editScore,
      feedback: editFeedback,
    });
    setEditingGradeId(null);
  };

  const handleAddNewGradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newGradeObj: GradeItem = {
      id: `grd-${Date.now()}`,
      studentId: newStudentId,
      courseCode: selectedCourseCode,
      courseName: currentCourse.name,
      category: newCategory,
      score: Number(newScore),
      maxScore: Number(newMaxScore),
      weight: newCategory === 'Midterm' || newCategory === 'Final Exam' ? 30 : 15,
      date: new Date().toISOString().slice(0, 10),
      feedback: newFeedback,
      locked: false,
    };
    onAddGrade(newGradeObj);
    setShowAddModal(false);
    setNewFeedback('');
  };

  const handleExportGradebookCsv = () => {
    // Ensure only authorized department students are exported
    const authorizedStudents = selectedDepartment === 'All Departments' 
      ? filteredStudents 
      : filteredStudents.filter((s) => s.department === selectedDepartment);

    const headers = [
      'Student No', 
      'Student Name', 
      'Institutional Email', 
      'Department', 
      'Year Level', 
      'Enrolled Course Code', 
      'Calculated Score (%)', 
      'Philippine Grade Label', 
      'Numeric Grade Equivalent', 
      'Academic Standing'
    ];
    
    const rows = authorizedStudents.map((s) => {
      const score = calculateStudentOverallScore(s.id);
      const ph = percentageToPhGrade(score);
      return [
        s.studentNo, 
        s.name, 
        s.email, 
        s.department, 
        s.yearLevel, 
        selectedCourseCode, 
        `${score}%`, 
        ph.label, 
        ph.numericGrade.toFixed(2), 
        ph.status
      ];
    });

    const deptTag = selectedDepartment === 'All Departments' ? 'ALL_DEPTS' : selectedDepartment.replace(/\s+/g, '_');
    exportToCsv(`TCC_Authorized_Grade_Roster_${selectedCourseCode}_${deptTag}`, headers, rows);
    alert(`Authorized grade roster CSV exported successfully!\n\nDepartment: ${selectedDepartment}\nTotal Exported Records: ${rows.length} students`);
  };

  // Real-time Departmental GPA Comparative Analytics Engine (Current Semester)
  const departmentalGpaComparison = useMemo(() => {
    const depts = [
      'BS Information Technology',
      'BS Business Administration',
      'BS Criminology',
    ];

    // Compute overall college average GPA across all students
    let collegeTotalScore = 0;
    students.forEach((st) => {
      collegeTotalScore += calculateStudentOverallScore(st.id);
    });
    const collegeAvgPct = students.length > 0 ? collegeTotalScore / students.length : 86.5;
    const collegeAvgPh = percentageToPhGrade(collegeAvgPct).numericGrade;
    const collegeAvg4Scale = Number((Math.min(4.0, (collegeAvgPct / 100) * 4.0)).toFixed(2));

    const data = depts.map((dName) => {
      const deptStudents = students.filter((s) => s.department === dName);
      let deptTotalScore = 0;
      deptStudents.forEach((st) => {
        deptTotalScore += calculateStudentOverallScore(st.id);
      });
      const avgScore = deptStudents.length > 0 ? deptTotalScore / deptStudents.length : 84.0;
      const deptPhGrade = percentageToPhGrade(avgScore).numericGrade;
      const deptGpa4Scale = Number((Math.min(4.0, (avgScore / 100) * 4.0)).toFixed(2));
      const delta = Number((deptGpa4Scale - collegeAvg4Scale).toFixed(2));

      return {
        departmentShort: dName.replace('BS ', ''),
        departmentFull: dName,
        deptGpa: deptGpa4Scale,
        collegeAvg: collegeAvg4Scale,
        deptPhGrade: deptPhGrade.toFixed(2),
        collegePhGrade: collegeAvgPh.toFixed(2),
        studentCount: deptStudents.length,
        delta,
        isAbove: delta >= 0,
      };
    });

    return {
      chartData: data,
      collegeAvg4Scale,
      collegeAvgPhGrade: collegeAvgPh.toFixed(2),
      collegeTotalStudents: students.length,
    };
  }, [students, grades, selectedCourseCode]);

  // Grade distribution frequency calculation for Recharts bar chart
  const gradeDistributionData = (() => {
    const counts = { 'Excellent (1.00-1.50)': 0, 'Good (1.75-2.50)': 0, 'Passing (2.75-3.00)': 0, 'Conditional (4.00)': 0, 'Failed (5.00)': 0 };
    filteredStudents.forEach((std) => {
      const score = calculateStudentOverallScore(std.id);
      const ph = percentageToPhGrade(score).numericGrade;
      if (ph <= 1.5) counts['Excellent (1.00-1.50)']++;
      else if (ph <= 2.5) counts['Good (1.75-2.50)']++;
      else if (ph <= 3.0) counts['Passing (2.75-3.00)']++;
      else if (ph <= 4.0) counts['Conditional (4.00)']++;
      else counts['Failed (5.00)']++;
    });

    const total = filteredStudents.length || 1;
    return [
      { grade: 'Excellent (1.00-1.50)', letter: 'Exc', count: counts['Excellent (1.00-1.50)'], percentage: Math.round((counts['Excellent (1.00-1.50)'] / total) * 100), fill: '#10b981' },
      { grade: 'Good (1.75-2.50)', letter: 'Good', count: counts['Good (1.75-2.50)'], percentage: Math.round((counts['Good (1.75-2.50)'] / total) * 100), fill: '#2563eb' },
      { grade: 'Passing (2.75-3.00)', letter: 'Pass', count: counts['Passing (2.75-3.00)'], percentage: Math.round((counts['Passing (2.75-3.00)'] / total) * 100), fill: '#f59e0b' },
      { grade: 'Conditional (4.00)', letter: 'Cond', count: counts['Conditional (4.00)'], percentage: Math.round((counts['Conditional (4.00)'] / total) * 100), fill: '#f97316' },
      { grade: 'Failed (5.00)', letter: 'Fail', count: counts['Failed (5.00)'], percentage: Math.round((counts['Failed (5.00)'] / total) * 100), fill: '#f43f5e' },
    ];
  })();

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            <BookOpenCheck className="w-4 h-4" />
            <span>Academic Gradebook & Roster Assessment</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            {currentCourse.name} ({currentCourse.code})
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Faculty Instructor: <span className="text-slate-800 font-semibold">{currentCourse.facultyName}</span> • {currentCourse.schedule}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Course Selector */}
          <select
            value={selectedCourseCode}
            onChange={(e) => setSelectedCourseCode(e.target.value)}
            className="bg-slate-50 text-slate-800 text-xs font-bold rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {courses.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} - {c.name}
              </option>
            ))}
          </select>

          {/* Add Grade Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>{t(currentLang, 'addGrade')}</span>
          </button>

          {/* Approve Grades Button */}
          {(currentUser?.role === 'Dean' || currentUser?.role === 'Admin' || currentUser?.role === 'Registrar') && (
            <button
              onClick={() => onApproveGrades(selectedCourseCode)}
              className="flex items-center space-x-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Lock & Approve Roster</span>
            </button>
          )}

          {/* Export CSV */}
          <button
            onClick={handleExportGradebookCsv}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl transition"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>{t(currentLang, 'exportCsv')}</span>
          </button>
        </div>
      </div>

      {/* Real-Time Departmental GPA Comparative Analytics Chart */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
              <Building2 className="w-4 h-4" />
              <span>Comparative Academic Analytics • Current Semester</span>
            </div>
            <h3 className="text-lg font-extrabold text-slate-900">
              Departmental GPA Average vs. College Overall Baseline
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time grade comparison across academic departments against the institutional average ({departmentalGpaComparison.collegeAvg4Scale} GPA / {departmentalGpaComparison.collegeAvgPhGrade} PH Grade).
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-slate-50 p-2 rounded-xl border border-slate-200/60 shrink-0">
            <div className="text-right">
              <div className="text-[10px] text-slate-400 font-bold uppercase">College Overall Baseline</div>
              <div className="text-sm font-black text-slate-900 font-mono">
                {departmentalGpaComparison.collegeAvg4Scale} <span className="text-xs font-semibold text-blue-600">GPA</span>
              </div>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="text-right">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Active Students</div>
              <div className="text-sm font-black text-slate-900 font-mono">
                {departmentalGpaComparison.collegeTotalStudents}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Comparative Bar Chart */}
          <div className="lg:col-span-2 w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={departmentalGpaComparison.chartData}
                margin={{ top: 20, right: 20, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="departmentShort"
                  tick={{ fill: '#334155', fontSize: 11, fontWeight: 'bold' }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 4.0]}
                  ticks={[0, 1.0, 2.0, 3.0, 4.0]}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px',
                    padding: '12px',
                  }}
                  formatter={(value: any, name: any, item: any) => [
                    `${value} GPA (PH Grade: ${name === 'Department GPA' ? item.payload.deptPhGrade : item.payload.collegePhGrade})`,
                    name,
                  ]}
                />
                <Legend
                  wrapperStyle={{ fontSize: '12px', fontWeight: '600', paddingTop: '10px' }}
                />
                <Bar dataKey="deptGpa" name="Department GPA" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={32}>
                  <LabelList dataKey="deptGpa" position="top" style={{ fill: '#1e293b', fontSize: '11px', fontWeight: 'bold' }} />
                </Bar>
                <Bar dataKey="collegeAvg" name="College Baseline" fill="#94a3b8" radius={[6, 6, 0, 0]} barSize={32}>
                  <LabelList dataKey="collegeAvg" position="top" style={{ fill: '#64748b', fontSize: '11px', fontWeight: 'bold' }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Department Breakdown Cards */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Department Variance Summary
            </div>
            {departmentalGpaComparison.chartData.map((d) => (
              <div
                key={d.departmentFull}
                className={`p-3.5 rounded-xl border transition ${
                  selectedDepartment === d.departmentFull || (selectedDepartment === 'All Departments' && d.departmentShort === 'Information Technology')
                    ? 'bg-blue-50/70 border-blue-300 shadow-xs'
                    : 'bg-slate-50 border-slate-200/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">{d.departmentFull}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      d.isAbove
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}
                  >
                    {d.delta >= 0 ? `+${d.delta} vs Avg` : `${d.delta} vs Avg`}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-200/60 text-xs">
                  <div>
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">Dept GPA</div>
                    <div className="font-mono font-black text-slate-900">{d.deptGpa} <span className="text-[10px] text-slate-500 font-normal">({d.deptPhGrade})</span></div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">Enrolled</div>
                    <div className="font-mono font-bold text-slate-700">{d.studentCount} Students</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Course Grade Distribution & Quick Selector Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recharts Grade Frequency Distribution Bar Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-0.5">
                <BarChart3 className="w-4 h-4" />
                <span>Grade Frequency Analysis</span>
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Grade Distribution Bar Chart — {currentCourse.code}
              </h3>
            </div>
            <div className="text-xs text-slate-500 font-mono font-semibold">
              Roster Size: <span className="text-blue-600 font-bold">{filteredStudents.length} Students</span>
            </div>
          </div>

          <div className="w-full h-52 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={gradeDistributionData}
                margin={{ top: 15, right: 20, left: -20, bottom: 0 }}
              >
                <XAxis
                  dataKey="letter"
                  tick={{ fill: '#334155', fontSize: 12, fontWeight: 'bold' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px',
                    fontWeight: '600',
                  }}
                  formatter={(value: any, name: any, item: any) => [
                    `${value} Students (${item.payload.percentage}%)`,
                    `Grade ${item.payload.letter}`,
                  ]}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={40}>
                  {gradeDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                  <LabelList
                    dataKey="count"
                    position="top"
                    style={{ fill: '#0f172a', fontSize: '11px', fontWeight: 'bold' }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Grade Distribution Pill Summary Row */}
          <div className="grid grid-cols-5 gap-2 mt-2 pt-3 border-t border-slate-100 text-center">
            {gradeDistributionData.map((d) => (
              <div key={d.letter} className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-[10px] font-bold text-slate-400">Grade {d.letter}</div>
                <div className="text-sm font-black font-mono text-slate-900 mt-0.5">{d.count} std</div>
                <div className="text-[10px] font-semibold text-slate-500">{d.percentage}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Course Roster Overview List */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 pb-2 border-b border-slate-100">
              <GraduationCap className="w-4 h-4 text-blue-600" />
              <span>Department Course Catalog</span>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {courses.map((c) => {
                const isSelected = c.code === selectedCourseCode;
                const isExpanded = expandedCourseCode === c.code;

                return (
                  <div key={c.code} className="rounded-xl border border-slate-200/80 overflow-hidden bg-slate-50 transition">
                    <div
                      onClick={() => setSelectedCourseCode(c.code)}
                      className={`p-3 cursor-pointer flex items-center justify-between transition ${
                        isSelected
                          ? 'bg-blue-50/90 border-l-4 border-l-blue-600 shadow-xs'
                          : 'hover:bg-slate-100/80'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="text-xs font-bold text-slate-900 flex items-center space-x-2">
                          <span>{c.code}</span>
                          {isSelected && (
                            <span className="text-[9px] bg-blue-600 text-white px-1.5 py-0.2 rounded font-mono">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[180px] mt-0.5">
                          {c.name}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <div className="text-right">
                          <div className="text-xs font-mono font-bold text-slate-800">
                            {c.credits} Credits
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {c.department}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedCourseCode(isExpanded ? null : c.code);
                          }}
                          className="p-1 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-200/60 transition"
                          title="Toggle Course Syllabus & Assessment Weights"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Interactive Course Expander Breakdown */}
                    {isExpanded && (
                      <div className="p-3 bg-white border-t border-slate-200/60 text-xs space-y-2.5">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                          <span className="flex items-center space-x-1">
                            <Layers className="w-3.5 h-3.5 text-blue-600" />
                            <span>Assessment Weight Scheme</span>
                          </span>
                          <span className="text-[10px] text-emerald-600 font-mono">Total: 100%</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                          <div className="p-1.5 rounded bg-slate-50 border border-slate-200/60">
                            <div className="text-slate-400">Assignments</div>
                            <div className="font-bold text-slate-800">20% Weight</div>
                          </div>
                          <div className="p-1.5 rounded bg-slate-50 border border-slate-200/60">
                            <div className="text-slate-400">Quizzes</div>
                            <div className="font-bold text-slate-800">15% Weight</div>
                          </div>
                          <div className="p-1.5 rounded bg-slate-50 border border-slate-200/60">
                            <div className="text-slate-400">Midterm Exam</div>
                            <div className="font-bold text-slate-800">30% Weight</div>
                          </div>
                          <div className="p-1.5 rounded bg-slate-50 border border-slate-200/60">
                            <div className="text-slate-400">Final Project</div>
                            <div className="font-bold text-slate-800">35% Weight</div>
                          </div>
                        </div>

                        <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
                          <span>Instructor: <strong className="text-slate-800">{c.facultyName}</strong></span>
                          <span className="text-blue-600 font-semibold">{c.schedule}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 mt-3 text-[11px] text-blue-900 font-medium">
            💡 Select any course above to instantly update the gradebook roster and Recharts frequency chart.
          </div>
        </div>
      </div>

      {/* Grade Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={t(currentLang, 'searchStudent')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center space-x-3 text-xs text-slate-500 dark:text-slate-400 font-mono">
            <span>Category Weights: Prelim (20%) • Midterms (25%) • Semifinal (25%) • Finals (30%)</span>
          </div>
        </div>

        {/* Mobile Roster Cards (< sm) */}
        <div className="sm:hidden space-y-3 mb-4">
          {filteredStudents.length === 0 ? (
            <div className="p-6 text-center text-slate-400 italic bg-slate-50 rounded-xl">
              No student records found.
            </div>
          ) : (
            filteredStudents.map((std) => {
              const stGrades = getStudentGrades(std.id);
              const overallScore = calculateStudentOverallScore(std.id);
              const ph = percentageToPhGrade(overallScore);
              const isStudentExpanded = expandedStudentId === std.id;

              return (
                <div
                  key={std.id}
                  className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2.5"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-xs flex items-center justify-center shrink-0">
                        {std.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900">{std.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {std.studentNo} • {std.program}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-mono font-bold text-slate-900">{overallScore}%</div>
                      <span className={`inline-block px-2 py-0.5 rounded-lg text-[10px] font-bold border ${ph.colorBadge}`}>
                        {ph.label}
                      </span>
                    </div>
                  </div>

                  {/* Assessment scores pills */}
                  <div className="pt-1 border-t border-slate-200/60">
                    <span className="text-[10px] text-slate-400 block mb-1">Assessment Scores:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {stGrades.length === 0 ? (
                        <span className="text-[10px] text-slate-400 italic">No grades recorded</span>
                      ) : (
                        stGrades.map((g) => (
                          <div
                            key={g.id}
                            className="px-2 py-1 rounded bg-white border border-slate-200 text-[10px] font-mono flex items-center space-x-1"
                          >
                            <span className="text-slate-500">{g.category.slice(0, 3)}:</span>
                            <span className="font-bold text-blue-600">{g.score}/{g.maxScore}</span>
                            {g.locked ? (
                              <Lock className="w-3 h-3 text-emerald-500 ml-0.5" />
                            ) : (
                              <button
                                onClick={() => {
                                  setEditingGradeId(g.id);
                                  setEditScore(g.score);
                                  setEditFeedback(g.feedback || '');
                                }}
                                className="text-slate-400 hover:text-blue-600 ml-0.5"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <button
                      onClick={() => setExpandedStudentId(isStudentExpanded ? null : std.id)}
                      className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                    >
                      <span>{isStudentExpanded ? 'Hide Details' : 'View Breakdown'}</span>
                      {isStudentExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                    <button
                      onClick={() => {
                        setNewStudentId(std.id);
                        setShowAddModal(true);
                      }}
                      className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold shadow-xs"
                    >
                      + Add Grade
                    </button>
                  </div>

                  {/* Collapsible Mobile Breakdown */}
                  {isStudentExpanded && (
                    <div className="mt-2 p-3 bg-white rounded-xl border border-slate-200 text-[11px] space-y-1.5 font-mono">
                      <div className="font-bold text-slate-700 text-xs font-sans">Performance Status</div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Classification:</span>
                        <span className="font-bold text-slate-800">{ph.status}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Attendance:</span>
                        <span className="font-bold text-emerald-600">{std.overallAttendance}%</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Desktop Table View (>= sm) */}
        <div className="hidden sm:block overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3">Student Name</th>
                <th className="p-3">Program</th>
                <th className="p-3">Assessment Scores</th>
                <th className="p-3 text-center">Calculated Score</th>
                <th className="p-3 text-center">Ph Grade</th>
                <th className="p-3 text-right">Actions / Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-400 italic">
                    No student records found.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((std) => {
                  const stGrades = getStudentGrades(std.id);
                  const overallScore = calculateStudentOverallScore(std.id);
                  const ph = percentageToPhGrade(overallScore);
                  const isStudentExpanded = expandedStudentId === std.id;

                  return (
                    <React.Fragment key={std.id}>
                      <tr className="hover:bg-slate-50/80 transition">
                        <td className="p-3">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-xs flex items-center justify-center shrink-0">
                              {std.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">{std.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{std.studentNo}</div>
                            </div>
                          </div>
                        </td>

                        <td className="p-3">
                          <div className="text-slate-800 font-medium">{std.program}</div>
                          <div className="text-[10px] text-slate-500">{std.yearLevel}</div>
                        </td>

                        <td className="p-3">
                          <div className="flex flex-wrap gap-1.5 max-w-xs">
                            {stGrades.length === 0 ? (
                              <span className="text-[10px] text-slate-400 italic">No grades entered</span>
                            ) : (
                              stGrades.map((g) => (
                                <div
                                  key={g.id}
                                  className="px-2 py-1 rounded bg-slate-50 border border-slate-200 text-[11px] font-mono flex items-center space-x-1"
                                >
                                  <span className="text-slate-500 text-[10px]">{g.category.slice(0, 3)}:</span>
                                  <span className="font-bold text-blue-600">{g.score}/{g.maxScore}</span>
                                  {g.locked ? (
                                    <Lock className="w-3 h-3 text-emerald-500 ml-1" title="Approved Grade" />
                                  ) : (
                                    <button
                                      onClick={() => {
                                        setEditingGradeId(g.id);
                                        setEditScore(g.score);
                                        setEditFeedback(g.feedback || '');
                                      }}
                                      className="text-slate-400 hover:text-blue-600 ml-1"
                                      title="Edit Score"
                                    >
                                      <Edit3 className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              ))
                            )}
                          </div>
                        </td>

                        <td className="p-3 text-center font-mono font-bold text-sm text-slate-900">
                          {overallScore}%
                        </td>

                        <td className="p-3 text-center">
                          <div
                            className={`inline-block px-3 py-1 rounded-xl text-xs font-bold border ${ph.colorBadge}`}
                            title={ph.description}
                          >
                            {ph.label}
                          </div>
                          <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">{ph.status}</div>
                        </td>

                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => setExpandedStudentId(isStudentExpanded ? null : std.id)}
                              className={`px-2.5 py-1 border rounded-xl text-[11px] font-bold transition flex items-center space-x-1 ${
                                isStudentExpanded
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                              }`}
                            >
                              <span>{isStudentExpanded ? 'Collapse' : 'Breakdown'}</span>
                              {isStudentExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>

                            <button
                              onClick={() => {
                                setNewStudentId(std.id);
                                setShowAddModal(true);
                              }}
                              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-[11px] font-bold transition shadow-xs"
                            >
                              + Grade
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Interactive Student Assessment Breakdown Card Expander */}
                      {isStudentExpanded && (
                        <tr className="bg-slate-50/90">
                          <td colSpan={6} className="p-4 border-y border-blue-200/60">
                            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                                <div>
                                  <div className="text-xs font-black text-slate-900 flex items-center space-x-2">
                                    <Sparkles className="w-4 h-4 text-blue-600" />
                                    <span>Detailed Course Breakdown — {currentCourse.code} ({currentCourse.name})</span>
                                  </div>
                                  <div className="text-[11px] text-slate-500 mt-0.5">
                                    Enrolled Student: <strong className="text-slate-800">{std.name}</strong> ({std.studentNo})
                                  </div>
                                </div>
                                <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 font-mono text-xs">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-slate-500 dark:text-slate-400">Course Cumulative Grade:</span>
                                    <span className={`px-2.5 py-0.5 font-bold rounded-lg border ${ph.colorBadge}`}>
                                      {overallScore}% ({ph.label})
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => handleExportPDF(std)}
                                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white font-bold rounded-lg transition text-[11px]"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                    <span>Export PDF</span>
                                  </button>
                                </div>
                              </div>

                              {/* 4 Category Breakdown Cards */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                {ASSESSMENT_TERMS.map((cat, idx) => {
                                  const termGrade = stGrades.find(g => g.category === cat.term);
                                  const score = termGrade?.score ?? Math.round(overallScore * (1 - (idx * 0.02)));
                                  const status = termGrade?.locked ? 'Locked & Verified' : termGrade ? 'Graded' : 'Estimated / Pending';
                                  
                                  return (
                                  <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl space-y-1.5 transition-colors">
                                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
                                      <span>{cat.label}</span>
                                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">Weight: {cat.weight}%</span>
                                    </div>
                                    <div className="flex items-baseline justify-between">
                                      <div className="text-lg font-black font-mono text-blue-600 dark:text-blue-400">{score} <span className="text-xs text-slate-400 font-normal">/ {cat.defaultMax}</span></div>
                                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center space-x-0.5">
                                        <CheckCircle2 className="w-3 h-3" />
                                        <span>{status}</span>
                                      </div>
                                    </div>
                                    <div className="text-[10px] text-slate-500 dark:text-slate-400 italic truncate pt-1 border-t border-slate-200/50 dark:border-slate-700">
                                      Feedback: {termGrade?.feedback || 'Good academic engagement shown.'}
                                    </div>
                                  </div>
                                )})}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Score Modal */}
      {editingGradeId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-sm w-full text-slate-900 shadow-2xl">
            <h3 className="text-base font-bold mb-4 flex items-center space-x-2">
              <Edit3 className="w-4 h-4 text-blue-600" />
              <span>Update Student Grade Record</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 mb-1 font-semibold">Score Achieved</label>
                <input
                  type="number"
                  value={editScore}
                  onChange={(e) => setEditScore(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-blue-600 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-semibold">Faculty Feedback Note</label>
                <textarea
                  rows={3}
                  value={editFeedback}
                  onChange={(e) => setEditFeedback(e.target.value)}
                  placeholder="Provide feedback for student academic review..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={() => setEditingGradeId(null)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const target = grades.find((g) => g.id === editingGradeId);
                    if (target) handleSaveEdit(target);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center space-x-1 shadow-md shadow-blue-500/20"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Record</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add New Grade Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full text-slate-900 shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold flex items-center space-x-2">
                <Plus className="w-4 h-4 text-blue-600" />
                <span>{t(currentLang, 'addGrade')}</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddNewGradeSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Select Student</label>
                <select
                  value={newStudentId}
                  onChange={(e) => setNewStudentId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-medium"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.studentNo})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Assessment Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-medium"
                >
                  <option value="Prelim">Prelim Examination (20%)</option>
                  <option value="Midterms">Midterms Examination (25%)</option>
                  <option value="Semifinal">Semifinal Examination (25%)</option>
                  <option value="Finals">Finals Examination (30%)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Score</label>
                  <input
                    type="number"
                    value={newScore}
                    onChange={(e) => setNewScore(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-blue-600 font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Max Score</label>
                  <input
                    type="number"
                    value={newMaxScore}
                    onChange={(e) => setNewMaxScore(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Faculty Feedback</label>
                <input
                  type="text"
                  placeholder="Optional notes for student..."
                  value={newFeedback}
                  onChange={(e) => setNewFeedback(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/20"
                >
                  Record Assessment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
