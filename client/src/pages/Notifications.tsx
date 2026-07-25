import React, { useState, useEffect } from 'react';
import { Bell, Sparkles, AlertTriangle, Eye, CheckCircle, RefreshCw } from 'lucide-react';
import { apiRequest } from '../utils/api';

interface NotificationItem {
  id: number;
  user_id: number;
  title: string;
  message: string;
  is_read: number;
  created_at: string;
}

interface NotificationsProps {
  fetchNotificationsCount: () => void;
}

export const Notifications: React.FC<NotificationsProps> = ({ fetchNotificationsCount }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await apiRequest('/notifications');
      setNotifications(data);
      // Automatically mark all as read when user opens the page
      if (data.some((n: NotificationItem) => n.is_read === 0)) {
        await apiRequest('/notifications/read-all', { method: 'PUT' });
        fetchNotificationsCount(); // Update the sidebar count badge
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('premium') && t.includes('faol')) return <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500/10" />;
    if (t.includes('rad') || t.includes('qabul qilinmadi')) return <AlertTriangle className="w-5 h-5 text-red-500" />;
    if (t.includes('ko\'rildi') || t.includes('👁️')) return <Eye className="w-5 h-5 text-blue-500" />;
    if (t.includes('sotildi') || t.includes('🎉')) return <CheckCircle className="w-5 h-5 text-emerald-500" />;
    return <Bell className="w-5 h-5 text-zinc-500" />;
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6 max-w-2xl mx-auto">
      
      <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-3">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-[var(--text-main)]">Bildirishnomalar</h2>
          <p className="text-xs text-[var(--text-muted)]">Premium statusi va e'lonlaringizga oid bildirishnomalar.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 space-y-2">
          <RefreshCw className="w-8 h-8 text-[var(--color-dehqon-green)] animate-spin mx-auto" />
          <p className="text-xs text-[var(--text-muted)]">Bildirishnomalar yangilanmoqda...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-12 text-center rounded-3xl space-y-4">
          <div className="w-14 h-14 bg-[var(--dehqon-light)] text-[var(--color-dehqon-green)] rounded-full flex items-center justify-center mx-auto shadow-inner">
            <Bell className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-base text-[var(--text-main)]">Hozircha bildirishnomalar yo'q</h3>
            <p className="text-xs text-[var(--text-muted)] max-w-xs mx-auto">Tizimdagi faolliklar va chek tasdiqlari shu yerda ko'rinadi.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 bg-[var(--bg-card)] border rounded-2xl flex gap-3.5 hover:shadow-sm transition-shadow relative ${
                n.is_read === 0 ? 'border-l-4 border-l-[var(--color-dehqon-green)] border-[var(--border-color)]' : 'border-[var(--border-color)]'
              }`}
            >
              <div className="p-2.5 bg-[var(--bg-app)] rounded-xl border border-[var(--border-color)] shrink-0 self-start">
                {getIcon(n.title)}
              </div>

              <div className="space-y-1 pr-4">
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-sm text-[var(--text-main)] leading-none">{n.title}</h4>
                  {n.is_read === 0 && (
                    <span className="bg-emerald-50 dark:bg-emerald-950 text-emerald-600 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">Yangi</span>
                  )}
                </div>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed font-light">{n.message}</p>
                <span className="text-[9px] text-[var(--text-muted)] block font-medium">
                  {new Date(n.created_at).toLocaleDateString('uz-UZ')} • {new Date(n.created_at).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
