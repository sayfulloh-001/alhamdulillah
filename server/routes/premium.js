const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticateToken } = require('../middleware/auth');

// SUBMIT RECEIPT FOR PREMIUM ACTIVATION
router.post('/receipt', authenticateToken, async (req, res) => {
  try {
    const { receipt_url } = req.body; // base64 representation of Image/PDF or URL

    if (!receipt_url) {
      return res.status(400).json({ message: 'Chek rasmi yoki PDF yuborilishi shart.' });
    }

    const createdAt = new Date().toISOString();

    // Check if there is already a pending receipt to avoid spam
    const existing = await db.query(
      'SELECT * FROM receipts WHERE user_id = ? AND status = ?',
      [req.user.id, 'Tekshirilmoqda']
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Sizda allaqachon tekshirilayotgan chek mavjud.' });
    }

    // Insert Receipt record
    await db.run(
      'INSERT INTO receipts (user_id, receipt_url, status, comment, created_at) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, receipt_url, 'Tekshirilmoqda', '', createdAt]
    );

    // Update user's premium request status
    await db.run(
      'UPDATE users SET premium_status = ? WHERE id = ?',
      ['pending', req.user.id]
    );

    // Insert notification
    await db.run(
      'INSERT INTO notifications (user_id, title, message, created_at) VALUES (?, ?, ?, ?)',
      [
        req.user.id,
        'Chek yuborildi 💸',
        'Sizning to\'lov chekingiz muvaffaqiyatli yuborildi va tez orada admin tomonidan ko\'rib chiqiladi.',
        createdAt
      ]
    );

    res.status(201).json({ message: 'Chek yuborildi. Tekshirilmoqda.' });
  } catch (err) {
    console.error("Submit receipt error:", err);
    res.status(500).json({ message: 'Server xatoligi yuz berdi.' });
  }
});

// GET CURRENT USER'S RECEIPTS HISTORY
router.get('/receipts', authenticateToken, async (req, res) => {
  try {
    const receipts = await db.query(
      'SELECT * FROM receipts WHERE user_id = ? ORDER BY id DESC',
      [req.user.id]
    );
    res.json(receipts);
  } catch (err) {
    console.error("Get receipts error:", err);
    res.status(500).json({ message: 'Server xatoligi.' });
  }
});

module.exports = router;
