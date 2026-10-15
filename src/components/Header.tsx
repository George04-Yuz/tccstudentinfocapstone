import React, { useState, useRef, useEffect } from 'react';
import { User, Language, Student, ThemeMode } from '../types';
import { t } from '../utils/i18n';
import { getStoredTheme, saveTheme } from '../utils/theme';
import {
  ShieldCheck,
  RefreshCw,
  Bell,
  Globe,
  User as UserIcon,
  LogOut,
  LogIn,
  Menu,
  Wifi,
  Search,
  X,
  Sun,
  Moon,
  Laptop,
  Check,
  Clock,
} from 'lucide-react';

interface HeaderProps {
  currentUser: User | null;
  currentLang: Language;
  onSelectLang: (lang: Language) => void;
  unreadNotifCount: number;
  onOpenNotifications: () => void;
  onOpenLogin?: () => void;
  onLogout: () => void;
  onToggleSidebarMobile: () => void;
  onForceSync: () => void;
  isSyncing: boolean;
  onOpenAiAssistant?: () => void;
  onOpenApkModal?: () => void;
  students?: Student[];
  onSelectStudent?: (studentId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  currentLang,
  onSelectLang,
  unreadNotifCount,
  onOpenNotifications,
  onOpenLogin,
  onLogout,
  onToggleSidebarMobile,
  onForceSync,
  isSyncing,
  students = [],
  onSelectStudent,
}) => {
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>('system');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const themeMenuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentTheme(getStoredTheme());
  }, []);

  const handleSelectTheme = (mode: ThemeMode) => {
    setCurrentTheme(mode);
    saveTheme(mode);
    setShowThemeMenu(false);
  };

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'tl', label: 'Filipino / Tagalog', flag: '🇵🇭' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'zh', label: '中文 (繁簡)', flag: '🇨🇳' },
  ];

  const themeOptions: { mode: ThemeMode; label: string; icon: React.FC<{ className?: string }> }[] = [
    { mode: 'light', label: 'Light Mode', icon: Sun },
    { mode: 'dark', label: 'Dark Mode', icon: Moon },
    { mode: 'system', label: 'System Default', icon: Laptop },
  ];

  // Filter students by name or ID for quick lookup, scoped to department for non-admin staff
  const searchResults = searchQuery.trim()
    ? students
        .filter((s) => {
          if (currentUser?.role && currentUser.role !== 'Admin' && currentUser.department) {
            if (s.department !== currentUser.department) return false;
          }
          return (
            s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.studentNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (s.contactNumber && s.contactNumber.includes(searchQuery))
          );
        })
        .slice(0, 5)
    : [];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setShowThemeMenu(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setShowLangMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectStudentResult = (studentId: string) => {
    if (onSelectStudent) {
      onSelectStudent(studentId);
    }
    setSearchQuery('');
    setIsSearchOpen(false);
  };

  const ActiveThemeIcon =
    currentTheme === 'light' ? Sun : currentTheme === 'dark' ? Moon : Laptop;

  // Format initials for user pill
  const userInitials = currentUser?.name
    ? currentUser.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'PA';

  return (
    <header className="sticky top-0 z-30 bg-slate-100/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 px-4 md:px-6 py-2 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Mobile Toggle & Dark User Pill */}
        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={onToggleSidebarMobile}
            className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
            aria-label="Toggle Sidebar"
          >
            <Menu className="w-6 h-6" />
          </button>

          {currentUser ? (
            <div className="bg-[#111827] text-white rounded-full px-2.5 sm:px-3 py-1 flex items-center space-x-2 sm:space-x-3 shadow-md border border-slate-800">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-800 text-white font-extrabold text-xs flex items-center justify-center border border-slate-700 shrink-0">
                {userInitials}
              </div>
              <div className="pr-1 text-left hidden sm:block">
                <div className="text-xs font-black tracking-wide text-white leading-tight flex items-center space-x-1.5">
                  <span className="truncate max-w-[120px]">{currentUser.name}</span>
                  <span className="text-[10px] font-normal text-slate-300 bg-slate-800 px-1.5 py-0.2 rounded font-mono hidden md:inline">
                    {currentUser.role === 'Student'
                      ? 'Student'
                      : currentUser.role === 'Admin'
                      ? 'System Administrator'
                      : `${currentUser.role} • ${currentUser.department?.replace('BS ', '') || 'Faculty'}`}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-medium font-mono leading-tight truncate max-w-[160px]">
                  {currentUser.email}
                </div>
              </div>
              {/* On mobile screens, show short first name */}
              <span className="text-xs font-bold text-white sm:hidden truncate max-w-[80px]">
                {currentUser.name.split(' ')[0]}
              </span>
            </div>
          ) : (
            <div className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[150px]">
              Torres Capitol College
            </div>
          )}
        </div>

        {/* Middle: Global Search Bar */}
        <div className="flex-1 max-w-sm relative hidden lg:block" ref={searchRef}>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Search student by name or ID..."
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full pl-9 pr-8 py-1.5 text-xs text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setIsSearchOpen(false);
                }}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Autocomplete Search Dropdown */}
          {isSearchOpen && searchQuery.trim() !== '' && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
              {searchResults.length === 0 ? (
                <div className="p-3 text-center text-xs text-slate-500 italic">
                  No matches found
                </div>
              ) : (
                searchResults.map((std) => (
                  <button
                    key={std.id}
                    onClick={() => handleSelectStudentResult(std.id)}
                    className="w-full p-2.5 text-left flex items-center justify-between hover:bg-blue-50 dark:hover:bg-slate-800 transition"
                  >
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {std.name} <span className="text-[10px] text-slate-400">({std.studentNo})</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Right Controls: Network Latency, Time, Notifications, Chat, Logout */}
        <div className="flex items-center space-x-2 shrink-0">
          {/* Latency Pill */}
          <div className="hidden sm:flex items-center space-x-1 px-2.5 py-1 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 text-[11px] font-mono text-slate-600 dark:text-slate-300 shadow-xs">
            <Wifi className="w-3 h-3 text-emerald-500" />
            <span>175ms</span>
          </div>

          {/* Live Date / Time Badge */}
          <div className="hidden md:flex items-center space-x-1 px-3 py-1 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 text-[11px] font-medium text-slate-600 dark:text-slate-300 shadow-xs">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>Sat • Aug 15, 1:36:23 PM</span>
          </div>



          {/* Theme Selector */}
          <div className="relative" ref={themeMenuRef}>
            <button
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              className="p-2 rounded-full bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition"
              title="Theme Selector"
            >
              <ActiveThemeIcon className="w-4 h-4 text-blue-600 dark:text-amber-400" />
            </button>
            {showThemeMenu && (
              <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-1 z-50 text-xs">
                {themeOptions.map((opt) => (
                  <button
                    key={opt.mode}
                    onClick={() => handleSelectTheme(opt.mode)}
                    className="w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  >
                    <span>{opt.label}</span>
                    {currentTheme === opt.mode && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Language Selector */}
          <div className="relative" ref={langMenuRef}>
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="p-2 rounded-full bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition"
              title="Language"
            >
              <Globe className="w-4 h-4 text-slate-500" />
            </button>
            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-1 z-50 text-xs">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      onSelectLang(l.code);
                      setShowLangMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <span>{l.flag} {l.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications Button */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-full bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            {unreadNotifCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {unreadNotifCount}
              </span>
            )}
          </button>


          {/* Logout Button */}
          {currentUser ? (
            <button
              onClick={onLogout}
              className="p-2 rounded-full bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition"
              title={t(currentLang, 'logout')}
            >
              <LogOut className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onOpenLogin}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-blue-600 text-white font-semibold text-xs"
            >
              <LogIn className="w-4 h-4" />
              <span>Login</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};


