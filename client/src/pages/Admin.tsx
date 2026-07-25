import React, { useState, useEffect } from 'react';
import { Users, FileText, Package, ShieldAlert, Sparkles, MapPin, Check, X, Trash2, ArrowUpRight, BarChart3, Award } from 'lucide-react';
import { apiRequest } from '../utils/api';
import { showToast } from '../utils/toast';

interface AdminStats {
  total_users: number;
  premium_users: number;
  normal_users: number;
  today_products: number;
  today_views: number;
  active_region: string;
  active_farmer: string;
}

export const Admin: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [receipts, setReceipts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'receipts', 'users', 'products'
  const [rejectComment, setRejectComment] = useState('');
  const [showRejectInput, setShowRejectInput] = useState<number | null>(null);

  useEffect(() => {
    fetchAdminData();
  }, [activeTab]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'dashboard') {
        const data = await apiRequest('/admin/stats');
        setStats(data);
      } else if (activeTab === 'receipts') {
        const data = await apiRequest('/admin/receipts');
        setReceipts(data.filter((r: any) => r.status === 'Tekshirilmoqda'));
      } else if (activeTab === 'users') {
        const data = await apiRequest('/admin/users');
        setUsers(data);
      } else if (activeTab === 'products') {
        const data = await apiRequest('/products?limit=100');
        setProducts(data.products);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await apiRequest(`/admin/receipts/${id}/approve`, { method: 'POST' });
      showToast('Chek tasdiqlandi. Foydalanuvchiga Premium berildi.', 'success');
      fetchAdminData();
    } catch (err) {
      showToast('Tasdiqlashda xatolik.', 'error');
    }
  };

  const handleReject = async (id: number) => {
    if (!rejectComment) {
      showToast('Iltimos, rad etish sababini yozing.', 'error');
      return;
    }
    try {
      await apiRequest(`/admin/receipts/${id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ comment: rejectComment })
      });
      showToast('To\'lov rad etildi.', 'success');
      setRejectComment('');
      setShowRejectInput(null);
      fetchAdminData();
    } catch (err) {
      showToast('Rad etishda xatolik.', 'error');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm('Foydalanuvchini va uning barcha e\'lonlarini o\'chirmoqchimisiz?')) return;
    try {
      await apiRequest(`/admin/users/${userId}`, { method: 'DELETE' });
      showToast('Foydalanuvchi o\'chirildi.', 'success');
      fetchAdminData();
    } catch (err) {
      showToast('Xatolik yuz berdi.', 'error');
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!window.confirm('Bu e\'lonni o\'chirmoqchimisiz?')) return;
    try {
      await apiRequest(`/products/${productId}`, { method: 'DELETE' });
      showToast('E\'lon o\'chirildi.', 'success');
      fetchAdminData();
    } catch (err) {
      showToast('Xatolik.', 'error');
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      
      {/* Header and navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-amber-600 flex items-center gap-1.5">
            <ShieldAlert className="w-5 h-5" /> Tizim Administratori
          </h2>
          <p className="text-xs text-[var(--text-muted)]">Cheklarni tekshirish, foydalanuvchilar va mahsulotlar boshqaruvi.</p>
        </div>

        {/* Tab selection links */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-0.5">
          {[
            { id: 'dashboard', label: 'Statistika', icon: BarChart3 },
            { id: 'receipts', label: 'Cheklar', icon: FileText },
            { id: 'users', label: 'Foydalanuvchilar', icon: Users },
            { id: 'products', label: 'Mahsulotlar', icon: Package }
          ].map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                  isActive
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-main)] hover:bg-[var(--bg-app)]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. DASHBOARD STATS TAB */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6 animate-fade">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="skeleton h-24 rounded-2xl" />
              ))}
            </div>
          ) : stats ? (
            <>
              {/* Numeric grids */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-5 rounded-2xl shadow-sm space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">Jami foydalanuvchilar</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-black text-[var(--text-main)]">{stats.total_users}</span>
                    <Users className="w-5 h-5 text-zinc-400" />
                  </div>
                </div>

                <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-5 rounded-2xl shadow-sm space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">Premium A'zolar</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-black text-amber-500">{stats.premium_users}</span>
                    <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
                  </div>
                </div>

                <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-5 rounded-2xl shadow-sm space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">Oddiy dehqonlar</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-black text-[var(--text-main)]">{stats.normal_users}</span>
                    <Users className="w-5 h-5 text-zinc-400" />
                  </div>
                </div>

                <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-5 rounded-2xl shadow-sm space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">Bugungi e'lonlar</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-black text-[var(--color-dehqon-green)] dark:text-[var(--color-dehqon-accent)]">{stats.today_products}</span>
                    <Package className="w-5 h-5 text-[var(--color-dehqon-green)]" />
                  </div>
                </div>
              </div>

              {/* Extra detailed insights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-5 rounded-2xl shadow-sm space-y-4">
                  <h3 className="font-bold text-sm text-[var(--text-main)] flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-emerald-500" /> Eng faol hudud (Viloyat)
                  </h3>
                  <div className="p-4 bg-[var(--bg-app)] rounded-xl border border-[var(--border-color)] text-center font-bold text-lg text-[var(--text-main)]">
                    {stats.active_region}
                  </div>
                </div>

                <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-5 rounded-2xl shadow-sm space-y-4">
                  <h3 className="font-bold text-sm text-[var(--text-main)] flex items-center gap-1">
                    <Award className="w-4 h-4 text-amber-500" /> Eng faol dehqon
                  </h3>
                  <div className="p-4 bg-[var(--bg-app)] rounded-xl border border-[var(--border-color)] text-center font-bold text-lg text-[var(--text-main)]">
                    {stats.active_farmer}
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      )}

      {/* 2. RECEIPTS TAB */}
      {activeTab === 'receipts' && (
        <div className="space-y-4 animate-fade">
          {loading ? (
            <div className="skeleton h-40 rounded-2xl w-full" />
          ) : receipts.length === 0 ? (
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-12 text-center rounded-3xl space-y-3">
              <FileText className="w-12 h-12 text-zinc-300 mx-auto" />
              <h3 className="font-bold text-base text-[var(--text-main)]">Barcha cheklar tekshirilgan</h3>
              <p className="text-xs text-[var(--text-muted)]">Navbatda yangi to'lov cheklari yo'q.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {receipts.map((r) => (
                <div key={r.id} className="bg-[var(--bg-card)] border border-[var(--border-color)] p-5 rounded-2xl shadow-sm space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start border-b border-[var(--border-color)] pb-2">
                      <div>
                        <span className="text-[10px] text-[var(--text-muted)] uppercase font-semibold">Foydalanuvchi</span>
                        <h4 className="font-bold text-sm text-[var(--text-main)]">{r.first_name} {r.last_name}</h4>
                        <span className="text-xs text-[var(--text-muted)]">{r.phone}</span>
                      </div>
                      <span className="text-[10px] text-[var(--text-muted)] font-medium">{new Date(r.created_at).toLocaleDateString()}</span>
                    </div>

                    {/* Receipt document preview (base64 Image / PDF) */}
                    <div className="w-full h-44 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-[var(--border-color)] overflow-hidden relative group">
                      {r.receipt_url.startsWith('data:application/pdf') ? (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-zinc-500">
                          <FileText className="w-12 h-12 text-red-500" />
                          <span className="text-xs font-bold">PDF Hujjat yuklangan</span>
                          <button
                            onClick={() => window.open(r.receipt_url, '_blank')}
                            className="bg-red-600 text-white font-bold text-[10px] py-1.5 px-3 rounded-lg flex items-center gap-1"
                          >
                            PDF ko'rish <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <img src={r.receipt_url} alt="Receipt proof" className="w-full h-full object-contain cursor-zoom-in" onClick={() => window.open(r.receipt_url, '_blank')} />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                              onClick={() => window.open(r.receipt_url, '_blank')}
                              className="bg-white text-zinc-900 text-[10px] font-bold py-1.5 px-3 rounded-lg flex items-center gap-0.5"
                            >
                              Kattalashtirish <ArrowUpRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Reject panel */}
                  {showRejectInput === r.id ? (
                    <div className="space-y-2 pt-2 border-t border-[var(--border-color)]">
                      <textarea
                        required
                        placeholder="Rad etish sababini kiriting..."
                        value={rejectComment}
                        onChange={(e) => setRejectComment(e.target.value)}
                        className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] p-2 rounded-xl text-xs focus:outline-none"
                        rows={2}
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleReject(r.id)}
                          className="bg-red-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg"
                        >
                          Rad etishni tasdiqlash
                        </button>
                        <button
                          onClick={() => {
                            setShowRejectInput(null);
                            setRejectComment('');
                          }}
                          className="border border-[var(--border-color)] text-[var(--text-main)] text-[10px] font-bold px-3 py-1.5 rounded-lg"
                        >
                          Bekor qilish
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2 border-t border-[var(--border-color)] pt-3.5">
                      <button
                        onClick={() => handleApprove(r.id)}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1 shadow-sm transition-all cursor-pointer active:scale-95"
                      >
                        <Check className="w-4 h-4" /> Tasdiqlash
                      </button>
                      <button
                        onClick={() => setShowRejectInput(r.id)}
                        className="flex-1 border border-red-200 dark:border-red-950 hover:bg-red-50 text-red-600 font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer active:scale-95"
                      >
                        <X className="w-4 h-4" /> Rad etish
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. USERS TAB */}
      {activeTab === 'users' && (
        <div className="space-y-4 animate-fade">
          {loading ? (
            <div className="skeleton h-40 rounded-2xl w-full" />
          ) : (
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[var(--bg-app)] border-b border-[var(--border-color)] font-bold text-[var(--text-muted)] uppercase">
                    <tr>
                      <th className="px-5 py-3 text-center">Rasm</th>
                      <th className="px-5 py-3">Ism/Familya</th>
                      <th className="px-5 py-3">Telefon</th>
                      <th className="px-5 py-3">Hudud</th>
                      <th className="px-5 py-3">Tarif</th>
                      <th className="px-5 py-3 text-right">Amal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-color)]">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-[var(--bg-app)]/30 transition-colors font-medium">
                        <td className="px-5 py-3 text-center">
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-100 border border-[var(--border-color)] flex items-center justify-center mx-auto shrink-0">
                            {u.avatar ? <img src={u.avatar} alt={u.first_name} className="w-full h-full object-cover" /> : <Users className="w-4 h-4 text-zinc-400" />}
                          </div>
                        </td>
                        <td className="px-5 py-3 font-bold text-[var(--text-main)]">{u.first_name} {u.last_name}</td>
                        <td className="px-5 py-3 text-[var(--text-main)]">{u.phone}</td>
                        <td className="px-5 py-3 text-[var(--text-muted)]">{u.region}, {u.district}</td>
                        <td className="px-5 py-3">
                          {u.is_premium === 1 ? (
                            <span className="bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 font-bold px-2 py-0.5 rounded">Premium</span>
                          ) : (
                            <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold px-2 py-0.5 rounded">Oddiy</span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                            title="Foydalanuvchini butunlay o'chirish"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. PRODUCTS TAB */}
      {activeTab === 'products' && (
        <div className="space-y-4 animate-fade">
          {loading ? (
            <div className="skeleton h-40 rounded-2xl w-full" />
          ) : (
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[var(--bg-app)] border-b border-[var(--border-color)] font-bold text-[var(--text-muted)] uppercase">
                    <tr>
                      <th className="px-5 py-3">Rasm</th>
                      <th className="px-5 py-3">Mahsulot</th>
                      <th className="px-5 py-3">Kategoriya</th>
                      <th className="px-5 py-3">Narxi</th>
                      <th className="px-5 py-3">Viloyat</th>
                      <th className="px-5 py-3 text-right">Amal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-color)]">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-[var(--bg-app)]/30 transition-colors font-medium">
                        <td className="px-5 py-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-zinc-100 border border-[var(--border-color)]">
                            <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <div className="font-bold text-[var(--text-main)]">{p.name}</div>
                          <span className="text-[10px] text-[var(--text-muted)] font-semibold text-[var(--color-dehqon-green)]">{p.fruit_type}</span>
                        </td>
                        <td className="px-5 py-3 text-[var(--text-main)]">{p.category}</td>
                        <td className="px-5 py-3 font-bold text-[var(--text-main)]">{p.price.toLocaleString()} so'm</td>
                        <td className="px-5 py-3 text-[var(--text-muted)]">{p.region}</td>
                        <td className="px-5 py-3 text-right">
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                            title="E'lonni o'chirish"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
