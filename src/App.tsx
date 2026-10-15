import React, { useState, useEffect, useRef } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { AlertTriangle } from 'lucide-react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { LoginPage } from './components/LoginPage';
import { DashboardOverview } from './components/DashboardOverview';
import { StudentDashboard } from './components/StudentDashboard';
import { Gradebook } from './components/Gradebook';
import { AttendanceTracker } from './components/AttendanceTracker';
import { StudentAnalytics } from './components/StudentAnalytics';
import { ReportsAndCompliance } from './components/ReportsAndCompliance';
import { BulkStudentImport } from './components/BulkStudentImport';
import { RealTimeMonitoring } from './components/RealTimeMonitoring';
import { RBACManager } from './components/RBACManager';
import { AuditLogs } from './components/AuditLogs';
import { BackupManager } from './components/BackupManager';
import { NotificationCenter } from './components/NotificationCenter';
import { AIAssistantModal } from './components/AIAssistantModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { ApkDownloadModal } from './components/ApkDownloadModal';
import { ClassSchedulesAndCurriculum } from './components/ClassSchedulesAndCurriculum';

import {
  User,
  Student,
  Course,
  Instructor,
  GradeItem,
  AttendanceRecord,
  AuditLogEntry,
  PushNotification,
  RolePermissions,
  Language,
} from './types';

import {
  initialUsers,
  defaultRolePermissions,
  initialStudents,
  initialCourses,
  initialGrades,
  initialAttendance,
  initialAuditLogs,
  initialNotifications,
} from './data/mockData';
import { initialInstructors, initialDepartmentSchedules } from './data/curriculumData';
import { initTheme } from './utils/theme';

export default function App() {
  // App Global State
  const [currentUser, setCurrentUser] = useState<User | null>(null); // Start logged out
  const [currentLang, setCurrentLang] = useState<Language>('en');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All Departments');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isOpenSidebarMobile, setIsOpenSidebarMobile] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Data Collections
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [instructors, setInstructors] = useState<Instructor[]>(initialInstructors);
  const [grades, setGrades] = useState<GradeItem[]>(initialGrades);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(initialAttendance);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(initialAuditLogs);
  const [notifications, setNotifications] = useState<PushNotification[]>(initialNotifications);
  const [permissions, setPermissions] = useState<Record<string, RolePermissions>>(defaultRolePermissions);

  // Modal Controls
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [showApkModal, setShowApkModal] = useState(false);
  const [interventionToast, setInterventionToast] = useState<string | null>(null);

  // Session Timeout Logic
  const lastActivityRef = useRef(Date.now());
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes
  const WARNING_TIME = 60 * 1000; // 60 seconds warning

  useEffect(() => {
    const cleanup = initTheme();
    return () => cleanup();
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    
    const updateActivity = () => {
      lastActivityRef.current = Date.now();
      if (showSessionWarning) setShowSessionWarning(false);
    };

    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('click', updateActivity);
    window.addEventListener('scroll', updateActivity);

    const interval = setInterval(() => {
      const idleTime = Date.now() - lastActivityRef.current;
      
      if (idleTime > SESSION_TIMEOUT) {
        // Logout
        setCurrentUser(null);
        setShowSessionWarning(false);
        addAuditEntry('SESSION_TIMEOUT', 'User logged out due to inactivity');
      } else if (idleTime > SESSION_TIMEOUT - WARNING_TIME) {
        if (!showSessionWarning) setShowSessionWarning(true);
      }
    }, 1000);

    return () => {
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('click', updateActivity);
      window.removeEventListener('scroll', updateActivity);
      clearInterval(interval);
    };
  }, [currentUser, showSessionWarning]);

  const userPermissions = currentUser ? permissions[currentUser.role] || defaultRolePermissions[currentUser.role] : defaultRolePermissions.Faculty;

  // Real-time Cloud Sync Trigger
  const handleForceSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      // Append sync audit record
      const syncAudit: AuditLogEntry = {
        id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        userId: currentUser?.id || 'sys',
        userName: currentUser?.name || 'System Auto-Sync',
        userRole: currentUser?.role || 'Admin',
        action: 'CROSS_DEPT_CLOUD_SYNC',
        details: 'Manual cross-department cloud data synchronization executed across all nodes',
        department: (selectedDepartment === 'All Departments' ? 'Computer Science' : selectedDepartment) as any,
        ipAddress: '192.168.10.1',
        severity: 'Info',
        hash: `SHA256-SYNC-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      };
      setAuditLogs((prev) => [syncAudit, ...prev]);
    }, 1200);
  };

  // Handlers for Gradebook
  const handleUpdateGrade = (updatedGrade: GradeItem) => {
    setGrades((prev) => prev.map((g) => (g.id === updatedGrade.id ? updatedGrade : g)));
    addAuditEntry('GRADE_RECORD_UPDATED', `Updated score for ${updatedGrade.courseCode}: ${updatedGrade.score}/${updatedGrade.maxScore}`);
  };

  const handleAddGrade = (newGrade: GradeItem) => {
    setGrades((prev) => [newGrade, ...prev]);
    addAuditEntry('GRADE_RECORD_CREATED', `Added new score entry for ${newGrade.courseCode} (${newGrade.category}): ${newGrade.score}`);
  };

  const handleApproveGrades = (courseCode: string) => {
    setGrades((prev) =>
      prev.map((g) => (g.courseCode === courseCode ? { ...g, locked: true } : g))
    );
    addAuditEntry('ROSTER_APPROVED', `Locked & approved official grade roster for ${courseCode}`);
    alert(`Official grade roster for ${courseCode} has been approved and locked for administrative review!`);
  };

  // Handlers for Attendance
  const handleRecordAttendance = (records: AttendanceRecord[]) => {
    setAttendanceRecords((prev) => {
      const remaining = prev.filter(
        (existing) => !records.some((r) => r.studentId === existing.studentId && r.courseCode === existing.courseCode && r.date === existing.date)
      );
      return [...records, ...remaining];
    });
    addAuditEntry('ATTENDANCE_REGISTER_SAVED', `Updated attendance records for ${records[0]?.courseCode || 'Course'}`);
  };

  // Intervention Trigger
  const handleTriggerIntervention = (student: Student) => {
    addAuditEntry('RISK_COUNSELING_ISSUED', `Issued academic intervention notice for ${student.name} (${student.studentNo})`);
    setInterventionToast(`Academic counseling intervention slip generated for ${student.name}. Sent to Dean & Student Advisor.`);
    setTimeout(() => setInterventionToast(null), 4000);
  };

  // Bulk Student Import Handler
  const handleImportStudents = (newStudents: Student[], summaryText: string) => {
    setStudents((prev) => [...newStudents, ...prev]);
    addAuditEntry('BULK_STUDENT_IMPORT', summaryText);
    const newNotif: PushNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      title: 'Bulk Student Roster Import Completed',
      message: `Successfully registered ${newStudents.length} new students into the SIS database.`,
      timestamp: 'Just now',
      type: 'info',
      read: false,
      category: 'System',
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Add Audit Entry Helper
  const addAuditEntry = (action: string, details: string) => {
    const entry: AuditLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      userId: currentUser?.id || 'guest',
      userName: currentUser?.name || 'Faculty Member',
      userRole: currentUser?.role || 'Faculty',
      action,
      details,
      department: currentUser?.department || 'Computer Science',
      ipAddress: '192.168.10.45',
      severity: action.includes('RISK') ? 'Warning' : 'Info',
      hash: `SHA256-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    };
    setAuditLogs((prev) => [entry, ...prev]);
  };

  // Notifications
  const handleMarkNotifsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleSendCustomNotif = (notif: PushNotification) => {
    setNotifications((prev) => [notif, ...prev]);
    addAuditEntry('PUSH_NOTIFICATION_BROADCAST', `Broadcasted critical push alert: ${notif.title}`);
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    setStudents((prev) => prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s)));
    addAuditEntry('STUDENT_DEMOGRAPHICS_UPDATED', `Updated official demographic details for ${updatedStudent.name} (${updatedStudent.studentNo})`);
  };

  const handleStudentSelfProfileUpdate = (updated: Partial<User>) => {
    setCurrentUser((prev) => (prev ? { ...prev, ...updated } : null));

    setStudents((prevStudents) =>
      prevStudents.map((s) => {
        if (
          s.email === currentUser?.email ||
          s.name === currentUser?.name ||
          s.id === `std-${currentUser?.id}`
        ) {
          return {
            ...s,
            name: updated.name ?? s.name,
            email: updated.email ?? s.email,
            avatar: updated.avatar ?? s.avatar,
          };
        }
        return s;
      })
    );

    addAuditEntry(
      'STUDENT_PROFILE_REALTIME_SYNC',
      `Real-time sync: Student ${updated.name || currentUser?.name} updated profile details & profile photo.`
    );
  };

  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  if (!currentUser) {
    return (
      <LoginPage
        onLoginSuccess={(user, newStudent) => {
          // Strict Verification Guard: Reject unverified student accounts
          if (user.role === 'Student' && !user.mfaVerified && !user.isEmailVerified) {
            alert('Email verification incomplete. Access denied. Please submit the 6-digit verification code sent to your email.');
            addAuditEntry('AUTH_VERIFICATION_REJECTED', `Login attempt blocked for unverified student account: ${user.email}`);
            return;
          }

          setCurrentUser(user);
          addAuditEntry('MFA_LOGIN_SUCCESS', `User ${user.name} logged in with verified email OTP code`);

          // Auto-detect and filter by department based on profile role and department
          if (user.role === 'Admin') {
            setSelectedDepartment('All Departments');
          } else if (user.department) {
            setSelectedDepartment(user.department);
          }

          if (newStudent) {
            setStudents((prev) => {
              if (prev.some((s) => s.id === newStudent.id || s.studentNo === newStudent.studentNo)) {
                return prev.map((s) => (s.id === newStudent.id ? newStudent : s));
              }
              return [newStudent, ...prev];
            });
            addAuditEntry('STUDENT_SELF_REGISTERED', `New verified student registered: ${newStudent.name} (${newStudent.studentNo}) in ${newStudent.department}`);
          } else if (user.role === 'Student') {
            // Check if student record exists, else auto-provision student record for demo
            setStudents((prev) => {
              const existing = prev.find((s) => s.email === user.email || s.name === user.name);
              if (existing) return prev;

              const autoStudent: Student = {
                id: `std-${user.id}`,
                studentNo: `2026-${Math.floor(1000 + Math.random() * 9000)}`,
                name: user.name,
                email: user.email,
                personalEmail: user.email,
                department: (user.department as any) || 'BS Information Technology',
                yearLevel: '2nd Year',
                program: `${user.department || 'BS Information Technology'} (2nd Year)`,
                gpa: 1.25,
                overallAttendance: 100,
                riskStatus: 'Optimal',
                avatar: user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
                contactNumber: '09123456789',
                address: {
                  street: 'Main St.',
                  barangay: 'Central',
                  city: 'Manila',
                  province: 'Metro Manila',
                  zipCode: '1000'
                },
                parents: { fatherName: 'Parent', motherName: 'Parent' },
                emergencyContact: { name: 'Emergency Contact', relationship: 'Parent', contactNumber: '09123456789' },
                civilStatus: 'Single',
                enrollmentStatus: 'Enrolled',
                birthDate: '2004-01-01'
              };
              return [autoStudent, ...prev];
            });
          }
        }}
        currentLang={currentLang}
      />
    );
  }

  const isAdmin = currentUser?.role === 'Admin';
  const effectiveDepartment = isAdmin
    ? selectedDepartment
    : (currentUser?.department || selectedDepartment || 'BS Information Technology');

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white transition-colors">
      {/* Top Header */}
      <Header
        currentUser={currentUser}
        currentLang={currentLang}
        onSelectLang={setCurrentLang}
        unreadNotifCount={unreadNotifCount}
        onOpenNotifications={() => setShowNotifDrawer(true)}
        onLogout={() => {
          setCurrentUser(null);
          addAuditEntry('USER_LOGOUT', 'User signed out of session');
        }}
        onToggleSidebarMobile={() => setIsOpenSidebarMobile(!isOpenSidebarMobile)}
        onForceSync={handleForceSync}
        isSyncing={isSyncing}
        onOpenAiAssistant={() => setShowAiModal(true)}
        onOpenApkModal={() => setShowApkModal(true)}
        students={students}
        onSelectStudent={(studentId) => {
          setSelectedStudentId(studentId);
          setActiveTab('analytics');
        }}
      />

      <div className="flex flex-1 max-w-7xl w-full mx-auto">
        {/* Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          currentLang={currentLang}
          currentUser={currentUser}
          permissions={userPermissions}
          isOpenMobile={isOpenSidebarMobile}
          onCloseMobile={() => setIsOpenSidebarMobile(false)}
          selectedDepartment={effectiveDepartment}
          onSelectDepartment={setSelectedDepartment}
          onOpenApkModal={() => setShowApkModal(true)}
        />

        {/* Main Content Area - Optimized for mobile app view with bottom spacing */}
        <main className="flex-1 p-3 sm:p-4 md:p-6 pb-20 md:pb-6 overflow-x-hidden">
          {/* Active View Routing */}
          {currentUser?.role === 'Student' && (
            <StudentDashboard
              currentUser={currentUser}
              notifications={notifications}
              onUpdateUser={handleStudentSelfProfileUpdate}
              activeTab={activeTab}
              onSelectTab={setActiveTab}
              students={students}
            />
          )}

          {currentUser?.role !== 'Student' && activeTab === 'dashboard' && (
            <DashboardOverview
              students={students}
              courses={courses}
              grades={grades}
              auditLogs={auditLogs}
              currentLang={currentLang}
              selectedDepartment={effectiveDepartment}
              currentUser={currentUser}
              userRole={currentUser?.role}
              userDepartment={currentUser?.department}
              onSelectDepartment={setSelectedDepartment}
              onNavigateTab={setActiveTab}
              onOpenAiAnalyst={() => setShowAiModal(true)}
              onTriggerIntervention={handleTriggerIntervention}
              onSelectStudent={(studentId) => {
                setSelectedStudentId(studentId);
                setActiveTab('analytics');
              }}
            />
          )}

          {currentUser?.role !== 'Student' && activeTab === 'schedules' && (
            <ClassSchedulesAndCurriculum
              students={students}
              courses={courses}
              instructors={instructors}
              departmentSchedules={initialDepartmentSchedules}
              currentUser={currentUser}
              selectedDepartment={effectiveDepartment}
              onAddCourse={(course) => {
                setCourses((prev) => [course, ...prev]);
                addAuditEntry('CURRICULUM_SUBJECT_ADDED', `Added course ${course.code} for ${course.department}`);
              }}
              onAddInstructor={(inst) => {
                setInstructors((prev) => [inst, ...prev]);
                addAuditEntry('INSTRUCTOR_APPOINTED', `Appointed instructor ${inst.name} for ${inst.department}`);
              }}
              onAddAuditLog={addAuditEntry}
              onSelectStudentProfile={(studentId) => {
                setSelectedStudentId(studentId);
                setActiveTab('analytics');
              }}
            />
          )}

          {currentUser?.role !== 'Student' && activeTab === 'gradebook' && (
            <Gradebook
              students={students}
              courses={courses}
              grades={grades}
              currentUser={currentUser}
              currentLang={currentLang}
              selectedDepartment={selectedDepartment}
              onUpdateGrade={handleUpdateGrade}
              onAddGrade={handleAddGrade}
              onApproveGrades={handleApproveGrades}
            />
          )}

          {currentUser?.role !== 'Student' && activeTab === 'attendance' && (
            <AttendanceTracker
              students={students}
              courses={courses}
              attendanceRecords={attendanceRecords}
              currentLang={currentLang}
              selectedDepartment={selectedDepartment}
              onRecordAttendance={handleRecordAttendance}
            />
          )}

          {currentUser?.role !== 'Student' && activeTab === 'analytics' && (
            <StudentAnalytics
              students={students}
              courses={courses}
              currentLang={currentLang}
              selectedDepartment={selectedDepartment}
              selectedStudentId={selectedStudentId}
              onSelectStudent={setSelectedStudentId}
              onUpdateStudent={handleUpdateStudent}
            />
          )}

          {currentUser?.role !== 'Student' && activeTab === 'reports' && (
            <ReportsAndCompliance
              students={students}
              courses={courses}
              auditLogs={auditLogs}
              currentLang={currentLang}
              selectedDepartment={selectedDepartment}
            />
          )}

          {currentUser?.role !== 'Student' && activeTab === 'import' && (
            <BulkStudentImport
              existingStudents={students}
              currentUser={currentUser}
              currentLang={currentLang}
              selectedDepartment={selectedDepartment}
              onImportStudents={handleImportStudents}
              onNavigateTab={setActiveTab}
            />
          )}

          {currentUser?.role !== 'Student' && activeTab === 'monitoring' && (
            <RealTimeMonitoring
              currentLang={currentLang}
              onForceSync={handleForceSync}
              isSyncing={isSyncing}
            />
          )}

          {currentUser?.role !== 'Student' && activeTab === 'rbac' && (
            <RBACManager
              permissions={permissions}
              currentLang={currentLang}
              onUpdatePermissions={(updated) => {
                setPermissions(updated);
                addAuditEntry('RBAC_PERMISSIONS_UPDATED', 'Updated staff permission matrix');
              }}
            />
          )}

          {currentUser?.role !== 'Student' && activeTab === 'audit' && (
            <AuditLogs
              auditLogs={auditLogs}
              currentLang={currentLang}
              selectedDepartment={selectedDepartment}
            />
          )}

          {currentUser?.role !== 'Student' && activeTab === 'backups' && (
            <BackupManager currentLang={currentLang} />
          )}
        </main>
      </div>

      {/* Intervention Toast Alert */}
      {interventionToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-2xl border border-amber-300 max-w-md animate-bounce">
          {interventionToast}
        </div>
      )}

      {/* Modals & Drawers */}
      {showSessionWarning && (
        <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-fade-in">
            <div className="flex items-center space-x-3 mb-4 text-amber-600 dark:text-amber-500">
              <AlertTriangle className="w-8 h-8" />
              <h3 className="text-xl font-bold">Session Expiring Soon</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
              For security reasons, your session will automatically expire in less than 60 seconds due to inactivity. Please move your mouse or press any key to stay logged in.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => {
                  lastActivityRef.current = Date.now();
                  setShowSessionWarning(false);
                }}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition"
              >
                Keep me logged in
              </button>
            </div>
          </div>
        </div>
      )}

      <NotificationCenter
        isOpen={showNotifDrawer}
        onClose={() => setShowNotifDrawer(false)}
        notifications={notifications}
        onMarkAllAsRead={handleMarkNotifsRead}
        onSendCustomNotification={handleSendCustomNotif}
      />

      <AIAssistantModal
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
      />

      {/* Mobile App Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        currentUser={currentUser}
        onOpenMobileMenu={() => setIsOpenSidebarMobile(true)}
        onOpenApkModal={() => setShowApkModal(true)}
        unreadNotifCount={unreadNotifCount}
      />

      {/* Download Android APK GitHub Release Modal */}
      <ApkDownloadModal
        isOpen={showApkModal}
        onClose={() => setShowApkModal(false)}
        currentLang={currentLang}
      />

      {/* Vercel Insights & Analytics */}
      <Analytics />
      <SpeedInsights />
    </div>
  );
}
