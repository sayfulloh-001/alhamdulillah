import React, { useEffect } from 'react';

export interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: string;
  structuredData?: object | object[];
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title = "Dehqon Market — Dehqonchilik Mahsulotlari Sotish va Sotib Olish Platformasi | Vositachisiz Qishloq Xo'jaligi Bozori",
  description = "O'zbekistondagi eng yirik dehqonchilik va qishloq xo'jaligi online bozori. Meva, sabzavot, poliz mahsulotlari, don, urug' va chorva mahsulotlarini vositachilarsiz bevosita dehqon va fermerdan arzon narxda sotib oling yoki o'z e'loningizni bepul joylashtiring.",
  keywords = "dehqon market, dehqonlar bozori, meva sotish, sabzavot sotish, uzum sotish, pomidor narxi, kartoshka ulgurji narxi, o'zbekiston dehqonlari, qishloq xo'jaligi mahsulotlari, agro market uzbekistan, fermerlar bozori, ulgurji savdo, dehqonchilik, toza tabiiy hosil, toshkent dehqon bozor, samarqand fermer",
  canonicalUrl = "https://dehqon-sell.vercel.app",
  ogImage = "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&h=630&q=80",
  ogType = "website",
  structuredData
}) => {
  useEffect(() => {
    // 1. Update Document Title
    document.title = title;

    // 2. Helper to set or create meta tag
    const setMetaTag = (nameAttr: string, attrValue: string, contentValue: string) => {
      let element = document.querySelector(`meta[${nameAttr}="${attrValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(nameAttr, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', contentValue);
    };

    // Standard Meta Tags
    setMetaTag('name', 'description', description);
    setMetaTag('name', 'keywords', keywords);

    // OpenGraph Tags
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('property', 'og:image', ogImage);
    setMetaTag('property', 'og:type', ogType);

    // Twitter Card
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', ogImage);

    // Canonical link
    let canonicalElement = document.querySelector('link[rel="canonical"]');
    if (!canonicalElement) {
      canonicalElement = document.createElement('link');
      canonicalElement.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalElement);
    }
    canonicalElement.setAttribute('href', canonicalUrl);

    // Dynamic JSON-LD Structured Data
    const scriptId = 'dynamic-seo-jsonld';
    let existingScript = document.getElementById(scriptId);
    if (existingScript) {
      existingScript.remove();
    }

    if (structuredData) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      script.text = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }

  }, [title, description, keywords, canonicalUrl, ogImage, ogType, structuredData]);

  return null;
};
