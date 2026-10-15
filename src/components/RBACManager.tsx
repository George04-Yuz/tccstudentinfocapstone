import React, { useState } from 'react';
import { RolePermissions, UserRole, Language } from '../types';
import { t } from '../utils/i18n';
import { ShieldAlert, Check, X, Save, Lock, Info, Key, ShieldCheck } from 'lucide-react';

interface RBACManagerProps {
  permissions: Record<string, RolePermissions>;
  currentLang: Language;
  onUpdatePermissions: (updated: Record<string, RolePermissions>) => void;
}

export const RBACManager: React.FC<RBACManagerProps> = ({
  permissions,
  currentLang,
  onUpdatePermissions,
}) => {
  const [localPermissions, setLocalPermissions] = useState<Record<string, RolePermissions>>(permissions);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const roles: UserRole[] = ['Admin', 'Dean', 'Faculty', 'Registrar', 'Advisor'];

  const permissionKeys: { key: keyof RolePermissions; label: string; description: string }[] = [
    { key: 'manageGrades', label: 'Manage & Record Grades', description: 'Enter, edit, and update student assessment scores' },
    { key: 'approveGrades', label: 'Approve & Lock Rosters', description: 'Finalize official grades and lock rosters against further edits' },
    { key: 'takeAttendance', label: 'Take Class Attendance', description: 'Record daily student attendance registers' },
    { key: 'viewAnalytics', label: 'View Student Analytics', description: 'Access student performance dashboards and GPA reports' },
    { key: 'exportReports', label: 'Export Compliance Reports', description: 'Generate and download administrative PDF and CSV reports' },
    { key: 'manageUsers', label: 'Manage Staff Accounts', description: 'Create and update faculty and staff profiles' },
    { key: 'manageRBAC', label: 'Manage Permissions (RBAC)', description: 'Modify access rights for different staff roles' },
    { key: 'viewAuditLogs', label: 'View System Audit Logs', description: 'Inspect timestamped user activity and security logs' },
    { key: 'manageBackups', label: 'Manage Cloud Backups', description: 'Create and restore cloud data backups' },
    { key: 'systemSettings', label: 'System Configuration', description: 'Configure institution-wide security policies' },
  ];

  const handleToggle = (role: string, key: keyof RolePermissions) => {
    if (role === 'Admin' && key === 'manageRBAC') return; // Admin must retain RBAC management
    setLocalPermissions((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [key]: !prev[role][key],
      },
    }));
  };

  const handleSave = () => {
    onUpdatePermissions(localPermissions);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100 transition-colors">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span>Role-Based Access Control (RBAC) & Security Policy</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Staff Permission Matrix Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Enforce granular role permissions across faculty, deans, registrars, advisors, and system administrators.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition"
        >
          <Save className="w-4 h-4" />
          <span>Save Permission Matrix</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Role-Based Access Control policy saved successfully and recorded in audit logs!</span>
        </div>
      )}

      {/* Permissions Matrix Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs overflow-x-auto transition-colors">
        <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="p-3 min-w-[220px]">System Capability / Permission</th>
              {roles.map((r) => (
                <th key={r} className="p-3 text-center min-w-[100px]">
                  <span className="font-bold text-blue-600 dark:text-blue-400">{r}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {permissionKeys.map((p) => (
              <tr key={p.key} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition">
                <td className="p-3">
                  <div className="font-bold text-slate-900 dark:text-white">{p.label}</div>
                  <div className="text-[10px] text-slate-400">{p.description}</div>
                </td>

                {roles.map((role) => {
                  const allowed = localPermissions[role]?.[p.key] ?? false;
                  return (
                    <td key={role} className="p-3 text-center">
                      <button
                        onClick={() => handleToggle(role, p.key)}
                        className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition border ${
                          allowed
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}
                        title={`${role}: ${allowed ? 'Allowed' : 'Denied'}`}
                      >
                        {allowed ? <Check className="w-4 h-4 stroke-[3]" /> : <X className="w-4 h-4" />}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
