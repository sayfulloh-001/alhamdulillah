import React, { useState } from 'react';
import { Leaf, User, Phone, MapPin, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { regionsData } from '../utils/regions';
import { apiRequest } from '../utils/api';
import { SEOHead } from '../components/SEOHead';

interface RegisterProps {
  onRegisterSuccess: (user: any, token: string) => void;
}

export const Register: React.FC<RegisterProps> = ({ onRegisterSuccess }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [region, setRegion] = useState('');
  const [district, setDistrict] = useState('');
  const [mahalla, setMahalla] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // For Admin login shortcut option
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPhone, setAdminPhone] = useState('');
  const [adminPassword, setAdminPassword] = useState('');



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Field validation
    if (!firstName || !lastName || !phone || !region || !mahalla || !password) {
      setError('Iltimos, barcha maydonlarni to\'ldiring.');
      return;
    }

    if (password.length < 4) {
      setError('Parol kamida 4 ta belgidan iborat bo\'lishi kerak.');
      return;
    }

    setLoading(true);

    try {
      const data = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          phone,
          region,
          district,
          mahalla,
          password
        })
      });

      onRegisterSuccess(data.user, data.token);
    } catch (err: any) {
      setError(err.message || 'Ro\'yxatdan o\'tishda xatolik yuz berdi.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          phone: adminPhone,
          password: adminPassword
        })
      });

      onRegisterSuccess(data.user, data.token);
    } catch (err: any) {
      setError(err.message || 'Admin kirishda xatolik.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-tr from-zinc-100 to-emerald-50 dark:from-zinc-950 dark:to-emerald-950/20">
      <SEOHead
        title="Ro'yxatdan O'tish — Dehqon Market | Bepul E'lon Joylashtirish"
        description="Dehqon Market platformasida bepul ro'yxatdan o'ting va o'z meva, sabzavot hamda qishloq xo'jaligi e'lonlaringizni O'zbekiston bo'ylab tarqating."
      />
      <div className="w-full max-w-lg bg-[var(--bg-card)] border border-[var(--border-color)] p-6 md:p-8 rounded-3xl shadow-xl flex flex-col gap-6 transition-all duration-300">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center text-[var(--color-dehqon-green)] dark:text-[var(--color-dehqon-accent)] shadow-inner">
            <Leaf className="w-8 h-8 fill-emerald-600/10" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-main)]">Dehqon Market</h1>
            <p className="text-xs text-[var(--text-muted)] mt-1 font-medium italic">"Dehqondan xaridorga bevosita."</p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 text-sm text-center font-medium">
            {error}
          </div>
        )}

        {/* Regular Signup Form */}
        {!showAdminLogin ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-center mb-1">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Ro'yxatdan o'tish</h2>
              <p className="text-xs text-[var(--text-muted)]">Faqat bir marta ro'yxatdan o'tasiz va doimiy tizimda qolasiz.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* First Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-muted)] flex items-center gap-1">
                  <User className="w-3.5 h-3.5" /> Ism
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ali"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-dehqon-green)] transition-all"
                />
              </div>

              {/* Last Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-muted)] flex items-center gap-1">
                  <User className="w-3.5 h-3.5" /> Familya
                </label>
                <input
                  type="text"
                  required
                  placeholder="Valiyev"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-dehqon-green)] transition-all"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--text-muted)] flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" /> Telefon raqami
              </label>
              <input
                type="tel"
                required
                placeholder="+998 (90) 123-45-67"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-dehqon-green)] transition-all"
              />
            </div>

            {/* Region Selector */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--text-muted)] flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> Viloyat
              </label>
              <select
                required
                value={region}
                onChange={(e) => {
                  setRegion(e.target.value);
                  setDistrict('');
                }}
                className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] px-2.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-dehqon-green)] transition-all"
              >
                <option value="">Tanlang</option>
                {regionsData.map((r, i) => (
                  <option key={i} value={r.name}>{r.name}</option>
                ))}
              </select>
            </div>

            {/* Mahalla */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--text-muted)] flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> Mahalla nomi
              </label>
              <input
                type="text"
                required
                placeholder="Yorug'lik mahallasi"
                value={mahalla}
                onChange={(e) => setMahalla(e.target.value)}
                className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-dehqon-green)] transition-all"
              />
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--text-muted)] flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" /> Parol yaratish
              </label>
              <input
                type="password"
                required
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-dehqon-green)] transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-amber-500/20 active:scale-[0.98] disabled:opacity-50 mt-6 cursor-pointer"
            >
              {loading ? 'Kutmoqda...' : 'Ro\'yxatdan o\'tish'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* Admin Login Panel option */
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="text-center mb-1">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-amber-600 flex items-center justify-center gap-1">
                <ShieldCheck className="w-4 h-4 text-amber-500 animate-pulse" /> Admin Panel Kirish
              </h2>
              <p className="text-xs text-[var(--text-muted)]">Faqat tizim boshqaruvchilari uchun maxfiy kirish.</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--text-muted)]">Admin Login</label>
              <input
                type="text"
                required
                placeholder="Kiriting"
                value={adminPhone}
                onChange={(e) => setAdminPhone(e.target.value)}
                className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--text-muted)]">Admin Parol</label>
              <input
                type="password"
                required
                placeholder="••••••"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 rounded-2xl flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-amber-950/15 active:scale-[0.98] disabled:opacity-50 mt-6"
            >
              {loading ? 'Kutmoqda...' : 'Tizimga kirish'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Toggle secret admin login form */}
        <button
          onClick={() => {
            setShowAdminLogin(!showAdminLogin);
            setError('');
          }}
          className="text-xs font-semibold text-center text-[var(--text-muted)] hover:text-[var(--color-dehqon-green)] dark:hover:text-[var(--color-dehqon-accent)] transition-colors self-center mt-2"
        >
          {showAdminLogin ? "Dehqon ro'yxatdan o'tishiga qaytish" : "Tizim Administratori kirishi"}
        </button>

      </div>
    </div>
  );
};
