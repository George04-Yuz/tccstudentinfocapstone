import React from 'react';
import {
  LayoutDashboard,
  Award,
  CalendarCheck,
  Calendar,
  BookOpenCheck,
  BarChart3,
  Smartphone,
  Menu,
  Clock,
} from 'lucide-react';
import { User } from '../types';

interface MobileBottomNavProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  currentUser: User | null;
  onOpenMobileMenu: () => void;
  onOpenApkModal: () => void;
  unreadNotifCount?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  currentUser,
  onOpenMobileMenu,
  onOpenApkModal,
  unreadNotifCount = 0,
}) => {
  const isStudent = currentUser?.role === 'Student';

  const navItems = isStudent
    ? [
        { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
        { id: 'grades', label: 'Grades', icon: Award },
        { id: 'schedule', label: 'Classes', icon: CalendarCheck },
        { id: 'timetable', label: 'Timetable', icon: Calendar },
      ]
    : [
        { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
        { id: 'gradebook', label: 'Grades', icon: BookOpenCheck },
        { id: 'attendance', label: 'Attendance', icon: Clock },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
      ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 text-slate-300 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-2xl transition-all">
      <div className="grid grid-cols-6 h-14 items-center px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center h-full min-h-[44px] py-1 transition-all ${
                isActive
                  ? 'text-blue-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-4 h-4 transition-transform ${isActive ? 'scale-110 text-blue-400' : ''}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-400 rounded-full" />
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[48px]">
                {item.label}
              </span>
            </button>
          );
        })}

        {/* Direct Mobile APK Download Button */}
        <button
          onClick={onOpenApkModal}
          className="flex flex-col items-center justify-center h-full min-h-[44px] py-1 text-emerald-400 hover:text-emerald-300 transition-all relative"
          title="Download APK"
        >
          <div className="relative p-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
          </div>
          <span className="text-[10px] font-bold mt-0.5 tracking-tight text-emerald-300">
            APK
          </span>
        </button>

        {/* All Modules / Hamburger Menu */}
        <button
          onClick={onOpenMobileMenu}
          className="flex flex-col items-center justify-center h-full min-h-[44px] py-1 text-slate-400 hover:text-white transition-all relative"
        >
          <div className="relative">
            <Menu className="w-4 h-4" />
            {unreadNotifCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full" />
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">
            Menu
          </span>
        </button>
      </div>
    </nav>
  );
};
