# Dehqon Market — Dehqondan Xaridorga Bevosita Savdo Web Platformasi

Ushbu platforma dehqonlar va fermerlar uchun maxsus Uzum Market uslubida, toza qishloq xo'jaligi ranglarida (Yashil, Oq, och yashil) ishlab chiqilgan professional, premium darajadagi web-ilovadir.

## 🌟 Tizim Imkoniyatlari
- **Minimalist va Premium Dizayn**: Silliq animatsiyalar, loading skeletlar, responsive dizayn (telefon, planshet va notebooklar uchun mukammal).
- **Dark/Light Mode**: Boshlang'ich rejim Tungi (Dark) hisoblanib, foydalanuvchi xohishiga qarab Kunduzgiga o'zgaradi.
- **Tezkor Ro'yxatdan O'tish**: SMS-tasdiqsiz, bir marta ro'yxatdan o'tish orqali doimiy tizimda qoladi. (Viloyat va Mahalla kiritiladi).
- **E'lonlar Limiti**: Oddiy foydalanuvchiga 2 ta e'lon qo'shish limiti. Premium a'zolarga 100 tagacha limit (100/100 ko'rinishidagi counter).
- **Humo Karta orqali Premium To'lov**: To'lov chekini (rasm/PDF) yuklash va admin tasdiqini kutish oqimi.
- **Maxfiy Admin Panel**: 
  - Login: `77777777777777777777`
  - Parol: `77777777777777777777`
  - Statistika, Foydalanuvchilar ro'yxati, To'lov chekini tasdiqlash/rad etish, e'lonlarni o'chirish.
- **TOP 15 Reyting**: Eng faol dehqonlarni medallar (🥇, 🥈, 🥉) bilan saralash tizimi.
- **Zero LocalStorage & Zero Alert**: Hech qanday browser alertlarisiz (o'rniga animatsion Toastlar) va `localStorage` ishlatmasdan (cookie-based persistence) ishlash.
- **WebP Image Compression**: Rasmlar galereyadan yuklanayotganda browserning o'zida Canvas orqali WebP formatiga siqiladi va hajmi strictly **300KB dan oshmaydi**.

## 🚀 Mahalliy Ishga Tushirish Yo'riqnomasi

1. **GitHub Repozitoriyani yuklab oling**:
   ```bash
   git clone https://github.com/sayfulloh-001/oxirgi-imkoniyat.git
   cd oxirgi-imkoniyat
   ```

2. **Barcha loyiha dependency'larini o'rnating** (frontend va backend uchun bir vaqtda):
   ```bash
   npm run install:all
   ```

3. **Loyiha xizmatlarini ishga tushiring**:
   ```bash
   npm run dev
   ```
   Bu komanda backend server (port: 5000) va frontend client (port: 5173) ni birgalikda ishga tushiradi.

## 🌍 Renderga Joylashtirish (Production)
Render.com da yangi **Web Service** oching va GitHub repozitoriyangizni ulang:
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Env Variables**:
  - `NODE_ENV` = `production`
  - `JWT_SECRET` = `istalgan_secure_key`

<!-- Vercel Deployment Trigger -->
