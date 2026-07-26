const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// GET ADMIN STATISTICS / DASHBOARD
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await db.query('SELECT * FROM users');
    const products = await db.query('SELECT * FROM products');
    const views = await db.query('SELECT * FROM views');

    const farmerUsers = users.filter(u => u.role !== 'admin');
    const totalUsers = farmerUsers.length;
    const premiumUsers = farmerUsers.filter(u => u.is_premium === 1).length;
    const normalUsers = farmerUsers.filter(u => u.is_premium === 0).length;
    const todayProducts = products.filter(p => !p.is_archived).length;

    // Today's views count (views from table views added today)
    const todayViews = products.reduce((acc, p) => acc + (p.views || 0), 0); // Simplified views count sum or check views table

    // Most active region (Viloyat)
    const regionCounts = {};
    products.forEach(p => {
      if (p.region) {
        regionCounts[p.region] = (regionCounts[p.region] || 0) + 1;
      }
    });
    if (Object.keys(regionCounts).length === 0) {
      users.forEach(u => {
        if (u.region) {
          regionCounts[u.region] = (regionCounts[u.region] || 0) + 1;
        }
      });
    }

    let activeRegion = 'Toshkent';
    let maxRegionCount = 0;
    Object.keys(regionCounts).forEach(r => {
      if (regionCounts[r] > maxRegionCount) {
        maxRegionCount = regionCounts[r];
        activeRegion = r;
      }
    });

    // Most active farmer (user with most ads)
    const farmerCounts = {};
    products.forEach(p => {
      farmerCounts[p.user_id] = (farmerCounts[p.user_id] || 0) + 1;
    });
    let activeFarmerId = null;
    let maxFarmerCount = 0;
    Object.keys(farmerCounts).forEach(fid => {
      if (farmerCounts[fid] > maxFarmerCount) {
        maxFarmerCount = farmerCounts[fid];
        activeFarmerId = parseInt(fid);
      }
    });

    let activeFarmerName = 'Mavjud emas';
    if (activeFarmerId) {
      const farmerUser = users.find(u => u.id === activeFarmerId);
      if (farmerUser) {
        activeFarmerName = `${farmerUser.first_name} ${farmerUser.last_name}`;
      }
    } else {
      const nonAdminUser = users.find(u => u.role !== 'admin');
      if (nonAdminUser) {
        activeFarmerName = `${nonAdminUser.first_name} ${nonAdminUser.last_name}`;
      }
    }

    res.json({
      total_users: totalUsers,
      premium_users: premiumUsers,
      normal_users: normalUsers,
      today_products: todayProducts,
      today_views: todayViews,
      active_region: activeRegion,
      active_farmer: activeFarmerName
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    res.status(500).json({ message: 'Server xatoligi yuz berdi.' });
  }
});

// LIST ALL USERS
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await db.query('SELECT id, first_name, last_name, phone, region, district, mahalla, role, is_premium, premium_limit, premium_status, avatar, created_at FROM users');
    res.json(users);
  } catch (err) {
    console.error("List users error:", err);
    res.status(500).json({ message: 'Server xatoligi.' });
  }
});

// ADMIN DELETE USER (Force logout / kick out)
router.delete('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    // Cannot delete active admin
    if (userId === req.user.id) {
      return res.status(400).json({ message: 'O\'zingizni o\'chira olmaysiz.' });
    }

    // Delete user from db
    if (db.mode === 'sqlite') {
      await db.run('DELETE FROM users WHERE id = ?', [userId]);
      await db.run('DELETE FROM products WHERE user_id = ?', [userId]);
      await db.run('DELETE FROM receipts WHERE user_id = ?', [userId]);
      await db.run('DELETE FROM notifications WHERE user_id = ?', [userId]);
    } else {
      const data = db.jsonDb.data;
      data.users = data.users.filter(u => u.id !== userId);
      data.products = data.products.filter(p => p.user_id !== userId);
      data.receipts = data.receipts.filter(r => r.user_id !== userId);
      data.notifications = data.notifications.filter(n => n.user_id !== userId);
      db.jsonDb.save();
    }

    res.json({ message: 'Foydalanuvchi va uning barcha e\'lonlari o\'chirildi.' });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ message: 'Server xatoligi.' });
  }
});

// LIST ALL RECEIPTS FOR VERIFICATION
router.get('/receipts', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const receipts = await db.query('SELECT * FROM receipts');
    res.json(receipts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server xatoligi.' });
  }
});

// APPROVE RECEIPT
router.post('/receipts/:id/approve', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const receiptId = parseInt(req.params.id);
    const receipts = await db.query('SELECT * FROM receipts WHERE id = ?', [receiptId]);

    if (receipts.length === 0) {
      return res.status(404).json({ message: 'Chek topilmadi.' });
    }

    const receipt = receipts[0];

    // Update receipt status
    await db.run('UPDATE receipts SET status = ?, comment = ? WHERE id = ?', ['Tasdiqlandi', 'Premium faollashtirildi', receiptId]);

    // Update user limits and status
    await db.run(
      'UPDATE users SET is_premium = 1, premium_limit = 100, premium_status = ? WHERE id = ?',
      ['approved', receipt.user_id]
    );

    // Apply premium status to user's products
    await db.run('UPDATE products SET is_premium = 1 WHERE user_id = ?', [receipt.user_id]);

    // Send Notification
    await db.run(
      'INSERT INTO notifications (user_id, title, message, created_at) VALUES (?, ?, ?, ?)',
      [
        receipt.user_id,
        'Premium faollashtirildi! 🌟',
        'Sizning to\'lov chekingiz muvaffaqiyatli tasdiqlandi. Premium status yoqildi. Endi siz 100 tagacha mahsulot qo\'shishingiz mumkin!',
        new Date().toISOString()
      ]
    );

    res.json({ message: 'To\'lov tasdiqlandi. Premium faollashtirildi.' });
  } catch (err) {
    console.error("Approve receipt error:", err);
    res.status(500).json({ message: 'Server xatoligi yuz berdi.' });
  }
});

// REJECT RECEIPT
router.post('/receipts/:id/reject', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const receiptId = parseInt(req.params.id);
    const { comment = 'To\'lov tasdiqlanmadi' } = req.body;

    const receipts = await db.query('SELECT * FROM receipts WHERE id = ?', [receiptId]);
    if (receipts.length === 0) {
      return res.status(404).json({ message: 'Chek topilmadi.' });
    }

    const receipt = receipts[0];

    // Update receipt status
    await db.run('UPDATE receipts SET status = ?, comment = ? WHERE id = ?', ['Rad etildi', comment, receiptId]);

    // Update user premium status
    await db.run(
      'UPDATE users SET premium_status = ? WHERE id = ?',
      ['rejected', receipt.user_id]
    );

    // Send Notification
    await db.run(
      'INSERT INTO notifications (user_id, title, message, created_at) VALUES (?, ?, ?, ?)',
      [
        receipt.user_id,
        'Premium rad etildi ❌',
        `Sizning to'lov chekingiz rad etildi. Sababi: ${comment}`,
        new Date().toISOString()
      ]
    );

    res.json({ message: 'To\'lov rad etildi.' });
  } catch (err) {
    console.error("Reject receipt error:", err);
    res.status(500).json({ message: 'Server xatoligi.' });
  }
});

// LEADERBOARD / RATING TOP 15
router.get('/leaderboard', async (req, res) => {
  try {
    const users = await db.query('SELECT * FROM users');
    const products = await db.query('SELECT * FROM products');

    const farmers = users.filter(u => u.role !== 'admin');

    const leaderboard = farmers.map(user => {
      const userProducts = products.filter(p => p.user_id === user.id);
      const totalProducts = userProducts.length;
      const totalViews = userProducts.reduce((acc, p) => acc + (p.views || 0), 0);
      const totalSold = userProducts.filter(p => p.is_sold === 1).length;

      // Score weight calculation to determine "active user" ranking
      const score = (totalProducts * 10) + (totalSold * 15) + (totalViews * 0.5);

      return {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        region: user.region,
        avatar: user.avatar,
        product_count: totalProducts,
        views: totalViews,
        sold: totalSold,
        score
      };
      return {
        ...user,
        medal
      };
    });

    res.json(finalTop15);
  } catch (err) {
    console.error("Leaderboard error:", err);
    res.status(500).json({ message: 'Server xatoligi.' });
  }
});

module.exports = router;
