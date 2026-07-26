const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticateToken } = require('../middleware/auth');

// GET ALL PRODUCTS (With Search & Filter & Tabs)
// Tabs: popular, recently_viewed, popular, newest, ai_recommended
router.get('/', async (req, res) => {
  try {
    const { search, region, district, category, min_price, max_price, harvest_year, tab, limit = 40, offset = 0 } = req.query;

    let products = await db.query('SELECT * FROM products WHERE is_archived = 0');

    // 1. Client-side filtration for robustness across both SQLite and JSON modes
    if (search) {
      const q = search.toLowerCase();
      products = products.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    if (region) {
      products = products.filter(p => p.region.toLowerCase() === region.toLowerCase());
    }
    if (district) {
      products = products.filter(p => p.district.toLowerCase() === district.toLowerCase());
    }
    if (category) {
      products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }
    if (min_price) {
      products = products.filter(p => p.price >= parseFloat(min_price));
    }
    if (max_price) {
      products = products.filter(p => p.price <= parseFloat(max_price));
    }
    if (harvest_year) {
      products = products.filter(p => p.harvest_year === parseInt(harvest_year));
    }

    // 2. Sorting based on Tabs
    if (tab === 'popular') {
      // Sort by view count descending
      products.sort((a, b) => b.views - a.views);
    } else if (tab === 'newest') {
      // Sort by date added descending
      products.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (tab === 'ai_recommended') {
      // AI recommended: show premium products first, then popular, then newest
      products.sort((a, b) => {
        if (a.is_premium !== b.is_premium) return b.is_premium - a.is_premium;
        if (a.views !== b.views) return b.views - a.views;
        return new Date(b.created_at) - new Date(a.created_at);
      });
    } else {
      // Default: premium products sorted to top, then newest
      products.sort((a, b) => {
        if (a.is_premium !== b.is_premium) return b.is_premium - a.is_premium;
        return new Date(b.created_at) - new Date(a.created_at);
      });
    }

    // Slice for pagination
    const totalCount = products.length;
    const paginatedProducts = products.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

    res.json({
      products: paginatedProducts,
      total: totalCount
    });
  } catch (err) {
    console.error("Get products error:", err);
    res.status(500).json({ message: 'Server xatoligi yuz berdi.' });
  }
});

// GET SINGLE PRODUCT BY ID & INCREASE VIEWS
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { viewer_id } = req.query; // If logged in, optional viewer ID

    const rows = await db.query('SELECT * FROM products WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Mahsulot topilmadi.' });
    }

    const product = rows[0];

    // Increment views in DB
    await db.run('UPDATE products SET views = views + 1 WHERE id = ?', [id]);
    product.views += 1;

    // Track views if viewer_id is provided to prevent spam & generate activity notifications
    if (viewer_id) {
      const viewerIdParsed = parseInt(viewer_id);
      if (viewerIdParsed !== product.user_id) {
        // Record unique view
        const alreadyViewed = await db.query('SELECT * FROM views WHERE product_id = ? AND viewer_id = ?', [id, viewerIdParsed]);
        if (alreadyViewed.length === 0) {
          await db.run('INSERT INTO views (product_id, viewer_id, created_at) VALUES (?, ?, ?)', [id, viewerIdParsed, new Date().toISOString()]);

          // Create notification for farmer that their product was viewed
          const viewersCount = product.views;
          if (viewersCount === 5 || viewersCount === 10 || viewersCount % 50 === 0) {
            await db.run(
              'INSERT INTO notifications (user_id, title, message, created_at) VALUES (?, ?, ?, ?)',
              [
                product.user_id,
                'Mahsulot ko\'rildi 👁️',
                `Sizning "${product.name}" mahsulotingiz ${viewersCount} marta ko'rildi! Xaridorlar qiziqishmoqda.`,
                new Date().toISOString()
              ]
            );
          }
        }
      }
    }

    res.json(product);
  } catch (err) {
    console.error("Get product detail error:", err);
    res.status(500).json({ message: 'Server xatoligi yuz berdi.' });
  }
});

// ADD NEW PRODUCT (WITH LIMIT CHECKS)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, category, fruit_type, harvest_year, price, quantity, description, phone, region, district, image_url } = req.body;

    if (!name || !category || !fruit_type || !harvest_year || !price || !quantity || !description || !phone || !region || !district || !image_url) {
      return res.status(400).json({ message: 'Barcha maydonlar to\'ldirilishi shart.' });
    }

    // Get current user to check premium and limits
    let users = await db.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    let user;
    if (users.length === 0) {
      const isUserAdmin = req.user.role === 'admin';
      const userLimit = isUserAdmin || req.user.is_premium ? 100 : 2;
      const userPremStatus = isUserAdmin || req.user.is_premium ? 'approved' : 'none';
      
      await db.run(
        `INSERT INTO users (id, first_name, last_name, phone, region, district, mahalla, password, role, is_premium, premium_limit, premium_status, avatar, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [req.user.id, req.user.first_name || 'Dehqon', req.user.last_name || 'Fermer', req.user.phone || '998900000000', req.user.region || 'Toshkent', req.user.district || 'Yunusobod', 'Markaz', 'auto_pass', req.user.role || 'user', req.user.is_premium || (isUserAdmin ? 1 : 0), userLimit, userPremStatus, '', new Date().toISOString()]
      );
      user = { id: req.user.id, is_premium: req.user.is_premium || (isUserAdmin ? 1 : 0), role: req.user.role || 'user' };
    } else {
      user = users[0];
    }

    // Count user's active products (exclude archived)
    const userProducts = await db.query('SELECT * FROM products WHERE user_id = ? AND is_archived = 0', [req.user.id]);
    const currentCount = userProducts.length;

    // Check Limit
    if (user.is_premium) {
      // Premium user has 100 limit
      if (currentCount >= 100) {
        return res.status(403).json({
          message: 'Limit tugadi. Yana Premium sotib oling.',
          limit_reached: true
        });
      }
    } else {
      // Regular user has 2 limit
      if (currentCount >= 2) {
        return res.status(403).json({
          message: 'Limit tugadi. Yangi mahsulot qo\'shish uchun Premiumga o\'ting.',
          limit_reached: true
        });
      }
    }

    // Insert Product
    const isPremiumAd = user.is_premium ? 1 : 0;
    const createdAt = new Date().toISOString();

    const result = await db.run(
      `INSERT INTO products (user_id, name, category, fruit_type, harvest_year, price, quantity, description, phone, region, district, views, is_sold, is_premium, is_archived, image_url, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, 0, ?, ?)`,
      [req.user.id, name, category, fruit_type, parseInt(harvest_year), parseFloat(price), quantity, description, phone, region, district, isPremiumAd, image_url, createdAt]
    );

    // Update remaining limit indicator in user object/table if premium
    if (user.is_premium) {
      const remainingLimit = 100 - (currentCount + 1);
      await db.run('UPDATE users SET premium_limit = ? WHERE id = ?', [remainingLimit, req.user.id]);
    }

    res.status(201).json({
      message: 'Mahsulot muvaffaqiyatli qo\'shildi.',
      productId: result.lastID
    });
  } catch (err) {
    console.error("Add product error:", err);
    res.status(500).json({ message: 'Server xatoligi yuz berdi.' });
  }
});

// UPDATE PRODUCT
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, fruit_type, harvest_year, price, quantity, description, image_url } = req.body;

    const rows = await db.query('SELECT * FROM products WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Mahsulot topilmadi.' });
    }

    const product = rows[0];
    if (product.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Tahrirlashga ruxsat yo\'q.' });
    }

    await db.run(
      `UPDATE products 
       SET name = ?, category = ?, fruit_type = ?, harvest_year = ?, price = ?, quantity = ?, description = ?, image_url = ?
       WHERE id = ?`,
      [name, category, fruit_type, parseInt(harvest_year), parseFloat(price), quantity, description, image_url || product.image_url, id]
    );

    res.json({ message: 'Mahsulot tahrirlandi.' });
  } catch (err) {
    console.error("Update product error:", err);
    res.status(500).json({ message: 'Server xatoligi yuz berdi.' });
  }
});

// TOGGLE SOLD STATUS
router.put('/:id/sold', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { is_sold } = req.body; // 0 or 1

    const rows = await db.query('SELECT * FROM products WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Mahsulot topilmadi.' });
    }

    const product = rows[0];
    if (product.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Ruxsat etilmadi.' });
    }

    await db.run('UPDATE products SET is_sold = ? WHERE id = ?', [parseInt(is_sold), id]);

    // Send notifications
    if (parseInt(is_sold) === 1) {
      await db.run(
        'INSERT INTO notifications (user_id, title, message, created_at) VALUES (?, ?, ?, ?)',
        [
          product.user_id,
          'Mahsulot sotildi! 🎉',
          `Tabriklaymiz, sizning "${product.name}" mahsulotingiz sotilgan deb belgilandi.`,
          new Date().toISOString()
        ]
      );
    }

    res.json({ message: 'Mahsulot holati o\'zgartirildi.', is_sold });
  } catch (err) {
    console.error("Toggle sold error:", err);
    res.status(500).json({ message: 'Server xatoligi yuz berdi.' });
  }
});

// TOGGLE ARCHIVED STATUS
router.put('/:id/archive', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { is_archived } = req.body; // 0 or 1

    const rows = await db.query('SELECT * FROM products WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Mahsulot topilmadi.' });
    }

    const product = rows[0];
    if (product.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Ruxsat etilmadi.' });
    }

    await db.run('UPDATE products SET is_archived = ? WHERE id = ?', [parseInt(is_archived), id]);

    // Update user limits if they archive a premium product
    const users = await db.query('SELECT * FROM users WHERE id = ?', [product.user_id]);
    if (users.length > 0 && users[0].is_premium) {
      const activeProducts = await db.query('SELECT * FROM products WHERE user_id = ? AND is_archived = 0', [product.user_id]);
      const remainingLimit = 100 - activeProducts.length;
      await db.run('UPDATE users SET premium_limit = ? WHERE id = ?', [remainingLimit, product.user_id]);
    }

    res.json({ message: 'Mahsulot arxivlandi/arxivdan chiqarildi.', is_archived });
  } catch (err) {
    console.error("Toggle archive error:", err);
    res.status(500).json({ message: 'Server xatoligi yuz berdi.' });
  }
});

// DELETE PRODUCT
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const rows = await db.query('SELECT * FROM products WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Mahsulot topilmadi.' });
    }

    const product = rows[0];
    if (product.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'O\'chirishga ruxsat yo\'q.' });
    }

    await db.run('DELETE FROM products WHERE id = ?', [id]);

    // Update user limits if deleted
    const users = await db.query('SELECT * FROM users WHERE id = ?', [product.user_id]);
    if (users.length > 0 && users[0].is_premium) {
      const activeProducts = await db.query('SELECT * FROM products WHERE user_id = ? AND is_archived = 0', [product.user_id]);
      const remainingLimit = 100 - activeProducts.length;
      await db.run('UPDATE users SET premium_limit = ? WHERE id = ?', [remainingLimit, product.user_id]);
    }

    res.json({ message: 'Mahsulot o\'chirildi.' });
  } catch (err) {
    console.error("Delete product error:", err);
    res.status(500).json({ message: 'Server xatoligi yuz berdi.' });
  }
});

// GET USER'S OWN PRODUCTS (My Ads Page)
router.get('/user/me', authenticateToken, async (req, res) => {
  try {
    const products = await db.query('SELECT * FROM products WHERE user_id = ?', [req.user.id]);
    res.json(products);
  } catch (err) {
    console.error("Get user products error:", err);
    res.status(500).json({ message: 'Server xatoligi yuz berdi.' });
  }
});

// FAVORITE ROUTING
// 1. Get favorite status
router.get('/:id/favorite', authenticateToken, async (req, res) => {
  try {
    const fav = await db.query('SELECT * FROM favorites WHERE user_id = ? AND product_id = ?', [req.user.id, req.params.id]);
    res.json({ is_favorite: fav.length > 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Xatolik' });
  }
});

// 2. Toggle favorite
router.post('/:id/favorite', authenticateToken, async (req, res) => {
  try {
    const fav = await db.query('SELECT * FROM favorites WHERE user_id = ? AND product_id = ?', [req.user.id, req.params.id]);
    if (fav.length > 0) {
      await db.run('DELETE FROM favorites WHERE user_id = ? AND product_id = ?', [req.user.id, req.params.id]);
      res.json({ is_favorite: false, message: 'Sevimlilardan o\'chirildi.' });
    } else {
      await db.run('INSERT INTO favorites (user_id, product_id) VALUES (?, ?)', [req.user.id, req.params.id]);
      res.json({ is_favorite: true, message: 'Sevimlilarga qo\'shildi.' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server xatoligi.' });
  }
});

// 3. Get user's all favorites
router.get('/user/favorites', authenticateToken, async (req, res) => {
  try {
    const favs = await db.query(
      'SELECT p.* FROM favorites f JOIN products p ON f.product_id = p.id WHERE f.user_id = ? AND p.is_archived = 0',
      [req.user.id]
    );
    res.json(favs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server xatoligi.' });
  }
});

module.exports = router;
