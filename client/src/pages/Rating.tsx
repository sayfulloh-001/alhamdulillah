import React, { useState, useEffect } from 'react';
import { Award, Eye, Package, CheckCircle, RefreshCw, Trophy, Leaf } from 'lucide-react';
import { apiRequest } from '../utils/api';

interface LeaderboardUser {
  id: number;
  first_name: string;
  last_name: string;
  region: string;
  avatar: string;
  product_count: number;
  views: number;
  sold: number;
  score: number;
  medal: string;
}

export const Rating: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const data = await apiRequest('/admin/leaderboard');
      setLeaderboard(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6 max-w-3xl mx-auto">
      
      {/* Dynamic Trophy Header */}
      <div className="p-6 bg-gradient-to-r from-emerald-800 to-green-700 text-white rounded-3xl shadow-md flex items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-1.5 z-10">
          <span className="bg-emerald-600/50 text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full border border-emerald-500/20">
            Reyting
          </span>
          <h2 className="text-xl md:text-2xl font-black">Eng Faol Dehqonlar TOP 15</h2>
          <p className="text-xs text-emerald-100 font-light leading-relaxed max-w-md">
            Platformadagi eng ko'p mahsulot qo'shgan, sotgan va e'lonlari eng ko'p ko'rilgan peshqadam dehqonlar ro'yxati.
          </p>
        </div>
        <div className="p-3 bg-white/10 rounded-2xl border border-white/10 shrink-0 z-10 animate-pulse">
          <Trophy className="w-12 h-12 text-yellow-300 fill-yellow-300/10" />
        </div>
      </div>

      {/* Leaderboard list container */}
      {loading ? (
        <div className="text-center py-10 space-y-2">
          <RefreshCw className="w-8 h-8 text-[var(--color-dehqon-green)] animate-spin mx-auto" />
          <p className="text-xs text-[var(--text-muted)]">Reyting ro'yxati yangilanmoqda...</p>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-12 text-center rounded-3xl space-y-3">
          <Award className="w-12 h-12 text-zinc-300 mx-auto" />
          <h3 className="font-bold text-base text-[var(--text-main)]">Ro'yxat bo'sh</h3>
          <p className="text-xs text-[var(--text-muted)]">Hozircha yetarlicha faollikka ega dehqonlar mavjud emas.</p>
        </div>
      ) : (
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl overflow-hidden shadow-sm">
          {/* Header titles */}
          <div className="grid grid-cols-12 px-4 py-3 bg-[var(--bg-app)] border-b border-[var(--border-color)] text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            <span className="col-span-2 text-center">O'rin</span>
            <span className="col-span-5 md:col-span-6">Dehqon</span>
            <span className="col-span-5 md:col-span-4 text-right pr-2">Faollik ko'rsatkichi</span>
          </div>

          {/* List items */}
          <div className="divide-y divide-[var(--border-color)]">
            {leaderboard.map((user, idx) => {
              const isTop3 = idx < 3;
              return (
                <div key={user.id} className="grid grid-cols-12 items-center px-4 py-3.5 hover:bg-[var(--bg-app)]/30 transition-colors">
                  
                  {/* Medal Column */}
                  <div className="col-span-2 flex items-center justify-center font-bold text-base">
                    {isTop3 ? (
                      <span className="text-2xl drop-shadow">{user.medal}</span>
                    ) : (
                      <span className="text-xs font-extrabold text-[var(--text-muted)] bg-[var(--bg-app)] px-2 py-0.5 rounded-md">
                        {user.medal}
                      </span>
                    )}
                  </div>

                  {/* Farmer details */}
                  <div className="col-span-5 md:col-span-6 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full overflow-hidden bg-emerald-50 dark:bg-emerald-950/40 border border-[var(--border-color)] flex items-center justify-center shrink-0">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.first_name} className="w-full h-full object-cover" />
                      ) : (
                        <Leaf className="w-4 h-4 text-[var(--color-dehqon-green)]" />
                      )}
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-xs md:text-sm text-[var(--text-main)] leading-none line-clamp-1">
                        {user.first_name} {user.last_name}
                      </h4>
                      <span className="text-[10px] text-[var(--text-muted)] block font-medium leading-none">{user.region} viloyati</span>
                    </div>
                  </div>

                  {/* Stats columns */}
                  <div className="col-span-5 md:col-span-4 flex items-center justify-end gap-3 md:gap-5 text-right pr-2">
                    {/* Products */}
                    <div className="flex flex-col" title="Qo'shilgan e'lonlar soni">
                      <span className="text-xs font-extrabold text-[var(--text-main)] flex items-center justify-end gap-0.5">
                        <Package className="w-3.5 h-3.5 text-zinc-400" /> {user.product_count}
                      </span>
                      <span className="text-[9px] text-[var(--text-muted)]">e'lonlar</span>
                    </div>

                    {/* Views */}
                    <div className="flex flex-col" title="Ko'rilganlar soni">
                      <span className="text-xs font-extrabold text-[var(--text-main)] flex items-center justify-end gap-0.5">
                        <Eye className="w-3.5 h-3.5 text-zinc-400" /> {user.views}
                      </span>
                      <span className="text-[9px] text-[var(--text-muted)]">ko'rishlar</span>
                    </div>

                    {/* Sold */}
                    <div className="flex flex-col" title="Sotilgan mahsulotlar">
                      <span className="text-xs font-extrabold text-[var(--text-main)] flex items-center justify-end gap-0.5">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> {user.sold}
                      </span>
                      <span className="text-[9px] text-[var(--text-muted)]">sotilgan</span>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

    </div>
  );
};
