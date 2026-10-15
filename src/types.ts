export type UserRole = 'Admin' | 'Dean' | 'Faculty' | 'Registrar' | 'Advisor' | 'Student';

export type Department = 'BS Information Technology' | 'BS Business Administration' | 'BS Criminology';

export type Language = 'en' | 'es' | 'tl' | 'fr' | 'zh';

export type ThemeMode = 'light' | 'dark' | 'system';

export type CivilStatus = 'Single' | 'Married' | 'Widowed' | 'Separated';

export type EnrollmentStatus = 'Enrolled' | 'Regular' | 'Irregular' | 'LOA' | 'Graduating' | 'Transferee' | 'Probationary';

export type AssessmentTerm = 'Prelim' | 'Midterms' | 'Semifinal' | 'Finals';

export interface StudentAddress {
  street: string;
  barangay: string;
  city: string;
  province: string;
  region?: string;
  zipCode: string;
}

export interface StudentParents {
  fatherName: string;
  fatherContact?: string;
  fatherOccupation?: string;
  motherName: string;
  motherContact?: string;
  motherOccupation?: string;
  guardianName?: string;
  guardianRelationship?: string;
  guardianContact?: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  contactNumber: string; // PH mobile format e.g. +63 9XX XXX XXXX
  alternateContact?: string;
  address?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: Department;
  avatar: string;
  mfaEnabled: boolean;
  mfaVerified?: boolean;
  isEmailVerified?: boolean;
  lastLogin?: string;
}

export interface Student {
  id: string;
  studentNo: string;
  name: string;
  email: string;
  personalEmail?: string;
  department: Department;
  yearLevel: string;
  program: string;
  gpa: number;
  overallAttendance: number; // percentage e.g. 92
  riskStatus: 'Optimal' | 'Watchlist' | 'Critical';
  avatar: string;

  // Detailed Philippine Student Information
  contactNumber: string; // Philippine Phone format: +63 9XX XXX XXXX or 09XX XXX XXXX
  address: StudentAddress;
  parents: StudentParents;
  emergencyContact: EmergencyContact;
  civilStatus: CivilStatus;
  enrollmentStatus: EnrollmentStatus;
  birthDate?: string; // YYYY-MM-DD
  gender?: 'Male' | 'Female' | 'Other';
  bloodType?: string; // 'O+' | 'A+' | 'B+' | 'AB+'
  nationality?: string; // 'Filipino'
  religion?: string; // e.g. 'Roman Catholic'
  lrn?: string; // 12-digit DepEd LRN / CHED Student ID
  admissionDate?: string;
}

export interface AssessmentCategory {
  name: string;
  weight: number; // e.g. 20%
}

export interface GradeItem {
  id: string;
  studentId: string;
  courseCode: string;
  courseName: string;
  category: 'Assignments' | 'Quizzes' | 'Midterm' | 'Final Exam' | 'Laboratory';
  score: number;
  maxScore: number;
  weight: number;
  date: string;
  feedback?: string;
  locked?: boolean;
}

export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Excused';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  courseCode: string;
  date: string;
  status: AttendanceStatus;
  notes?: string;
}

export interface Course {
  code: string;
  name: string;
  department: Department;
  facultyId: string;
  facultyName: string;
  schedule: string;
  enrolledCount: number;
  semester: string;
  units?: number;
  room?: string;
  day?: string;
  timeSlot?: string;
  description?: string;
  prerequisites?: string;
}

export interface Instructor {
  id: string;
  name: string;
  title: string; // e.g. 'Dean', 'Associate Professor', 'Assistant Professor', 'RCrim / Investigator', 'Atty.'
  department: Department;
  email: string;
  phone?: string;
  avatar?: string;
  officeLocation?: string;
  consultationHours?: string;
  specialization?: string;
  assignedCourseCodes?: string[];
}

export interface ClassScheduleItem {
  id?: string;
  timeSlot: string;
  code: string;
  title: string;
  section: string;
  timeRange: string;
  room: string;
  instructor: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  color?: string;
  department: Department;
  units?: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
  department: Department;
  ipAddress: string;
  severity: 'Info' | 'Warning' | 'Critical';
  hash: string;
}

export interface PushNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'info' | 'warning' | 'critical' | 'sync';
  read: boolean;
  category: 'Compliance' | 'Grade' | 'Attendance' | 'System' | 'Security';
}

export interface RolePermissions {
  manageGrades: boolean;
  approveGrades: boolean;
  takeAttendance: boolean;
  viewAnalytics: boolean;
  exportReports: boolean;
  manageUsers: boolean;
  manageRBAC: boolean;
  viewAuditLogs: boolean;
  manageBackups: boolean;
  systemSettings: boolean;
  importStudents?: boolean;
}

export interface BackupSnapshot {
  id: string;
  timestamp: string;
  createdBy: string;
  sizeKb: number;
  recordCount: number;
  encryptionKeyHash: string;
  status: 'Completed' | 'Syncing' | 'Verified';
  autoGenerated: boolean;
}

export interface MonthlyReportConfig {
  month: string;
  year: number;
  department: Department | 'All';
  includeCompliance: boolean;
  includeAuditTrail: boolean;
  includeGpaDistribution: boolean;
  includeAttendanceAnalysis: boolean;
}
