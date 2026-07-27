import React, { useState, useEffect } from 'react';
import { MapPin, Sparkles, Camera, Check, RefreshCw, Leaf, LogOut, Package, Plus, Trash2, Tag, Calendar, Eye } from 'lucide-react';
import { regionsData } from '../utils/regions';
import { apiRequest } from '../utils/api';
import { compressImage } from '../utils/imageCompressor';
import { showToast } from '../utils/toast';
import { cookieStorage } from '../utils/cookieStorage';
import { ProductCard, type Product } from '../components/ProductCard';

interface ProfileProps {
  currentUser: any;
  fetchProfile: () => void;
  setPage?: (page: string) => void;
}

export const Profile: React.FC<ProfileProps> = ({ currentUser, fetchProfile, setPage }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [region, setRegion] = useState('');
  const [district, setDistrict] = useState('');
  const [avatar, setAvatar] = useState('');
  
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [error, setError] = useState('');

  // User's added products
  const [myProducts, setMyProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      setFirstName(currentUser.first_name || '');
      setLastName(currentUser.last_name || '');
      setPhone(currentUser.phone || '');
      setRegion(currentUser.region || '');
      setDistrict(currentUser.district || '');
      setAvatar(currentUser.avatar || '');
      fetchUserProducts();
    }
  }, [currentUser]);

  const fetchUserProducts = async () => {
    try {
      setProductsLoading(true);
      const data = await apiRequest('/products/user/me');
      const activeProducts = data.filter((p: any) => p.is_archived === 0);
      setMyProducts(activeProducts);
      setAdsCount(activeProducts.length);
    } catch (err) {
      console.error("Fetch user products error:", err);
    } finally {
      setProductsLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!window.confirm("Haqiqatan ham ushbu e'loningizni o'chirmoqchimisiz?")) return;
    try {
      await apiRequest(`/products/${productId}`, { method: 'DELETE' });
      showToast("E'loningiz muvaffaqiyatli o'chirildi.", 'success');
      fetchUserProducts();
    } catch (err) {
      showToast("O'chirishda xatolik yuz berdi.", 'error');
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setAvatarLoading(true);
      setError('');
      
      // Compress and convert to base64 WebP (<300KB guaranteed)
      const compressedBase64 = await compressImage(file);
      
      // Upload avatar to server
      const response = await apiRequest('/auth/me/avatar', {
        method: 'PUT',
        body: JSON.stringify({ avatar: compressedBase64 })
      });

      setAvatar(response.avatar);
      fetchProfile();
      showToast('Profil rasmi o\'zgartirildi.', 'success');
    } catch (err) {
      setError('Rasm yuklashda xatolik yuz berdi.');
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!firstName || !lastName || !phone || !region || !district) {
      setError('Iltimos, barcha maydonlarni to\'ldiring.');
      return;
    }

    setLoading(true);

    try {
      await apiRequest('/auth/me', {
        method: 'PUT',
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          phone,
          region,
          district
        })
      });

      showToast('Profil ma\'lumotlari tahrirlandi.', 'success');
      setEditMode(false);
      fetchProfile();
    } catch (err: any) {
      setError(err.message || 'Saqlashda xatolik yuz berdi.');
    } finally {
      setLoading(false);
    }
  };

  const selectedRegionData = regionsData.find(r => r.name === region);
  const isPremium = currentUser?.is_premium === 1;
  const maxLimit = isPremium ? 100 : 2;

  return (
    <div className="space-y-6 pb-20 md:pb-6 max-w-2xl mx-auto">
      
      {/* Profile Header Card */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-6 rounded-3xl shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row items-center gap-5 text-center md:text-left">
          
          {/* Avatar Upload Frame */}
          <div className="relative group shrink-0">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-emerald-50 dark:bg-emerald-950/40 border-2 border-[var(--color-dehqon-green)] flex items-center justify-center shadow-md relative">
              {avatarLoading ? (
                <RefreshCw className="w-6 h-6 text-[var(--color-dehqon-green)] animate-spin" />
              ) : avatar ? (
                <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <Leaf className="w-10 h-10 text-[var(--color-dehqon-green)]" />
              )}
            </div>
            
            <label className="absolute bottom-0 right-0 p-2 bg-[var(--color-dehqon-green)] text-white hover:bg-[var(--color-dehqon-dark)] rounded-full shadow-md cursor-pointer transition-colors active:scale-90 border border-white">
              <Camera className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
                disabled={avatarLoading}
              />
            </label>
          </div>

          <div className="space-y-2 flex-1">
            <div className="space-y-0.5">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <h2 className="text-xl font-bold text-[var(--text-main)]">
                  {currentUser?.first_name} {currentUser?.last_name}
                </h2>
                {isPremium && (
                  <span className="bg-gradient-to-r from-blue-600 via-emerald-500 to-amber-400 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-lg flex items-center gap-1 shadow-sm border border-white">
                    <Sparkles className="w-3 h-3 fill-amber-300 text-white" /> Premium Dehqon
                  </span>
                )}
              </div>
              <span className="text-xs text-[var(--text-muted)] block">{currentUser?.phone}</span>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 text-xs text-[var(--text-muted)]">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                {currentUser?.region}, {currentUser?.district}
              </span>
            </div>
          </div>
        </div>

        {/* Stats row info badges */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[var(--border-color)]">
          <div className="bg-[var(--bg-app)] border border-[var(--border-color)] p-3.5 rounded-2xl text-center space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">Faol e'lonlar</span>
            <span className="text-lg font-extrabold text-[var(--text-main)] block">{adsCount} ta</span>
          </div>

          <div className="bg-[var(--bg-app)] border border-[var(--border-color)] p-3.5 rounded-2xl text-center space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">E'lonlar limiti</span>
            <span className="text-lg font-extrabold text-[var(--text-main)] block">{maxLimit} ta</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 border border-red-200 text-xs rounded-xl text-center">
          {error}
        </div>
      )}

      {/* Profile edit info box */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-6 rounded-3xl shadow-sm space-y-6">
        <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-3">
          <h3 className="font-bold text-base text-[var(--text-main)]">Shaxsiy ma'lumotlar</h3>
          <button
            onClick={() => setEditMode(!editMode)}
            className="text-xs font-bold text-[var(--color-dehqon-green)] dark:text-[var(--color-dehqon-accent)] hover:underline cursor-pointer"
          >
            {editMode ? 'Bekor qilish' : 'Tahrirlash'}
          </button>
        </div>

        {!editMode ? (
          <div className="space-y-4 text-sm font-medium">
            <div className="grid grid-cols-2 gap-4 py-2 border-b border-[var(--border-color)]/50">
              <span className="text-[var(--text-muted)]">Ism</span>
              <span className="text-[var(--text-main)] text-right">{currentUser?.first_name}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 py-2 border-b border-[var(--border-color)]/50">
              <span className="text-[var(--text-muted)]">Familya</span>
              <span className="text-[var(--text-main)] text-right">{currentUser?.last_name}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 py-2 border-b border-[var(--border-color)]/50">
              <span className="text-[var(--text-muted)]">Telefon</span>
              <span className="text-[var(--text-main)] text-right">{currentUser?.phone}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 py-2 border-b border-[var(--border-color)]/50">
              <span className="text-[var(--text-muted)]">Viloyat</span>
              <span className="text-[var(--text-main)] text-right">{currentUser?.region}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 py-2">
              <span className="text-[var(--text-muted)]">Tuman</span>
              <span className="text-[var(--text-main)] text-right">{currentUser?.district}</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-muted)]">Ism</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-dehqon-green)]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-muted)]">Familya</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-dehqon-green)]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--text-muted)]">Telefon raqam</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-dehqon-green)]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-muted)]">Viloyat</label>
                <select
                  required
                  value={region}
                  onChange={(e) => {
                    setRegion(e.target.value);
                    setDistrict('');
                  }}
                  className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] px-2 py-2 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-dehqon-green)]"
                >
                  <option value="">Tanlang</option>
                  {regionsData.map((r, i) => (
                    <option key={i} value={r.name}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-muted)]">Tuman</label>
                <select
                  required
                  disabled={!region}
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] px-2 py-2 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-dehqon-green)] disabled:opacity-50"
                >
                  <option value="">Tanlang</option>
                  {selectedRegionData?.districts.map((d, i) => (
                    <option key={i} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--color-dehqon-green)] hover:bg-[var(--color-dehqon-dark)] text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Saqlanmoqda...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" /> Ma'lumotlarni saqlash
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* User's Uploaded Products Section */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-6 rounded-3xl shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-[var(--color-dehqon-green)] dark:text-[var(--color-dehqon-accent)]" />
            <h3 className="font-bold text-base text-[var(--text-main)]">
              O'zim qo'shgan mahsulotlar
            </h3>
            <span className="bg-[var(--dehqon-light)] dark:bg-emerald-950/30 text-[var(--color-dehqon-green)] dark:text-[var(--color-dehqon-accent)] text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              {myProducts.length} ta
            </span>
          </div>

          {setPage && (
            <button
              onClick={() => setPage('my-ads')}
              className="bg-[var(--color-dehqon-green)] hover:bg-[var(--color-dehqon-dark)] text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>E'lon qo'shish</span>
            </button>
          )}
        </div>

        {productsLoading ? (
          <div className="py-8 text-center text-xs text-[var(--text-muted)] flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[var(--color-dehqon-green)]" />
            <span>Mahsulotlaringiz yuklanmoqda...</span>
          </div>
        ) : myProducts.length === 0 ? (
          <div className="py-10 text-center space-y-3 bg-[var(--bg-app)] rounded-2xl border border-[var(--border-color)] p-6">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-[var(--color-dehqon-green)] flex items-center justify-center mx-auto shadow-inner">
              <Leaf className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-[var(--text-main)]">Siz hali birorta ham e'lon qo'shmadingiz</h4>
              <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
                O'z meva, sabzavot va dehqonchilik mahsulotlaringizni joylashtiring va xaridorlar bilan bevosita bog'laning.
              </p>
            </div>
            {setPage && (
              <button
                onClick={() => setPage('my-ads')}
                className="mt-2 bg-[var(--color-dehqon-green)] hover:bg-[var(--color-dehqon-dark)] text-white text-xs font-bold px-4 py-2.5 rounded-xl inline-flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Birinchi e'loningizni joylashtiring
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {myProducts.map((p) => (
              <div
                key={p.id}
                className="bg-[var(--bg-app)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between group hover:border-[var(--color-dehqon-green)] transition-all"
              >
                <div className="relative h-40 bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                  <img
                    src={p.image_url}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {p.is_premium === 1 && (
                    <div className="absolute top-2 left-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                      <Sparkles className="w-3 h-3 fill-amber-300" /> VIP Premium
                    </div>
                  )}
                  <span className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Eye className="w-3 h-3" /> {p.views}
                  </span>
                </div>

                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-[var(--color-dehqon-green)] dark:text-[var(--color-dehqon-accent)] bg-[var(--dehqon-light)] dark:bg-emerald-950/20 px-2 py-0.5 rounded inline-block">
                      {p.fruit_type || p.category}
                    </span>
                    <h4 className="font-bold text-sm text-[var(--text-main)] line-clamp-1">{p.name}</h4>
                    <p className="text-xs text-[var(--text-muted)] line-clamp-2 font-light">{p.description}</p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-[var(--border-color)]">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[var(--text-muted)]">Narxi:</span>
                      <span className="font-extrabold text-[var(--color-dehqon-green)] dark:text-[var(--color-dehqon-accent)]">
                        {p.price.toLocaleString()} so'm / {p.quantity}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-zinc-400" /> {p.region}
                      </span>
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="text-red-500 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer hover:underline"
                        title="E'lonni o'chirish"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> O'chirish
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
