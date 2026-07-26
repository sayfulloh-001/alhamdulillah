const express = require('express');
const router = express.Router();
const db = require('../database');
const { hashPassword, comparePassword, generateToken, authenticateToken } = require('../middleware/auth');

// REGISTER ENDPOINT
router.post('/register', async (req, res) => {
  try {
        const { first_name, last_name, phone, region, district, mahalla, password } = req.body;

    if (!first_name || !last_name || !phone || !region || !mahalla || !password) {
      return res.status(400).json({ message: 'Barcha maydonlar to\'ldirilishi shart.' });
    }

    const finalDistrict = district || '';

    // Check if phone number already exists
    const existing = await db.query('SELECT * FROM users WHERE phone = ?', [phone]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Bu telefon raqami allaqachon ro\'yxatdan o\'tgan.' });
    }

    const hashedPassword = await hashPassword(password);
    const createdAt = new Date().toISOString();

    // Default: normal user has 2 ads limit, premium has 100
    const role = 'user';
    const isPremium = 0;
    const premiumLimit = 2;
    const premiumStatus = 'none'; // 'none', 'pending', 'approved', 'rejected'
    const avatar = '';

    const result = await db.run(
      `INSERT INTO users (first_name, last_name, phone, region, district, mahalla, password, role, is_premium, premium_limit, premium_status, avatar, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [first_name, last_name, phone, region, finalDistrict, mahalla, hashedPassword, role, isPremium, premiumLimit, premiumStatus, avatar, createdAt]
    );

    const userId = result.lastID;
    const user = {
      id: userId,
      first_name,
      last_name,
      phone,
      region,
      district: finalDistrict,
      mahalla,
      role,
      is_premium: isPremium,
      premium_limit: premiumLimit,
      premium_status: premiumStatus,
      avatar,
      created_at: createdAt
    };

    const token = generateToken(user);
    res.status(201).json({
      message: 'Muvaffaqiyatli ro\'yxatdan o\'tildi.',
      token,
      user
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: 'Server xatoligi yuz berdi.' });
  }
});

// LOGIN ENDPOINT (Useful for auto-login revalidation or admin login)
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ message: 'Telefon va parol kiritilishi shart.' });
    }

    const ADMIN_PHONE = process.env.ADMIN_PHONE || '77777777777777777777';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '77777777777777777777';

    // SPECIAL CASE: Secret Admin Login
    if (phone === ADMIN_PHONE && password === ADMIN_PASSWORD) {
      const adminUser = {
        id: 77777,
        first_name: 'Admin',
        last_name: 'Tizim',
        phone: ADMIN_PHONE,
        region: 'Toshkent',
        district: 'Yunusobod',
        mahalla: 'Markaz',
        role: 'admin',
        is_premium: 1,
        premium_limit: 9999,
        premium_status: 'approved',
        avatar: '',
        created_at: new Date().toISOString()
      };
      // Check if admin user exists in DB, if not insert it
      const adminExists = await db.query('SELECT * FROM users WHERE phone = ?', [ADMIN_PHONE]);
      if (adminExists.length === 0) {
        await db.run(
          `INSERT INTO users (first_name, last_name, phone, region, district, mahalla, password, role, is_premium, premium_limit, premium_status, avatar, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [adminUser.first_name, adminUser.last_name, adminUser.phone, adminUser.region, adminUser.district, adminUser.mahalla, 'admin_pass_hashed', 'admin', 1, 9999, 'approved', '', adminUser.created_at]
        );
      } else {
        adminUser.id = adminExists[0].id;
      }

      const token = generateToken(adminUser);
      return res.json({
        message: 'Admin tizimga kirdi.',
        token,
        user: adminUser
      });
    }

    // Regular User Login
    const users = await db.query('SELECT * FROM users WHERE phone = ?', [phone]);
    if (users.length === 0) {
      return res.status(400).json({ message: 'Telefon raqam yoki parol xato.' });
    }

    const user = users[0];
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Telefon raqam yoki parol xato.' });
    }

    // Remove password hash from response
    delete user.password;

    const token = generateToken(user);
    res.json({
      message: 'Tizimga kirildi.',
      token,
      user
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: 'Server xatoligi yuz berdi.' });
  }
});

// GET CURRENT USER PROFILE
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const users = await db.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'Foydalanuvchi topilmadi.' });
    }
    const user = users[0];
    delete user.password;
    res.json(user);
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ message: 'Server xatoligi yuz berdi.' });
  }
});

// UPDATE PROFILE DETAILS
router.put('/me', authenticateToken, async (req, res) => {
  try {
    const { first_name, last_name, phone, region, district } = req.body;
    if (!first_name || !last_name || !phone || !region || !district) {
      return res.status(400).json({ message: 'Barcha maydonlar to\'ldirilishi shart.' });
    }

    // Check phone availability
    const phoneUsers = await db.query('SELECT * FROM users WHERE phone = ? AND id != ?', [phone, req.user.id]);
    if (phoneUsers.length > 0) {
      return res.status(400).json({ message: 'Bu telefon raqami boshqa foydalanuvchida ishlatilmoqda.' });
    }

    await db.run(
      'UPDATE users SET first_name = ?, last_name = ?, phone = ?, region = ?, district = ? WHERE id = ?',
      [first_name, last_name, phone, region, district, req.user.id]
    );

    res.json({ message: 'Profil tahrirlandi.' });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: 'Server xatoligi yuz berdi.' });
  }
});

// UPDATE PROFILE AVATAR
router.put('/me/avatar', authenticateToken, async (req, res) => {
  try {
    const { avatar } = req.body; // base64 or url from client-side WebP compression
    if (!avatar) {
      return res.status(400).json({ message: 'Rasm yuborilmadi.' });
    }

    await db.run('UPDATE users SET avatar = ? WHERE id = ?', [avatar, req.user.id]);
    res.json({ message: 'Profil rasmi o\'zgartirildi.', avatar });
  } catch (err) {
    console.error("Update avatar error:", err);
    res.status(500).json({ message: 'Server xatoligi yuz berdi.' });
  }
});

module.exports = router;
