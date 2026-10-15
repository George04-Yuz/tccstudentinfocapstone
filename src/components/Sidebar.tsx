import React, { useState } from 'react';
import { User, Language, RolePermissions } from '../types';
import { t } from '../utils/i18n';
import {
  LayoutDashboard,
  User as UserIcon,
  CalendarCheck,
  Calendar,
  CreditCard,
  Bell,
  Clock,
  GraduationCap,
  Award,
  ShieldAlert,
  BookOpenCheck,
  BarChart3,
  FileSpreadsheet,
  UserPlus,
  Activity,
  History,
  CloudUpload,
  Lock,
  Building2,
  ChevronDown,
  ChevronRight,
  FolderTree,
  Smartphone,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  currentLang: Language;
  currentUser: User | null;
  permissions: RolePermissions;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  selectedDepartment: string;
  onSelectDepartment: (dept: string) => void;
  onOpenApkModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  currentLang,
  currentUser,
  permissions,
  isOpenMobile,
  onCloseMobile,
  selectedDepartment,
  onSelectDepartment,
  onOpenApkModal,
}) => {
  const departments = [
    'All Departments',
    'BS Information Technology',
    'BS Business Administration',
    'BS Criminology',
  ];

  // Collapsible accordion states
  const [isDeptsExpanded, setIsDeptsExpanded] = useState<boolean>(true);
  const [expandedDeptName, setExpandedDeptName] = useState<string | null>(selectedDepartment || 'BS Information Technology');

  const studentMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, allowed: true },
    { id: 'profile', label: 'Full Student Profile', icon: UserIcon, allowed: true },
    { id: 'schedule', label: 'My Class Schedule', icon: CalendarCheck, allowed: true },
    { id: 'timetable', label: 'Weekly Timetable', icon: Calendar, allowed: true },
    { id: 'attendance', label: 'My Attendance', icon: Clock, allowed: true },
    { id: 'grades', label: 'My Grades', icon: Award, allowed: true },
    { id: 'news', label: 'News & Events', icon: Bell, allowed: true },
    { id: 'admin', label: 'System Admin Console', icon: ShieldAlert, allowed: permissions.manageRBAC || currentUser?.role === 'Admin' },
  ];

  const adminMenuItems = [
    { id: 'dashboard', label: t(currentLang, 'dashboard'), icon: LayoutDashboard, allowed: true },
    { id: 'schedules', label: 'Class Schedules & Curriculum', icon: Calendar, allowed: true },
    { id: 'gradebook', label: t(currentLang, 'gradebook'), icon: BookOpenCheck, allowed: permissions.manageGrades || permissions.approveGrades },
    { id: 'attendance', label: t(currentLang, 'attendance'), icon: CalendarCheck, allowed: permissions.takeAttendance },
    { id: 'analytics', label: t(currentLang, 'analytics'), icon: BarChart3, allowed: permissions.viewAnalytics },
    { id: 'reports', label: t(currentLang, 'reports'), icon: FileSpreadsheet, allowed: permissions.exportReports },
    { id: 'import', label: t(currentLang, 'bulkImport'), icon: UserPlus, allowed: permissions.importStudents !== false },
    { id: 'monitoring', label: t(currentLang, 'monitoring'), icon: Activity, allowed: true },
    { id: 'rbac', label: t(currentLang, 'rbac'), icon: ShieldAlert, allowed: permissions.manageRBAC || currentUser?.role === 'Admin' },
    { id: 'audit', label: t(currentLang, 'auditLogs'), icon: History, allowed: permissions.viewAuditLogs },
    { id: 'backups', label: t(currentLang, 'backups'), icon: CloudUpload, allowed: permissions.manageBackups || currentUser?.role === 'Admin' },
  ];

  const menuItems = currentUser?.role === 'Student' ? studentMenuItems : adminMenuItems;

  const handleDeptSubViewClick = (deptName: string, tabId: string) => {
    onSelectDepartment(deptName);
    onSelectTab(tabId);
    onCloseMobile();
  };

  const content = (
    <div className="flex flex-col h-full bg-[#111827] border-r border-slate-800/80 text-slate-300 w-64 p-4 select-none shrink-0">
      {/* Branding Header Block */}
      <div className="mb-5 text-center pb-4 border-b border-slate-800/80">
        <div className="text-xl font-black text-white tracking-widest font-sans">TCC</div>
        <div className="text-[11px] font-bold text-slate-300 uppercase tracking-tight mt-0.5">
          TORRES CAPITOL COLLEGE
        </div>
        <div className="my-1.5 inline-block px-2 py-0.5 text-[9px] font-mono font-bold text-slate-400 bg-slate-900 rounded border border-slate-800">
          WISSMS v1.5
        </div>
        <p className="text-[10px] text-slate-400 leading-tight max-w-[190px] mx-auto mb-2.5 font-medium">
          Web Integrated Smart School Management System
        </p>
        <div className="inline-block px-3 py-1 text-[9px] font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 rounded-full">
          {currentUser?.role === 'Student'
            ? 'STUDENT'
            : currentUser?.role === 'Admin'
            ? 'SYSTEM ADMIN'
            : `${currentUser?.role?.toUpperCase() || 'STAFF'} • ${currentUser?.department?.replace('BS ', '') || 'DEPT'}`}
        </div>
      </div>

      {/* Collapsible Department Sub-menus Section for Non-Students */}
      {currentUser?.role !== 'Student' && (
        <div className="mb-4 rounded-xl bg-slate-900/90 border border-slate-800/80 overflow-hidden shadow-xs transition-all">
          <button
            type="button"
            onClick={() => setIsDeptsExpanded(!isDeptsExpanded)}
            className="w-full flex items-center justify-between p-3 text-xs font-bold text-slate-200 hover:bg-slate-800/60 transition cursor-pointer"
          >
            <div className="flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-blue-400" />
              <span>Academic Departments</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="text-[9px] px-1.5 py-0.5 bg-blue-950 text-blue-300 rounded border border-blue-800 font-mono">
                {selectedDepartment === 'All Departments' ? 'ALL' : selectedDepartment.split(' ')[1] || 'DEPT'}
              </span>
              {isDeptsExpanded ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              )}
            </div>
          </button>

          {isDeptsExpanded && (
            <div className="p-2 pt-0 space-y-1 border-t border-slate-800/60 bg-slate-950/40 text-xs">
              {(currentUser?.role === 'Admin'
                ? departments
                : departments.filter((d) => d === currentUser?.department)
              ).map((dept) => {
                const isSelectedDept = selectedDepartment === dept;
                const isExpanded = expandedDeptName === dept;

                return (
                  <div key={dept} className="rounded-lg overflow-hidden border border-slate-800/40">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectDepartment(dept);
                        setExpandedDeptName(isExpanded ? null : dept);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 text-[11px] font-semibold transition ${
                        isSelectedDept
                          ? 'bg-blue-600/20 text-blue-300 border-l-2 border-l-blue-500 font-bold'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                      }`}
                    >
                      <span className="truncate">{dept === 'All Departments' ? '🌐 All Departments' : dept}</span>
                      {isExpanded ? (
                        <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                      ) : (
                        <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                      )}
                    </button>

                    {/* Collapsible Sub-views under Department */}
                    {isExpanded && (
                      <div className="pl-3 pr-1 py-1 space-y-0.5 bg-slate-900/80 border-t border-slate-800/50 text-[10px]">
                        <button
                          onClick={() => handleDeptSubViewClick(dept, 'dashboard')}
                          className={`w-full flex items-center space-x-2 px-2 py-1 rounded transition ${
                            isSelectedDept && activeTab === 'dashboard'
                              ? 'bg-blue-600 text-white font-bold'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800'
                          }`}
                        >
                          <LayoutDashboard className="w-3 h-3 text-blue-400" />
                          <span>Overview Dashboard</span>
                        </button>

                        {permissions.manageGrades && (
                          <button
                            onClick={() => handleDeptSubViewClick(dept, 'gradebook')}
                            className={`w-full flex items-center space-x-2 px-2 py-1 rounded transition ${
                              isSelectedDept && activeTab === 'gradebook'
                                ? 'bg-blue-600 text-white font-bold'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                          >
                            <BookOpenCheck className="w-3 h-3 text-emerald-400" />
                            <span>Gradebook Roster</span>
                          </button>
                        )}

                        {permissions.takeAttendance && (
                          <button
                            onClick={() => handleDeptSubViewClick(dept, 'attendance')}
                            className={`w-full flex items-center space-x-2 px-2 py-1 rounded transition ${
                              isSelectedDept && activeTab === 'attendance'
                                ? 'bg-blue-600 text-white font-bold'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                          >
                            <Clock className="w-3 h-3 text-amber-400" />
                            <span>Attendance Logs</span>
                          </button>
                        )}

                        {permissions.viewAnalytics && (
                          <button
                            onClick={() => handleDeptSubViewClick(dept, 'analytics')}
                            className={`w-full flex items-center space-x-2 px-2 py-1 rounded transition ${
                              isSelectedDept && activeTab === 'analytics'
                                ? 'bg-blue-600 text-white font-bold'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                          >
                            <BarChart3 className="w-3 h-3 text-violet-400" />
                            <span>Student Analytics</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Main Navigation */}
      <div className="flex-1 space-y-1.5 overflow-y-auto pr-1 scrollbar-hide">
        {currentUser?.role !== 'Student' && (
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 px-3 mb-2">
            Academic Operations
          </div>
        )}
        {menuItems.map((item) => {
          if (!item.allowed) return null;
          const Icon = item.icon;
          const isActive = activeTab === item.id || (activeTab === 'dashboard' && item.id === 'schedule' && currentUser?.role === 'Student');

          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectTab(item.id);
                onCloseMobile();
              }}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs transition-all duration-150 ${
                isActive
                  ? 'bg-white text-slate-900 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-900' : 'text-slate-400'}`}
              />
              <span className="flex-1 text-left truncate">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Download Android APK Direct Action Button */}
      {onOpenApkModal && (
        <div className="pt-2 pb-2">
          <button
            onClick={() => {
              onOpenApkModal();
              onCloseMobile();
            }}
            className="w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs bg-gradient-to-r from-emerald-600/20 to-blue-600/20 hover:from-emerald-600/30 hover:to-blue-600/30 text-emerald-300 border border-emerald-500/30 transition shadow-sm font-semibold group"
          >
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 group-hover:scale-105 transition-transform shrink-0">
              <Smartphone className="w-4 h-4" />
            </div>
            <div className="text-left flex-1 truncate">
              <div className="text-[11px] font-bold text-white leading-tight">Android APK</div>
              <div className="text-[9px] text-emerald-400/90 leading-tight">GitHub Release v1.0</div>
            </div>
            <span className="text-[9px] bg-emerald-500 text-slate-950 font-bold px-1.5 py-0.5 rounded-full">
              APK
            </span>
          </button>
        </div>
      )}

      {/* Security & System Info Footer */}
      <div className="mt-auto pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-2">
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center space-x-2">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-300 font-semibold text-[10px]">{t(currentLang, 'encryptionStatus')}</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
        <p className="text-[9px] text-center text-slate-500">
          Torres Capitol College © 2026
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block h-[calc(100vh-61px)] sticky top-[61px] shrink-0">
        {content}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative flex-1 max-w-xs w-full bg-slate-900 shadow-2xl z-10">
            {content}
          </div>
        </div>
      )}
    </>
  );
};

