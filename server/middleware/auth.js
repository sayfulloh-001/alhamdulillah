const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'dehqon_secret_jwt_key_2026';

// Password utilities
async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

async function comparePassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

// Generate JWT Token
function generateToken(user) {
  return jwt.sign(
    { id: user.id, phone: user.phone, role: user.role, is_premium: user.is_premium },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

// Middleware to verify JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token topilmadi. Avtorizatsiyadan o\'ting.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Yaroqsiz token.' });
    }
    req.user = user;
    next();
  });
}

// Admin role check
function requireAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Ruxsat etilmadi. Faqat admin uchun.' });
  }
}

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  authenticateToken,
  requireAdmin
};
