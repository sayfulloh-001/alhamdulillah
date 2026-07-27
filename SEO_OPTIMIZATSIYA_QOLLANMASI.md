# 🚀 Dehqon Market — Google va Yandex Qidiruvida 1-O'ringa Chiqish Bo'yicha Mukammal SEO Qo'llanma

Ushbu qo'llanma **Dehqon Market** platformasining Google, Yandex va Bing qidiruv tizimlarida **1-o'rinni (Top #1)** egallashi uchun barcha texnik, on-page va off-page SEO optimizatsiya ishlarini o'z ichiga oladi.

---

## 🛠 1. Tizimda Amalga Oshirilgan Texnik SEO Ishlari (Bajarildi)

Biz loyihada quyidagi eng zamonaviy SEO texnologiyalarini to'liq tatbiq etdik:

1. **`index.html` Meta Optimallashtirish**:
   - Uzbekistondagi eng mashhur qidiruv so'rovlari (*dehqon market, meva sotish, sabzavot ulgurji narxlari, pomidor narxi, kartoshka sotib olish, vositachisiz dehqon bozori*) bilan boyitildi.
   - Title tags, description, author, publisher hamda `geo.region` (UZ) va `geo.placename` (Tashkent, Uzbekistan) teglari joylashtirildi.

2. **Open Graph (OG) va Twitter Cards**:
   - Telegram, WhatsApp, Facebook va Twitter tarmoqlarida e'lonlar va sayt havolasi ulashilganda chiroyli rasm, sarlavha va tavsif avtomatik chiqadigan qilindi.

3. **Schema.org Structured Data (JSON-LD)**:
   - `WebSite` va `SearchAction` (sayt ichidagi qidiruv Google-da to'g'ridan-to'g'ri chiqadi).
   - `Organization` schema (logo, ijtimoiy tarmoqlar, kontaktlar).
   - `FAQPage` rich snippet schema (Google natijalarida savol-javob shaklida javoblar chiqarish uchun).

4. **Dynamic SEO Components (`SEOHead.tsx`)**:
   - Har bir sahifa va turkum (Meva, Sabzavot, Poliz, Don, Chorva) uchun alohida dinamik sarlavha va meta description o'rnatildi.

5. **`robots.txt` va Dynamic `sitemap.xml`**:
   - Crawl-botlar (Googlebot, YandexBot) uchun ruxsat berilgan va taqiqlangan yo'llar belgilandi.
   - Tizimda ham `client/public/sitemap.xml` hamda serverda dinamik `/sitemap.xml` yaratildi (tizimga yangi qo'shilgan har bir e meva va sabzavot e'loni avtomatik sitemap-ga tushadi).

---

## 🎯 2. Google-da 1-O'ringa Chiqish Uchun Keyingi 5 Ta Muhim Qadam

Platformangiz internetga joylangach (Vercel / domen ulanganidan so'ng), quyidagi 5 ta qadamni bajarsangiz saytingiz **Google-da 1-o'ringa** ko'tariladi:

### 1-qadam: Google Search Console-ga Saytni Ulang
1. [Google Search Console](https://search.google.com/search-console) ga kiring.
2. Saytingiz domenini kiriting (masalan: `dehqon-sell.vercel.app` yoki o'zingizning shaxsiy domeningiz `dehqonmarket.uz`).
3. Google bergan TXT yoki HTML meta teg kodini `client/index.html` dagi `<meta name="google-site-verification" content="..." />` joyiga qo'ying.
4. **Sitemaps** bo'limiga o'tib, `https://domeningiz.uz/sitemap.xml` havolasini yuboring. Google 24-48 soat ichida barcha sahifalaringizni indekslaydi.

### 2-qadam: Yandex Webmaster-ga Ulang
1. [Yandex Webmaster](https://webmaster.yandex.ru) ga kiring.
2. Saytni qo'shing va verification tegini `index.html` ga qo'ying.
3. Sitemap qo'shing (`sitemap.xml`). O'zbekiston hududidagi Yandex qidiruvida ham TOP-1 bo'lasiz.

### 3-qadam: Telegram va Ijtimoiy Tarmoqlardan Backlink (Trafik) Yuborish
- Google saytga kelayotgan haqiqiy foydalanuvchilar oqimiga (traffic) qarab uni 1-o me'yorga chiqaradi.
- Telegram kanallar, guruhlar, Instagram bio-da sayt havolasini bering (`https://dehqon-sell.vercel.app`).
- Har kuni yangi e'lonlar qo me'yorida ulashilsa, Google algoritmlari saytni faol va ishonchli deb topadi.

### 4-qadam: Google Business Profile (Google Kartaga Qo'shish)
1. [Google Business Profile](https://google.com/business) ga kiring.
2. "Dehqon Market — Qishloq Xo'jaligi Online Bozori" nomi bilan ro'yxatdan o'ting.
3. Manzil, telefon va sayt havolasini ko me'yorida kiriting. Bu bilan Google Maps va mahalla qidiruvlarida har doim 1-chi bo'lib chiqasiz.

### 5-qadam: Muntazam Kontent va Yangi E'lonlar
- Qanchalik ko'p dehqonlar va sotuvchilar e'lon joylashtirsa, Google shunchalik ko'p kalit so'zlarda (`samarqand uzum sotish`, `fargona o'rik ulgurji`, `toshkent pomidor narxi`) saytingizni 1-o'ringa chiqarib beradi.

---

## 📊 3. SEO Natijasini Tekshirish Dasturlari
- **Google PageSpeed Insights**: Sayt tezligini va Core Web Vitals ko'rsatkichlarini tekshiradi.
- **SEO Audit Tool / Lighthouse**: Chrome F12 -> Lighthouse bo'limida SEO balini 100/100 ko'rishingiz mumkin.

*Dehqon Market jamoasi tomonidan tayyorlandi.*
