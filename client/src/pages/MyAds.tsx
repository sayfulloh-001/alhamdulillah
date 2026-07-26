import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Archive, CheckCircle, Sparkles, Upload, Leaf, MapPin, RefreshCw } from 'lucide-react';
import { regionsData, categoriesData } from '../utils/regions';
import { apiRequest } from '../utils/api';
import { compressImage } from '../utils/imageCompressor';
import { type Product } from '../components/ProductCard';
import { showToast } from '../utils/toast';

interface MyAdsProps {
  currentUser: any;
  setPage: (page: string) => void;
  fetchProfile: () => void;
}

export const MyAds: React.FC<MyAdsProps> = ({ currentUser, setPage, fetchProfile }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [fruitType, setFruitType] = useState('');
  const [harvestYear, setHarvestYear] = useState('');
  const [price, setPrice] = useState('');
  const [quantityValue, setQuantityValue] = useState('');
  const [quantityUnit, setQuantityUnit] = useState('kg');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [region, setRegion] = useState('');
  const [district, setDistrict] = useState('');
  const [image, setImage] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMyProducts();
  }, []);

  const fetchMyProducts = async () => {
    try {
      setLoading(true);
      const data = await apiRequest('/products/user/me');
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setFormError('');
      // Client-side WebP compression (size limit <300KB guaranteed)
      const compressedBase64 = await compressImage(file);
      setImage(compressedBase64);
    } catch (err) {
      setFormError('Rasm yuklashda xatolik yuz berdi.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const fullQuantity = `${quantityValue} ${quantityUnit}`;

    if (!name || !category || !fruitType || !harvestYear || !price || !quantityValue || !description || !phone || !region || !district || (!image && !editingProduct)) {
      setFormError('Iltimos, barcha maydonlarni to\'ldiring va rasm yuklang.');
      return;
    }

    setSubmitting(true);

    try {
      if (editingProduct) {
        // Edit Action
        await apiRequest(`/products/${editingProduct.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            name,
            category,
            fruit_type: fruitType,
            harvest_year: harvestYear,
            price,
            quantity: fullQuantity,
            description,
            image_url: image
          })
        });
        showToast('E\'lon muvaffaqiyatli tahrirlandi.', 'success');
      } else {
        // Create Action
        await apiRequest('/products', {
          method: 'POST',
          body: JSON.stringify({
            name,
            category,
            fruit_type: fruitType,
            harvest_year: harvestYear,
            price,
            quantity: fullQuantity,
            description,
            phone,
            region,
            district,
            image_url: image
          })
        });
        showToast('E\'lon muvaffaqiyatli qo\'shildi.', 'success');
        fetchProfile(); // update local remaining limits
      }

      resetForm();
      fetchMyProducts();
    } catch (err: any) {
      setFormError(err.message || 'Xatolik yuz berdi.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setName('');
    setCategory('');
    setFruitType('');
    setHarvestYear('');
    setPrice('');
    setQuantityValue('');
    setQuantityUnit('kg');
    setDescription('');
    setPhone(currentUser?.phone || '');
    setRegion(currentUser?.region || '');
    setDistrict(currentUser?.district || '');
    setImage('');
    setEditingProduct(null);
    setShowAddForm(false);
  };

  const handleEditClick = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setCategory(p.category);
    setFruitType(p.fruit_type);
    setHarvestYear(p.harvest_year.toString());
    setPrice(p.price.toString());
    
    // Parse quantity value and unit
    const qtyParts = (p.quantity || '').trim().split(' ');
    if (qtyParts.length >= 2) {
      setQuantityValue(qtyParts[0]);
      setQuantityUnit(qtyParts.slice(1).join(' '));
    } else {
      setQuantityValue(p.quantity || '');
      setQuantityUnit('kg');
    }

    setDescription(p.description);
    setPhone(p.phone);
    setRegion(p.region);
    setDistrict(p.district);
    setImage(p.image_url);
    setShowAddForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Haqiqatan ham bu e\'lonni o\'chirmoqchimisiz?')) return;
    try {
      await apiRequest(`/products/${id}`, { method: 'DELETE' });
      fetchMyProducts();
      fetchProfile();
    } catch (err) {
      showToast('O\'chirishda xatolik yuz berdi.', 'error');
    }
  };

  const handleToggleArchive = async (p: Product) => {
    const nextArchive = p.is_archived === 1 ? 0 : 1;
    try {
      await apiRequest(`/products/${p.id}/archive`, {
        method: 'PUT',
        body: JSON.stringify({ is_archived: nextArchive })
      });
      fetchMyProducts();
      fetchProfile();
    } catch (err) {
      showToast('Arxivlashda xatolik.', 'error');
    }
  };

  const handleToggleSold = async (p: Product) => {
    const nextSold = p.is_sold === 1 ? 0 : 1;
    try {
      await apiRequest(`/products/${p.id}/sold`, {
        method: 'PUT',
        body: JSON.stringify({ is_sold: nextSold })
      });
      fetchMyProducts();
    } catch (err) {
      showToast('Sotildi deb belgilashda xatolik.', 'error');
    }
  };

  const activeProducts = products.filter(p => p.is_archived === 0);
  const currentCount = activeProducts.length;
  const isPremium = currentUser?.is_premium === 1;

  // Limits Verification
  const maxLimit = isPremium ? 100 : 2;
  const remainingCount = maxLimit - currentCount;
  const isLimitReached = currentCount >= maxLimit;

  const selectedRegionData = regionsData.find(r => r.name === region);

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header Panel with Premium limit details */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl shadow-sm">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-[var(--text-main)]">Mening e'lonlarim</h2>
          <p className="text-xs text-[var(--text-muted)]">O'z mahsulotlaringizni qo'shing, tahrirlang yoki sotilgan deb belgilang.</p>
        </div>

        {/* Dynamic Limit Counter Indicator */}
        <div className="flex items-center gap-3 bg-[var(--bg-app)] border border-[var(--border-color)] p-3 rounded-2xl">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">Mahsulotlar limiti</span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-extrabold text-[var(--color-dehqon-green)] dark:text-[var(--color-dehqon-accent)]">{currentCount}</span>
              <span className="text-xs text-[var(--text-muted)]">/ {maxLimit} ta</span>
            </div>
          </div>
          {isPremium ? (
            <div className="bg-amber-100 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 text-xs px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 fill-amber-500/10" />
              Premium {remainingCount} qoldi
            </div>
          ) : (
            <div className="bg-emerald-50 dark:bg-zinc-800 text-[var(--color-dehqon-green)] dark:text-[var(--color-dehqon-accent)] text-xs px-2.5 py-1.5 rounded-xl font-bold">
              Oddiy tarif
            </div>
          )}
        </div>
      </div>

      {/* Limit exceeded premium redirect block page */}
      {!showAddForm && isLimitReached && (
        <div className="p-6 bg-gradient-to-r from-amber-500/10 to-amber-600/5 border border-amber-300/30 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
          <div className="space-y-1">
            <h3 className="font-extrabold text-amber-700 dark:text-amber-400 text-lg flex items-center gap-1.5">
              <Sparkles className="w-5 h-5 fill-amber-500/10 text-amber-500 animate-pulse" />
              Yangi e'lon qo'shish tugmasi bloklandi!
            </h3>
            <p className="text-xs text-[var(--text-muted)] max-w-lg leading-relaxed">
              Siz o'z tariftingiz doirasidagi limitga yetdingiz ({currentCount}/{maxLimit} ta). Premium tarifga o'ting va 100 tagacha mahsulot qo'shish imkoniyatiga ega bo'ling.
            </p>
          </div>
          <button
            onClick={() => setPage('premium')}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs py-3 px-5 rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer whitespace-nowrap"
          >
            Premium sotib olish
          </button>
        </div>
      )}

      {/* Top Creation Controls */}
      {!showAddForm && (
        <div className="flex justify-end">
          <button
            onClick={() => {
              resetForm();
              setShowAddForm(true);
            }}
            disabled={isLimitReached}
            className="bg-[var(--color-dehqon-green)] hover:bg-[var(--color-dehqon-dark)] text-white font-bold py-3 px-5 rounded-2xl flex items-center gap-1.5 transition-all shadow-md active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-xs"
          >
            <Plus className="w-4.5 h-4.5" />
            Yangi mahsulot qo'shish
          </button>
        </div>
      )}

      {/* 1. CREATION / EDITING FORM PANEL */}
      {showAddForm && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-6 md:p-8 rounded-3xl shadow-md space-y-6 animate-fade">
          <div className="border-b border-[var(--border-color)] pb-3">
            <h3 className="font-bold text-lg text-[var(--text-main)]">
              {editingProduct ? 'Mahsulotni tahrirlash' : 'Yangi e\'lon yaratish'}
            </h3>
            <p className="text-xs text-[var(--text-muted)]">Iltimos, mahsulot va hosil tafsilotlarini batafsil yozing.</p>
          </div>

          {formError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 text-red-600 rounded-xl text-xs text-center font-medium">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Image Selector Dropzone */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--text-muted)]">Mahsulot rasmi</label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-[var(--border-color)] hover:border-[var(--color-dehqon-green)] rounded-2xl cursor-pointer bg-[var(--bg-app)] transition-colors relative overflow-hidden group">
                  {image ? (
                    <>
                      <img src={image} alt="Upload Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5">
                        <Upload className="w-4 h-4" /> Rasmni o'zgartirish
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center space-y-2">
                      <div className="p-3 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] text-[var(--color-dehqon-green)]">
                        <Upload className="w-5 h-5" />
                      </div>
                      <p className="text-xs text-[var(--text-main)] font-semibold">Galereyadan tanlash yoki papkadan yuklash</p>
                      <p className="text-[10px] text-[var(--text-muted)]">Rasm hajmi WebP formatda 300KB gacha siqiladi</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Product Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-muted)]">Mahsulot nomi</label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Qizil shirin olma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-dehqon-green)]"
                />
              </div>

              {/* Category */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-muted)]">Kategoriya</label>
                <select
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] px-2.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-dehqon-green)]"
                >
                  <option value="">Tanlang</option>
                  {categoriesData.map((cat, i) => (
                    <option key={i} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Fruit Type / Variety */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-muted)]">Meva/Nav turi</label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Golden navli meva"
                  value={fruitType}
                  onChange={(e) => setFruitType(e.target.value)}
                  className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-dehqon-green)]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Harvest Year */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-muted)]">Hosil yili</label>
                <input
                  type="number"
                  required
                  placeholder="Masalan: 2026"
                  value={harvestYear}
                  onChange={(e) => setHarvestYear(e.target.value)}
                  className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-dehqon-green)]"
                />
              </div>

              {/* Price */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-muted)]">
                  Narxi (1 {quantityUnit} uchun, so'mda)
                </label>
                <input
                  type="number"
                  required
                  placeholder="Masalan: 12000"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-dehqon-green)]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Quantity Value */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-muted)]">Sizda qancha bor? (Miqdori)</label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="Masalan: 500"
                  value={quantityValue}
                  onChange={(e) => setQuantityValue(e.target.value)}
                  className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-dehqon-green)]"
                />
              </div>

              {/* Quantity Unit */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-muted)]">O'lchov birligi</label>
                <select
                  required
                  value={quantityUnit}
                  onChange={(e) => setQuantityUnit(e.target.value)}
                  className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] px-3 py-2.5 rounded-xl text-sm font-semibold text-[var(--color-dehqon-green)] dark:text-[var(--color-dehqon-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-dehqon-green)]"
                >
                  <option value="kg">kg (Kilogramm)</option>
                  <option value="tonna">tonna (Tonna)</option>
                  <option value="gramm">gramm (Gramm)</option>
                  <option value="dona">dona (Shtuk)</option>
                  <option value="qop">qop</option>
                  <option value="litr">litr</option>
                  <option value="yashik">yashik / quti</option>
                  <option value="bog'">bog' / tuta</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Phone */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-muted)]">Aloqa telefoni</label>
                <input
                  type="tel"
                  required
                  placeholder="+998"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-dehqon-green)]"
                />
              </div>

              {/* Region */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-muted)]">Viloyat</label>
                <select
                  required
                  value={region}
                  onChange={(e) => {
                    setRegion(e.target.value);
                    setDistrict('');
                  }}
                  className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] px-2.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-dehqon-green)]"
                >
                  <option value="">Tanlang</option>
                  {regionsData.map((r, i) => (
                    <option key={i} value={r.name}>{r.name}</option>
                  ))}
                </select>
              </div>

              {/* District */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-muted)]">Tuman</label>
                <select
                  required
                  disabled={!region}
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] px-2.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-dehqon-green)] disabled:opacity-50"
                >
                  <option value="">Tanlang</option>
                  {selectedRegionData?.districts.map((d, i) => (
                    <option key={i} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--text-muted)]">Batafsil izoh (Mahsulot holati, sifati haqida)</label>
              <textarea
                required
                rows={3}
                placeholder="Masalan: Hosil juda shirin, kimyoviy dorilarsiz o'stirilgan, barcha hujjatlari bor..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-dehqon-green)] resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2.5 pt-4 border-t border-[var(--border-color)]">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-[var(--color-dehqon-green)] hover:bg-[var(--color-dehqon-dark)] text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Yuborilmoqda...
                  </>
                ) : (
                  editingProduct ? 'Saqlash' : 'E\'lon qo\'shish'
                )}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3.5 border border-[var(--border-color)] rounded-2xl text-xs font-bold text-[var(--text-main)] hover:bg-[var(--bg-app)] transition-colors cursor-pointer"
              >
                Bekor qilish
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2. ADVERTISEMENTS DASHBOARD LISTING */}
      {loading ? (
        <div className="text-center py-10 space-y-2">
          <RefreshCw className="w-8 h-8 text-[var(--color-dehqon-green)] animate-spin mx-auto" />
          <p className="text-xs text-[var(--text-muted)]">Sizning e'lonlaringiz yuklanmoqda...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-12 text-center rounded-3xl space-y-4">
          <div className="w-16 h-16 bg-[var(--dehqon-light)] text-[var(--color-dehqon-green)] rounded-full flex items-center justify-center mx-auto shadow-inner">
            <Leaf className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-base text-[var(--text-main)]">Sizda hali e'lonlar yo'q</h3>
            <p className="text-xs text-[var(--text-muted)] max-w-xs mx-auto">Sotmoqchi bo'lgan meva va hosillaringizni bozorga qo'shing va birinchi xaridorlaringizni toping.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products.map((p) => (
            <div key={p.id} className="bg-[var(--bg-card)] border border-[var(--border-color)] p-4 rounded-2xl shadow-sm flex gap-4 hover:shadow-md transition-shadow relative">
              
              {/* Product Thumbnail */}
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 relative">
                <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                {p.is_sold === 1 && (
                  <div className="absolute inset-0 bg-red-600/80 backdrop-blur-[1px] flex items-center justify-center text-white text-[10px] font-bold uppercase tracking-wider">
                    Sotilgan
                  </div>
                )}
                {p.is_archived === 1 && p.is_sold === 0 && (
                  <div className="absolute inset-0 bg-zinc-700/80 backdrop-blur-[1px] flex items-center justify-center text-white text-[10px] font-bold uppercase tracking-wider">
                    Arxiv
                  </div>
                )}
              </div>

              {/* Information & Action buttons */}
              <div className="flex-1 flex flex-col justify-between py-0.5">
                <div className="space-y-1">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="font-bold text-sm md:text-base text-[var(--text-main)] line-clamp-1">{p.name}</h4>
                    {p.is_premium === 1 && (
                      <span className="bg-amber-100 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 shrink-0 border border-amber-300/20">
                        <Sparkles className="w-2.5 h-2.5 fill-amber-500/10" /> Prem
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--color-dehqon-green)] dark:text-[var(--color-dehqon-accent)] font-semibold">{p.fruit_type}</p>
                  
                  <div className="flex items-center gap-2 text-[10px] text-[var(--text-muted)] pt-0.5">
                    <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" /> {p.region}</span>
                    <span>•</span>
                    <span>{p.harvest_year}-yil</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-[var(--border-color)]">
                  <div>
                    <span className="text-sm font-extrabold text-[var(--text-main)]">{p.price.toLocaleString()} so'm</span>
                    <span className="text-[10px] text-[var(--text-muted)] block">{p.quantity}</span>
                  </div>

                  {/* Management buttons row */}
                  <div className="flex items-center gap-1.5">
                    {/* Mark Sold toggle */}
                    <button
                      onClick={() => handleToggleSold(p)}
                      title={p.is_sold === 1 ? "Sotuvga chiqarish" : "Sotildi deb belgilash"}
                      className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                        p.is_sold === 1
                          ? 'bg-red-50 dark:bg-red-950/20 text-red-600 border-red-200 dark:border-red-900/30'
                          : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-[var(--border-color)] hover:bg-emerald-50 dark:hover:bg-emerald-950/20'
                      }`}
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => handleEditClick(p)}
                      title="Tahrirlash"
                      className="p-2 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-[var(--border-color)] hover:bg-[var(--dehqon-light)] rounded-xl transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Archive toggle */}
                    <button
                      onClick={() => handleToggleArchive(p)}
                      title={p.is_archived === 1 ? "Faollashtirish (Arxivdan olish)" : "Arxivlash"}
                      className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                        p.is_archived === 1
                          ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 border-amber-200'
                          : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-[var(--border-color)]'
                      }`}
                    >
                      <Archive className="w-4 h-4" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(p.id)}
                      title="O'chirish"
                      className="p-2 bg-zinc-50 dark:bg-zinc-800 text-red-600 border border-[var(--border-color)] hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
