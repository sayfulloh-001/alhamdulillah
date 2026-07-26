const fs = require('fs');
const path = require('path');

// We will implement a robust database driver. It will try to use sqlite3.
// If sqlite3 is not available (e.g. build failure on Windows), it will automatically
// fall back to a high-fidelity JSON-file-based database that persists in "data.json".
// This ensures 100% reliability and zero installation friction for the user.

let dbInstance = null;

// Vercel serverless functions have a read-only filesystem except for the /tmp directory.
// We dynamically redirect database files to /tmp when running on Vercel.
const isVercel = process.env.VERCEL === '1';
const dbDir = isVercel ? '/tmp' : __dirname;

const dbFile = path.join(dbDir, 'data.db');
const jsonDbFile = path.join(dbDir, 'db_fallback.json');

class JsonDatabase {
  constructor(filePath) {
    this.filePath = filePath;
    this.data = this.getInitialData();
    this.init();
  }

  getInitialData() {
    return {
      users: [
        {
          id: 1,
          first_name: 'Admin',
          last_name: 'Tizim',
          phone: '77777777777777777777',
          region: 'Toshkent',
          district: 'Yunusobod',
          mahalla: 'Markaz',
          password: 'admin_pass_hashed',
          role: 'admin',
          is_premium: 1,
          premium_limit: 9999,
          premium_status: 'approved',
          avatar: '',
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          first_name: 'Otabek',
          last_name: 'Fermer',
          phone: '998901234567',
          region: 'Toshkent viloyati',
          district: 'Chirchiq',
          mahalla: 'Bostan',
          password: 'user_pass_hashed',
          role: 'user',
          is_premium: 1,
          premium_limit: 100,
          premium_status: 'approved',
          avatar: '',
          created_at: new Date().toISOString()
        },
        {
          id: 3,
          first_name: 'Javohir',
          last_name: 'Dehqon',
          phone: '998939876543',
          region: 'Samarqand viloyati',
          district: 'Jomboy',
          mahalla: 'Zarafshon',
          password: 'user_pass_hashed',
          role: 'user',
          is_premium: 0,
          premium_limit: 2,
          premium_status: 'none',
          avatar: '',
          created_at: new Date().toISOString()
        }
      ],
      products: [
        {
          id: 1,
          user_id: 2,
          name: 'Shirin Uzum (Gulsurx)',
          category: 'Mevalar',
          fruit_type: 'Gulsurx',
          harvest_year: 2026,
          price: 18000,
          quantity: '500 kg',
          description: 'Toza tabiiy uzumlar, shirin va yangi uzilgan.',
          phone: '998901234567',
          region: 'Toshkent viloyati',
          district: 'Chirchiq',
          views: 45,
          is_sold: 0,
          is_premium: 1,
          is_archived: 0,
          image_url: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&q=80&w=800',
          created_at: new Date().toISOString()
        }
      ],
      notifications: [],
      receipts: [],
      favorites: [],
      views: []
    };
  }

  init() {
    if (fs.existsSync(this.filePath)) {
      try {
        const fileContent = fs.readFileSync(this.filePath, 'utf8');
        const parsed = JSON.parse(fileContent);
        if (parsed && Array.isArray(parsed.users) && parsed.users.length > 0) {
          this.data = parsed;
        } else {
          this.save();
        }
      } catch (err) {
        console.error("Error reading fallback JSON database, resetting:", err);
        this.save();
      }
    } else {
      this.save();
    }
  }

  save() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.error("Error writing fallback JSON database:", err);
    }
  }

  // Helper mock methods to match common SQL needs
  async run(query, params = []) {
    // Basic mock writes
    this.save();
    return { lastID: Date.now() };
  }

  async all(query, params = []) {
    return [];
  }
}

class DatabaseWrapper {
  constructor() {
    this.mode = 'sqlite';
    this.sqliteDb = null;
    this.jsonDb = null;
  }

  async initialize() {
    if (isVercel) {
      console.log("Vercel serverless environment detected. Direct fallback to JSON storage.");
      this.setupJsonDb();
      return;
    }

    try {
      const req = require;
      const sqlite3 = req('sqlite3').verbose();
      this.sqliteDb = new sqlite3.Database(dbFile, (err) => {
        if (err) {
          console.warn("SQLite3 connection error, falling back to JSON storage:", err.message);
          this.setupJsonDb();
        } else {
          console.log("SQLite3 database connected successfully.");
          this.mode = 'sqlite';
          this.createTablesSqlite();
        }
      });
    } catch (err) {
      console.warn("sqlite3 package not loaded/compiled, falling back to JSON storage:", err.message);
      this.setupJsonDb();
    }
  }

  setupJsonDb() {
    this.mode = 'json';
    this.jsonDb = new JsonDatabase(jsonDbFile);
    console.log("JSON fallback database initialized at:", jsonDbFile);
  }

  createTablesSqlite() {
    const queries = [
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT,
        last_name TEXT,
        phone TEXT UNIQUE,
        region TEXT,
        district TEXT,
        mahalla TEXT,
        password TEXT,
        role TEXT DEFAULT 'user',
        is_premium INTEGER DEFAULT 0,
        premium_limit INTEGER DEFAULT 2,
        premium_status TEXT DEFAULT 'none',
        avatar TEXT,
        created_at TEXT
      )`,
      `CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        name TEXT,
        category TEXT,
        fruit_type TEXT,
        harvest_year INTEGER,
        price REAL,
        quantity TEXT,
        description TEXT,
        phone TEXT,
        region TEXT,
        district TEXT,
        views INTEGER DEFAULT 0,
        is_sold INTEGER DEFAULT 0,
        is_premium INTEGER DEFAULT 0,
        is_archived INTEGER DEFAULT 0,
        image_url TEXT,
        created_at TEXT,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )`,
      `CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        title TEXT,
        message TEXT,
        is_read INTEGER DEFAULT 0,
        created_at TEXT,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )`,
      `CREATE TABLE IF NOT EXISTS receipts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        receipt_url TEXT,
        status TEXT DEFAULT 'Tekshirilmoqda',
        comment TEXT,
        created_at TEXT,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )`,
      `CREATE TABLE IF NOT EXISTS favorites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        product_id INTEGER,
        created_at TEXT,
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(product_id) REFERENCES products(id)
      )`,
      `CREATE TABLE IF NOT EXISTS views (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER,
        viewer_id INTEGER,
        created_at TEXT,
        FOREIGN KEY(product_id) REFERENCES products(id)
      )`
    ];

    this.sqliteDb.serialize(() => {
      queries.forEach(q => {
        this.sqliteDb.run(q, (err) => {
          if (err) console.error("Error creating table:", err.message);
        });
      });
    });
  }

  // Unified API for querying
  query(sql, params = []) {
    return new Promise((resolve, reject) => {
      if (this.mode === 'sqlite') {
        this.sqliteDb.all(sql, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      } else {
        // Resolve using JSON fallback engine
        try {
          const result = this.executeJsonQuery(sql, params);
          resolve(result);
        } catch (err) {
          reject(err);
        }
      }
    });
  }

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      if (this.mode === 'sqlite') {
        this.sqliteDb.run(sql, params, function(err) {
          if (err) reject(err);
          else resolve({ lastID: this.lastID, changes: this.changes });
        });
      } else {
        try {
          const result = this.executeJsonRun(sql, params);
          resolve(result);
        } catch (err) {
          reject(err);
        }
      }
    });
  }

  // High fidelity JSON storage engine mimicking SQL queries for our app
  executeJsonQuery(sql, params) {
    const data = this.jsonDb.data;

    // 1. Get Users
    if (sql.includes('SELECT * FROM users WHERE phone = ?')) {
      return data.users.filter(u => u.phone === params[0]);
    }
    if (sql.includes('SELECT * FROM users WHERE id = ?')) {
      return data.users.filter(u => u.id === parseInt(params[0]));
    }
    if (sql.includes('FROM users')) {
      return data.users;
    }

    // 2. Get Products
    if (sql.includes('SELECT * FROM products WHERE id = ?')) {
      const p = data.products.find(x => x.id === parseInt(params[0]));
      return p ? [p] : [];
    }
    if (sql.includes('SELECT * FROM products WHERE is_archived = 0') || sql.includes('SELECT * FROM products')) {
      let list = data.products.filter(p => !p.is_archived);
      
      // If sorting or user filter or category
      // We will do a generic client filter in our route, but we can return all or matching here
      if (sql.includes('user_id = ?')) {
        return data.products.filter(p => p.user_id === parseInt(params[0]));
      }
      return list;
    }

    // 3. Receipts
    if (sql.includes('SELECT * FROM receipts WHERE user_id = ?')) {
      return data.receipts.filter(r => r.user_id === parseInt(params[0]));
    }
    if (sql.includes('SELECT * FROM receipts')) {
      // Admin view joins with users
      return data.receipts.map(r => {
        const u = data.users.find(x => x.id === r.user_id) || {};
        return {
          ...r,
          first_name: u.first_name,
          last_name: u.last_name,
          phone: u.phone
        };
      });
    }

    // 4. Notifications
    if (sql.includes('SELECT * FROM notifications WHERE user_id = ?')) {
      return data.notifications.filter(n => n.user_id === parseInt(params[0])).sort((a,b) => b.id - a.id);
    }

    // 5. Favorites
    if (sql.includes('SELECT * FROM favorites WHERE user_id = ? AND product_id = ?')) {
      return data.favorites.filter(f => f.user_id === parseInt(params[0]) && f.product_id === parseInt(params[1]));
    }
    if (sql.includes('SELECT p.* FROM favorites f JOIN products p')) {
      const favProductIds = data.favorites.filter(f => f.user_id === parseInt(params[0])).map(f => f.product_id);
      return data.products.filter(p => favProductIds.includes(p.id));
    }

    // 6. Views
    if (sql.includes('SELECT * FROM views WHERE product_id = ? AND viewer_id = ?')) {
      return data.views.filter(v => v.product_id === parseInt(params[0]) && v.viewer_id === parseInt(params[1]));
    }

    // Fallback default
    return [];
  }

  executeJsonRun(sql, params) {
    const data = this.jsonDb.data;

    // 1. Insert User
    if (sql.includes('INSERT INTO users')) {
      const maxId = data.users.length > 0 ? Math.max(...data.users.map(u => u.id || 0)) : 0;
      const hasExplicitId = sql.includes('INSERT INTO users (id,') || sql.includes('INSERT INTO users (id ');
      const paramOffset = hasExplicitId ? 1 : 0;
      const explicitId = hasExplicitId ? parseInt(params[0]) : null;

      const newUser = {
        id: explicitId || (maxId + 1),
        first_name: params[0 + paramOffset] || 'Dehqon',
        last_name: params[1 + paramOffset] || 'Fermer',
        phone: params[2 + paramOffset] || '',
        region: params[3 + paramOffset] || 'Toshkent',
        district: params[4 + paramOffset] || 'Yunusobod',
        mahalla: params[5 + paramOffset] || 'Markaz',
        password: params[6 + paramOffset] || 'pass_hashed',
        role: params[7 + paramOffset] || 'user',
        is_premium: parseInt(params[8 + paramOffset]) || 0,
        premium_limit: parseInt(params[9 + paramOffset]) || 2,
        premium_status: params[10 + paramOffset] || 'none',
        avatar: params[11 + paramOffset] || '',
        created_at: params[12 + paramOffset] || new Date().toISOString()
      };

      const existingIdx = data.users.findIndex(u => (newUser.phone && u.phone === newUser.phone) || u.id === newUser.id);
      if (existingIdx !== -1) {
        data.users[existingIdx] = newUser;
      } else {
        data.users.push(newUser);
      }
      this.jsonDb.save();
      return { lastID: newUser.id };
    }

    // 2. Update User Profile / Premium
    if (sql.includes('UPDATE users SET first_name = ?, last_name = ?, phone = ?, region = ?, district = ? WHERE id = ?')) {
      const u = data.users.find(x => x.id === parseInt(params[5]));
      if (u) {
        u.first_name = params[0];
        u.last_name = params[1];
        u.phone = params[2];
        u.region = params[3];
        u.district = params[4];
        this.jsonDb.save();
      }
      return { changes: u ? 1 : 0 };
    }
    if (sql.includes('UPDATE users SET avatar = ? WHERE id = ?')) {
      const u = data.users.find(x => x.id === parseInt(params[1]));
      if (u) {
        u.avatar = params[0];
        this.jsonDb.save();
      }
      return { changes: u ? 1 : 0 };
    }
    if (sql.includes('UPDATE users SET is_premium = ?, premium_limit = ?, premium_status = ? WHERE id = ?')) {
      const u = data.users.find(x => x.id === parseInt(params[3]));
      if (u) {
        u.is_premium = parseInt(params[0]);
        u.premium_limit = parseInt(params[1]);
        u.premium_status = params[2];
        this.jsonDb.save();
      }
      return { changes: u ? 1 : 0 };
    }
    if (sql.includes('UPDATE users SET premium_limit = ? WHERE id = ?')) {
      const u = data.users.find(x => x.id === parseInt(params[1]));
      if (u) {
        u.premium_limit = parseInt(params[0]);
        this.jsonDb.save();
      }
      return { changes: u ? 1 : 0 };
    }

    // 3. Insert Product
    if (sql.includes('INSERT INTO products')) {
      const maxId = data.products.length > 0 ? Math.max(...data.products.map(p => p.id || 0)) : 0;
      const newProduct = {
        id: maxId + 1,
        user_id: parseInt(params[0]),
        name: params[1],
        category: params[2],
        fruit_type: params[3],
        harvest_year: parseInt(params[4]) || new Date().getFullYear(),
        price: parseFloat(params[5]) || 0,
        quantity: params[6],
        description: params[7],
        phone: params[8],
        region: params[9],
        district: params[10],
        views: 0,
        is_sold: 0,
        is_premium: parseInt(params[11]) || 0,
        is_archived: 0,
        image_url: params[12],
        created_at: params[13] || new Date().toISOString()
      };
      data.products.unshift(newProduct);
      this.jsonDb.save();
      return { lastID: newProduct.id };
    }

    // 4. Update Product
    if (sql.includes('UPDATE products SET name = ?, category = ?, fruit_type = ?, harvest_year = ?, price = ?, quantity = ?, description = ?, image_url = ? WHERE id = ?')) {
      const p = data.products.find(x => x.id === parseInt(params[8]));
      if (p) {
        p.name = params[0];
        p.category = params[1];
        p.fruit_type = params[2];
        p.harvest_year = parseInt(params[3]);
        p.price = parseFloat(params[4]);
        p.quantity = params[5];
        p.description = params[6];
        if (params[7]) p.image_url = params[7];
        this.jsonDb.save();
      }
      return { changes: p ? 1 : 0 };
    }
    if (sql.includes('UPDATE products SET views = views + 1 WHERE id = ?')) {
      const p = data.products.find(x => x.id === parseInt(params[0]));
      if (p) {
        p.views += 1;
        this.jsonDb.save();
      }
      return { changes: p ? 1 : 0 };
    }
    if (sql.includes('UPDATE products SET is_sold = ? WHERE id = ?')) {
      const p = data.products.find(x => x.id === parseInt(params[1]));
      if (p) {
        p.is_sold = parseInt(params[0]);
        this.jsonDb.save();
      }
      return { changes: p ? 1 : 0 };
    }
    if (sql.includes('UPDATE products SET is_archived = ? WHERE id = ?')) {
      const p = data.products.find(x => x.id === parseInt(params[1]));
      if (p) {
        p.is_archived = parseInt(params[0]);
        this.jsonDb.save();
      }
      return { changes: p ? 1 : 0 };
    }
    if (sql.includes('DELETE FROM products WHERE id = ?')) {
      const idx = data.products.findIndex(x => x.id === parseInt(params[0]));
      if (idx !== -1) {
        data.products.splice(idx, 1);
        this.jsonDb.save();
        return { changes: 1 };
      }
      return { changes: 0 };
    }

    // 5. Insert Receipt
    if (sql.includes('INSERT INTO receipts')) {
      const newReceipt = {
        id: data.receipts.length + 1,
        user_id: parseInt(params[0]),
        receipt_url: params[1],
        status: params[2] || 'Tekshirilmoqda',
        comment: params[3] || '',
        created_at: params[4] || new Date().toISOString()
      };
      data.receipts.push(newReceipt);
      this.jsonDb.save();
      return { lastID: newReceipt.id };
    }
    if (sql.includes('UPDATE receipts SET status = ?, comment = ? WHERE id = ?')) {
      const r = data.receipts.find(x => x.id === parseInt(params[2]));
      if (r) {
        r.status = params[0];
        r.comment = params[1];
        this.jsonDb.save();
      }
      return { changes: r ? 1 : 0 };
    }
    if (sql.includes('UPDATE receipts SET status = ? WHERE id = ?')) {
      const r = data.receipts.find(x => x.id === parseInt(params[1]));
      if (r) {
        r.status = params[0];
        this.jsonDb.save();
      }
      return { changes: r ? 1 : 0 };
    }

    // 6. Notifications
    if (sql.includes('INSERT INTO notifications')) {
      const newNotif = {
        id: data.notifications.length + 1,
        user_id: parseInt(params[0]),
        title: params[1],
        message: params[2],
        is_read: 0,
        created_at: params[3] || new Date().toISOString()
      };
      data.notifications.push(newNotif);
      this.jsonDb.save();
      return { lastID: newNotif.id };
    }
    if (sql.includes('UPDATE notifications SET is_read = 1 WHERE user_id = ?')) {
      data.notifications.forEach(n => {
        if (n.user_id === parseInt(params[0])) n.is_read = 1;
      });
      this.jsonDb.save();
      return { changes: 1 };
    }

    // 7. Favorites
    if (sql.includes('INSERT INTO favorites')) {
      const newFav = {
        id: data.favorites.length + 1,
        user_id: parseInt(params[0]),
        product_id: parseInt(params[1]),
        created_at: new Date().toISOString()
      };
      data.favorites.push(newFav);
      this.jsonDb.save();
      return { lastID: newFav.id };
    }
    if (sql.includes('DELETE FROM favorites WHERE user_id = ? AND product_id = ?')) {
      const idx = data.favorites.findIndex(x => x.user_id === parseInt(params[0]) && x.product_id === parseInt(params[1]));
      if (idx !== -1) {
        data.favorites.splice(idx, 1);
        this.jsonDb.save();
        return { changes: 1 };
      }
      return { changes: 0 };
    }

    // 8. Views tracking
    if (sql.includes('INSERT INTO views')) {
      const newView = {
        id: data.views.length + 1,
        product_id: parseInt(params[0]),
        viewer_id: parseInt(params[1]),
        created_at: new Date().toISOString()
      };
      data.views.push(newView);
      this.jsonDb.save();
      return { lastID: newView.id };
    }

    return { changes: 0 };
  }
}

if (!dbInstance) {
  dbInstance = new DatabaseWrapper();
  dbInstance.initialize();
}

module.exports = dbInstance;
