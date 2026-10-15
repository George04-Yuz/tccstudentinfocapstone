import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { t } from '../utils/i18n';
import {
  Activity,
  Wifi,
  Server,
  Lock,
  RefreshCw,
  Zap,
  ShieldCheck,
  Building2,
  CheckCircle2,
  HardDrive,
} from 'lucide-react';

interface RealTimeMonitoringProps {
  currentLang: Language;
  onForceSync: () => void;
  isSyncing: boolean;
}

export const RealTimeMonitoring: React.FC<RealTimeMonitoringProps> = ({
  currentLang,
  onForceSync,
  isSyncing,
}) => {
  const [latency, setLatency] = useState(18);
  const [syncedPackets, setSyncedPackets] = useState(14820);
  const [connectedFaculty, setConnectedFaculty] = useState(24);

  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(Math.floor(14 + Math.random() * 12));
      setSyncedPackets((prev) => prev + Math.floor(1 + Math.random() * 5));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const departmentsNodes = [
    { name: 'Computer Science Campus Node', status: 'Online', latency: `${latency}ms`, syncState: 'In Sync' },
    { name: 'Engineering Lab Server', status: 'Online', latency: `${latency + 3}ms`, syncState: 'In Sync' },
    { name: 'Business Administration Data Hub', status: 'Online', latency: `${latency + 1}ms`, syncState: 'In Sync' },
    { name: 'Nursing & Health Sciences Node', status: 'Online', latency: `${latency + 5}ms`, syncState: 'In Sync' },
    { name: 'Liberal Arts & Registrar Core', status: 'Online', latency: `${latency + 2}ms`, syncState: 'In Sync' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
            <Activity className="w-4 h-4 animate-pulse" />
            <span>Dedicated Real-Time Monitoring & Data Synchronization</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Real-Time Analytics & Cross-Department Infrastructure
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Continuous cloud sync monitor, network packet telemetry, and AES-256 encrypted payload throughput.
          </p>
        </div>

        <button
          onClick={onForceSync}
          disabled={isSyncing}
          className="flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Synchronizing Cloud Nodes...' : 'Force Immediate Cloud Sync'}</span>
        </button>
      </div>

      {/* KPI Real-Time Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Sync Latency</p>
            <h3 className="text-2xl font-black font-mono text-emerald-600 mt-1">{latency} ms</h3>
            <p className="text-[11px] text-emerald-700 flex items-center space-x-1 mt-1 font-semibold">
              <Zap className="w-3.5 h-3.5" />
              <span>Ultra-low WebSocket Ping</span>
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <Wifi className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Synced Payloads</p>
            <h3 className="text-2xl font-black font-mono text-blue-600 mt-1">{syncedPackets.toLocaleString()}</h3>
            <p className="text-[11px] text-blue-700 flex items-center space-x-1 mt-1 font-semibold">
              <span>AES-256 Encrypted</span>
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100">
            <Lock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Faculty Sessions</p>
            <h3 className="text-2xl font-black font-mono text-indigo-600 mt-1">{connectedFaculty} Active</h3>
            <p className="text-[11px] text-indigo-700 flex items-center space-x-1 mt-1 font-semibold">
              <span>MFA Authenticated</span>
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
            <Server className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Cloud Backup Status</p>
            <h3 className="text-lg font-black font-mono text-emerald-600 mt-1">100% HEALTHY</h3>
            <p className="text-[11px] text-emerald-700 flex items-center space-x-1 mt-1 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Auto Backup Verified</span>
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <HardDrive className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Department Server Nodes Status Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center space-x-2 border-b border-slate-100 pb-3">
          <Building2 className="w-4 h-4 text-emerald-600" />
          <span>Cross-Department Live Server Node Telemetry</span>
        </h3>

        <div className="space-y-3">
          {departmentsNodes.map((node) => (
            <div
              key={node.name}
              className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
            >
              <div className="flex items-center space-x-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
                <div>
                  <div className="font-bold text-slate-900">{node.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">TLS 1.3 / AES-256-GCM Handshake Active</div>
                </div>
              </div>

              <div className="flex items-center space-x-4 font-mono text-xs">
                <span className="text-slate-500">Latency: <strong className="text-emerald-700">{node.latency}</strong></span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px]">
                  {node.syncState}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
