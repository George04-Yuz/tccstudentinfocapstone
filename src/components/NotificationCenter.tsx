import React, { useState } from 'react';
import { PushNotification, Language } from '../types';
import { t } from '../utils/i18n';
import { Bell, AlertTriangle, CheckCircle2, ShieldAlert, Plus, Send } from 'lucide-react';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: PushNotification[];
  onMarkAllAsRead: () => void;
  onSendCustomNotification: (notif: PushNotification) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onSendCustomNotification,
}) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<'Compliance' | 'Grade' | 'Attendance' | 'System' | 'Security'>('System');
  const [type, setType] = useState<'info' | 'warning' | 'critical' | 'sync'>('warning');

  if (!isOpen) return null;

  const handleSendSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;

    const newNotif: PushNotification = {
      id: `notif-${Date.now()}`,
      title,
      message,
      timestamp: 'Just now',
      type,
      read: false,
      category,
    };
    onSendCustomNotification(newNotif);
    setTitle('');
    setMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border-l border-slate-200/80 dark:border-slate-800 w-full max-w-md h-full shadow-2xl flex flex-col text-slate-900 dark:text-slate-100 transition-colors">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">System Updates & Push Alerts</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onMarkAllAsRead}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-bold"
            >
              Mark all as read
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-bold"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-8">No unread push notifications.</p>
          ) : (
            notifications.map((notif, idx) => (
              <div
                key={`${notif.id}-${idx}`}
                className={`p-3.5 rounded-xl border text-xs transition ${
                  notif.read
                    ? 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400'
                    : 'bg-white dark:bg-slate-800 border-slate-200/80 dark:border-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`font-bold text-[10px] uppercase px-2 py-0.5 rounded-full ${
                      notif.type === 'critical'
                        ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                        : notif.type === 'warning'
                        ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                        : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                    }`}
                  >
                    {notif.category}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{notif.timestamp}</span>
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-xs">{notif.title}</h4>
                <p className="text-slate-600 dark:text-slate-300 mt-1">{notif.message}</p>
              </div>
            ))
          )}
        </div>

        {/* Push Alert Trigger Form Simulator */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
          <h4 className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-2 flex items-center space-x-1">
            <Send className="w-3.5 h-3.5" />
            <span>Simulate Critical Update Push Notification</span>
          </h4>

          <form onSubmit={handleSendSubmit} className="space-y-2 text-xs">
            <input
              type="text"
              placeholder="Notification Title (e.g. Schedule Change)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Message body..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <div className="flex space-x-2">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-1/2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-[11px] text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="Compliance">Compliance</option>
                <option value="Grade">Grade</option>
                <option value="Attendance">Attendance</option>
                <option value="System">System</option>
                <option value="Security">Security</option>
              </select>
              <button
                type="submit"
                className="w-1/2 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-500/20 transition"
              >
                Broadcast Push
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
