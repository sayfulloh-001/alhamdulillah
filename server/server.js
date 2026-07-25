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
const MAX_REQUESTS = 100; // 100 requests per minute

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
