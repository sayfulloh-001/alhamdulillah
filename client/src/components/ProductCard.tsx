import React from 'react';
import { Heart, Share2, Phone, Eye, Calendar, MapPin, Sparkles } from 'lucide-react';

export interface Product {
  id: number;
  user_id: number;
  name: string;
  category: string;
  fruit_type: string;
  harvest_year: number;
  price: number;
  quantity: string;
  description: string;
  phone: string;
  region: string;
  district: string;
  views: number;
  is_sold: number;
  is_premium: number;
  is_archived: number;
  image_url: string;
  created_at: string;
}

interface ProductCardProps {
  product: Product;
  isFavorite: boolean;
  onFavoriteToggle: () => void;
  onContact: () => void;
  onShare: () => void;
  onClick: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isFavorite,
  onFavoriteToggle,
  onContact,
  onShare,
  onClick,
}) => {
  // Format Date beautifully
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' });
    } catch {
      return '';
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  // Extract unit if available from product.quantity (e.g. "500 kg" -> "/ kg")
  const getUnit = (qtyStr: string) => {
    if (!qtyStr) return '';
    const parts = qtyStr.trim().split(' ');
    if (parts.length >= 2) {
      return `/ ${parts.slice(1).join(' ')}`;
    }
    return '';
  };

  return (
    <div className={`bg-[var(--bg-card)] rounded-2xl overflow-hidden shadow-sm flex flex-col h-[420px] hover-scale relative group cursor-pointer transition-all ${
      product.is_premium === 1 ? 'border-2 border-amber-400/80 shadow-lg shadow-amber-500/10 dark:shadow-amber-500/10 ring-1 ring-amber-400/30' : 'border border-[var(--border-color)]'
    }`} onClick={onClick}>
      {/* Badges and actions */}
      <div className="relative w-full h-[200px] overflow-hidden bg-gray-100 dark:bg-zinc-800">
        <img
          src={product.image_url || 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?q=80&w=600&auto=format&fit=crop'}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Sold Badge */}
        {product.is_sold === 1 && (
          <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm z-10">
            Sotilgan
          </div>
        )}

        {/* Premium Badge */}
        {product.is_premium === 1 && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-xl shadow-lg flex items-center gap-1.5 z-10 border border-amber-300 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 fill-amber-200 text-white" />
            ★ PREMIUM E'LON
          </div>
        )}

        {/* Favorite heart and share buttons */}
        <div className="absolute bottom-3 right-3 flex gap-1.5 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFavoriteToggle();
            }}
            className="w-9 h-9 rounded-full glass flex items-center justify-center text-red-500 hover:scale-110 active:scale-95 transition-all shadow-sm"
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-zinc-600 dark:text-zinc-300'}`} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onShare();
            }}
            className="w-9 h-9 rounded-full glass flex items-center justify-center text-zinc-700 dark:text-zinc-200 hover:scale-110 active:scale-95 transition-all shadow-sm"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Product Information */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs text-[var(--text-muted)]">
            <span className="bg-[var(--border-color)] px-2 py-0.5 rounded font-medium text-[var(--color-dehqon-green)] dark:text-[var(--color-dehqon-accent)]">
              {product.fruit_type || product.category}
            </span>
            <span className="flex items-center gap-0.5">
              <Calendar className="w-3 h-3" />
              {product.harvest_year}-yil
            </span>
          </div>

          <h3 className="font-semibold text-base text-[var(--text-main)] line-clamp-1 group-hover:text-[var(--color-dehqon-green)] transition-colors">
            {product.name}
          </h3>

          <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
            <MapPin className="w-3.5 h-3.5 text-zinc-400" />
            <span className="line-clamp-1">{product.region}, {product.district}</span>
          </div>
        </div>

        {/* Price & Contact Action */}
        <div className="mt-3 space-y-3">
          <div className="flex justify-between items-baseline">
            <div>
              <span className="text-lg font-bold text-[var(--color-dehqon-green)] dark:text-[var(--color-dehqon-accent)]">
                {product.price.toLocaleString('uz-UZ')}
              </span>
              <span className="text-xs text-[var(--text-muted)] ml-0.5">
                so'm {getUnit(product.quantity)}
              </span>
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
              Mavjud: {product.quantity}
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onContact();
            }}
            className="w-full bg-[var(--color-dehqon-green)] hover:bg-[var(--color-dehqon-dark)] text-white font-medium py-2 rounded-xl flex items-center justify-center gap-2 transition-all hover:shadow-md hover:shadow-green-950/10 active:scale-[0.98]"
          >
            <Phone className="w-4 h-4" />
            Bog'lanish
          </button>

          {/* Views, Date & Time metadata footer */}
          <div className="flex justify-between items-center text-[10px] text-[var(--text-muted)] pt-1 border-t border-[var(--border-color)]">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {product.views} marta ko'rildi
            </span>
            <span>
              {formatDate(product.created_at)} • {formatTime(product.created_at)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
