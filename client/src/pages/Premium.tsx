import React, { useState, useEffect } from 'react';
import { Sparkles, Copy, Check, Upload, Clock, AlertTriangle, ShieldCheck, RefreshCw, FileText } from 'lucide-react';
import { apiRequest } from '../utils/api';
import { compressImage } from '../utils/imageCompressor';
import { showToast } from '../utils/toast';
import { SEOHead } from '../components/SEOHead';

interface PremiumProps {
  currentUser: any;
  fetchProfile: () => void;
}

export const Premium: React.FC<PremiumProps> = ({ currentUser, fetchProfile }) => {
  const [copied, setCopied] = useState(false);
  const [receipt, setReceipt] = useState('');
  const [fileName, setFileName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [receiptsList, setReceiptsList] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const cardNumber = '9860 0803 9506 0082';

  useEffect(() => {
    fetchReceiptsHistory();
  }, []);

  const fetchReceiptsHistory = async () => {
    try {
      setLoadingHistory(true);
      const data = await apiRequest('/premium/receipts');
      setReceiptsList(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleCopyCard = () => {
    navigator.clipboard.writeText(cardNumber.replace(/\s/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setError('');
      setFileName(file.name);

      // Client-side WebP compression for images, native base64 for PDFs
      const base64Str = await compressImage(file);
      setReceipt(base64Str);
    } catch (err) {
      setError('Chek yuklashda xatolik. Iltimos qaytadan urinib ko\'ring.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!receipt) {
      setError('Iltimos, avval to\'lov chekini (rasm yoki PDF) yuklang.');
      return;
    }

    setSubmitting(true);

    try {
      await apiRequest('/premium/receipt', {
        method: 'POST',
        body: JSON.stringify({ receipt_url: receipt })
      });

      showToast('To\'lov cheki yuborildi. Tez orada tekshirilib tasdiqlanadi.', 'success');
      setReceipt('');
      setFileName('');
      fetchProfile(); // update user pending status
      fetchReceiptsHistory(); // refresh receipts list
    } catch (err: any) {
      setError(err.message || 'Chek yuborishda xatolik yuz berdi.');
    } finally {
      setSubmitting(false);
    }
  };

  // Determine current pending / verification status
  const currentStatus = currentUser?.premium_status || 'none'; // 'none', 'pending', 'approved', 'rejected'

  return (
    <div className="space-y-6 pb-20 md:pb-6 max-w-2xl mx-auto">
      <SEOHead
        title="Premium VIP Tarif — Dehqon Market | Cheksiz E'lonlar va TOP O'rinlar"
        description="Dehqon Market Premium VIP obuna bo'ling: cheksiz e'lon joylashtirish, e'lonlaringizni TOP 1-o'rinda ko'rsatish va 10 barobar ko'proq xaridor topish imkoniyati."
      />
      
      {/* Premium Hero Promo Card (Blue, Green, Yellow/Gold & White theme) */}
      <div className="p-6 md:p-8 bg-gradient-to-br from-blue-950 via-emerald-950 to-zinc-950 text-white rounded-3xl border-2 border-emerald-400/40 shadow-2xl space-y-4 relative overflow-hidden ring-2 ring-amber-400/30">
        <div className="absolute right-0 bottom-0 opacity-20 pointer-events-none transform translate-x-6 translate-y-6">
          <Sparkles className="w-52 h-52 text-amber-400 fill-amber-300" />
        </div>
        
        <div className="flex items-center gap-2">
          <span className="bg-gradient-to-r from-blue-500 via-emerald-400 to-amber-400 text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-full tracking-wider shadow-md flex items-center gap-1 border border-white">
            <Sparkles className="w-3.5 h-3.5 fill-white" /> Premium VIP Tarif
          </span>
        </div>

        <div className="space-y-1">
          <h2 className="text-xl md:text-2xl font-black bg-gradient-to-r from-blue-400 via-emerald-300 to-amber-300 bg-clip-text text-transparent">Dehqon Market Premium</h2>
          <p className="text-xs md:text-sm text-zinc-100 leading-relaxed font-light">
            E'lonlaringiz sonini 100 tagacha oshiring. Barcha mahsulotlaringiz asosiy sahifada eng yuqori o'rinlarda maxsus ramka va yorliq bilan ko'rsatiladi va sotilish imkoniyati 5 baravar ortadi.
          </p>
        </div>

        <div className="pt-3 flex items-center justify-between border-t border-emerald-900/60">
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-400 block">Bir martalik to'lov</span>
            <span className="text-xl font-black text-amber-300 drop-shadow-sm">49,000 so'm</span>
          </div>
          
          {currentUser?.is_premium === 1 ? (
            <div className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white border border-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md">
              <ShieldCheck className="w-4 h-4 text-amber-300" /> Faol (100 mahsulot)
            </div>
          ) : currentStatus === 'pending' ? (
            <div className="bg-amber-500/30 text-amber-300 border border-amber-400/40 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1">
              <Clock className="w-4 h-4 animate-spin" /> Tekshirilmoqda...
            </div>
          ) : (
            <div className="bg-zinc-800 text-zinc-300 text-xs font-bold px-3.5 py-2 rounded-xl border border-zinc-700">
              Faollashtirilmagan
            </div>
          )}
        </div>
      </div>

      {/* Payment Instruction (Always visible for card copy & receipt upload) */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-6 rounded-3xl shadow-sm space-y-6 animate-fade">
        <div className="space-y-1 border-b border-[var(--border-color)] pb-3">
          <h3 className="font-bold text-base text-[var(--text-main)]">1-qadam: To'lovni amalga oshiring</h3>
          <p className="text-xs text-[var(--text-muted)]">Istalgan bank ilovasi (Click, Payme, Apelsin) orqali ushbu kartaga 49,000 so'm to'lang.</p>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--bg-app)] border border-[var(--border-color)] p-4 rounded-2xl">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Karta raqami (Humo)</span>
            <span className="text-lg font-black text-[var(--text-main)] block tracking-wide">{cardNumber}</span>
          </div>
          <button
            onClick={handleCopyCard}
            className="w-full md:w-auto bg-[var(--bg-card)] border border-[var(--border-color)] hover:bg-[var(--dehqon-light)] dark:hover:bg-zinc-800 text-[var(--text-main)] font-semibold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-colors active:scale-95 shadow-sm cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4.5 h-4.5 text-green-600" /> Karta ko'chirildi
              </>
            ) : (
              <>
                <Copy className="w-4.5 h-4.5 text-zinc-500" /> Kartani nusxalash
              </>
            )}
          </button>
        </div>

        <div className="space-y-1 border-b border-[var(--border-color)] pb-3 pt-2">
          <h3 className="font-bold text-base text-[var(--text-main)]">2-qadam: Chekni yuklang</h3>
          <p className="text-xs text-[var(--text-muted)]">To'lov chekini rasm (WebP, JPG) yoki PDF formatida yuboring.</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 border border-red-200 text-xs rounded-xl text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[var(--border-color)] hover:border-[var(--color-dehqon-green)] rounded-2xl cursor-pointer bg-[var(--bg-app)] transition-colors relative overflow-hidden group">
              <div className="flex flex-col items-center justify-center text-center space-y-1.5">
                <div className="p-2 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] text-[var(--color-dehqon-green)]">
                  <Upload className="w-4 h-4" />
                </div>
                {fileName ? (
                  <span className="text-xs text-[var(--text-main)] font-semibold flex items-center gap-1">
                    <FileText className="w-4 h-4 text-emerald-600" /> {fileName}
                  </span>
                ) : (
                  <>
                    <p className="text-xs text-[var(--text-main)] font-semibold">Chek rasmi yoki PDF yuklash</p>
                    <p className="text-[9px] text-[var(--text-muted)]">Maksimal hajm 300KB</p>
                  </>
                )}
              </div>
              <input
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={handleReceiptUpload}
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting || !receipt}
            className="w-full bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer text-sm"
          >
            {submitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Yuborilmoqda...
              </>
            ) : (
              'Tasdiqlash uchun yuborish'
            )}
          </button>
        </form>
      </div>

      {/* Pending status details block */}
      {currentStatus === 'pending' && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-6 rounded-3xl shadow-sm text-center space-y-4 animate-fade">
          <div className="w-12 h-12 bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-base text-[var(--text-main)]">Chek tekshirilmoqda</h3>
            <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
              Siz to'lov chekini yubordingiz. Tizim administratori chekni 10-15 daqiqa ichida tekshiradi va premium imkoniyatlarini faollashtiradi.
            </p>
          </div>
        </div>
      )}

      {/* Rejected status details block */}
      {currentStatus === 'rejected' && (
        <div className="bg-[var(--bg-card)] border border-red-200 dark:border-red-950 p-6 rounded-3xl shadow-sm text-center space-y-4 animate-fade">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <AlertTriangle className="w-6 h-6 animate-bounce" />
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-base text-red-600 dark:text-red-400">Premium rad etildi</h3>
            <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
              Siz yuborgan to'lov cheki admin tomonidan rad etildi. Iltimos, to'lov to'g'ri qilinganligiga ishonch hosil qiling va chekni qayta yuboring.
            </p>
          </div>
          <button
            onClick={async () => {
              // Reset status back to none on server to allow upload
              try {
                await apiRequest('/auth/me'); // dummy check
                // We let them overwrite by simply uploading another receipt, we handle this client side
              } catch {}
            }}
            className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-sm transition-all"
          >
            Qayta chek yuborish
          </button>
        </div>
      )}

      {/* Receipts History */}
      <div className="space-y-3 pt-4">
        <h3 className="font-bold text-sm text-[var(--text-main)]">Yuborilgan cheklar tarixi</h3>
        {loadingHistory ? (
          <div className="skeleton w-full h-24 rounded-2xl" />
        ) : receiptsList.length === 0 ? (
          <p className="text-xs text-[var(--text-muted)] italic text-center py-4">Sizda hali cheklar tarixi mavjud emas.</p>
        ) : (
          <div className="space-y-2">
            {receiptsList.map((r, idx) => (
              <div key={idx} className="bg-[var(--bg-card)] border border-[var(--border-color)] p-3 rounded-2xl flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <span className="font-bold text-[var(--text-main)]">Chek #{r.id}</span>
                  <span className="text-[10px] text-[var(--text-muted)] block">Yuborilgan sana: {new Date(r.created_at).toLocaleDateString('uz-UZ')}</span>
                </div>
                <div className="flex items-center gap-2">
                  {r.status === 'Tasdiqlandi' ? (
                    <span className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 px-2.5 py-1 rounded-full font-bold">Tasdiqlandi</span>
                  ) : r.status === 'Rad etildi' ? (
                    <span className="bg-red-50 dark:bg-red-950/30 text-red-600 px-2.5 py-1 rounded-full font-bold">Rad etildi</span>
                  ) : (
                    <span className="bg-amber-50 dark:bg-amber-950/30 text-amber-600 px-2.5 py-1 rounded-full font-bold animate-pulse">Tekshirilmoqda</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
