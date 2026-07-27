import React, { useState } from 'react';
import { Download, User, Sun, Moon, PlusCircle, Sparkles, Bell } from 'lucide-react';

interface HeaderProps {
  currentPage: string;
  setPage: (page: string) => void;
  currentUser: any;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  unreadCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  setPage,
  currentUser,
  isDarkMode,
  toggleDarkMode,
  unreadCount = 0
}) => {
  const [lang, setLang] = useState<'UZ' | 'OZ' | 'RU' | 'EN'>('UZ');

  return (
    <header className="sticky top-0 z-40 w-full bg-[var(--bg-card)]/95 backdrop-blur-md border-b border-[var(--border-color)] transition-colors shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        
        {/* Left: Brand Logo dehqon.uz */}
        <div 
          onClick={() => setPage('home')} 
          className="flex items-center gap-1.5 cursor-pointer group select-none"
        >
          <span className="font-serif text-2xl md:text-3xl font-extrabold text-[#124E2A] dark:text-emerald-400 tracking-tight group-hover:opacity-90 transition-opacity">
            dehqon.uz
          </span>
        </div>

        {/* Center: Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 font-medium text-sm text-[var(--text-muted)]">
          <button
            onClick={() => setPage('home')}
            className={`transition-colors relative py-1 cursor-pointer ${
              currentPage === 'home' 
                ? 'text-[#124E2A] dark:text-emerald-400 font-bold border-b-2 border-[#124E2A] dark:border-emerald-400' 
                : 'hover:text-[#124E2A] dark:hover:text-emerald-400'
            }`}
          >
            Platforma
          </button>
          <button
            onClick={() => setPage('rating')}
            className={`transition-colors relative py-1 cursor-pointer ${
              currentPage === 'rating' 
                ? 'text-[#124E2A] dark:text-emerald-400 font-bold border-b-2 border-[#124E2A] dark:border-emerald-400' 
                : 'hover:text-[#124E2A] dark:hover:text-emerald-400'
            }`}
          >
            Biz haqimizda
          </button>
          <button
            onClick={() => setPage('home')}
            className={`transition-colors relative py-1 cursor-pointer ${
              currentPage === 'help' || currentPage === 'home'
                ? 'text-[#124E2A] dark:text-emerald-400 font-bold border-b-2 border-[#124E2A] dark:border-emerald-400' 
                : 'hover:text-[#124E2A] dark:hover:text-emerald-400'
            }`}
          >
            Yordam
          </button>
          <button
            onClick={() => setPage('my-ads')}
            className={`transition-colors relative py-1 cursor-pointer ${
              currentPage === 'my-ads' 
                ? 'text-[#124E2A] dark:text-emerald-400 font-bold border-b-2 border-[#124E2A] dark:border-emerald-400' 
                : 'hover:text-[#124E2A] dark:hover:text-emerald-400'
            }`}
          >
            Aloqa
          </button>
        </nav>

        {/* Right Actions: Lang Switcher, Kirish, Action button */}
        <div className="flex items-center gap-3 md:gap-4">
          
          {/* Language Selector Pill [ UZ | OZ | RU | EN ] */}
          <div className="hidden sm:flex items-center bg-[var(--bg-app)] border border-[var(--border-color)] p-1 rounded-full text-[11px] font-bold text-[var(--text-muted)]">
            {(['UZ', 'OZ', 'RU', 'EN'] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                  lang === l
                    ? 'bg-[#124E2A] dark:bg-emerald-600 text-white shadow-xs'
                    : 'hover:text-[var(--text-main)]'
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-app)] text-[var(--text-main)] transition-colors cursor-pointer"
            title={isDarkMode ? 'Yorug\' rejim' : 'Qorong\'u rejim'}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-600" />}
          </button>

          {/* Notifications icon if logged in */}
          {currentUser && (
            <button
              onClick={() => setPage('notifications')}
              className="relative p-2 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-app)] text-[var(--text-main)] transition-colors cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          )}

          {/* Kirish / Profile link */}
          <button
            onClick={() => setPage(currentUser ? 'profile' : 'register')}
            className="text-xs md:text-sm font-semibold text-[var(--text-main)] hover:text-[#124E2A] dark:hover:text-emerald-400 transition-colors flex items-center gap-1.5 cursor-pointer px-2"
          >
            <User className="w-4 h-4 text-[#124E2A] dark:text-emerald-400" />
            <span>{currentUser ? `${currentUser.first_name}` : 'Kirish'}</span>
          </button>

          {/* Green Action Pill Button "Yuklab olish" / "E'lon berish" */}
          <button
            onClick={() => setPage(currentUser ? 'my-ads' : 'register')}
            className="bg-[#124E2A] hover:bg-[#0D3B1F] dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white text-xs md:text-sm font-bold px-4 md:px-5 py-2.5 rounded-full flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Yuklab olish</span>
          </button>

        </div>

      </div>
    </header>
  );
};
