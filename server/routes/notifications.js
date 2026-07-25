const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticateToken } = require('../middleware/auth');

// GET USER NOTIFICATIONS
router.get('/', authenticateToken, async (req, res) => {
  try {
    const notifications = await db.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY id DESC',
      [req.user.id]
    );
    res.json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server xatoligi.' });
  }
});

// MARK ALL AS READ
router.put('/read-all', authenticateToken, async (req, res) => {
  try {
    await db.run('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [req.user.id]);
    res.json({ message: 'Barcha bildirishnomalar o\'qildi deb belgilandi.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server xatoligi.' });
  }
});

module.exports = router;
