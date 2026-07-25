import React from 'react';
import { Home, Package, Award, Bell, User, Sparkles } from 'lucide-react';

interface BottomNavProps {
  currentPage: string;
  setPage: (page: string) => void;
  unreadCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentPage,
  setPage,
  unreadCount
}) => {
  const menuItems = [
    { id: 'home', label: 'Asosiy', icon: Home },
    { id: 'my-ads', label: 'E\'lonlar', icon: Package },
    { id: 'premium', label: 'Premium', icon: Sparkles },
    { id: 'rating', label: 'Reyting', icon: Award },
    { id: 'notifications', label: 'Bildirish', icon: Bell, count: unreadCount },
    { id: 'profile', label: 'Profil', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 glass border-t border-[var(--border-color)] h-16 flex items-center justify-around px-2 pb-safe z-30 shadow-lg">
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentPage === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setPage(item.id)}
            className="flex flex-col items-center justify-center flex-1 h-full relative group active:scale-95 transition-transform"
          >
            <div className={`p-1 rounded-full relative transition-all duration-200 ${isActive ? 'text-[var(--color-dehqon-green)] dark:text-[var(--color-dehqon-accent)] scale-110' : 'text-zinc-500'}`}>
              <Icon className="w-5 h-5" />
              {item.count !== undefined && item.count > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                  {item.count}
                </span>
              )}
            </div>
            <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-[var(--color-dehqon-green)] dark:text-[var(--color-dehqon-accent)] font-semibold' : 'text-zinc-500'}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
