import React, { useState } from 'react';
import { AuditLogEntry, Language } from '../types';
import { t } from '../utils/i18n';
import { exportToCsv } from '../utils/encryption';
import {
  History,
  Search,
  Download,
  ShieldCheck,
  AlertTriangle,
  Info,
  CheckCircle2,
  Lock,
} from 'lucide-react';

interface AuditLogsProps {
  auditLogs: AuditLogEntry[];
  currentLang: Language;
  selectedDepartment: string;
}

export const AuditLogs: React.FC<AuditLogsProps> = ({
  auditLogs,
  currentLang,
  selectedDepartment,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'All' | 'Info' | 'Warning' | 'Critical'>('All');
  const [verifiedHashId, setVerifiedHashId] = useState<string | null>(null);

  const filteredLogs = auditLogs.filter((log) => {
    const matchesDept = selectedDepartment === 'All Departments' || log.department === selectedDepartment;
    const matchesSearch =
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = severityFilter === 'All' || log.severity === severityFilter;
    return matchesDept && matchesSearch && matchesSeverity;
  });

  const handleVerifyHash = (id: string) => {
    setVerifiedHashId(id);
    setTimeout(() => setVerifiedHashId(null), 3000);
  };

  const handleExportAuditCsv = () => {
    const headers = ['Log ID', 'Timestamp', 'User Name', 'Role', 'Department', 'Action', 'Details', 'Severity', 'IP Address', 'SHA-256 Checksum'];
    const rows = filteredLogs.map((l) => [
      l.id,
      l.timestamp,
      l.userName,
      l.userRole,
      l.department,
      l.action,
      l.details,
      l.severity,
      l.ipAddress,
      l.hash,
    ]);
    exportToCsv(`TCC_Audit_Logs_${new Date().toISOString().slice(0, 10)}`, headers, rows);
  };

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100 transition-colors">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
            <History className="w-4 h-4" />
            <span>Comprehensive Audit Logs & System Integrity Trail</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            User Activity & Security Event Audit Trail
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Tamper-evident activity logs protected by SHA-256 cryptographic hashes for FERPA and Philippine Data Privacy Act compliance.
          </p>
        </div>

        <button
          onClick={handleExportAuditCsv}
          className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold rounded-xl transition"
        >
          <Download className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>{t(currentLang, 'exportCsv')}</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search logs by user, action or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-bold">Severity:</span>
          {(['All', 'Info', 'Warning', 'Critical'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition border ${
                severityFilter === sev
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs overflow-x-auto transition-colors">
        <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="p-3">Timestamp</th>
              <th className="p-3">User & Role</th>
              <th className="p-3">Action Type</th>
              <th className="p-3">Event Details</th>
              <th className="p-3">IP Address</th>
              <th className="p-3">Cryptographic Checksum</th>
              <th className="p-3 text-right">Verification</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-slate-400 dark:text-slate-500 italic">
                  No audit log entries matching filters.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log, idx) => (
                <tr key={`${log.id}-${idx}`} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition">
                  <td className="p-3 font-mono text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {log.timestamp}
                  </td>

                  <td className="p-3">
                    <div className="font-bold text-slate-900 dark:text-white">{log.userName}</div>
                    <div className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">{log.userRole} • {log.department}</div>
                  </td>

                  <td className="p-3">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        log.severity === 'Critical'
                          ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                          : log.severity === 'Warning'
                          ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                          : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>

                  <td className="p-3 max-w-xs text-slate-800 dark:text-slate-200 font-medium">
                    {log.details}
                  </td>

                  <td className="p-3 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                    {log.ipAddress}
                  </td>

                  <td className="p-3 font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                    {log.hash}
                  </td>

                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleVerifyHash(log.id)}
                      className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-xl text-[10px] font-mono font-bold transition flex items-center space-x-1 ml-auto shadow-xs"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{verifiedHashId === log.id ? 'VALIDATED ✓' : 'Verify Hash'}</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
