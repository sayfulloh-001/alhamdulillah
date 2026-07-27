const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const premiumRoutes = require('./routes/premium');
const adminRoutes = require('./routes/admin');
const notificationRoutes = require('./routes/notifications');

const app = express();
const PORT = process.env.PORT || 5000;

// Security and CORS
app.use(helmet({
  contentSecurityPolicy: false, // For local testing and ease of loading fonts/images
}));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Express configurations - increase limits for base64 image uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Simple Rate Limiting Middleware
const ipRequestLimits = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 300; // 300 requests per minute (allows smooth silent background polling)

function rateLimiter(req, res, next) {
  const ip = req.ip;
  const now = Date.now();

  if (!ipRequestLimits.has(ip)) {
    ipRequestLimits.set(ip, []);
  }

  const timestamps = ipRequestLimits.get(ip);
  const activeTimestamps = timestamps.filter(time => now - time < RATE_LIMIT_WINDOW);
  
  if (activeTimestamps.length >= MAX_REQUESTS) {
    return res.status(429).json({ message: 'Siz juda ko\'p so\'rov yubordingiz. Birozdan so\'ng qayta urinib ko\'ring.' });
  }

  activeTimestamps.push(now);
  ipRequestLimits.set(ip, activeTimestamps);
  next();
}

app.use('/api', rateLimiter);

// API Routing
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/premium', premiumRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Dynamic SEO Sitemap endpoint
const db = require('./database');
app.get(['/sitemap.xml', '/api/sitemap.xml'], async (req, res) => {
  try {
    const products = await db.query('SELECT id, name, created_at FROM products WHERE is_archived = 0');
    const baseUrl = 'https://dehqon-sell.vercel.app';
    const staticRoutes = [
      { url: '/', priority: '1.0', changefreq: 'daily' },
      { url: '/?category=Mevalar', priority: '0.9', changefreq: 'daily' },
      { url: '/?category=Sabzavotlar', priority: '0.9', changefreq: 'daily' },
      { url: '/?category=Poliz+mahsulotlari', priority: '0.9', changefreq: 'daily' },
      { url: '/?category=Don+va+urug%27lar', priority: '0.8', changefreq: 'daily' },
      { url: '/?category=Chorva+va+parrandachilik', priority: '0.8', changefreq: 'daily' },
      { url: '/?region=Toshkent', priority: '0.85', changefreq: 'daily' },
      { url: '/?region=Samarqand', priority: '0.85', changefreq: 'daily' },
      { url: '/?region=Farg%27ona', priority: '0.85', changefreq: 'daily' },
      { url: '/?page=premium', priority: '0.7', changefreq: 'monthly' }
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Static pages
    staticRoutes.forEach(r => {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}${r.url}</loc>\n`;
      xml += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
      xml += `    <changefreq>${r.changefreq}</changefreq>\n`;
      xml += `    <priority>${r.priority}</priority>\n`;
      xml += `  </url>\n`;
    });

    // Dynamic products from DB
    if (Array.isArray(products)) {
      products.forEach(p => {
        const dateStr = p.created_at ? new Date(p.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}/?product=${p.id}</loc>\n`;
        xml += `    <lastmod>${dateStr}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.75</priority>\n`;
        xml += `  </url>\n`;
      });
    }

    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    console.error("Sitemap generation error:", err);
    res.status(500).send("Error generating sitemap");
  }
});

// Serve frontend client in production build
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

// Start Server
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`Dehqon Market backend running on port: ${PORT}`);
  });
}

module.exports = app;
