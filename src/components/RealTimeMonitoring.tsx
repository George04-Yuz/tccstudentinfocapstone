import React, { useState, useEffect } from 'react';
import {
  Activity,
  Wifi,
  Server,
  Lock,
  RefreshCw,
  Building2,
  HardDrive,
} from 'lucide-react';
import { apiUrl } from '../services/apiUrl';
import { SharedSyncStatus } from '../services/useSharedAppState';

interface RealTimeMonitoringProps {
  onForceSync: () => void;
  isSyncing: boolean;
  syncStatus: SharedSyncStatus;
}

export const RealTimeMonitoring: React.FC<RealTimeMonitoringProps> = ({
  onForceSync,
  isSyncing,
  syncStatus,
}) => {
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [latency, setLatency] = useState<number | null>(null);
  const [healthChecks, setHealthChecks] = useState(0);
  const [serverVersion, setServerVersion] = useState('');
  const [lastChecked, setLastChecked] = useState('');

  useEffect(() => {
    let isMounted = true;
    const checkServer = async () => {
      const startedAt = performance.now();
      try {
        const response = await fetch(apiUrl('health'), { cache: 'no-store' });
        const elapsed = Math.round(performance.now() - startedAt);
        if (!response.ok) throw new Error(`Health check returned ${response.status}`);
        const health: { version?: string } = await response.json();
        if (!isMounted) return;
        setServerStatus('online');
        setLatency(elapsed);
        setServerVersion(health.version || '');
        setHealthChecks((count) => count + 1);
        setLastChecked(new Date().toLocaleTimeString());
      } catch {
        if (!isMounted) return;
        setServerStatus('offline');
        setLatency(null);
        setServerVersion('');
        setLastChecked(new Date().toLocaleTimeString());
      }
    };

    void checkServer();
    const interval = setInterval(() => void checkServer(), 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const statusColor = serverStatus === 'online' ? 'text-emerald-600' : serverStatus === 'offline' ? 'text-rose-600' : 'text-amber-600';
  const statusLabel = serverStatus === 'online' ? 'Online' : serverStatus === 'offline' ? 'Offline' : 'Checking';
  const syncStatusLabel = syncStatus === 'synced' ? 'LIVE' : syncStatus === 'syncing' ? 'SYNCING' : syncStatus === 'offline' ? 'OFFLINE' : 'CONNECTING';
  const syncStatusColor = syncStatus === 'synced' ? 'text-emerald-600' : syncStatus === 'offline' ? 'text-rose-600' : 'text-amber-600';

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
            <Activity className="w-4 h-4 animate-pulse" />
            <span>Server Health Monitoring</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Application Server Status
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Server health is checked every five seconds. App data is shared through Neon and refreshed every three seconds.
          </p>
        </div>

        <button
          onClick={onForceSync}
          disabled={isSyncing}
          className="flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Checking server...' : 'Check server now'}</span>
        </button>
      </div>

      {/* KPI Real-Time Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">API Status</p>
            <h3 className={`text-2xl font-black mt-1 ${statusColor}`}>{statusLabel}</h3>
            <p className="text-[11px] text-slate-500 mt-1 font-semibold">
              {lastChecked ? `Last checked ${lastChecked}` : 'Waiting for first response'}
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 text-slate-600 border border-slate-200">
            <Wifi className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Response Time</p>
            <h3 className="text-2xl font-black font-mono text-blue-600 mt-1">{latency === null ? '--' : `${latency} ms`}</h3>
            <p className="text-[11px] text-slate-500 mt-1 font-semibold">
              Measured from this browser
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100">
            <Lock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Health Checks</p>
            <h3 className="text-2xl font-black font-mono text-indigo-600 mt-1">{healthChecks}</h3>
            <p className="text-[11px] text-slate-500 mt-1 font-semibold">
              Successful responses
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
            <Server className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Neon Shared Data</p>
            <h3 className={`text-lg font-black font-mono mt-1 ${syncStatusColor}`}>{syncStatusLabel}</h3>
            <p className="text-[11px] text-slate-500 mt-1 font-semibold">
              Cross-device app-state sync
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 text-slate-600 border border-slate-200">
            <HardDrive className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Department Server Nodes Status Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center space-x-2 border-b border-slate-100 pb-3">
          <Building2 className="w-4 h-4 text-emerald-600" />
          <span>Backend Health Endpoint</span>
        </h3>

        <div className="flex flex-col gap-3 rounded-lg border border-slate-100 bg-slate-50 p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${serverStatus === 'online' ? 'bg-emerald-500' : serverStatus === 'offline' ? 'bg-rose-500' : 'bg-amber-500'}`} />
            <div>
              <div className="font-bold text-slate-900">/api/health</div>
              <div className="text-xs text-slate-500">{serverVersion ? `Version ${serverVersion}` : 'No server version received'}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs text-slate-600">
            <Server className="h-4 w-4" /> {statusLabel}
          </div>
        </div>
      </div>
    </div>
  );
};
