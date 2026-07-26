import React, { useState, useEffect } from 'react';
import { Search, MapPin, SlidersHorizontal, Eye, Calendar, Sparkles, Copy, Check, Phone, ArrowUpRight, Sun, Moon } from 'lucide-react';
import { regionsData, categoriesData } from '../utils/regions';
import { ProductCard, type Product } from '../components/ProductCard';
import { SkeletonCard } from '../components/SkeletonCard';
import { apiRequest } from '../utils/api';
import { cookieStorage } from '../utils/cookieStorage';
import { showToast } from '../utils/toast';

interface HomeProps {
  currentUser: any;
  setPage: (page: string) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const Home: React.FC<HomeProps> = ({ currentUser, setPage, isDarkMode, toggleDarkMode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all'); // 'all', 'popular', 'newest', 'ai_recommended', 'recently_viewed'
  
  // Filters
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('');
  const [district, setDistrict] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [harvestYear, setHarvestYear] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Pagination / Load more
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const LIMIT = 12;

  // Selected Product Detail Modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showContactModal, setShowContactModal] = useState<Product | null>(null);
  const [copied, setCopied] = useState(false);

  // Recently Viewed cache
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<number[]>([]);

  useEffect(() => {
    // Load recently viewed IDs from cookie storage
    const cached = cookieStorage.getItem('dehqon_recently_viewed');
    if (cached) {
      setRecentlyViewedIds(JSON.parse(cached));
    }

    // Fetch favorites
    if (currentUser) {
      fetchFavorites();
    }
  }, [currentUser]);

  // Fetch products when filters/tabs/offset change
  useEffect(() => {
    fetchProducts();
  }, [tab, region, district, category, minPrice, maxPrice, harvestYear, offset]);

  // Search debouncing / real time search trigger
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setOffset(0);
      fetchProducts();
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const fetchProducts = async (append = false) => {
    try {
      if (!append) setLoading(true);

      // Handle local recently viewed tab client-side to save DB operations
      if (tab === 'recently_viewed') {
        const cached = cookieStorage.getItem('dehqon_recently_viewed');
        const ids: number[] = cached ? JSON.parse(cached) : [];
        if (ids.length === 0) {
          setProducts([]);
          setTotal(0);
          setLoading(false);
          return;
        }

        // Fetch individual details or load all items and filter
        const data = await apiRequest(`/products?limit=100`);
        const filtered = data.products.filter((p: Product) => ids.includes(p.id));
        // Sort by how recently they were added to recently viewed
        filtered.sort((a: Product, b: Product) => ids.indexOf(b.id) - ids.indexOf(a.id));
        setProducts(filtered);
        setTotal(filtered.length);
        setLoading(false);
        return;
      }

      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (region) params.append('region', region);
      if (district) params.append('district', district);
      if (category) params.append('category', category);
      if (minPrice) params.append('min_price', minPrice);
      if (maxPrice) params.append('max_price', maxPrice);
      if (harvestYear) params.append('harvest_year', harvestYear);
      if (tab !== 'all') params.append('tab', tab);
      params.append('limit', LIMIT.toString());
      params.append('offset', offset.toString());

      const data = await apiRequest(`/products?${params.toString()}`);
      if (append) {
        setProducts(prev => [...prev, ...data.products]);
      } else {
        setProducts(data.products);
      }
      setTotal(data.total);
    } catch (err) {
      console.error("Fetch products error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const data = await apiRequest('/products/user/favorites');
      setFavorites(data.map((f: Product) => f.id));
    } catch (err) {
      console.error("Fetch favorites error:", err);
    }
  };

  const handleFavoriteToggle = async (productId: number) => {
    if (!currentUser) {
      setPage('profile'); // redirect to register/login
      return;
    }

    try {
      const data = await apiRequest(`/products/${productId}/favorite`, { method: 'POST' });
      if (data.is_favorite) {
        setFavorites(prev => [...prev, productId]);
      } else {
        setFavorites(prev => prev.filter(id => id !== productId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleProductClick = async (product: Product) => {
    setSelectedProduct(product);
    
    // Add to recently viewed
    let ids = [...recentlyViewedIds];
    ids = ids.filter(id => id !== product.id); // remove duplicate
    ids.unshift(product.id); // add to top
    if (ids.length > 8) ids.pop(); // keep last 8
    
    setRecentlyViewedIds(ids);
    cookieStorage.setItem('dehqon_recently_viewed', JSON.stringify(ids));

    // Notify backend of view (sends viewer_id if logged in)
    try {
      const viewerParam = currentUser ? `?viewer_id=${currentUser.id}` : '';
      await apiRequest(`/products/${product.id}${viewerParam}`);
    } catch (err) {
      console.error("View track error:", err);
    }
  };

  const handleContact = (product: Product) => {
    // Check viewport type: mobile uses dialer directly, desktop opens Modal
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      window.location.href = `tel:${product.phone}`;
    } else {
      setShowContactModal(product);
      setCopied(false);
    }
  };

  const handleCopyNumber = (phoneStr: string) => {
    navigator.clipboard.writeText(phoneStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (product: Product) => {
    const shareUrl = `${window.location.origin}/product/${product.id}`;
    navigator.clipboard.writeText(shareUrl);
    showToast('Havola nusxalandi! Do\'stlaringizga ulashing.', 'success');
  };

  const loadMore = () => {
    setOffset(prev => prev + LIMIT);
    fetchProducts(true);
  };

  const resetFilters = () => {
    setSearch('');
    setRegion('');
    setDistrict('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    setHarvestYear('');
    setOffset(0);
  };

  const selectedRegionData = regionsData.find(r => r.name === region);

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      
      {/* Top Mobile Bar with Light/Dark and Search */}
      <div className="flex md:hidden items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[var(--color-dehqon-green)] dark:text-[var(--color-dehqon-accent)] font-bold text-xl">
          <Sparkles className="w-5 h-5 fill-[var(--color-dehqon-green)]/10 animate-bounce" />
          <span>Dehqon Market</span>
        </div>
        <button
          onClick={toggleDarkMode}
          className="p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-main)] shadow-sm"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-zinc-500" />}
        </button>
      </div>

      {/* Main Slogan & Info Banner */}
      <div className="p-6 bg-gradient-to-r from-emerald-800 to-green-700 text-white rounded-3xl shadow-md space-y-2 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-4 translate-y-4">
          <Sparkles className="w-48 h-48" />
        </div>
        <span className="bg-emerald-600/50 text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full border border-emerald-500/20">
          Uchashuv Joyi
        </span>
        <h2 className="text-xl md:text-2xl font-extrabold">Dehqondan xaridorga bevosita.</h2>
        <p className="text-xs md:text-sm text-emerald-100 max-w-lg font-light leading-relaxed">
          Uzum Market uslubidagi premium qishloq xo'jaligi savdo maydonchasi. Bu yerda faqat haqiqiy dehqonlar va toza tabiiy hosillar.
        </p>
      </div>

      {/* Search and Filters Toggle */}
      <div className="flex gap-2.5">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3.5 text-zinc-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Mahsulot nomi yoki kalit so'zlarni qidiring..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] pl-11 pr-4 py-3.5 rounded-2xl shadow-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-dehqon-green)] text-sm"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-5 py-3.5 rounded-2xl font-semibold border transition-all text-sm cursor-pointer shadow-sm ${
            showFilters || region || category || minPrice || maxPrice || harvestYear
              ? 'bg-[var(--color-dehqon-green)] text-white border-[var(--color-dehqon-green)]'
              : 'bg-[var(--bg-card)] text-[var(--text-main)] border-[var(--border-color)]'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden md:inline">Filtrlar</span>
        </button>
      </div>

      {/* Filter Options Expandable Panel */}
      {(showFilters || region || category || minPrice || maxPrice || harvestYear) && (
        <div className="p-5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-md grid grid-cols-2 md:grid-cols-5 gap-3.5 relative animate-fade">
          
          {/* Region */}
          <div className="space-y-1 col-span-2 md:col-span-1">
            <label className="text-xs font-semibold text-[var(--text-muted)]">Viloyat</label>
            <select
              value={region}
              onChange={(e) => {
                setRegion(e.target.value);
                setDistrict('');
                setOffset(0);
              }}
              className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] px-2.5 py-2 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-dehqon-green)]"
            >
              <option value="">Barchasi</option>
              {regionsData.map((r, i) => (
                <option key={i} value={r.name}>{r.name}</option>
              ))}
            </select>
          </div>

          {/* District */}
          <div className="space-y-1 col-span-2 md:col-span-1">
            <label className="text-xs font-semibold text-[var(--text-muted)]">Tuman</label>
            <select
              value={district}
              disabled={!region}
              onChange={(e) => {
                setDistrict(e.target.value);
                setOffset(0);
              }}
              className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] px-2.5 py-2 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-dehqon-green)] disabled:opacity-50"
            >
              <option value="">Barchasi</option>
              {selectedRegionData?.districts.map((d, i) => (
                <option key={i} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[var(--text-muted)]">Kategoriya</label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setOffset(0);
              }}
              className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] px-2.5 py-2 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-dehqon-green)]"
            >
              <option value="">Barchasi</option>
              {categoriesData.map((cat, i) => (
                <option key={i} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[var(--text-muted)]">Narx (so'm)</label>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                placeholder="min"
                value={minPrice}
                onChange={(e) => {
                  setMinPrice(e.target.value);
                  setOffset(0);
                }}
                className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] px-2 py-2 rounded-xl text-xs text-center focus:outline-none"
              />
              <span className="text-[var(--text-muted)]">-</span>
              <input
                type="number"
                placeholder="max"
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(e.target.value);
                  setOffset(0);
                }}
                className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] px-2 py-2 rounded-xl text-xs text-center focus:outline-none"
              />
            </div>
          </div>

          {/* Harvest Year */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[var(--text-muted)]">Hosil yili</label>
            <input
              type="number"
              placeholder="Masalan: 2026"
              value={harvestYear}
              onChange={(e) => {
                setHarvestYear(e.target.value);
                setOffset(0);
              }}
              className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] px-2 py-2 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-dehqon-green)]"
            />
          </div>

          <div className="col-span-2 md:col-span-5 flex justify-end gap-2.5 mt-2 pt-2 border-t border-[var(--border-color)]">
            <button
              onClick={resetFilters}
              className="px-4 py-2 border border-zinc-200 dark:border-zinc-700 text-xs font-bold rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 text-[var(--text-main)]"
            >
              Filtrlarni tozalash
            </button>
          </div>
        </div>
      )}

      {/* Tabs / Filter Sections - 3 columns grid on Mobile, horizontal strip on Desktop */}
      <div className="grid grid-cols-3 md:flex gap-2 md:gap-5 md:border-b md:border-[var(--border-color)] md:overflow-x-auto md:no-scrollbar text-xs md:text-sm font-medium">
        {[
          { id: 'all', label: 'Barcha e\'lonlar' },
          { id: 'popular', label: 'Eng ommabop' },
          { id: 'newest', label: 'Yangi e\'lonlar' },
          { id: 'ai_recommended', label: 'AI Tavsiyalar' },
          { id: 'recently_viewed', label: 'Ko\'rilganlar' },
        ].map((t) => {
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => {
                setTab(t.id);
                setOffset(0);
              }}
              className={`px-2.5 py-2.5 md:py-0 md:pb-3.5 md:px-1 text-center font-bold cursor-pointer transition-all rounded-xl md:rounded-none border md:border-0 md:border-b-2 shadow-xs md:shadow-none flex items-center justify-center gap-1 ${
                isActive
                  ? 'bg-[var(--color-dehqon-green)] text-white border-[var(--color-dehqon-green)] md:bg-transparent md:border-[var(--color-dehqon-green)] md:text-[var(--color-dehqon-green)] md:dark:text-[var(--color-dehqon-accent)]'
                  : 'bg-[var(--bg-card)] text-[var(--text-main)] border-[var(--border-color)] hover:bg-[var(--bg-app)] md:bg-transparent md:border-transparent md:text-[var(--text-muted)] md:hover:text-[var(--text-main)]'
              }`}
            >
              {t.id === 'ai_recommended' && (
                <Sparkles className={`w-3.5 h-3.5 animate-pulse ${isActive ? 'text-amber-300' : 'text-amber-500'}`} />
              )}
              <span className="truncate">{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Product Grid */}
      {loading && products.length === 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, idx) => (
            <SkeletonCard key={idx} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center space-y-3">
          <SlidersHorizontal className="w-12 h-12 text-zinc-300 dark:text-zinc-700 animate-spin" />
          <h3 className="font-bold text-lg text-[var(--text-main)]">Mahsulotlar topilmadi</h3>
          <p className="text-xs text-[var(--text-muted)] max-w-xs">Ushbu filtr yoki qidiruv so'rovi bo'yicha hech qanday mahsulot topilmadi.</p>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                isFavorite={favorites.includes(p.id)}
                onFavoriteToggle={() => handleFavoriteToggle(p.id)}
                onContact={() => handleContact(p)}
                onShare={() => handleShare(p)}
                onClick={() => handleProductClick(p)}
              />
            ))}
          </div>

          {/* Load More Button (Infinite scroll fallback) */}
          {products.length < total && (
            <div className="flex justify-center">
              <button
                onClick={loadMore}
                disabled={loading}
                className="px-6 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--dehqon-light)] dark:hover:bg-zinc-800 text-xs font-semibold transition-colors disabled:opacity-50 shadow-sm"
              >
                {loading ? 'Yuklanmoqda...' : 'Ko\'proq yuklash'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* 1. PRODUCT DETAIL MODAL DIALOG */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedProduct(null)}>
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh] md:max-h-auto overflow-y-auto animate-zoom" onClick={(e) => e.stopPropagation()}>
            {/* Image zoom wrapper */}
            <div className="w-full md:w-1/2 relative bg-zinc-100 dark:bg-zinc-800 h-[280px] md:h-[420px]">
              <img
                src={selectedProduct.image_url}
                alt={selectedProduct.name}
                className="w-full h-full object-cover cursor-zoom-in hover:scale-105 transition-transform duration-300"
                onClick={() => window.open(selectedProduct.image_url, '_blank')}
              />
              {selectedProduct.is_premium === 1 && (
                <div className="absolute top-4 left-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold px-3 py-1 rounded-md shadow-md flex items-center gap-1 animate-pulse">
                  <Sparkles className="w-3.5 h-3.5 fill-amber-300" /> Premium
                </div>
              )}
            </div>

            {/* Info details */}
            <div className="p-6 md:p-8 flex-1 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs text-[var(--color-dehqon-green)] dark:text-[var(--color-dehqon-accent)] bg-[var(--dehqon-light)] dark:bg-emerald-950/20 px-2 py-0.5 rounded font-bold">
                      {selectedProduct.fruit_type || selectedProduct.category}
                    </span>
                    <h2 className="text-xl font-bold text-[var(--text-main)] mt-1.5">{selectedProduct.name}</h2>
                  </div>
                  <span className="text-xs text-[var(--text-muted)] flex items-center gap-0.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {selectedProduct.harvest_year}-yil hosili
                  </span>
                </div>

                <div className="flex justify-between items-center bg-[var(--bg-app)] p-3 rounded-2xl border border-[var(--border-color)]">
                  <div>
                    <span className="text-xs text-[var(--text-muted)] block">Narxi</span>
                    <span className="text-lg font-black text-[var(--color-dehqon-green)] dark:text-[var(--color-dehqon-accent)]">
                      {selectedProduct.price.toLocaleString()} so'm {selectedProduct.quantity.includes(' ') ? `/ ${selectedProduct.quantity.split(' ').slice(1).join(' ')}` : ''}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-[var(--text-muted)] block">Mavjud miqdor</span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800 inline-block mt-0.5">
                      {selectedProduct.quantity}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-[var(--text-muted)] font-semibold block">Dehqon izohi:</span>
                  <p className="text-sm text-[var(--text-main)] font-light leading-relaxed max-h-36 overflow-y-auto pr-1">
                    {selectedProduct.description}
                  </p>
                </div>

                <div className="space-y-2 pt-2 text-xs border-t border-[var(--border-color)] text-[var(--text-muted)]">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-zinc-400" />
                    <span>Viloyat/Tuman: <b className="text-[var(--text-main)] font-medium">{selectedProduct.region}, {selectedProduct.district}</b></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-zinc-400" />
                    <span>Ko'rishlar soni: <b className="text-[var(--text-main)] font-medium">{selectedProduct.views} marta</b></span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleContact(selectedProduct)}
                  className="flex-1 bg-[var(--color-dehqon-green)] hover:bg-[var(--color-dehqon-dark)] text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  <Phone className="w-4 h-4" />
                  Dehqon bilan bog'lanish
                </button>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="px-5 py-3.5 border border-[var(--border-color)] rounded-2xl text-xs font-bold text-[var(--text-main)] hover:bg-[var(--bg-app)] transition-colors cursor-pointer"
                >
                  Yopish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. NOTEBOOK CONTACT DETAILS MODAL (Copy features) */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowContactModal(null)}>
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-6 rounded-3xl shadow-xl w-full max-w-sm flex flex-col gap-5 text-center animate-zoom" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/40 text-[var(--color-dehqon-green)] dark:text-[var(--color-dehqon-accent)] rounded-full flex items-center justify-center self-center shadow-inner">
              <Phone className="w-6 h-6 animate-pulse" />
            </div>
            
            <div className="space-y-1">
              <h3 className="font-bold text-lg text-[var(--text-main)]">Dehqon telefon raqami</h3>
              <p className="text-xs text-[var(--text-muted)]">Mahsulot: "{showContactModal.name}"</p>
            </div>

            <div className="bg-[var(--bg-app)] border border-[var(--border-color)] py-3 px-4 rounded-2xl flex items-center justify-between text-base font-bold text-[var(--text-main)] shadow-sm">
              <span>{showContactModal.phone}</span>
              <button
                onClick={() => handleCopyNumber(showContactModal.phone)}
                className="p-2 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--dehqon-light)] dark:hover:bg-zinc-800 text-[var(--text-main)] border border-[var(--border-color)] transition-colors active:scale-90"
              >
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-zinc-500" />}
              </button>
            </div>

            <div className="flex gap-2.5">
              <a
                href={`tel:${showContactModal.phone}`}
                className="flex-1 bg-[var(--color-dehqon-green)] hover:bg-[var(--color-dehqon-dark)] text-white text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-1.5 shadow-sm"
              >
                Tizimda qo'ng'iroq
                <ArrowUpRight className="w-4 h-4" />
              </a>
              <button
                onClick={() => setShowContactModal(null)}
                className="px-4 py-3 border border-[var(--border-color)] rounded-xl text-xs font-bold text-[var(--text-main)] hover:bg-[var(--bg-app)]"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
