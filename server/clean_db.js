const fs = require('fs');
const path = require('path');

// Clean up DB helper
const dbFile = path.join(__dirname, 'data.db');
const jsonDbFile = path.join(__dirname, 'db_fallback.json');

console.log("Cleaning database...");

// 1. Clean SQLite database if it exists
if (fs.existsSync(dbFile)) {
  try {
    const sqlite3 = require('sqlite3').verbose();
    const db = new sqlite3.Database(dbFile);
    
    db.serialize(() => {
      db.run("DELETE FROM users");
      db.run("DELETE FROM products");
      db.run("DELETE FROM receipts");
      db.run("DELETE FROM notifications");
      db.run("DELETE FROM favorites");
      db.run("DELETE FROM views");
      db.run("VACUUM", (err) => {
        if (err) console.error("Error vacuuming SQLite database:", err.message);
        else console.log("SQLite tables cleared successfully.");
        db.close();
      });
    });
  } catch (err) {
    console.warn("SQLite clean warning (likely package not installed or in use):", err.message);
  }
}

// 2. Clean JSON fallback database
const emptyData = {
  users: [],
  products: [],
  notifications: [],
  receipts: [],
  favorites: [],
  views: []
};

try {
  fs.writeFileSync(jsonDbFile, JSON.stringify(emptyData, null, 2), 'utf8');
  console.log("JSON fallback storage cleared successfully.");
} catch (err) {
  console.error("Error clearing JSON fallback database:", err.message);
}

console.log("Database cleanup completed!");
