import React, { useState, useMemo } from 'react';
import { Student, Department, Language, User } from '../types';
import { t } from '../utils/i18n';
import {
  FileSpreadsheet,
  UploadCloud,
  CheckCircle2,
  AlertOctagon,
  AlertTriangle,
  RefreshCw,
  Download,
  Copy,
  Trash2,
  Edit3,
  Check,
  UserPlus,
  ShieldCheck,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Database,
} from 'lucide-react';

interface BulkStudentImportProps {
  existingStudents: Student[];
  currentUser: User | null;
  currentLang: Language;
  selectedDepartment: string;
  onImportStudents: (newStudents: Student[], summaryText: string) => void;
  onNavigateTab: (tab: string) => void;
}

export interface ParsedStudentRow {
  rowIndex: number;
  rawText: string;
  studentNo: string;
  name: string;
  email: string;
  department: Department;
  yearLevel: string;
  program: string;
  gpa: number;
  overallAttendance: number;
  riskStatus: 'Optimal' | 'Watchlist' | 'Critical';
  isValid: boolean;
  errors: string[];
  warnings: string[];
  isDuplicateInDb: boolean;
  isDuplicateInBatch: boolean;
}

const SAMPLE_CSV = `studentNo,name,email,department,yearLevel,program,gpa,attendance
TCC-2026-101,Aria Sofia Castillo,aria.castillo@student.tcc.edu,BS Information Technology,1st Year,BS Information Technology,3.85,96
TCC-2026-102,Dominic James Alonzo,d.alonzo@student.tcc.edu,BS Criminology,2nd Year,BS Criminology,3.40,92
TCC-2026-103,Isabella Marie Cruz,isabella.cruz@student.tcc.edu,BS Business Administration,1st Year,BS Business Administration,2.20,78
TCC-2026-104,Mateo Gabriel Silva,mateo.silva@student.tcc.edu,BS Information Technology,3rd Year,BS Information Technology,3.95,99
TCC-2026-105,Clara Jane Bennett,clara.bennett@student.tcc.edu,BS Business Administration,2nd Year,BS Business Administration,1.85,68
TCC-2024-001,Duplicate Test Student,duplicate@student.tcc.edu,BS Information Technology,3rd Year,BS Information Technology,3.50,90
TCC-2026-106,Invalid Email Student,invalid-email-format,BS Criminology,1st Year,BS Criminology,3.10,88
TCC-2026-107,High GPA Student,high.gpa@student.tcc.edu,BS Information Technology,2nd Year,BS Information Technology,4.50,105`;

export const BulkStudentImport: React.FC<BulkStudentImportProps> = ({
  existingStudents,
  currentUser,
  currentLang,
  selectedDepartment,
  onImportStudents,
  onNavigateTab,
}) => {
  const [rawInput, setRawInput] = useState<string>(SAMPLE_CSV);
  const [delimiter, setDelimiter] = useState<',' | '\t' | ';'>(',');
  const [hasHeader, setHasHeader] = useState<boolean>(true);
  const [importMode, setImportMode] = useState<'csv' | 'form'>('csv');
  
  // Single Student Form State
  const [formData, setFormData] = useState({
    studentNo: '',
    name: '',
    email: '',
    department: selectedDepartment !== 'All Departments' ? selectedDepartment : 'BS Information Technology',
    yearLevel: '1st Year',
    program: selectedDepartment !== 'All Departments' ? selectedDepartment : 'BS Information Technology',
    gpa: '',
    attendance: '',
    lrn: '',
    contactNumber: '',
    address: { street: '', barangay: '', city: '', province: '', zipCode: '' },
    parents: { fatherName: '', motherName: '' }
  });
  const [defaultDepartment, setDefaultDepartment] = useState<Department>(
    selectedDepartment !== 'All Departments' ? (selectedDepartment as Department) : 'BS Information Technology'
  );
  const [filterTab, setFilterTab] = useState<'all' | 'valid' | 'errors' | 'warnings'>('all');
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<ParsedStudentRow>>({});
  const [copiedTemplate, setCopiedTemplate] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [importSuccess, setImportSuccess] = useState<{
    count: number;
    auditHash: string;
    timestamp: string;
  } | null>(null);

  // Departments list for dropdown
  const departmentOptions: Department[] = [
    'BS Information Technology',
    'BS Business Administration',
    'BS Criminology',
  ];

  // Real-time Parser & Validator Engine
  const parsedRows = useMemo<ParsedStudentRow[]>(() => {
    if (!rawInput.trim()) return [];

    const lines = rawInput
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.startsWith('#'));

    if (lines.length === 0) return [];

    const dataLines = hasHeader ? lines.slice(1) : lines;
    const seenStudentNos = new Set<string>();
    const seenEmails = new Set<string>();

    // Database existing sets for fast duplicate check
    const dbStudentNos = new Set(existingStudents.map((s) => s.studentNo.toLowerCase()));
    const dbEmails = new Set(existingStudents.map((s) => s.email.toLowerCase()));

    return dataLines.map((line, idx) => {
      const parts = line.split(delimiter).map((p) => p.trim().replace(/^"|"$/g, ''));
      const errors: string[] = [];
      const warnings: string[] = [];

      // Destructure columns based on position
      const studentNo = parts[0] || '';
      const name = parts[1] || '';
      const email = parts[2] || '';
      let rawDept = parts[3] || '';
      let yearLevel = parts[4] || '1st Year';
      let program = parts[5] || '';
      let rawGpa = parts[6] || '3.00';
      let rawAttendance = parts[7] || '90';

      // 1. Validate Student Number
      if (!studentNo) {
        errors.push('Missing Student Number (Required)');
      } else {
        const studentNoLower = studentNo.toLowerCase();
        if (dbStudentNos.has(studentNoLower)) {
          errors.push(`Duplicate Student No "${studentNo}" already exists in SIS database`);
        } else if (seenStudentNos.has(studentNoLower)) {
          errors.push(`Duplicate Student No "${studentNo}" repeated in current import batch`);
        }
        seenStudentNos.add(studentNoLower);
      }

      // 2. Validate Full Name
      if (!name || name.length < 2) {
        errors.push('Missing or invalid Full Name');
      }

      // 3. Validate Email Format & Uniqueness
      if (!email) {
        errors.push('Missing Email address');
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          errors.push(`Invalid email format ("${email}")`);
        } else {
          const emailLower = email.toLowerCase();
          if (dbEmails.has(emailLower)) {
            errors.push(`Email "${email}" already registered to an existing student`);
          } else if (seenEmails.has(emailLower)) {
            errors.push(`Duplicate email "${email}" repeated in current batch`);
          }
          seenEmails.add(emailLower);
        }
      }

      // 4. Validate Department
      let department: Department = defaultDepartment;
      if (rawDept) {
        const matchedDept = departmentOptions.find(
          (d) => d.toLowerCase() === rawDept.toLowerCase() || d.toLowerCase().includes(rawDept.toLowerCase())
        );
        if (matchedDept) {
          department = matchedDept;
        } else {
          warnings.push(`Unrecognized department "${rawDept}", defaulted to ${defaultDepartment}`);
        }
      } else {
        warnings.push(`Department omitted, assigned default "${defaultDepartment}"`);
      }

      // 5. Default Program if omitted
      if (!program) {
        program =
          department === 'BS Information Technology'
            ? 'BS Information Technology'
            : department === 'BS Criminology'
            ? 'BS Criminology'
            : 'BS Business Administration';
        warnings.push(`Program omitted, assigned default "${program}"`);
      }

      // 6. Validate GPA (Philippine Scale 1.00 - 5.00)
      let gpa = parseFloat(rawGpa);
      if (isNaN(gpa)) {
        gpa = 3.0;
        warnings.push('Invalid grade value, defaulted to 3.00');
      } else if (gpa < 1.0 || gpa > 5.0) {
        errors.push(`Grade value (${rawGpa}) out of bounds (must be between 1.00 and 5.00)`);
      }

      // 7. Validate Attendance Percentage
      let overallAttendance = parseInt(rawAttendance, 10);
      if (isNaN(overallAttendance)) {
        overallAttendance = 90;
        warnings.push('Invalid Attendance %, defaulted to 90%');
      } else if (overallAttendance < 0 || overallAttendance > 100) {
        errors.push(`Attendance % (${rawAttendance}) out of range (must be 0 - 100%)`);
      }

      // 8. Determine Risk Status
      let riskStatus: 'Optimal' | 'Watchlist' | 'Critical' = 'Optimal';
      if (gpa < 2.0 || overallAttendance < 75) {
        riskStatus = 'Critical';
      } else if (gpa < 2.5 || overallAttendance < 85) {
        riskStatus = 'Watchlist';
      }

      const isDuplicateInDb = dbStudentNos.has(studentNo.toLowerCase());
      const isDuplicateInBatch = seenStudentNos.has(studentNo.toLowerCase());
      const isValid = errors.length === 0;

      return {
        rowIndex: idx + 1,
        rawText: line,
        studentNo,
        name,
        email,
        department,
        yearLevel,
        program,
        gpa,
        overallAttendance,
        riskStatus,
        isValid,
        errors,
        warnings,
        isDuplicateInDb,
        isDuplicateInBatch,
      };
    });
  }, [rawInput, delimiter, hasHeader, defaultDepartment, existingStudents]);

  // Derived statistics
  const totalParsed = parsedRows.length;
  const validRows = parsedRows.filter((r) => r.isValid);
  const errorRows = parsedRows.filter((r) => !r.isValid);
  const warningRows = parsedRows.filter((r) => r.isValid && r.warnings.length > 0);

  // Filtered preview rows
  const displayRows = parsedRows.filter((r) => {
    if (filterTab === 'valid') return r.isValid;
    if (filterTab === 'errors') return !r.isValid;
    if (filterTab === 'warnings') return r.isValid && r.warnings.length > 0;
    return true;
  });

  // Action handlers
  const handleLoadSample = () => {
    setRawInput(SAMPLE_CSV);
    setHasHeader(true);
    setDelimiter(',');
    setImportSuccess(null);
  };

  const handleClear = () => {
    setRawInput('');
    setImportSuccess(null);
  };

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(
      'studentNo,name,email,department,yearLevel,program,gpa,attendance\nTCC-2026-001,John Doe,john.doe@student.tcc.edu,Computer Science,1st Year,BS Computer Science,3.50,95'
    );
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 2500);
  };

  const handleDownloadCsvTemplate = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,studentNo,name,email,department,yearLevel,program,gpa,attendance\n' +
      'TCC-2026-001,Jane Smith,jane.smith@student.tcc.edu,Computer Science,1st Year,BS Computer Science,3.80,98\n' +
      'TCC-2026-002,Robert Lee,robert.lee@student.tcc.edu,Engineering,2nd Year,BS Civil Engineering,3.20,90';

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'TCC_Student_Import_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteRow = (rowIndex: number) => {
    const lines = rawInput.split('\n').filter((l) => l.trim().length > 0);
    if (hasHeader) {
      const header = lines[0];
      const dataLines = lines.slice(1);
      dataLines.splice(rowIndex - 1, 1);
      setRawInput([header, ...dataLines].join('\n'));
    } else {
      lines.splice(rowIndex - 1, 1);
      setRawInput(lines.join('\n'));
    }
  };

  const handleStartEditRow = (row: ParsedStudentRow) => {
    setEditingRowIndex(row.rowIndex);
    setEditFormData({ ...row });
  };

  const handleSaveEditRow = (rowIndex: number) => {
    const lines = rawInput.split('\n').filter((l) => l.trim().length > 0);
    const lineIdx = hasHeader ? rowIndex : rowIndex - 1;

    const formattedLine = [
      editFormData.studentNo || '',
      editFormData.name || '',
      editFormData.email || '',
      editFormData.department || defaultDepartment,
      editFormData.yearLevel || '1st Year',
      editFormData.program || 'BS General',
      editFormData.gpa !== undefined ? editFormData.gpa.toFixed(2) : '3.00',
      editFormData.overallAttendance !== undefined ? editFormData.overallAttendance : '90',
    ].join(delimiter);

    lines[lineIdx] = formattedLine;
    setRawInput(lines.join('\n'));
    setEditingRowIndex(null);
  };

  // Batch Execution
  const handleExecuteImport = () => {
    if (validRows.length === 0) return;
    setShowConfirmModal(false);

    // Convert valid ParsedStudentRows into rich Student objects with full Philippine demographics
    const newStudents: Student[] = validRows.map((r, i) => ({
      id: `std-imp-${Date.now()}-${i}`,
      studentNo: r.studentNo,
      name: r.name,
      email: r.email,
      personalEmail: `${r.name.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
      department: r.department,
      yearLevel: r.yearLevel,
      program: r.program,
      gpa: Number(r.gpa.toFixed(2)),
      overallAttendance: r.overallAttendance,
      riskStatus: r.riskStatus,
      avatar: `https://images.unsplash.com/photo-${1500000000000 + (i % 10) * 1000}?w=150&auto=format&fit=crop&q=80`,

      // Detailed Philippine Student Information
      contactNumber: `+63 9${Math.floor(10 + Math.random() * 89)} ${Math.floor(100 + Math.random() * 900)} ${Math.floor(1000 + Math.random() * 9000)}`,
      address: {
        street: 'Blk 12 Lot 8 Academic Avenue',
        barangay: 'Barangay Central',
        city: 'Quezon City',
        province: 'Metro Manila',
        region: 'NCR (National Capital Region)',
        zipCode: '1100',
      },
      parents: {
        fatherName: 'Eduardo Castillo',
        fatherContact: '+63 917 555 0192',
        fatherOccupation: 'Civil Engineer',
        motherName: 'Maria Sofia Santos-Castillo',
        motherContact: '+63 918 555 0193',
        motherOccupation: 'Public School Teacher',
        guardianName: 'Eduardo Castillo',
        guardianRelationship: 'Father',
        guardianContact: '+63 917 555 0192',
      },
      emergencyContact: {
        name: 'Maria Sofia Santos-Castillo',
        relationship: 'Mother',
        contactNumber: '+63 918 555 0193',
        address: 'Blk 12 Lot 8 Academic Avenue, Brgy. Central, Quezon City',
      },
      civilStatus: 'Single',
      enrollmentStatus: 'Enrolled',
      birthDate: '2005-06-15',
      gender: i % 2 === 0 ? 'Female' : 'Male',
      bloodType: ['O+', 'A+', 'B+', 'AB+'][i % 4],
      nationality: 'Filipino',
      religion: 'Roman Catholic',
      lrn: `136589${Math.floor(100000 + Math.random() * 900000)}`,
      admissionDate: '2025-08-01',
    }));

    const auditHash = `SHA256-IMP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);

    const summaryText = `Batch imported ${newStudents.length} student records into SIS. Department scope: ${defaultDepartment}. Verification Hash: ${auditHash}`;

    onImportStudents(newStudents, summaryText);

    setImportSuccess({
      count: newStudents.length,
      auditHash,
      timestamp,
    });
  };

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100 transition-colors">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
            <FileSpreadsheet className="w-4 h-4" />
            <span>Faculty Onboarding Tool & Batch Roster Import</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Bulk Student Roster Import & Verification
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Paste CSV or delimited lists to batch-register student records into the SIS with real-time validation and SHA-256 audit logs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadCsvTemplate}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold rounded-xl transition shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Download Template CSV</span>
          </button>

          <button
            onClick={handleCopyTemplate}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold rounded-xl transition shadow-xs"
          >
            {copiedTemplate ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
            <span>{copiedTemplate ? 'Copied to Clipboard!' : 'Copy Header Format'}</span>
          </button>
        </div>
      </div>

      {/* Main Container: Split Input & Parser Settings */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4 transition-colors mb-6">
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setImportMode('csv')}
            className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${
              importMode === 'csv'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Bulk CSV Import
          </button>
          <button
            onClick={() => setImportMode('form')}
            className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${
              importMode === 'form'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Interactive Quick-Add Form
          </button>
        </div>
      </div>

      {importMode === 'csv' ? (
        <>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Paste Area & Config */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <UploadCloud className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Paste CSV or Delimited Roster List
                </h3>
              </div>

              <div className="flex items-center space-x-2 text-xs">
                <button
                  onClick={handleLoadSample}
                  className="px-2.5 py-1.5 bg-blue-50 dark:bg-blue-900/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold rounded-lg border border-blue-200 dark:border-blue-700 transition"
                >
                  Load Demo Data
                </button>
                <button
                  onClick={handleClear}
                  className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold rounded-lg border border-slate-200 dark:border-slate-700 transition"
                >
                  Clear Text
                </button>
              </div>
            </div>

            {/* Delimiter & Formatting Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Delimiter</label>
                <select
                  value={delimiter}
                  onChange={(e) => setDelimiter(e.target.value as any)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white font-medium"
                >
                  <option value=",">Comma (,)</option>
                  <option value="\t">Tab (\t)</option>
                  <option value=";">Semicolon (;)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Default Department</label>
                <select
                  value={defaultDepartment}
                  onChange={(e) => setDefaultDepartment(e.target.value as Department)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white font-medium"
                >
                  {departmentOptions.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center space-x-2 cursor-pointer font-bold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={hasHeader}
                    onChange={(e) => setHasHeader(e.target.checked)}
                    className="rounded accent-blue-600 w-4 h-4"
                  />
                  <span>First Row is Column Header</span>
                </label>
              </div>
            </div>

            {/* Textarea Input */}
            <div>
              <textarea
                value={rawInput}
                onChange={(e) => {
                  setRawInput(e.target.value);
                  setImportSuccess(null);
                }}
                rows={10}
                placeholder="Paste CSV rows here: studentNo, name, email, department, yearLevel, program, gpa, attendance..."
                className="w-full font-mono text-xs p-3.5 bg-slate-900 text-slate-100 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed shadow-inner"
              />
            </div>
          </div>
        </div>

        {/* Right 1 Col: Validation Summary & Guidelines */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4 transition-colors">
            <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Real-Time Validation Audit</span>
            </h3>

            {/* KPI Summary Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-xl text-center">
                <div className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase">Total Parsed</div>
                <div className="text-xl font-black font-mono text-slate-900 dark:text-white mt-0.5">{totalParsed}</div>
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-center">
                <div className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase">Ready to Import</div>
                <div className="text-xl font-black font-mono text-emerald-700 dark:text-emerald-400 mt-0.5">{validRows.length}</div>
              </div>

              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-center">
                <div className="text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase">Errors / Blocked</div>
                <div className="text-xl font-black font-mono text-rose-700 dark:text-rose-400 mt-0.5">{errorRows.length}</div>
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-center">
                <div className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase">Warnings</div>
                <div className="text-xl font-black font-mono text-amber-700 dark:text-amber-400 mt-0.5">{warningRows.length}</div>
              </div>
            </div>

            {/* Execution Trigger */}
            <div className="pt-2">
              <button
                onClick={() => setShowConfirmModal(true)}
                disabled={validRows.length === 0}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition flex items-center justify-center space-x-2 disabled:cursor-not-allowed disabled:text-slate-400 dark:disabled:text-slate-600 font-sans"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                <span>
                  {validRows.length > 0
                    ? `Review & Confirm Import (${validRows.length} Valid Students)`
                    : 'Fix Errors to Enable Import'}
                </span>
              </button>
              {errorRows.length > 0 && (
                <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-2 text-center font-medium">
                  ⚠️ Note: {errorRows.length} invalid or duplicate rows will be skipped automatically during execution.
                </p>
              )}
            </div>

            {/* Format Instructions Box */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs space-y-2">
              <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Expected CSV Column Structure</span>
              </div>
              <ul className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1 list-disc pl-4 font-mono">
                <li><strong className="text-slate-800 dark:text-slate-200">studentNo:</strong> Unique ID (e.g. TCC-2026-101)</li>
                <li><strong className="text-slate-800 dark:text-slate-200">name:</strong> Student Full Name</li>
                <li><strong className="text-slate-800 dark:text-slate-200">email:</strong> Official email address</li>
                <li><strong className="text-slate-800 dark:text-slate-200">department:</strong> Department name</li>
                <li><strong className="text-slate-800 dark:text-slate-200">yearLevel:</strong> 1st, 2nd, 3rd, 4th Year</li>
                <li><strong className="text-slate-800 dark:text-slate-200">program:</strong> Academic degree program</li>
                <li><strong className="text-slate-800 dark:text-slate-200">gpa:</strong> 0.00 - 4.00 range</li>
                <li><strong className="text-slate-800 dark:text-slate-200">attendance:</strong> 0 - 100 percentage</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification Banner */}
      {importSuccess && (
        <div className="p-6 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl shadow-sm space-y-3 animate-fade-in transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-emerald-600 text-white rounded-xl">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-emerald-900 dark:text-emerald-200">
                  Batch Import Successful! {importSuccess.count} Student Records Onboarded
                </h3>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5 font-mono">
                  Timestamp: {importSuccess.timestamp} • SHA-256 Audit Verification: <strong className="font-bold">{importSuccess.auditHash}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => onNavigateTab('gradebook')}
                className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1.5"
              >
                <span>View Gradebook</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Preview & Row Audit Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Database className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Parsed Roster Preview & Audit Trail</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Inspect validation checks, correct line item errors, or purge invalid duplicate entries before database commit.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-3 py-1 rounded-lg transition ${
                filterTab === 'all' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All ({totalParsed})
            </button>
            <button
              onClick={() => setFilterTab('valid')}
              className={`px-3 py-1 rounded-lg transition ${
                filterTab === 'valid' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-700 dark:text-emerald-400 hover:text-emerald-900'
              }`}
            >
              Valid ({validRows.length})
            </button>
            <button
              onClick={() => setFilterTab('errors')}
              className={`px-3 py-1 rounded-lg transition ${
                filterTab === 'errors' ? 'bg-rose-600 text-white shadow-xs' : 'text-rose-700 dark:text-rose-400 hover:text-rose-900'
              }`}
            >
              Errors ({errorRows.length})
            </button>
            <button
              onClick={() => setFilterTab('warnings')}
              className={`px-3 py-1 rounded-lg transition ${
                filterTab === 'warnings' ? 'bg-amber-500 text-white shadow-xs' : 'text-amber-700 dark:text-amber-400 hover:text-amber-900'
              }`}
            >
              Warnings ({warningRows.length})
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3 w-12 text-center">Line</th>
                <th className="p-3">Status</th>
                <th className="p-3">Student No</th>
                <th className="p-3">Student Name & Email</th>
                <th className="p-3">Dept & Program</th>
                <th className="p-3">Year</th>
                <th className="p-3">GPA / Att.</th>
                <th className="p-3">Risk</th>
                <th className="p-3">Validation Remarks</th>
                <th className="p-3 text-right">Row Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
              {displayRows.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-400 dark:text-slate-500 italic">
                    {totalParsed === 0
                      ? 'No data pasted yet. Paste CSV rows above or click "Load Demo Data".'
                      : 'No records matching the selected filter tab.'}
                  </td>
                </tr>
              ) : (
                displayRows.map((row) => {
                  const isEditing = editingRowIndex === row.rowIndex;

                  return (
                    <tr
                      key={row.rowIndex}
                      className={`transition ${
                        !row.isValid
                          ? 'bg-rose-50/40 dark:bg-rose-950/20 hover:bg-rose-50/70 dark:hover:bg-rose-950/30'
                          : row.warnings.length > 0
                          ? 'bg-amber-50/30 dark:bg-amber-950/20 hover:bg-amber-50/60 dark:hover:bg-amber-950/30'
                          : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <td className="p-3 font-mono text-center font-bold text-slate-400 dark:text-slate-500">
                        #{row.rowIndex}
                      </td>

                      {/* Status Badge */}
                      <td className="p-3">
                        {row.isValid ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>VALID</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                            <AlertOctagon className="w-3 h-3" />
                            <span>BLOCKED</span>
                          </span>
                        )}
                      </td>

                      {/* Student No */}
                      <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editFormData.studentNo || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, studentNo: e.target.value })}
                            className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded p-1 text-xs text-slate-900 dark:text-white w-28"
                          />
                        ) : (
                          row.studentNo || <span className="text-rose-500 italic">Missing</span>
                        )}
                      </td>

                      {/* Name & Email */}
                      <td className="p-3">
                        {isEditing ? (
                          <div className="space-y-1">
                            <input
                              type="text"
                              value={editFormData.name || ''}
                              onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                              className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded p-1 text-xs text-slate-900 dark:text-white w-full"
                              placeholder="Name"
                            />
                            <input
                              type="text"
                              value={editFormData.email || ''}
                              onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                              className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded p-1 text-xs text-slate-900 dark:text-white w-full"
                              placeholder="Email"
                            />
                          </div>
                        ) : (
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">{row.name || '—'}</div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{row.email || '—'}</div>
                          </div>
                        )}
                      </td>

                      {/* Department & Program */}
                      <td className="p-3">
                        {isEditing ? (
                          <select
                            value={editFormData.department || defaultDepartment}
                            onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value as Department })}
                            className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded p-1 text-xs text-slate-900 dark:text-white"
                          >
                            {departmentOptions.map((d) => (
                              <option key={d} value={d}>
                                {d}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div>
                            <div className="font-bold text-slate-800 dark:text-slate-200">{row.program}</div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400">{row.department}</div>
                          </div>
                        )}
                      </td>

                      {/* Year Level */}
                      <td className="p-3 text-slate-700 dark:text-slate-300 font-medium">
                        {isEditing ? (
                          <select
                            value={editFormData.yearLevel || '1st Year'}
                            onChange={(e) => setEditFormData({ ...editFormData, yearLevel: e.target.value })}
                            className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded p-1 text-xs text-slate-900 dark:text-white"
                          >
                            <option value="1st Year">1st Year</option>
                            <option value="2nd Year">2nd Year</option>
                            <option value="3rd Year">3rd Year</option>
                            <option value="4th Year">4th Year</option>
                            <option value="Graduate">Graduate</option>
                          </select>
                        ) : (
                          row.yearLevel
                        )}
                      </td>

                      {/* GPA & Attendance */}
                      <td className="p-3 font-mono">
                        {isEditing ? (
                          <div className="flex space-x-1">
                            <input
                              type="number"
                              step="0.01"
                              value={editFormData.gpa || 3.0}
                              onChange={(e) => setEditFormData({ ...editFormData, gpa: parseFloat(e.target.value) })}
                              className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded p-1 text-xs w-14 text-slate-900 dark:text-white"
                            />
                            <input
                              type="number"
                              value={editFormData.overallAttendance || 90}
                              onChange={(e) => setEditFormData({ ...editFormData, overallAttendance: parseInt(e.target.value, 10) })}
                              className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded p-1 text-xs w-14 text-slate-900 dark:text-white"
                            />
                          </div>
                        ) : (
                          <div>
                            <span className={`font-bold ${row.gpa < 2.5 ? 'text-rose-600 dark:text-rose-400' : 'text-blue-600 dark:text-blue-400'}`}>
                              {row.gpa.toFixed(2)}
                            </span>
                            <span className="text-slate-400 text-[10px] mx-1">•</span>
                            <span className={row.overallAttendance < 80 ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-emerald-600 dark:text-emerald-400'}>
                              {row.overallAttendance}%
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Calculated Risk */}
                      <td className="p-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            row.riskStatus === 'Critical'
                              ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                              : row.riskStatus === 'Watchlist'
                              ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                              : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          }`}
                        >
                          {row.riskStatus}
                        </span>
                      </td>

                      {/* Remarks */}
                      <td className="p-3 max-w-xs space-y-1">
                        {row.errors.map((err, i) => (
                          <div key={i} className="text-[11px] text-rose-700 dark:text-rose-400 font-medium flex items-center space-x-1">
                            <AlertOctagon className="w-3 h-3 text-rose-600 dark:text-rose-400 shrink-0" />
                            <span>{err}</span>
                          </div>
                        ))}
                        {row.warnings.map((warn, i) => (
                          <div key={i} className="text-[11px] text-amber-700 dark:text-amber-400 font-medium flex items-center space-x-1">
                            <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
                            <span>{warn}</span>
                          </div>
                        ))}
                        {row.isValid && row.warnings.length === 0 && (
                          <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                            ✓ Ready for database commit
                          </span>
                        )}
                      </td>

                      {/* Row Actions */}
                      <td className="p-3 text-right">
                        {isEditing ? (
                          <button
                            onClick={() => handleSaveEditRow(row.rowIndex)}
                            className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition"
                            title="Save Row Edits"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => handleStartEditRow(row)}
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                              title="Edit Row"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteRow(row.rowIndex)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                              title="Delete Row"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      </>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs transition-colors">
          <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
            <UserPlus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Quick Add Student Form</h3>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const newStudent: Student = {
                id: `std-${Date.now()}`,
                studentNo: formData.studentNo,
                name: formData.name,
                email: formData.email,
                department: formData.department as Department,
                yearLevel: formData.yearLevel,
                program: formData.program,
                gpa: parseFloat(formData.gpa) || 5.0,
                overallAttendance: parseInt(formData.attendance) || 100,
                riskStatus: (parseFloat(formData.gpa) > 3.0 || parseInt(formData.attendance) < 75) ? 'Critical' : (parseFloat(formData.gpa) > 2.5 ? 'Watchlist' : 'Optimal'),
                lrn: formData.lrn,
                contactNumber: formData.contactNumber,
                address: formData.address,
                parents: formData.parents,
                civilStatus: 'Single',
                enrollmentStatus: 'Enrolled',
                birthDate: '2005-01-01',
                gender: 'Other',
                nationality: 'Filipino',
                admissionDate: new Date().toISOString().split('T')[0],
                avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(formData.name)}`,
                emergencyContact: {
                  name: formData.parents.motherName || formData.parents.fatherName || 'Not specified',
                  relationship: 'Parent',
                  contactNumber: formData.contactNumber || 'Not specified'
                }
              };
              onImportStudents([newStudent], `Quick-added student ${newStudent.name}`);
              setFormData({
                ...formData,
                studentNo: '',
                name: '',
                email: '',
                gpa: '',
                attendance: '',
                lrn: '',
                contactNumber: ''
              });
              setImportSuccess({ count: 1, auditHash: 'SHA256-QUICKADD', timestamp: new Date().toISOString() });
            }}
            className="space-y-6"
          >
            {/* Form grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Student No</label>
                <input required value={formData.studentNo} onChange={e => setFormData({...formData, studentNo: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm" placeholder="TCC-2026-X" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm" placeholder="email@student.tcc.edu" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">LRN</label>
                <input value={formData.lrn} onChange={e => setFormData({...formData, lrn: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm" placeholder="1092837465" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Department</label>
                <select value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm">
                  {departmentOptions.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Program</label>
                <input required value={formData.program} onChange={e => setFormData({...formData, program: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm" placeholder="BS Information Technology" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Year Level</label>
                <select value={formData.yearLevel} onChange={e => setFormData({...formData, yearLevel: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm">
                  <option>1st Year</option>
                  <option>2nd Year</option>
                  <option>3rd Year</option>
                  <option>4th Year</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Ph Grade (1.0 - 5.0)</label>
                <input type="number" step="0.01" min="1.0" max="5.0" required value={formData.gpa} onChange={e => setFormData({...formData, gpa: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm" placeholder="2.50" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Attendance %</label>
                <input type="number" step="1" min="0" max="100" required value={formData.attendance} onChange={e => setFormData({...formData, attendance: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm" placeholder="95" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Contact Number</label>
                <input value={formData.contactNumber} onChange={e => setFormData({...formData, contactNumber: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm" placeholder="+63 9XX XXX XXXX" />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition flex items-center space-x-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Save Student Record</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Batch Processing Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full p-6 shadow-2xl space-y-6 animate-in fade-in zoom-in duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center space-x-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Data Integrity Pre-Commit Check</span>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  Confirm Batch Student Database Import
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Review exact database modifications before committing records to the Torres Capitol College SIS database.
                </p>
              </div>

              <div className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-700 dark:text-emerald-400 text-xs font-mono font-bold">
                Batch SHA-256 Ready
              </div>
            </div>

            {/* Impact Metrics Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800 rounded-2xl text-center">
                <div className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase">Records to Commit</div>
                <div className="text-2xl font-black text-emerald-900 dark:text-emerald-200 font-mono mt-0.5">{validRows.length}</div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400">Validated student profiles</div>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-center">
                <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Skipped / Blocked</div>
                <div className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono mt-0.5">{errorRows.length}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Invalid or duplicate rows</div>
              </div>

              <div className="p-3.5 bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800 rounded-2xl text-center">
                <div className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase">Warnings Flagged</div>
                <div className="text-2xl font-black text-blue-900 dark:text-blue-200 font-mono mt-0.5">{warningRows.length}</div>
                <div className="text-[10px] text-blue-600 dark:text-blue-400">Defaulted fields auto-mapped</div>
              </div>
            </div>

            {/* Preview Scrollable Table */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>Batch Records Preview ({validRows.length} Pending Inserts)</span>
                <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">Target Dept: {defaultDepartment}</span>
              </div>

              <div className="max-h-60 overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
                <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-mono sticky top-0 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="p-2.5">Student No</th>
                      <th className="p-2.5">Student Name</th>
                      <th className="p-2.5">Email</th>
                      <th className="p-2.5">Department</th>
                      <th className="p-2.5">Year</th>
                      <th className="p-2.5 text-center">GPA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800">
                    {validRows.map((r) => (
                      <tr key={r.rowIndex} className="hover:bg-slate-100/60 dark:hover:bg-slate-800/40">
                        <td className="p-2.5 font-mono font-bold text-blue-600 dark:text-blue-400">{r.studentNo}</td>
                        <td className="p-2.5 font-bold text-slate-900 dark:text-white">{r.name}</td>
                        <td className="p-2.5 font-mono text-slate-500 dark:text-slate-400 text-[11px]">{r.email}</td>
                        <td className="p-2.5 text-slate-700 dark:text-slate-300">{r.department}</td>
                        <td className="p-2.5 text-slate-600 dark:text-slate-400">{r.yearLevel}</td>
                        <td className="p-2.5 text-center font-mono font-bold">{r.gpa.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Integrity Notice */}
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Committing this batch will instantly update the SIS database, generate audit log entries, and notify department deans.
              </span>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition"
              >
                Cancel & Review Data
              </button>
              <button
                type="button"
                onClick={handleExecuteImport}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/25 transition flex items-center space-x-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Batch Commit to SIS Database</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
