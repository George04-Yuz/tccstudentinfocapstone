import React, { useState, useEffect, useRef } from 'react';
import { User, PushNotification, Student, Department, ClassScheduleItem } from '../types';
import { initialDepartmentSchedules } from '../data/curriculumData';
import { initialStudents } from '../data/mockData';
import jsPDF from 'jspdf';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  Calendar,
  Clock,
  User as UserIcon,
  CreditCard,
  GraduationCap,
  Phone,
  BookOpen,
  Award,
  Bell,
  CheckCircle2,
  Download,
  Filter,
  Lock,
  Upload,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  X,
  Sparkles,
  MapPin,
  Mail,
  FileText,
  Check,
  Building2,
  RefreshCw,
  TrendingUp,
  FileSpreadsheet,
  AlertTriangle,
} from 'lucide-react';

interface StudentDashboardProps {
  currentUser: User;
  notifications?: PushNotification[];
  onUpdateUser?: (updatedUser: Partial<User>) => void;
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
  students?: Student[];
}

type ScheduleItem = ClassScheduleItem;

interface ScheduledAssessmentInfo {
  code: string;
  courseTitle: string;
  examType: string;
  dateStr: string;
  room: string;
  proctor: string;
  syllabusCode: string;
}

export const DEPARTMENT_ASSESSMENTS: Record<Department, ScheduledAssessmentInfo> = {
  'BS Criminology': {
    code: 'CDI 1',
    courseTitle: 'Fundamentals of Criminal Investigation',
    examType: 'Midterm Examination',
    dateStr: 'August 18, 2026 • 9:00 AM - 10:30 AM',
    room: 'Crime Scene Lab 1',
    proctor: 'Capt. Danilo "Danny" Fernandez, RCrim',
    syllabusCode: 'CDI 1',
  },
  'BS Business Administration': {
    code: 'BA-CORE 1',
    courseTitle: 'Principles of Management & Organization',
    examType: 'Midterm Examination',
    dateStr: 'August 18, 2026 • 8:00 AM - 9:30 AM',
    room: 'Business Hall 101',
    proctor: 'Prof. Paolo Vergara Bote, MBA, CPA',
    syllabusCode: 'BA-CORE 1',
  },
  'BS Information Technology': {
    code: 'ITCC 5',
    courseTitle: 'Information Management & Architecture',
    examType: 'Midterm Examination',
    dateStr: 'August 18, 2026 • 9:00 AM - 10:30 AM',
    room: 'Lab 1 (Computer Center)',
    proctor: 'Prof. April Jean D. Villas',
    syllabusCode: 'ITCC 5',
  },
};

export const DEPARTMENT_GRADES_DATA: Record<
  Department,
  Array<{ code: string; desc: string; units: number; prelim: number; midterm: number; final: number; status: string }>
> = {
  'BS Criminology': [
    { code: 'CDI 1', desc: 'Fundamentals of Criminal Investigation', units: 3, prelim: 91, midterm: 93, final: 94, status: 'Passed' },
    { code: 'FORENSIC 1', desc: 'Forensic Photography & Evidence', units: 3, prelim: 89, midterm: 91, final: 92, status: 'Passed' },
    { code: 'FORENSIC 2', desc: 'Personal Identification & Dactyloscopy', units: 3, prelim: 94, midterm: 96, final: 97, status: 'Passed' },
    { code: 'CRIMLAW 1', desc: 'Criminal Law: Book 1 (RPC)', units: 3, prelim: 88, midterm: 90, final: 92, status: 'Passed' },
    { code: 'CRIM 1', desc: 'Introduction to Criminology', units: 3, prelim: 92, midterm: 94, final: 95, status: 'Passed' },
    { code: 'CA 1', desc: 'Institutional Corrections & Penology', units: 3, prelim: 87, midterm: 89, final: 91, status: 'Passed' },
    { code: 'LEA 1', desc: 'Law Enforcement Organization & Admin', units: 3, prelim: 90, midterm: 92, final: 93, status: 'Passed' },
    { code: 'MARKSMAN 1', desc: 'Combat Marksmanship & Firearms', units: 2, prelim: 96, midterm: 98, final: 98, status: 'Passed' },
    { code: 'GE 5', desc: 'Purposive Communication', units: 3, prelim: 88, midterm: 90, final: 91, status: 'Passed' },
  ],
  'BS Business Administration': [
    { code: 'BA-CORE 1', desc: 'Principles of Management & Organization', units: 3, prelim: 90, midterm: 92, final: 94, status: 'Passed' },
    { code: 'BA-FIN 1', desc: 'Financial Management & Corporate Finance', units: 3, prelim: 91, midterm: 93, final: 95, status: 'Passed' },
    { code: 'BA-ECON 1', desc: 'Managerial Economics & Micro-Analysis', units: 3, prelim: 88, midterm: 90, final: 92, status: 'Passed' },
    { code: 'BA-MKTG 1', desc: 'Strategic Marketing Management', units: 3, prelim: 93, midterm: 95, final: 96, status: 'Passed' },
    { code: 'BA-BACC 1', desc: 'Basic Accounting for Business Decisions', units: 3, prelim: 86, midterm: 89, final: 91, status: 'Passed' },
    { code: 'BA-HRM 1', desc: 'Human Resource Management & Relations', units: 3, prelim: 92, midterm: 94, final: 95, status: 'Passed' },
    { code: 'BA-LAW 1', desc: 'Law on Obligations & Business Law', units: 3, prelim: 89, midterm: 91, final: 93, status: 'Passed' },
    { code: 'BA-ENTREP', desc: 'Entrepreneurial Feasibility & Pitching', units: 3, prelim: 90, midterm: 93, final: 95, status: 'Passed' },
    { code: 'GE 5', desc: 'Purposive Communication', units: 3, prelim: 88, midterm: 90, final: 91, status: 'Passed' },
  ],
  'BS Information Technology': [
    { code: 'GE 5', desc: 'Purposive Communication', units: 3, prelim: 88, midterm: 90, final: 91, status: 'Passed' },
    { code: 'GE 6', desc: 'Art Appreciation', units: 3, prelim: 92, midterm: 94, final: 95, status: 'Passed' },
    { code: 'GEE 3', desc: 'Reading Visual Art', units: 3, prelim: 85, midterm: 88, final: 90, status: 'Passed' },
    { code: 'ITAPDC 1', desc: 'System Analysis and Design', units: 3, prelim: 90, midterm: 91, final: 93, status: 'Passed' },
    { code: 'ITAPDC 2', desc: 'Integrated Application Software', units: 3, prelim: 87, midterm: 89, final: 92, status: 'Passed' },
    { code: 'ITCC 5', desc: 'Information Management', units: 3, prelim: 95, midterm: 96, final: 98, status: 'Passed' },
    { code: 'ITPC 2', desc: 'Discrete Mathematics', units: 3, prelim: 82, midterm: 85, final: 89, status: 'Passed' },
    { code: 'ITPE 1', desc: 'Professional Elective 1: OOP', units: 3, prelim: 91, midterm: 93, final: 96, status: 'Passed' },
    { code: 'PE 3', desc: 'PATH-FIT 3: Martial Arts', units: 2, prelim: 98, midterm: 98, final: 99, status: 'Passed' },
  ],
};

export const DEPARTMENT_ATTENDANCE_DATA: Record<
  Department,
  Array<{ code: string; course: string; present: number; absent: number; late: number; percentage: number }>
> = {
  'BS Criminology': [
    { code: 'CDI 1', course: 'Fundamentals of Criminal Investigation', present: 14, absent: 0, late: 1, percentage: 96 },
    { code: 'FORENSIC 2', course: 'Personal Identification & Dactyloscopy', present: 15, absent: 0, late: 0, percentage: 100 },
    { code: 'CRIMLAW 1', course: 'Criminal Law: Book 1 (RPC)', present: 13, absent: 1, late: 0, percentage: 93 },
    { code: 'CRIM 1', course: 'Introduction to Criminology', present: 12, absent: 0, late: 0, percentage: 100 },
    { code: 'MARKSMAN 1', course: 'Combat Marksmanship & Firearms', present: 8, absent: 0, late: 0, percentage: 100 },
  ],
  'BS Business Administration': [
    { code: 'BA-CORE 1', course: 'Principles of Management & Organization', present: 14, absent: 0, late: 1, percentage: 96 },
    { code: 'BA-FIN 1', course: 'Financial Management & Corporate Finance', present: 12, absent: 0, late: 0, percentage: 100 },
    { code: 'BA-ECON 1', course: 'Managerial Economics & Micro-Analysis', present: 11, absent: 1, late: 0, percentage: 92 },
    { code: 'BA-MKTG 1', course: 'Strategic Marketing Management', present: 13, absent: 0, late: 0, percentage: 100 },
    { code: 'BA-LAW 1', course: 'Law on Obligations & Business Law', present: 9, absent: 0, late: 0, percentage: 100 },
  ],
  'BS Information Technology': [
    { code: 'ITCC 5', course: 'Information Management', present: 14, absent: 0, late: 1, percentage: 96 },
    { code: 'ITAPDC 1', course: 'System Analysis and Design', present: 12, absent: 0, late: 0, percentage: 100 },
    { code: 'GE 5', course: 'Purposive Communication', present: 10, absent: 0, late: 0, percentage: 100 },
    { code: 'ITPC 2', course: 'Discrete Mathematics', present: 11, absent: 1, late: 0, percentage: 92 },
    { code: 'PE 3', course: 'PATH-FIT 3: Martial Arts', present: 8, absent: 0, late: 0, percentage: 100 },
  ],
};

export const DEPARTMENT_GPA_TREND: Record<
  Department,
  {
    trend: Array<{ period: string; gpa: number; averagePct: number; status: string }>;
    standing: string;
  }
> = {
  'BS Criminology': {
    trend: [
      { period: 'Prelim', gpa: 1.15, averagePct: 94.5, status: 'Passed' },
      { period: 'Midterm', gpa: 1.05, averagePct: 96.8, status: 'Passed' },
      { period: 'Semifinal', gpa: 1.02, averagePct: 97.5, status: 'Passed' },
      { period: 'Finals', gpa: 1.00, averagePct: 98.5, status: 'Summa Cum Laude' },
    ],
    standing: 'Summa Cum Laude',
  },
  'BS Business Administration': {
    trend: [
      { period: 'Prelim', gpa: 1.60, averagePct: 90.0, status: 'Passed' },
      { period: 'Midterm', gpa: 1.50, averagePct: 92.2, status: 'Passed' },
      { period: 'Semifinal', gpa: 1.40, averagePct: 93.8, status: 'Passed' },
      { period: 'Finals', gpa: 1.35, averagePct: 94.6, status: 'Cum Laude' },
    ],
    standing: 'Cum Laude',
  },
  'BS Information Technology': {
    trend: [
      { period: 'Prelim', gpa: 1.50, averagePct: 91.5, status: 'Passed' },
      { period: 'Midterm', gpa: 1.35, averagePct: 93.8, status: 'Passed' },
      { period: 'Semifinal', gpa: 1.28, averagePct: 95.0, status: 'Passed' },
      { period: 'Finals', gpa: 1.25, averagePct: 96.2, status: 'Magna Cum Laude' },
    ],
    standing: 'Magna Cum Laude',
  },
};

export const DEPARTMENT_NOTIFICATIONS: Record<
  Department,
  Array<{ id: string; title: string; message: string; time: string; type: 'grade' | 'reminder' | 'system'; read: boolean }>
> = {
  'BS Criminology': [
    {
      id: 'sn-c1',
      title: 'New Grade Posted: CDI 1',
      message: 'Capt. Danilo "Danny" Fernandez posted your Midterm grade: 93% (Passed).',
      time: '10 mins ago',
      type: 'grade',
      read: false,
    },
    {
      id: 'sn-c2',
      title: 'Upcoming Class Reminder',
      message: 'Fundamentals of Criminal Investigation (CDI 1) starts in 30 mins in Crime Scene Lab 1.',
      time: '25 mins ago',
      type: 'reminder',
      read: false,
    },
    {
      id: 'sn-c3',
      title: 'Attendance Recorded',
      message: 'Marked Present in FORENSIC 2 Personal Identification & Dactyloscopy.',
      time: '2 hours ago',
      type: 'system',
      read: true,
    },
    {
      id: 'sn-c4',
      title: 'Midterm Assessment Advisory',
      message: 'CDI 1 Midterm Examination schedule and proctor roster are now confirmed.',
      time: '1 day ago',
      type: 'reminder',
      read: true,
    },
  ],
  'BS Business Administration': [
    {
      id: 'sn-b1',
      title: 'New Grade Posted: BA-CORE 1',
      message: 'Prof. Paolo Vergara Bote posted your Midterm grade: 92% (Passed).',
      time: '10 mins ago',
      type: 'grade',
      read: false,
    },
    {
      id: 'sn-b2',
      title: 'Upcoming Class Reminder',
      message: 'Principles of Management (BA-CORE 1) starts in 30 mins in Business Hall 101.',
      time: '25 mins ago',
      type: 'reminder',
      read: false,
    },
    {
      id: 'sn-b3',
      title: 'Attendance Recorded',
      message: 'Marked Present in BA-FIN 1 Financial Management.',
      time: '2 hours ago',
      type: 'system',
      read: true,
    },
    {
      id: 'sn-b4',
      title: 'Midterm Assessment Advisory',
      message: 'BA-CORE 1 Midterm Examination schedule and room assignments are now active.',
      time: '1 day ago',
      type: 'reminder',
      read: true,
    },
  ],
  'BS Information Technology': [
    {
      id: 'sn-1',
      title: 'New Grade Posted: ITCC 5',
      message: 'April Jean D. Villas posted your Midterm grade: 96% (Passed).',
      time: '10 mins ago',
      type: 'grade',
      read: false,
    },
    {
      id: 'sn-2',
      title: 'Upcoming Class Reminder',
      message: 'System Analysis & Design (ITAPDC 1) starts in 30 mins in Lab 2.',
      time: '25 mins ago',
      type: 'reminder',
      read: false,
    },
    {
      id: 'sn-3',
      title: 'Attendance Recorded',
      message: 'Marked Present in GE 6 Art Appreciation.',
      time: '2 hours ago',
      type: 'system',
      read: true,
    },
    {
      id: 'sn-4',
      title: 'Final Examination Schedule Released',
      message: 'Midterm & Final exam timetables for 2nd Semester 2026 are now active.',
      time: '1 day ago',
      type: 'reminder',
      read: true,
    },
  ],
};

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
];

const SYLLABUS_DATA: Record<string, {
  code: string;
  title: string;
  department: string;
  units: number;
  instructorName: string;
  instructorEmail: string;
  officeLocation: string;
  consultationHours: string;
  description: string;
  objectives: string[];
  gradingScheme: { category: string; weight: number }[];
  prerequisites: string;
}> = {
  // Criminology Syllabi
  'CDI 1': {
    code: 'CDI 1',
    title: 'Fundamentals of Criminal Investigation',
    department: 'BS Criminology',
    units: 3,
    instructorName: 'Capt. Danilo "Danny" Fernandez, RCrim',
    instructorEmail: 'd.fernandez@tcc.edu',
    officeLocation: 'Forensics Complex, Lab 4',
    consultationHours: 'Mon & Wed 10:00 AM - 12:00 PM',
    description: 'Covers core investigative protocols, crime scene management, physical evidence handling, cordon establishment, and chain of custody documentation.',
    objectives: [
      'Master Golden Rule of Crime Scene Investigation and cordon preservation protocols.',
      'Execute photographic sketching, note taking, and systematic physical evidence recovery.',
      'Prepare comprehensive spot reports, progress reports, and final investigation dockets.'
    ],
    gradingScheme: [
      { category: 'Prelim Assessment', weight: 20 },
      { category: 'Midterm Assessment', weight: 25 },
      { category: 'Semifinal Assessment', weight: 25 },
      { category: 'Finals Assessment', weight: 30 }
    ],
    prerequisites: 'CRIM 1 (Introduction to Criminology)'
  },
  'FORENSIC 1': {
    code: 'FORENSIC 1',
    title: 'Forensic Photography & Evidence',
    department: 'BS Criminology',
    units: 3,
    instructorName: 'Capt. Danilo "Danny" Fernandez, RCrim',
    instructorEmail: 'd.fernandez@tcc.edu',
    officeLocation: 'Forensic Darkroom, Ground Floor',
    consultationHours: 'Tue & Thu 1:00 PM - 3:00 PM',
    description: 'Scientific application of photography in criminalistics, camera optics, specialized lighting techniques, ultraviolet fluorescence, and courtroom presentation.',
    objectives: [
      'Operate manual SLR forensic cameras across diverse atmospheric and nocturnal conditions.',
      'Capture admissible macro-scale photographs of latent impressions and ballistic striations.'
    ],
    gradingScheme: [
      { category: 'Prelim Assessment', weight: 20 },
      { category: 'Midterm Assessment', weight: 25 },
      { category: 'Semifinal Assessment', weight: 25 },
      { category: 'Finals Assessment', weight: 30 }
    ],
    prerequisites: 'None'
  },
  'FORENSIC 2': {
    code: 'FORENSIC 2',
    title: 'Personal Identification & Dactyloscopy',
    department: 'BS Criminology',
    units: 3,
    instructorName: 'Capt. Danilo "Danny" Fernandez, RCrim',
    instructorEmail: 'd.fernandez@tcc.edu',
    officeLocation: 'Dactyloscopy Studio, Room 102',
    consultationHours: 'Mon & Wed 1:00 PM - 3:00 PM',
    description: 'Henry System of fingerprint classification, ridge minutiae identification, chemical lifting of latent prints, and automated fingerprint identification systems (AFIS).',
    objectives: [
      'Classify 10-fingerprint cards using primary, secondary, and sub-secondary Henry formulas.',
      'Develop latent impressions utilizing cyanoacrylate fuming and magnetic powders.'
    ],
    gradingScheme: [
      { category: 'Prelim Assessment', weight: 20 },
      { category: 'Midterm Assessment', weight: 25 },
      { category: 'Semifinal Assessment', weight: 25 },
      { category: 'Finals Assessment', weight: 30 }
    ],
    prerequisites: 'FORENSIC 1'
  },
  'CRIMLAW 1': {
    code: 'CRIMLAW 1',
    title: 'Criminal Law: Book 1 (Revised Penal Code)',
    department: 'BS Criminology',
    units: 3,
    instructorName: 'Atty. Maria Teresa Gutierrez',
    instructorEmail: 'mt.gutierrez@tcc.edu',
    officeLocation: 'Moot Court Chamber, Room 102',
    consultationHours: 'Fri 9:00 AM - 12:00 PM',
    description: 'General principles of penal law, felonies, criminal liability, justifying and exempting circumstances, modifying circumstances, and penalties.',
    objectives: [
      'Analyze elements of criminal liability under Act No. 3815 (RPC) as amended.',
      'Evaluate courtroom jurisprudence regarding self-defense, alibi, and mitigating factors.'
    ],
    gradingScheme: [
      { category: 'Prelim Assessment', weight: 20 },
      { category: 'Midterm Assessment', weight: 25 },
      { category: 'Semifinal Assessment', weight: 25 },
      { category: 'Finals Assessment', weight: 30 }
    ],
    prerequisites: 'None'
  },
  'CRIM 1': {
    code: 'CRIM 1',
    title: 'Introduction to Criminology',
    department: 'BS Criminology',
    units: 3,
    instructorName: 'Major Chairel Rafaila, MSCrim, CSP',
    instructorEmail: 'c.rafaila@tcc.edu',
    officeLocation: 'Justice Hall, Room 201',
    consultationHours: 'Tue & Thu 1:00 PM - 4:00 PM',
    description: 'Sociological and psychological theories of crime causation, criminal behavior typologies, victimology, and comparative criminal justice systems.',
    objectives: [
      'Examine classical, positivist, and contemporary sociological theories of delinquency.',
      'Critique contemporary approaches to crime prevention and offender reformation.'
    ],
    gradingScheme: [
      { category: 'Prelim Assessment', weight: 20 },
      { category: 'Midterm Assessment', weight: 25 },
      { category: 'Semifinal Assessment', weight: 25 },
      { category: 'Finals Assessment', weight: 30 }
    ],
    prerequisites: 'None'
  },
  'CA 1': {
    code: 'CA 1',
    title: 'Institutional Corrections & Penology',
    department: 'BS Criminology',
    units: 3,
    instructorName: 'Insp. Roland P. Macaraeg',
    instructorEmail: 'r.macaraeg@tcc.edu',
    officeLocation: 'Tactical Defense Armory, Room 10',
    consultationHours: 'Wed & Fri 2:00 PM - 5:00 PM',
    description: 'Custodial management in jail facilities, BJMP and BuCor operating guidelines, rehabilitation programs, and modern penological treatment.',
    objectives: [
      'Appraise standards of custody, classification, and humane treatment of persons deprived of liberty.',
      'Design reintegration curricula for correctional rehabilitation facilities.'
    ],
    gradingScheme: [
      { category: 'Prelim Assessment', weight: 20 },
      { category: 'Midterm Assessment', weight: 25 },
      { category: 'Semifinal Assessment', weight: 25 },
      { category: 'Finals Assessment', weight: 30 }
    ],
    prerequisites: 'CRIM 1'
  },
  'LEA 1': {
    code: 'LEA 1',
    title: 'Law Enforcement Organization & Admin',
    department: 'BS Criminology',
    units: 3,
    instructorName: 'Major Chairel Rafaila, MSCrim, CSP',
    instructorEmail: 'c.rafaila@tcc.edu',
    officeLocation: 'Justice Hall, Room 201',
    consultationHours: 'Tue & Thu 1:00 PM - 4:00 PM',
    description: 'Structural organization and operational dynamics of the PNP, NAPOLCOM, and specialized national law enforcement agencies.',
    objectives: [
      'Master administrative guidelines established by RA 6975 and RA 8551.',
      'Develop strategic precinct deployment plans based on crime mapping statistics.'
    ],
    gradingScheme: [
      { category: 'Prelim Assessment', weight: 20 },
      { category: 'Midterm Assessment', weight: 25 },
      { category: 'Semifinal Assessment', weight: 25 },
      { category: 'Finals Assessment', weight: 30 }
    ],
    prerequisites: 'None'
  },
  'MARKSMAN 1': {
    code: 'MARKSMAN 1',
    title: 'Combat Marksmanship & Firearms',
    department: 'BS Criminology',
    units: 2,
    instructorName: 'Insp. Roland P. Macaraeg',
    instructorEmail: 'r.macaraeg@tcc.edu',
    officeLocation: 'Firing Range Complex',
    consultationHours: 'Wed & Fri 2:00 PM - 5:00 PM',
    description: 'Firearms safety, mechanical functioning of service handguns and shotguns, stance, breath control, and tactical shooting drills.',
    objectives: [
      'Execute 4 cardinal rules of gun safety under high-stress simulator drills.',
      'Achieve standard qualification scores on paper and reactive steel targets.'
    ],
    gradingScheme: [
      { category: 'Prelim Assessment', weight: 20 },
      { category: 'Midterm Assessment', weight: 25 },
      { category: 'Semifinal Assessment', weight: 25 },
      { category: 'Finals Assessment', weight: 30 }
    ],
    prerequisites: 'None'
  },

  // BS Business Administration Syllabi
  'BA-CORE 1': {
    code: 'BA-CORE 1',
    title: 'Principles of Management & Organization',
    department: 'BS Business Administration',
    units: 3,
    instructorName: 'Prof. Paolo Vergara Bote, MBA, CPA',
    instructorEmail: 'p.bote@tcc.edu',
    officeLocation: 'Business Center, Hall 301',
    consultationHours: 'Mon & Wed 1:00 PM - 4:00 PM',
    description: 'Foundations of corporate management: planning, organizing, leading, controlling, corporate social responsibility, and strategic positioning.',
    objectives: [
      'Formulate strategic business plans addressing market volatility and consumer dynamics.',
      'Evaluate organizational structures and leadership communication paradigms.'
    ],
    gradingScheme: [
      { category: 'Prelim Assessment', weight: 20 },
      { category: 'Midterm Assessment', weight: 25 },
      { category: 'Semifinal Assessment', weight: 25 },
      { category: 'Finals Assessment', weight: 30 }
    ],
    prerequisites: 'None'
  },
  'BA-FIN 1': {
    code: 'BA-FIN 1',
    title: 'Financial Management & Corporate Finance',
    department: 'BS Business Administration',
    units: 3,
    instructorName: 'Prof. Eduardo S. Tan, CPA, CMA',
    instructorEmail: 'e.tan@tcc.edu',
    officeLocation: 'Accountancy & Tax Lab, Room 305',
    consultationHours: 'Mon & Wed 9:00 AM - 11:30 AM',
    description: 'Capital structure analysis, valuation models, time value of money, working capital management, and investment feasibility appraisal.',
    objectives: [
      'Calculate Weighted Average Cost of Capital (WACC), Net Present Value (NPV), and IRR.',
      'Perform financial statement ratio analysis for corporate solvency and profitability.'
    ],
    gradingScheme: [
      { category: 'Prelim Assessment', weight: 20 },
      { category: 'Midterm Assessment', weight: 25 },
      { category: 'Semifinal Assessment', weight: 25 },
      { category: 'Finals Assessment', weight: 30 }
    ],
    prerequisites: 'BA-BACC 1'
  },
  'BA-ECON 1': {
    code: 'BA-ECON 1',
    title: 'Managerial Economics & Micro-Analysis',
    department: 'BS Business Administration',
    units: 3,
    instructorName: 'Prof. Paolo Vergara Bote, MBA, CPA',
    instructorEmail: 'p.bote@tcc.edu',
    officeLocation: 'Business Center, Hall 301',
    consultationHours: 'Mon & Wed 1:00 PM - 4:00 PM',
    description: 'Demand forecasting, production theory, cost functions, market structure analysis (perfect competition, oligopoly, monopoly), and pricing strategies.',
    objectives: [
      'Model price elasticity of demand and marginal revenue curves for optimal pricing.',
      'Analyze market equilibrium under imperfect competitive market dynamics.'
    ],
    gradingScheme: [
      { category: 'Prelim Assessment', weight: 20 },
      { category: 'Midterm Assessment', weight: 25 },
      { category: 'Semifinal Assessment', weight: 25 },
      { category: 'Finals Assessment', weight: 30 }
    ],
    prerequisites: 'None'
  },
  'BA-MKTG 1': {
    code: 'BA-MKTG 1',
    title: 'Strategic Marketing Management',
    department: 'BS Business Administration',
    units: 3,
    instructorName: 'Dr. Melissa D. Roxas, DBA',
    instructorEmail: 'm.roxas@tcc.edu',
    officeLocation: 'Innovation Incubator, Suite B',
    consultationHours: 'Tue & Thu 10:00 AM - 1:00 PM',
    description: 'Market segmentation, targeting, positioning (STP), digital omnichannel marketing, customer lifetime value, and brand identity development.',
    objectives: [
      'Develop data-driven marketing campaigns optimizing customer acquisition costs.',
      'Execute comprehensive market segmentation and customer journey mapping.'
    ],
    gradingScheme: [
      { category: 'Prelim Assessment', weight: 20 },
      { category: 'Midterm Assessment', weight: 25 },
      { category: 'Semifinal Assessment', weight: 25 },
      { category: 'Finals Assessment', weight: 30 }
    ],
    prerequisites: 'BA-CORE 1'
  },
  'BA-BACC 1': {
    code: 'BA-BACC 1',
    title: 'Basic Accounting for Business Decisions',
    department: 'BS Business Administration',
    units: 3,
    instructorName: 'Prof. Eduardo S. Tan, CPA, CMA',
    instructorEmail: 'e.tan@tcc.edu',
    officeLocation: 'Accountancy & Tax Lab, Room 305',
    consultationHours: 'Mon & Wed 9:00 AM - 11:30 AM',
    description: 'The accounting cycle, journal entries, ledger posting, trial balance, adjusting entries, and financial statements preparation.',
    objectives: [
      'Record business transactions applying double-entry bookkeeping rules.',
      'Prepare statement of financial position and statement of comprehensive income.'
    ],
    gradingScheme: [
      { category: 'Prelim Assessment', weight: 20 },
      { category: 'Midterm Assessment', weight: 25 },
      { category: 'Semifinal Assessment', weight: 25 },
      { category: 'Finals Assessment', weight: 30 }
    ],
    prerequisites: 'None'
  },
  'BA-HRM 1': {
    code: 'BA-HRM 1',
    title: 'Human Resource Management & Relations',
    department: 'BS Business Administration',
    units: 3,
    instructorName: 'Dr. Melissa D. Roxas, DBA',
    instructorEmail: 'm.roxas@tcc.edu',
    officeLocation: 'Innovation Incubator, Suite B',
    consultationHours: 'Tue & Thu 10:00 AM - 1:00 PM',
    description: 'Talent recruitment, compensation architectures, performance appraisal systems, Philippine Labor Code compliance, and labor union relations.',
    objectives: [
      'Design structured recruitment, onboarding, and KPI appraisal workflows.',
      'Evaluate Philippine labor laws concerning employee rights, due process, and benefits.'
    ],
    gradingScheme: [
      { category: 'Prelim Assessment', weight: 20 },
      { category: 'Midterm Assessment', weight: 25 },
      { category: 'Semifinal Assessment', weight: 25 },
      { category: 'Finals Assessment', weight: 30 }
    ],
    prerequisites: 'BA-CORE 1'
  },
  'BA-LAW 1': {
    code: 'BA-LAW 1',
    title: 'Law on Obligations & Business Law',
    department: 'BS Business Administration',
    units: 3,
    instructorName: 'Atty. Victorino C. Santos',
    instructorEmail: 'v.santos@tcc.edu',
    officeLocation: 'Legal Studies Wing, Room 210',
    consultationHours: 'Fri 10:00 AM - 1:00 PM',
    description: 'Philippine Civil Code provisions on obligations and contracts, corporate law, negotiable instruments, and commercial transactions.',
    objectives: [
      'Identify essential requisites of contracts and grounds for voidable or rescissible agreements.',
      'Draft legally sound commercial service agreements and partnership bylaws.'
    ],
    gradingScheme: [
      { category: 'Prelim Assessment', weight: 20 },
      { category: 'Midterm Assessment', weight: 25 },
      { category: 'Semifinal Assessment', weight: 25 },
      { category: 'Finals Assessment', weight: 30 }
    ],
    prerequisites: 'None'
  },
  'BA-ENTREP': {
    code: 'BA-ENTREP',
    title: 'Entrepreneurial Feasibility & Pitching',
    department: 'BS Business Administration',
    units: 3,
    instructorName: 'Dr. Melissa D. Roxas, DBA',
    instructorEmail: 'm.roxas@tcc.edu',
    officeLocation: 'Incubator Pitch Room',
    consultationHours: 'Tue & Thu 10:00 AM - 1:00 PM',
    description: 'Ideation, Lean Canvas modeling, minimum viable product (MVP) validation, pitch deck storytelling, and investor funding rounds.',
    objectives: [
      'Conduct complete market validation studies for a scalable enterprise concept.',
      'Present an investor-grade pitch deck to faculty and venture incubators.'
    ],
    gradingScheme: [
      { category: 'Prelim Assessment', weight: 20 },
      { category: 'Midterm Assessment', weight: 25 },
      { category: 'Semifinal Assessment', weight: 25 },
      { category: 'Finals Assessment', weight: 30 }
    ],
    prerequisites: 'BA-CORE 1'
  },

  // BS Information Technology Syllabi
  'ITCC 5': {
    code: 'ITCC 5',
    title: 'Information Management & Architecture',
    department: 'BS Information Technology',
    units: 3,
    instructorName: 'April Jean D. Villas',
    instructorEmail: 'april.villas@tcc.edu.ph',
    officeLocation: 'IT Faculty Office Room 302, 3rd Floor Academic Bldg',
    consultationHours: 'Monday & Wednesday: 2:00 PM - 4:00 PM',
    description: 'Covers database management system concepts, relational algebra, SQL querying, transaction processing, indexing, data normalization, and distributed cloud architecture.',
    objectives: [
      'Design normalized 3NF relational database schemas for enterprise applications.',
      'Construct advanced SQL queries involving multi-table joins, aggregations, and subqueries.',
      'Analyze transaction concurrency control, indexing, and query execution planning.',
      'Implement data security, role-based permissions, and cloud database replication.'
    ],
    gradingScheme: [
      { category: 'Prelim Assessment', weight: 20 },
      { category: 'Midterm Assessment', weight: 25 },
      { category: 'Semifinal Assessment', weight: 25 },
      { category: 'Finals Assessment', weight: 30 }
    ],
    prerequisites: 'ITPC 1 (Data Structures & Algorithms)'
  },
  'ITAPDC 1': {
    code: 'ITAPDC 1',
    title: 'System Analysis and Design',
    department: 'BS Information Technology',
    units: 3,
    instructorName: 'Engr. Raymond Tandoc',
    instructorEmail: 'r.tandoc@tcc.edu.ph',
    officeLocation: 'Engineering & Technology Lab 2',
    consultationHours: 'Tuesday & Thursday: 1:00 PM - 3:00 PM',
    description: 'Focuses on systems development life cycle (SDLC), agile methodologies, requirements gathering, UML diagramming, architectural blueprints, and software testing.',
    objectives: [
      'Model business requirements using Use Case, Sequence, and ER diagrams.',
      'Apply Agile/Scrum sprint planning for iterative software delivery.',
      'Evaluate client feasibility, cost-benefit analysis, and system architecture risks.',
      'Conduct system testing and write technical documentation.'
    ],
    gradingScheme: [
      { category: 'Prelim Assessment', weight: 20 },
      { category: 'Midterm Assessment', weight: 25 },
      { category: 'Semifinal Assessment', weight: 25 },
      { category: 'Finals Assessment', weight: 30 }
    ],
    prerequisites: 'ITPC 2 (Discrete Mathematics)'
  },
  'ITAPDC 2': {
    code: 'ITAPDC 2',
    title: 'Integrated Application Software',
    department: 'BS Information Technology',
    units: 3,
    instructorName: 'Engr. Raymond Tandoc',
    instructorEmail: 'r.tandoc@tcc.edu.ph',
    officeLocation: 'Cloud Lab 3',
    consultationHours: 'Monday & Wednesday: 1:00 PM - 3:00 PM',
    description: 'Full-stack enterprise application integration, RESTful API design, state synchronization, and secure microservices orchestration.',
    objectives: [
      'Build end-to-end cloud integrated software with robust API contracts.',
      'Deploy CI/CD automated test pipelines and security auditing.'
    ],
    gradingScheme: [
      { category: 'Prelim Assessment', weight: 20 },
      { category: 'Midterm Assessment', weight: 25 },
      { category: 'Semifinal Assessment', weight: 25 },
      { category: 'Finals Assessment', weight: 30 }
    ],
    prerequisites: 'ITAPDC 1'
  },
  'ITPE 1': {
    code: 'ITPE 1',
    title: 'OOP & Microservices Engineering',
    department: 'BS Information Technology',
    units: 3,
    instructorName: 'Engr. Princess Jean Nebria Monsanto, MIT',
    instructorEmail: 'pj.monsanto@tcc.edu',
    officeLocation: 'Software Lab 4',
    consultationHours: 'Tuesday & Thursday: 3:00 PM - 5:00 PM',
    description: 'Advanced object-oriented programming patterns, dependency injection, containerization with Docker, and decoupled microservices architecture.',
    objectives: [
      'Implement Gang of Four design patterns in enterprise-grade software.',
      'Containerize microservices and configure inter-service communication.'
    ],
    gradingScheme: [
      { category: 'Prelim Assessment', weight: 20 },
      { category: 'Midterm Assessment', weight: 25 },
      { category: 'Semifinal Assessment', weight: 25 },
      { category: 'Finals Assessment', weight: 30 }
    ],
    prerequisites: 'ITAPDC 1'
  },
  'GE 5': {
    code: 'GE 5',
    title: 'Purposive Communication',
    department: 'General Education',
    units: 3,
    instructorName: 'Prof. A. Silva',
    instructorEmail: 'a.silva@tcc.edu.ph',
    officeLocation: 'Humanities & Education Dept, Room 405',
    consultationHours: 'Monday & Wednesday: 11:00 AM - 1:00 PM',
    description: 'Equips students with multimodal communication skills in diverse social, academic, and intercultural professional settings.',
    objectives: [
      'Demonstrate mastery of oral, written, and digital professional communication.',
      'Evaluate ethical perspectives in cross-cultural communication scenarios.',
      'Produce research-based technical presentations and academic papers.'
    ],
    gradingScheme: [
      { category: 'Prelim Assessment', weight: 20 },
      { category: 'Midterm Assessment', weight: 25 },
      { category: 'Semifinal Assessment', weight: 25 },
      { category: 'Finals Assessment', weight: 30 }
    ],
    prerequisites: 'None'
  },
  'GE 6': {
    code: 'GE 6',
    title: 'Art Appreciation',
    department: 'General Education',
    units: 3,
    instructorName: 'Prof. M. Santos',
    instructorEmail: 'm.santos@tcc.edu.ph',
    officeLocation: 'Arts & Culture Studio Room 101',
    consultationHours: 'Thursday: 1:00 PM - 4:00 PM',
    description: 'Explores visual arts, music, dance, theater, and digital arts across Philippine and global history.',
    objectives: [
      'Critique artistic styles using aesthetic analysis frameworks.',
      'Understand cultural context and heritage preservation in Philippine indigenous art.'
    ],
    gradingScheme: [
      { category: 'Prelim Assessment', weight: 20 },
      { category: 'Midterm Assessment', weight: 25 },
      { category: 'Semifinal Assessment', weight: 25 },
      { category: 'Finals Assessment', weight: 30 }
    ],
    prerequisites: 'None'
  },
  'ITPC 2': {
    code: 'ITPC 2',
    title: 'Discrete Mathematics',
    department: 'BS Information Technology',
    units: 3,
    instructorName: 'Dr. Emmanuel Dela Cruz',
    instructorEmail: 'e.delacruz@tcc.edu.ph',
    officeLocation: 'Mathematics Faculty Office Room 204',
    consultationHours: 'Friday: 1:00 PM - 3:00 PM',
    description: 'Covers set theory, logic gates, mathematical induction, graph theory, combinatorics, and boolean algebra for computer science.',
    objectives: [
      'Solve formal logic proofs, truth tables, and set operations.',
      'Apply graph algorithms to network routing problems.'
    ],
    gradingScheme: [
      { category: 'Prelim Assessment', weight: 20 },
      { category: 'Midterm Assessment', weight: 25 },
      { category: 'Semifinal Assessment', weight: 25 },
      { category: 'Finals Assessment', weight: 30 }
    ],
    prerequisites: 'High School Mathematics'
  },
  'PE 3': {
    code: 'PE 3',
    title: 'PATH-FIT 3: Martial Arts & Physical Fitness',
    department: 'Physical Education',
    units: 2,
    instructorName: 'Coach M. Reyes',
    instructorEmail: 'm.reyes@tcc.edu.ph',
    officeLocation: 'Gymnasium Athletic Office',
    consultationHours: 'Tuesday: 3:00 PM - 5:00 PM',
    description: 'Physical wellness, cardiovascular conditioning, self-defense fundamentals, and Arnis/Taekwondo form practice.',
    objectives: [
      'Perform traditional Arnis striking techniques and self-defense drills.',
      'Maintain personal fitness logs and target heart-rate targets.'
    ],
    gradingScheme: [
      { category: 'Prelim Assessment', weight: 20 },
      { category: 'Midterm Assessment', weight: 25 },
      { category: 'Semifinal Assessment', weight: 25 },
      { category: 'Finals Assessment', weight: 30 }
    ],
    prerequisites: 'PE 1 & PE 2'
  }
};

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  currentUser,
  notifications = [],
  onUpdateUser,
  activeTab: activeTabProp,
  onSelectTab,
  students = [],
}) => {
  const mapPropToTab = (tab?: string): 'schedule' | 'timetable' | 'grades' | 'attendance' | 'profile' => {
    if (!tab) return 'schedule';
    if (tab === 'dashboard' || tab === 'schedule' || tab === 'news' || tab === 'admin') return 'schedule';
    if (tab === 'timetable') return 'timetable';
    if (tab === 'grades') return 'grades';
    if (tab === 'attendance') return 'attendance';
    if (tab === 'profile') return 'profile';
    return 'schedule';
  };

  const [internalTab, setInternalTab] = useState<'schedule' | 'timetable' | 'grades' | 'attendance' | 'profile'>(
    mapPropToTab(activeTabProp)
  );

  useEffect(() => {
    if (activeTabProp) {
      setInternalTab(mapPropToTab(activeTabProp));
    }
  }, [activeTabProp]);

  const activeTab = internalTab;

  const setActiveTab = (tab: 'schedule' | 'timetable' | 'grades' | 'attendance' | 'profile') => {
    setInternalTab(tab);
    if (onSelectTab) {
      onSelectTab(tab);
    }
  };

  const [filterMode, setFilterMode] = useState<'all' | 'today'>('all');
  const [selectedTimetableDay, setSelectedTimetableDay] = useState<string>('all');
  const [showAlertDropdown, setShowAlertDropdown] = useState(false);
  const [selectedSyllabusCode, setSelectedSyllabusCode] = useState<string | null>(null);

  // Live Exam Countdown State (Targeting ITCC 5 Midterm Examination)
  const [examCountdown, setExamCountdown] = useState({ days: 3, hours: 14, minutes: 22, seconds: 45 });
  useEffect(() => {
    const targetTime = new Date(Date.now() + (3 * 24 * 3600 + 14 * 3600 + 22 * 60) * 1000).getTime();
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetTime - now;
      if (distance > 0) {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setExamCountdown({ days, hours, minutes, seconds });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Profile photo file upload handler
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file (JPG, PNG, GIF, or WebP).');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatarUrl(event.target.result as string);
          setProfileSuccessToast('Photo uploaded! Click "Save Changes" to apply your new profile photo.');
          setTimeout(() => setProfileSuccessToast(null), 3500);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Timetable PDF Download Helper
  const handleDownloadTimetablePdf = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    // Header Banner
    doc.setFillColor(17, 24, 39);
    doc.rect(0, 0, 297, 28, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.text('TORRES CAPITOL COLLEGE', 14, 12);
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    doc.text('OFFICIAL WEEKLY CLASS TIMETABLE - 2ND SEMESTER A.Y. 2025-2026', 14, 20);

    // Student Information Block
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.text(`Student Name: ${fullName}`, 14, 36);
    doc.text(`Student No: ${studentNo}`, 115, 36);
    doc.text(`Degree Program: ${department}`, 185, 36);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`, 14, 42);

    // Table Header
    doc.setFillColor(241, 245, 249);
    doc.rect(14, 47, 269, 8, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('Time Slot', 16, 52.5);
    doc.text('Course Code & Title', 42, 52.5);
    doc.text('Section', 125, 52.5);
    doc.text('Day & Time', 145, 52.5);
    doc.text('Room', 200, 52.5);
    doc.text('Instructor', 235, 52.5);

    let y = 61;
    ALL_SCHEDULES.forEach((item, idx) => {
      if (y > 180) {
        doc.addPage();
        y = 20;
      }
      if (idx % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(14, y - 5, 269, 8, 'F');
      }
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(30, 41, 59);
      doc.text(item.timeSlot, 16, y);
      doc.text(`${item.code} - ${item.title}`, 42, y);
      doc.text(item.section, 125, y);
      doc.text(`${item.day} (${item.timeRange})`, 145, y);
      doc.text(item.room, 200, y);
      doc.text(item.instructor, 235, y);
      y += 7.5;
    });

    // Document Footer
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Official Document generated from Torres Capitol College Student Information System (TCC SIS).', 14, 198);

    doc.save(`TCC_Timetable_${studentNo}.pdf`);
  };

  // In-app alert notifications state
  const [studentNotifs, setStudentNotifs] = useState<
    Array<{ id: string; title: string; message: string; time: string; type: 'grade' | 'reminder' | 'system'; read: boolean }>
  >([
    {
      id: 'sn-1',
      title: 'New Grade Posted: ITCC 5',
      message: 'April Jean D. Villas posted your Midterm grade: 96% (Passed).',
      time: '10 mins ago',
      type: 'grade',
      read: false,
    },
    {
      id: 'sn-2',
      title: 'Upcoming Class Reminder',
      message: 'System Analysis & Design (ITAPDC 1) starts in 30 mins in Lab 2.',
      time: '25 mins ago',
      type: 'reminder',
      read: false,
    },
    {
      id: 'sn-3',
      title: 'Attendance Recorded',
      message: 'Marked Present in GE 6 Art Appreciation.',
      time: '2 hours ago',
      type: 'system',
      read: true,
    },
    {
      id: 'sn-4',
      title: 'Final Examination Schedule Released',
      message: 'Midterm & Final exam timetables for 2nd Semester 2026 are now active.',
      time: '1 day ago',
      type: 'reminder',
      read: true,
    },
  ]);

  // Resolve matching student record
  const matchedStudent =
    students?.find(
      (s) => s.email.toLowerCase() === currentUser.email.toLowerCase() || s.id === currentUser.id
    ) ||
    initialStudents.find(
      (s) => s.email.toLowerCase() === currentUser.email.toLowerCase() || s.id === currentUser.id
    );

  const name = currentUser.name || matchedStudent?.name || 'STUDENT';
  const email = currentUser.email || matchedStudent?.email || 'student@tcc.edu';
  const resolveStudentDepartment = (): Department => {
    if (
      currentUser.department &&
      (currentUser.department === 'BS Criminology' ||
        currentUser.department === 'BS Business Administration' ||
        currentUser.department === 'BS Information Technology')
    ) {
      return currentUser.department as Department;
    }
    if (
      matchedStudent?.department &&
      (matchedStudent.department === 'BS Criminology' ||
        matchedStudent.department === 'BS Business Administration' ||
        matchedStudent.department === 'BS Information Technology')
    ) {
      return matchedStudent.department as Department;
    }
    const emailLower = (currentUser.email || '').toLowerCase();
    if (emailLower.includes('xernex02') || emailLower.includes('crim')) {
      return 'BS Criminology';
    }
    if (emailLower.includes('xernex03') || emailLower.includes('bsba') || emailLower.includes('business')) {
      return 'BS Business Administration';
    }
    return 'BS Information Technology';
  };

  const department: Department = resolveStudentDepartment();

  const ALL_SCHEDULES: ScheduleItem[] =
    initialDepartmentSchedules[department] ||
    initialDepartmentSchedules['BS Information Technology'];

  const uniqueSubjects = Array.from(
    new Map(ALL_SCHEDULES.map((item) => [item.code, item])).values()
  );
  const totalEnrolledUnits = uniqueSubjects.reduce(
    (acc, curr) => acc + (curr.units || 3),
    0
  );
  const studentGpa = matchedStudent?.gpa ? matchedStudent.gpa.toFixed(2) : '1.25';
  const studentAttendancePct = matchedStudent?.overallAttendance
    ? `${matchedStudent.overallAttendance}%`
    : '98%';

  const currentAssessment =
    DEPARTMENT_ASSESSMENTS[department] ||
    DEPARTMENT_ASSESSMENTS['BS Information Technology'];
  const myGrades =
    DEPARTMENT_GRADES_DATA[department] ||
    DEPARTMENT_GRADES_DATA['BS Information Technology'];
  const myAttendance =
    DEPARTMENT_ATTENDANCE_DATA[department] ||
    DEPARTMENT_ATTENDANCE_DATA['BS Information Technology'];
  const departmentGpaInfo =
    DEPARTMENT_GPA_TREND[department] ||
    DEPARTMENT_GPA_TREND['BS Information Technology'];

  const [avatarUrl, setAvatarUrl] = useState(
    currentUser.avatar || matchedStudent?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
  );
  const [studentNo, setStudentNo] = useState(matchedStudent?.studentNo || 'TCC-2024-001');
  const [fullName, setFullName] = useState(name);
  const [instEmail, setInstEmail] = useState(email);
  const [personalEmail, setPersonalEmail] = useState(matchedStudent?.personalEmail || email);
  const [contactNo, setContactNo] = useState(matchedStudent?.contactNumber || '09123456789');
  const [courseYear, setCourseYear] = useState(`${department} • ${matchedStudent?.yearLevel || '2nd Year'}`);
  const [street, setStreet] = useState(matchedStudent?.address?.street || '123 Taguig City College Rd.');
  const [barangay, setBarangay] = useState(matchedStudent?.address?.barangay || 'Brgy. Central');
  const [city, setCity] = useState(matchedStudent?.address?.city || 'Taguig City');
  const [province, setProvince] = useState(matchedStudent?.address?.province || 'Metro Manila');
  const [zipCode, setZipCode] = useState(matchedStudent?.address?.zipCode || '1630');
  const [emergencyName, setEmergencyName] = useState(matchedStudent?.emergencyContact?.name || 'Mrs. Santos');
  const [emergencyRelation, setEmergencyRelation] = useState(matchedStudent?.emergencyContact?.relationship || 'Parent / Guardian');
  const [emergencyPhone, setEmergencyPhone] = useState(matchedStudent?.emergencyContact?.contactNumber || '09987654321');

  useEffect(() => {
    if (matchedStudent) {
      setStudentNo(matchedStudent.studentNo);
      setFullName(currentUser.name || matchedStudent.name);
      setInstEmail(currentUser.email || matchedStudent.email);
      setPersonalEmail(matchedStudent.personalEmail || currentUser.email);
      setContactNo(matchedStudent.contactNumber || '09123456789');
      setCourseYear(`${department} • ${matchedStudent.yearLevel || '2nd Year'}`);
      if (currentUser.avatar || matchedStudent.avatar) {
        setAvatarUrl(currentUser.avatar || matchedStudent.avatar);
      }
      if (matchedStudent.address) {
        setStreet(matchedStudent.address.street || '');
        setBarangay(matchedStudent.address.barangay || '');
        setCity(matchedStudent.address.city || '');
        setProvince(matchedStudent.address.province || '');
        setZipCode(matchedStudent.address.zipCode || '');
      }
      if (matchedStudent.emergencyContact) {
        setEmergencyName(matchedStudent.emergencyContact.name || '');
        setEmergencyRelation(matchedStudent.emergencyContact.relationship || '');
        setEmergencyPhone(matchedStudent.emergencyContact.contactNumber || '');
      }
    }
  }, [currentUser, matchedStudent, department]);

  useEffect(() => {
    setStudentNotifs(
      DEPARTMENT_NOTIFICATIONS[department] || DEPARTMENT_NOTIFICATIONS['BS Information Technology']
    );
  }, [department]);

  // Password Security Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passSuccessToast, setPassSuccessToast] = useState<string | null>(null);
  const [profileSuccessToast, setProfileSuccessToast] = useState<string | null>(null);

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const unreadAlertsCount = studentNotifs.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    setStudentNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateUser) {
      onUpdateUser({
        name: fullName,
        email: instEmail,
        avatar: avatarUrl,
      });
    }
    setProfileSuccessToast('Demographic information & avatar updated successfully!');
    setTimeout(() => setProfileSuccessToast(null), 3500);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      alert('Please enter your current password.');
      return;
    }
    if (newPassword.length < 8) {
      alert('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match.');
      return;
    }
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPassSuccessToast('Your account security password has been updated!');
    setTimeout(() => setPassSuccessToast(null), 3500);
  };

  const daysToRender: Array<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday'> =
    filterMode === 'today'
      ? ['Monday']
      : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  // Timetable Grid Days & Hours
  const timeSlots = [
    '7:00 AM',
    '8:00 AM',
    '9:00 AM',
    '10:00 AM',
    '11:00 AM',
    '12:00 PM',
    '1:00 PM',
    '2:00 PM',
    '3:00 PM',
    '4:00 PM',
    '5:00 PM',
  ];
  const daysOfWeek: Array<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday'> = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
  ];

  const renderScheduleContent = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2 pb-2">
        <div>
          <h2 className="text-2xl font-black text-blue-600 dark:text-blue-500 tracking-tight">
            My Class Schedule
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Daily Academic Schedule Breakdown • {totalEnrolledUnits} Enrolled Units
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleDownloadTimetablePdf}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Schedule PDF</span>
          </button>

          <button
            onClick={() => setFilterMode('today')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition border ${
              filterMode === 'today'
                ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Today's Classes</span>
          </button>

          <button
            onClick={() => setFilterMode('all')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition border ${
              filterMode === 'all'
                ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>All Days</span>
          </button>
        </div>
      </div>

      {/* Exam Countdown Widget */}
      <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-5 shadow-lg border border-blue-800/60 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider flex items-center space-x-1">
                <Sparkles className="w-3 h-3" />
                <span>Next Scheduled Assessment</span>
              </span>
              <span className="text-xs text-blue-200 font-mono">2nd Semester A.Y. 2025-2026</span>
            </div>
            <h3 className="text-lg font-black tracking-tight text-white">
              {currentAssessment.code} — {currentAssessment.examType} ({currentAssessment.courseTitle})
            </h3>
            <p className="text-xs text-slate-300 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>📅 {currentAssessment.dateStr}</span>
              <span>📍 {currentAssessment.room}</span>
              <span>Proctor: {currentAssessment.proctor}</span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
            {/* Live Countdown Cards */}
            <div className="flex items-center space-x-2 font-mono text-center">
              <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl px-3 py-1.5 min-w-[55px]">
                <div className="text-lg font-black text-amber-400">{String(examCountdown.days).padStart(2, '0')}</div>
                <div className="text-[9px] text-slate-400 font-sans uppercase">Days</div>
              </div>
              <span className="text-amber-400 font-bold">:</span>
              <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl px-3 py-1.5 min-w-[55px]">
                <div className="text-lg font-black text-white">{String(examCountdown.hours).padStart(2, '0')}</div>
                <div className="text-[9px] text-slate-400 font-sans uppercase">Hours</div>
              </div>
              <span className="text-slate-400 font-bold">:</span>
              <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl px-3 py-1.5 min-w-[55px]">
                <div className="text-lg font-black text-white">{String(examCountdown.minutes).padStart(2, '0')}</div>
                <div className="text-[9px] text-slate-400 font-sans uppercase">Mins</div>
              </div>
              <span className="text-slate-400 font-bold">:</span>
              <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl px-3 py-1.5 min-w-[55px]">
                <div className="text-lg font-black text-emerald-400 animate-pulse">{String(examCountdown.seconds).padStart(2, '0')}</div>
                <div className="text-[9px] text-slate-400 font-sans uppercase">Secs</div>
              </div>
            </div>

            <button
              onClick={() => setSelectedSyllabusCode(currentAssessment.syllabusCode)}
              className="px-3.5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center space-x-1.5 shrink-0"
            >
              <FileText className="w-4 h-4" />
              <span>View Syllabus</span>
            </button>
          </div>
        </div>
      </div>

      {/* Schedule Lists by Day */}
      {daysToRender.map((day) => {
        const itemsForDay = ALL_SCHEDULES.filter((item) => item.day === day);
        if (itemsForDay.length === 0) return null;

        return (
          <div key={day} className="space-y-3">
            <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 font-sans tracking-tight pt-2 flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              <span>{day}</span>
            </h3>

            <div className="space-y-3">
              {itemsForDay.map((item, idx) => (
                <div
                  key={`${day}-${idx}`}
                  className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-xs border border-slate-200/80 dark:border-slate-800 border-l-[6px] border-l-blue-600 dark:border-l-blue-500 transition hover:shadow-md"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-start space-x-4">
                      <div className="text-sm font-black text-slate-900 dark:text-white shrink-0 min-w-[75px] font-mono">
                        {item.timeSlot}
                      </div>

                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                            {item.code} - {item.title}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-[10px] font-bold border border-blue-200 dark:border-blue-800">
                            Section {item.section}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{item.timeRange}</span>
                          </span>
                          <span>•</span>
                          <span>
                            Room: <strong className="text-slate-700 dark:text-slate-300">{item.room}</strong>
                          </span>
                          <span>•</span>
                          <span>
                            Instructor: <strong className="text-slate-700 dark:text-slate-300">{item.instructor}</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedSyllabusCode(item.code)}
                      className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 dark:bg-slate-800 dark:hover:bg-blue-950 dark:text-slate-300 dark:hover:text-blue-300 border border-slate-200 dark:border-slate-700 text-xs font-bold rounded-xl transition shrink-0 self-start md:self-auto"
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      <span>View Syllabus</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderTimetableContent = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <Calendar className="w-6 h-6 text-blue-600" />
            <span>Weekly Class Timetable</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Visual weekly schedule grid • Monday to Friday (7:00 AM – 6:00 PM)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block mr-1"></span>
            {department === 'BS Criminology'
              ? 'Criminology Courses'
              : department === 'BS Business Administration'
              ? 'Business Courses'
              : 'IT Courses'}
          </span>
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-bold">
            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block mr-1"></span> GE Courses
          </span>
          <button
            onClick={handleDownloadTimetablePdf}
            className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Timetable PDF</span>
          </button>
        </div>
      </div>

      {/* Mobile Day Selector Tabs */}
      <div className="sm:hidden space-y-2">
        <div className="flex overflow-x-auto gap-1.5 pb-1 pt-1 no-scrollbar">
          {['all', ...daysOfWeek].map((day) => (
            <button
              key={day}
              onClick={() => setSelectedTimetableDay(day)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition ${
                selectedTimetableDay === day
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {day === 'all' ? 'All (Grid)' : day.slice(0, 3)}
            </button>
          ))}
        </div>
        {selectedTimetableDay === 'all' && (
          <p className="text-[11px] text-slate-400 flex items-center space-x-1">
            <span>👉 Swipe horizontally across grid to view all days</span>
          </p>
        )}
      </div>

      {/* Mobile Single Day Card Stack */}
      {selectedTimetableDay !== 'all' && (
        <div className="sm:hidden space-y-3">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span>Schedule for {selectedTimetableDay}</span>
            <button
              onClick={() => setSelectedTimetableDay('all')}
              className="text-[11px] text-blue-600 font-semibold"
            >
              View Grid
            </button>
          </div>
          {ALL_SCHEDULES.filter((s) => s.day === selectedTimetableDay).length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 text-center text-xs text-slate-500">
              No scheduled classes on this day
            </div>
          ) : (
            ALL_SCHEDULES.filter((s) => s.day === selectedTimetableDay).map((item, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-xs border border-slate-200 dark:border-slate-800 border-l-[5px] border-l-blue-600"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                    {item.timeSlot} • {item.timeRange}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
                    Sec {item.section}
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                  {item.code} - {item.title}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center justify-between">
                  <span>📍 {item.room}</span>
                  <span className="truncate max-w-[150px]">{item.instructor}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Visual Calendar Grid (Hidden on mobile if a specific single day is selected) */}
      <div className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto ${
        selectedTimetableDay !== 'all' ? 'hidden sm:block' : 'block'
      }`}>
        <div className="min-w-[800px]">
          {/* Header Days */}
          <div className="grid grid-cols-6 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-black text-xs text-center py-3">
            <div className="p-2 border-r border-slate-200 dark:border-slate-700">TIME</div>
            {daysOfWeek.map((day) => (
              <div key={day} className="p-2 border-r last:border-r-0 border-slate-200 dark:border-slate-700 uppercase tracking-wider">
                {day}
              </div>
            ))}
          </div>

          {/* Time Rows */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {timeSlots.map((slot) => (
              <div key={slot} className="grid grid-cols-6 min-h-[70px]">
                {/* Time Slot Cell */}
                <div className="p-2 text-center text-xs font-mono font-extrabold text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-center">
                  {slot}
                </div>

                {/* Day Columns for this time slot */}
                {daysOfWeek.map((day) => {
                  const matchingClasses = ALL_SCHEDULES.filter(
                    (item) => item.day === day && item.timeSlot === slot
                  );

                  return (
                    <div
                      key={`${day}-${slot}`}
                      className="p-1.5 border-r last:border-r-0 border-slate-100 dark:border-slate-800/60 relative flex flex-col gap-1 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition"
                    >
                      {matchingClasses.map((item, idx) => (
                        <div
                          key={idx}
                          className={`p-2 rounded-xl border text-xs shadow-xs transition transform hover:-translate-y-0.5 ${item.color}`}
                        >
                          <div className="font-extrabold text-[11px] leading-tight flex items-center justify-between">
                            <span>{item.code}</span>
                            <span className="text-[9px] opacity-75 font-mono">{item.section}</span>
                          </div>
                          <div className="text-[10px] font-medium truncate mt-0.5 leading-tight">
                            {item.title}
                          </div>
                          <div className="text-[9px] font-mono mt-1 opacity-80 flex items-center justify-between">
                            <span>📍 {item.room}</span>
                            <span>{item.timeRange}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderGradesContent = () => (
    <div className="space-y-6">
      {/* Cumulative GPA Trend Progress Visualization (Recharts) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-xs border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              <span>Cumulative GPA Trend Progress</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Grade point average progression across 4 assessment periods (Philippine Scale: 1.00 is highest honors)
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 text-xs font-black font-mono border border-emerald-200 dark:border-emerald-800">
              Current GPA: {studentGpa}
            </span>
            <span className="px-3 py-1 rounded-xl bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 text-xs font-black font-mono border border-blue-200 dark:border-blue-800">
              {departmentGpaInfo.standing}
            </span>
          </div>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={departmentGpaInfo.trend} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gpaTrendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
              <XAxis dataKey="period" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }} />
              <YAxis
                reversed={true}
                domain={[1.0, 2.0]}
                ticks={[1.0, 1.25, 1.5, 1.75, 2.0]}
                tick={{ fill: '#64748b', fontSize: 10 }}
                tickFormatter={(val) => val.toFixed(2)}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-xl border border-slate-700 shadow-xl text-xs space-y-1">
                        <div className="font-extrabold text-amber-400">{data.period} Assessment</div>
                        <div>Cumulative GPA: <strong className="text-emerald-400 font-mono">{data.gpa.toFixed(2)}</strong></div>
                        <div>Equivalent Grade: <strong className="font-mono">{data.averagePct}%</strong></div>
                        <div>Standing: <strong className="text-blue-300">{data.status}</strong></div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area type="monotone" dataKey="gpa" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#gpaTrendGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-800 overflow-hidden space-y-0">
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Award className="w-5 h-5 text-amber-500" />
            <span>My Official Academic Grades</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            SY 2025-2026 • 2nd Semester • Confidential Student Transcript
          </p>
        </div>
        <button
          onClick={() => alert('Official Grade Transcript PDF generated for download.')}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition self-start sm:self-auto shadow-xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Transcript</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
              <th className="p-3.5">Code</th>
              <th className="p-3.5">Subject Description</th>
              <th className="p-3.5 text-center">Units</th>
              <th className="p-3.5 text-center">Prelim</th>
              <th className="p-3.5 text-center">Midterm</th>
              <th className="p-3.5 text-center">Final</th>
              <th className="p-3.5 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {myGrades.map((row, i) => (
              <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                <td className="p-3.5 font-bold text-slate-900 dark:text-white">{row.code}</td>
                <td className="p-3.5 text-slate-700 dark:text-slate-300 font-medium">{row.desc}</td>
                <td className="p-3.5 text-center font-bold text-slate-900 dark:text-white">{row.units}</td>
                <td className="p-3.5 text-center font-semibold text-slate-700 dark:text-slate-300">{row.prelim}</td>
                <td className="p-3.5 text-center font-semibold text-slate-700 dark:text-slate-300">{row.midterm}</td>
                <td className="p-3.5 text-center font-bold text-blue-600 dark:text-blue-400">{row.final}</td>
                <td className="p-3.5 text-right">
                  <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold rounded-md border border-emerald-200 dark:border-emerald-800">
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

  const renderAttendanceContent = () => (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Clock className="w-5 h-5 text-emerald-500" />
            <span>My Attendance Records</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Individual Attendance Percentage • SY 2025-2026
          </p>
        </div>
      </div>

      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        {myAttendance.map((item, idx) => (
          <div key={idx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-black text-blue-600 dark:text-blue-400">{item.code}</span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{item.course}</h4>
              </div>
              <span className="text-sm font-black font-mono text-emerald-600 dark:text-emerald-400">{item.percentage}%</span>
            </div>

            {/* Attendance Progress Bar */}
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${item.percentage}%` }}></div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium pt-1">
              <span>Present: <strong className="text-slate-800 dark:text-slate-200">{item.present}</strong> sessions</span>
              <span>Late: <strong className="text-amber-600">{item.late}</strong></span>
              <span>Absent: <strong className="text-rose-600">{item.absent}</strong></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderProfileContent = () => (
    <div className="space-y-6">
      {/* Toast Alerts */}
      {profileSuccessToast && (
        <div className="p-4 bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center space-x-2 animate-fade-in">
          <CheckCircle2 className="w-5 h-5" />
          <span>{profileSuccessToast}</span>
        </div>
      )}

      {passSuccessToast && (
        <div className="p-4 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-lg flex items-center space-x-2 animate-fade-in">
          <ShieldCheck className="w-5 h-5" />
          <span>{passSuccessToast}</span>
        </div>
      )}

      {/* Avatar & Demographic Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <UserIcon className="w-5 h-5 text-blue-600" />
              <span>Student Profile & Demographics</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage your profile picture, contact details, and institutional address information.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-6">
          {/* Avatar Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-3">
              Profile Avatar Image
            </label>
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="relative group shrink-0">
                <img
                  src={avatarUrl}
                  alt="Avatar Preview"
                  className="w-20 h-20 rounded-full object-cover border-4 border-slate-200 dark:border-slate-700 shadow-md"
                />
              </div>

              <div className="flex-1 space-y-3 w-full">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Upload a profile photo or select a preset avatar / custom URL:
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center space-x-2 shadow-sm transition cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-white" />
                    <span>Upload Photo</span>
                  </button>

                  <div className="flex items-center space-x-1.5">
                    {PRESET_AVATARS.map((url, i) => (
                      <button
                        type="button"
                        key={i}
                        onClick={() => setAvatarUrl(url)}
                        className={`w-8 h-8 rounded-full overflow-hidden border-2 transition ${
                          avatarUrl === url ? 'border-blue-600 ring-2 ring-blue-500/30' : 'border-slate-200 dark:border-slate-700 hover:opacity-80'
                        }`}
                      >
                        <img src={url} alt="Preset" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Policy Warning Banner */}
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs flex items-start space-x-2.5 shadow-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-extrabold uppercase text-[10px] tracking-wider block text-amber-700 dark:text-amber-400">
                      Official Student Conduct Notice
                    </span>
                    <p className="leading-snug">
                      <strong>Warning:</strong> Uploading inappropriate, offensive, or unauthorized photos will result in immediate account blocking or disciplinary detention.
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://example.com/my-photo.jpg"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Demographic Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Student No</label>
              <input
                type="text"
                value={studentNo}
                disabled
                className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-mono font-bold text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Course & Year</label>
              <input
                type="text"
                value={courseYear}
                onChange={(e) => setCourseYear(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-medium text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Institutional Email</label>
              <input
                type="email"
                value={instEmail}
                onChange={(e) => setInstEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-mono text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Personal Email</label>
              <input
                type="email"
                value={personalEmail}
                onChange={(e) => setPersonalEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-mono text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Contact Number</label>
              <input
                type="text"
                value={contactNo}
                onChange={(e) => setContactNo(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-mono text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Address Details */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
              Permanent Address
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Street / House No.</label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Barangay</label>
                <input
                  type="text"
                  value={barangay}
                  onChange={(e) => setBarangay(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">City / Municipality</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Province & Zip Code</label>
                <input
                  type="text"
                  value={`${province} ${zipCode}`}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-xs"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center space-x-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Demographic Changes</span>
            </button>
          </div>
        </form>
      </div>

      {/* Password & Security Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Lock className="w-5 h-5 text-amber-500" />
            <span>Account Security & Password</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Update your student account password. Ensure it uses numbers and special characters.
          </p>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Current Password</label>
            <div className="relative">
              <input
                type={showCurrentPass ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPass(!showCurrentPass)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">New Password</label>
            <div className="relative">
              <input
                type={showNewPass ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPass(!showNewPass)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password Strength Indicator Bar */}
            {newPassword && (
              <div className="mt-2 space-y-1">
                <div className="flex space-x-1">
                  {[1, 2, 3, 4].map((step) => {
                    const len = newPassword.length;
                    const isActive = step <= (len > 10 ? 4 : len > 8 ? 3 : len > 5 ? 2 : 1);
                    return (
                      <div
                        key={step}
                        className={`h-1 flex-1 rounded-full ${
                          isActive ? (len > 10 ? 'bg-emerald-500' : len > 8 ? 'bg-blue-500' : 'bg-amber-500') : 'bg-slate-200 dark:bg-slate-700'
                        }`}
                      />
                    );
                  })}
                </div>
                <div className="text-[10px] text-slate-400">
                  Password Strength: {newPassword.length > 10 ? 'Strong' : newPassword.length > 8 ? 'Good' : 'Fair'}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-md transition flex items-center space-x-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Update Account Password</span>
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto w-full space-y-5">
      {/* Black Student Banner Card matching image.png */}
      <div className="bg-[#18181B] dark:bg-[#111827] text-white rounded-3xl p-6 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center space-x-5">
            {/* Avatar Circle */}
            <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-slate-700 text-white font-extrabold text-xl flex items-center justify-center shrink-0 shadow-inner overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </div>

            {/* Student Info */}
            <div className="space-y-1">
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white font-sans uppercase">
                {name}
              </h1>
              <p className="text-xs text-slate-400 font-mono font-medium">{email}</p>

              {/* Info Badges Pill Row */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-900 text-slate-300 text-xs font-mono font-bold border border-slate-700">
                  <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                  <span>{studentNo}</span>
                </div>

                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-900 text-slate-300 text-xs font-mono font-bold border border-slate-700">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                  <span>{department} • 2nd Year</span>
                </div>

                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-900 text-slate-300 text-xs font-mono font-bold border border-slate-700">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{contactNo}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Top Bar Controls & Highlighted Quick Metrics */}
          <div className="flex flex-col items-end space-y-3 w-full md:w-auto">
            {/* In-App Alert Dropdown Control */}
            <div className="relative">
              <button
                onClick={() => setShowAlertDropdown(!showAlertDropdown)}
                className="relative p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-200 border border-slate-700 transition flex items-center space-x-2 text-xs font-bold"
              >
                <Bell className="w-4 h-4 text-amber-400" />
                <span>Alerts & Reminders</span>
                {unreadAlertsCount > 0 && (
                  <span className="w-5 h-5 bg-rose-500 text-white rounded-full text-[10px] font-black flex items-center justify-center animate-pulse">
                    {unreadAlertsCount}
                  </span>
                )}
              </button>

              {/* In-App Alerts Dropdown Menu */}
              {showAlertDropdown && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 p-4 space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="text-xs font-black uppercase text-slate-900 dark:text-white flex items-center space-x-1.5">
                      <Bell className="w-3.5 h-3.5 text-amber-500" />
                      <span>Class Reminders & Grades</span>
                    </span>
                    {unreadAlertsCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {studentNotifs.map((n, idx) => (
                      <div
                        key={`${n.id}-${idx}`}
                        className={`p-3 rounded-xl border text-xs transition ${
                          !n.read
                            ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800'
                            : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <span className="font-extrabold text-slate-900 dark:text-white leading-snug">{n.title}</span>
                          <span className="text-[9px] font-mono text-slate-400 shrink-0 ml-2">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">{n.message}</p>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setShowAlertDropdown(false)}
                    className="w-full text-center py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-200 transition"
                  >
                    Close Dropdown
                  </button>
                </div>
              )}
            </div>

            {/* Quick Metrics Cards */}
            <div className="flex items-center space-x-3 w-full">
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 text-center flex-1 md:w-28">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">GPA</div>
                <div className="text-xl font-black text-emerald-400 font-mono">{studentGpa}</div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 text-center flex-1 md:w-28">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Units</div>
                <div className="text-xl font-black text-white font-mono">{totalEnrolledUnits}</div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 text-center flex-1 md:w-28">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Attendance</div>
                <div className="text-xl font-black text-blue-400 font-mono">{studentAttendancePct}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('schedule')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'schedule'
              ? 'bg-slate-900 text-white dark:bg-blue-600'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>My Class Schedule</span>
        </button>

        <button
          onClick={() => setActiveTab('timetable')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'timetable'
              ? 'bg-slate-900 text-white dark:bg-blue-600'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>Weekly Timetable</span>
        </button>

        <button
          onClick={() => setActiveTab('grades')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'grades'
              ? 'bg-slate-900 text-white dark:bg-blue-600'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-emerald-400" />
          <span>My Grades</span>
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'attendance'
              ? 'bg-slate-900 text-white dark:bg-blue-600'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
          <span>My Attendance</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'profile'
              ? 'bg-slate-900 text-white dark:bg-blue-600'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <UserIcon className="w-3.5 h-3.5" />
          <span>Profile Management</span>
        </button>
      </div>

      {/* Active Tab View */}
      {activeTab === 'schedule' && renderScheduleContent()}
      {activeTab === 'timetable' && renderTimetableContent()}
      {activeTab === 'grades' && renderGradesContent()}
      {activeTab === 'attendance' && renderAttendanceContent()}
      {activeTab === 'profile' && renderProfileContent()}

      {/* View Syllabus Modal */}
      {selectedSyllabusCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-2xl w-full text-slate-900 dark:text-slate-100 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            {(() => {
              const matchedClass = ALL_SCHEDULES.find((s) => s.code === selectedSyllabusCode);
              const syl = SYLLABUS_DATA[selectedSyllabusCode] || {
                code: selectedSyllabusCode,
                title: matchedClass?.title || 'Official Course Syllabus',
                department: matchedClass?.department || department,
                units: matchedClass?.units || 3,
                instructorName: matchedClass?.instructor || 'Faculty Instructor',
                instructorEmail: 'faculty@tcc.edu.ph',
                officeLocation: matchedClass?.room ? `${matchedClass.room} Complex` : 'Academic Faculty Office',
                consultationHours: 'Regular Office Hours',
                description: `Comprehensive academic coursework for ${matchedClass?.title || selectedSyllabusCode}, detailing course competencies, syllabus guidelines, and evaluation metrics.`,
                objectives: [
                  `Master fundamental subject matter concepts and competencies in ${matchedClass?.title || selectedSyllabusCode}.`,
                  'Apply practical methodologies, research standards, and academic best practices.'
                ],
                gradingScheme: [
                  { category: 'Prelim Assessment', weight: 20 },
                  { category: 'Midterm Assessment', weight: 25 },
                  { category: 'Semifinal Assessment', weight: 25 },
                  { category: 'Finals Assessment', weight: 30 }
                ],
                prerequisites: 'None'
              };

              return (
                <>
                  <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                    <div>
                      <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
                        <BookOpen className="w-4 h-4" />
                        <span>Official Course Syllabus & Outline</span>
                      </div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white">
                        {syl.code} — {syl.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {syl.department} • {syl.units} Academic Units • Prereq: {syl.prerequisites}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedSyllabusCode(null)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4 text-xs">
                    {/* Course Summary */}
                    <div>
                      <h4 className="font-extrabold text-slate-900 dark:text-white mb-1 uppercase tracking-wide text-[11px]">
                        Course Summary & Description
                      </h4>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700 font-medium">
                        {syl.description}
                      </p>
                    </div>

                    {/* Learning Objectives */}
                    <div>
                      <h4 className="font-extrabold text-slate-900 dark:text-white mb-1.5 uppercase tracking-wide text-[11px]">
                        Learning Objectives & Outcomes
                      </h4>
                      <ul className="space-y-1.5">
                        {syl.objectives.map((obj, i) => (
                          <li key={i} className="flex items-start space-x-2 text-slate-700 dark:text-slate-300">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{obj}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Requirements & Grading Breakdown */}
                    <div>
                      <h4 className="font-extrabold text-slate-900 dark:text-white mb-1.5 uppercase tracking-wide text-[11px]">
                        Assessment Scheme & Grading Weights
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {syl.gradingScheme.map((g, i) => (
                          <div key={i} className="p-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/60 text-center">
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">{g.category}</div>
                            <div className="text-sm font-black text-blue-600 dark:text-blue-400 font-mono mt-0.5">{g.weight}% Weight</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Faculty Instructor Details */}
                    <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-blue-400 flex items-center space-x-1.5">
                        <UserIcon className="w-3.5 h-3.5" />
                        <span>Faculty Instructor Contact Information</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <div>
                          <div className="font-bold text-sm text-white">{syl.instructorName}</div>
                          <div className="text-slate-300 font-mono text-[11px]">{syl.instructorEmail}</div>
                        </div>
                        <div className="text-right text-[11px] text-slate-300">
                          <div>📍 {syl.officeLocation}</div>
                          <div className="text-emerald-400 font-semibold">🕒 {syl.consultationHours}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <button
                      onClick={() => {
                        alert(`Downloading official Syllabus PDF document for ${syl.code}...`);
                      }}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition flex items-center space-x-1.5"
                    >
                      <Download className="w-3.5 h-3.5 text-blue-600" />
                      <span>Download Syllabus PDF</span>
                    </button>
                    <button
                      onClick={() => setSelectedSyllabusCode(null)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition"
                    >
                      Close Window
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
