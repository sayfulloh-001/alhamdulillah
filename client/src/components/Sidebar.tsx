import React from 'react';
import { Home, Package, Award, Bell, User, ShieldAlert, Leaf, Sun, Moon, Sparkles } from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  setPage: (page: string) => void;
  unreadCount: number;
  isAdmin: boolean;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  setPage,
  unreadCount,
  isAdmin,
  isDarkMode,
  toggleDarkMode
}) => {
  const menuItems = [
    { id: 'home', label: 'Asosiy', icon: Home },
    { id: 'my-ads', label: 'E\'lonlar', icon: Package },
    { id: 'premium', label: 'Premium', icon: Sparkles },
    { id: 'rating', label: 'Reyting', icon: Award },
    { id: 'notifications', label: 'Bildirishnoma', icon: Bell, count: unreadCount },
    { id: 'profile', label: 'Profil', icon: User },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-[var(--bg-card)] border-r border-[var(--border-color)] h-screen sticky top-0 p-5 justify-between z-20">
      <div className="space-y-8">
        {/* Brand Logo & Slogan */}
        <div className="flex flex-col gap-1 items-start pl-2 cursor-pointer" onClick={() => setPage('home')}>
          <div className="flex items-center gap-2 text-[var(--color-dehqon-green)] dark:text-[var(--color-dehqon-accent)] font-bold text-2xl">
            <Leaf className="w-7 h-7 fill-[var(--color-dehqon-green)]/10" />
            <span>Dehqon</span>
          </div>
          <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-semibold">
            Market
          </span>
        </div>

        {/* Menu Navigation */}
        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-all group active:scale-[0.98] ${
                  isActive
                    ? 'bg-[var(--color-dehqon-green)] text-white shadow-md shadow-green-950/10'
                    : 'text-[var(--text-main)] hover:bg-[var(--dehqon-light)] dark:hover:bg-zinc-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-white' : 'text-zinc-500 dark:text-zinc-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && item.count > 0 && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-white text-[var(--color-dehqon-green)]' : 'bg-red-500 text-white'}`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}

          {/* Admin Panel Item (Visible if user role is Admin) */}
          {isAdmin && (
            <button
              onClick={() => setPage('admin')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all group active:scale-[0.98] ${
                currentPage === 'admin'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20'
              }`}
            >
              <ShieldAlert className="w-5 h-5 text-amber-500 animate-pulse" />
              <span>Admin Panel</span>
            </button>
          )}
        </nav>
      </div>

      {/* Slogan at Bottom & Dark Mode Trigger */}
      <div className="space-y-4">
        <button
          onClick={toggleDarkMode}
          className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-[var(--border-color)] hover:bg-[var(--dehqon-light)] dark:hover:bg-zinc-800/50 transition-colors"
        >
          <span className="text-sm font-medium text-[var(--text-main)]">Mavzu</span>
          {isDarkMode ? (
            <Sun className="w-5 h-5 text-amber-500" />
          ) : (
            <Moon className="w-5 h-5 text-zinc-500" />
          )}
        </button>

        <div className="p-3 bg-[var(--color-dehqon-light)] dark:bg-zinc-800/30 rounded-xl">
          <p className="text-[11px] text-[var(--color-dehqon-green)] dark:text-[var(--color-dehqon-accent)] font-semibold text-center italic">
            "Dehqondan xaridorga bevosita."
          </p>
        </div>
      </div>
    </aside>
  );
};
