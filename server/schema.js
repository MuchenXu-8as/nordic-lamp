const db = require('./db');

async function initSchema() {
  const isPg = db.isPgMode();
  
  if (isPg) {
    await db.exec(`
      CREATE TABLE IF NOT EXISTS admin (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at BIGINT NOT NULL,
        updated_at BIGINT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS site_settings (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        data JSONB NOT NULL DEFAULT '{}'
      );

      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        sort_order INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(255) PRIMARY KEY,
        slug VARCHAR(255) UNIQUE NOT NULL,
        category_id VARCHAR(255) REFERENCES categories(id) ON DELETE SET NULL,
        name VARCHAR(255) NOT NULL,
        price VARCHAR(255),
        description TEXT,
        specs JSONB,
        images JSONB,
        featured BOOLEAN NOT NULL DEFAULT false,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at BIGINT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS inquiries (
        id VARCHAR(255) PRIMARY KEY,
        product_id VARCHAR(255),
        product_name VARCHAR(255),
        name VARCHAR(255),
        email VARCHAR(255),
        company VARCHAR(255),
        country VARCHAR(255),
        quantity VARCHAR(255),
        message TEXT,
        status VARCHAR(50) NOT NULL DEFAULT 'new',
        reply TEXT,
        created_at BIGINT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS settings (
        key VARCHAR(255) PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);
    console.log('[schema] PostgreSQL schema initialized');
  } else {
    const d = db.getDb();
    d.exec(`
      CREATE TABLE IF NOT EXISTS admin (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS site_settings (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        data TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT,
        sort_order INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        slug TEXT UNIQUE NOT NULL,
        category_id TEXT,
        name TEXT NOT NULL,
        price TEXT,
        description TEXT,
        specs TEXT,
        images TEXT,
        featured INTEGER NOT NULL DEFAULT 0,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS inquiries (
        id TEXT PRIMARY KEY,
        product_id TEXT,
        product_name TEXT,
        name TEXT,
        email TEXT,
        company TEXT,
        country TEXT,
        quantity TEXT,
        message TEXT,
        status TEXT NOT NULL DEFAULT 'new',
        reply TEXT,
        created_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);
    console.log('[schema] SQLite schema initialized');
  }
}

module.exports = initSchema;
