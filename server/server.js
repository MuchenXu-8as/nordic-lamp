require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');

const db = require('./db');
const initSchema = require('./schema');
const { seed, DEFAULT_SETTINGS } = require('./seed');

async function startServer() {
  try {
    initSchema();
    await seed();

    const app = express();
    app.use(cors());
    app.use(express.json({ limit: '5mb' }));

    const PORT = process.env.PORT || 3000;
    const JWT_SECRET = process.env.JWT_SECRET || 'nordic-lamp-dev-secret-change-me';

    const ROOT_DIR = path.join(__dirname, '..');
    const PUBLIC_DIR = ROOT_DIR;
    const ADMIN_DIR = path.join(ROOT_DIR, 'admin');
    const UPLOAD_DIR = path.join(ROOT_DIR, 'data', 'uploads');
    if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

    app.use('/uploads', express.static(UPLOAD_DIR));
    app.use(express.static(PUBLIC_DIR, {
      index: 'index.html',
      extensions: ['html']
    }));

    const storage = multer.diskStorage({
      destination: (req, file, cb) => cb(null, UPLOAD_DIR),
      filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase() || '.bin';
        const base = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
        cb(null, base + ext);
      }
    });
    const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

    function uid(){
      return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    }

    function authOptional(req, res, next){
      const h = req.headers.authorization || '';
      const token = h.startsWith('Bearer ') ? h.slice(7) : null;
      if (token){
        try { req.user = jwt.verify(token, JWT_SECRET); } catch(e){}
      }
      next();
    }

    function authRequired(req, res, next){
      const h = req.headers.authorization || '';
      const token = h.startsWith('Bearer ') ? h.slice(7) : null;
      if (!token){ return res.status(401).json({ error: 'Unauthorized' }); }
      try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.user = payload;
        next();
      } catch(e){
        res.status(401).json({ error: 'Invalid token' });
      }
    }

    app.get('/api/health', (req, res) => {
      res.json({ ok: true, time: Date.now() });
    });

    app.post('/api/auth/login', (req, res) => {
      const { username, password } = req.body || {};
      if (!username || !password) return res.status(400).json({ error: 'Missing credentials' });
      const row = db.prepare('SELECT * FROM admin LIMIT 1').get();
      if (!row) return res.status(401).json({ error: 'Invalid credentials' });
      const ok = bcrypt.compareSync(String(password), row.password);
      if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
      const token = jwt.sign({ sub: row.id, username: row.username }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ token, user: { id: row.id, username: row.username } });
    });

    app.get('/api/auth/me', authRequired, (req, res) => {
      const row = db.prepare('SELECT id, username FROM admin WHERE id = ?').get(req.user.sub);
      if (!row) return res.status(404).json({ error: 'Not found' });
      res.json({ user: row });
    });

    app.post('/api/auth/change-password', authRequired, (req, res) => {
      const { oldPassword, newPassword, username } = req.body || {};
      if (!oldPassword || !newPassword) return res.status(400).json({ error: 'Missing fields' });
      const row = db.prepare('SELECT * FROM admin WHERE id = ?').get(req.user.sub);
      if (!row) return res.status(404).json({ error: 'Not found' });
      if (!bcrypt.compareSync(String(oldPassword), row.password)) return res.status(401).json({ error: 'Old password incorrect' });
      const hash = bcrypt.hashSync(String(newPassword), 10);
      const uname = username && username.trim() ? username.trim() : row.username;
      db.prepare('UPDATE admin SET username = ?, password = ?, updated_at = ? WHERE id = ?')
        .run(uname, hash, Date.now(), row.id);
      res.json({ ok: true, username: uname });
    });

    app.get('/api/site/settings', (req, res) => {
      const row = db.prepare('SELECT data FROM site_settings WHERE id = 1').get();
      const data = row ? JSON.parse(row.data) : DEFAULT_SETTINGS;
      res.json({ data });
    });

    app.put('/api/site/settings', authRequired, (req, res) => {
      const data = req.body || {};
      const merged = Object.assign({}, DEFAULT_SETTINGS, data);
      const exists = db.prepare('SELECT id FROM site_settings WHERE id = 1').get();
      if (exists){
        db.prepare('UPDATE site_settings SET data = ? WHERE id = 1').run(JSON.stringify(merged));
      } else {
        db.prepare('INSERT INTO site_settings (id, data) VALUES (1, ?)').run(JSON.stringify(merged));
      }
      res.json({ data: merged });
    });

    app.get('/api/categories', (req, res) => {
      const rows = db.prepare('SELECT * FROM categories ORDER BY sort_order ASC').all();
      res.json({ data: rows });
    });

    app.post('/api/categories', authRequired, (req, res) => {
      const { name, slug, description } = req.body || {};
      if (!name || !slug) return res.status(400).json({ error: 'Missing name/slug' });
      const id = uid();
      const max = db.prepare('SELECT COALESCE(MAX(sort_order),0) AS m FROM categories').get().m;
      db.prepare('INSERT INTO categories (id, name, slug, description, sort_order) VALUES (?, ?, ?, ?, ?)')
        .run(id, name, slug, description || '', max + 1);
      res.json({ data: { id, name, slug, description: description || '', sort_order: max + 1 } });
    });

    app.put('/api/categories/:id', authRequired, (req, res) => {
      const id = req.params.id;
      const { name, slug, description, sort_order } = req.body || {};
      const fields = [];
      const values = [];
      if (name !== undefined){ fields.push('name = ?'); values.push(name); }
      if (slug !== undefined){ fields.push('slug = ?'); values.push(slug); }
      if (description !== undefined){ fields.push('description = ?'); values.push(description); }
      if (sort_order !== undefined){ fields.push('sort_order = ?'); values.push(sort_order); }
      if (!fields.length) return res.json({ data: db.prepare('SELECT * FROM categories WHERE id = ?').get(id) });
      values.push(id);
      db.prepare(`UPDATE categories SET ${fields.join(', ')} WHERE id = ?`).run(...values);
      res.json({ data: db.prepare('SELECT * FROM categories WHERE id = ?').get(id) });
    });

    app.delete('/api/categories/:id', authRequired, (req, res) => {
      db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
      res.json({ ok: true });
    });

    app.post('/api/categories/reorder', authRequired, (req, res) => {
      const ids = Array.isArray(req.body) ? req.body : (req.body && req.body.ids ? req.body.ids : []);
      const tx = db.transaction((arr) => {
        const stmt = db.prepare('UPDATE categories SET sort_order = ? WHERE id = ?');
        arr.forEach((id, i) => stmt.run(i, id));
      });
      tx(ids);
      res.json({ ok: true });
    });

    app.get('/api/products', (req, res) => {
      const rows = db.prepare('SELECT * FROM products ORDER BY sort_order ASC').all();
      const data = rows.map(rowToProduct);
      res.json({ data });
    });

    app.get('/api/products/:id', (req, res) => {
      const row = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
      if (!row) return res.status(404).json({ error: 'Not found' });
      res.json({ data: rowToProduct(row) });
    });

    app.get('/api/products/slug/:slug', (req, res) => {
      const row = db.prepare('SELECT * FROM products WHERE slug = ?').get(req.params.slug);
      if (!row) return res.status(404).json({ error: 'Not found' });
      res.json({ data: rowToProduct(row) });
    });

    app.post('/api/products', authRequired, (req, res) => {
      const p = req.body || {};
      const id = uid();
      const now = Date.now();
      db.prepare(`INSERT INTO products (id, slug, category_id, name, price, description, specs, images, featured, sort_order, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
          id,
          p.slug || (p.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          p.categoryId || null,
          p.name || '',
          p.price || '',
          p.description || '',
          JSON.stringify(p.specs || {}),
          JSON.stringify(p.images || []),
          p.featured ? 1 : 0,
          p.sort_order || 0,
          now
        );
      const row = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
      res.json({ data: rowToProduct(row) });
    });

    app.put('/api/products/:id', authRequired, (req, res) => {
      const id = req.params.id;
      const p = req.body || {};
      const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
      if (!existing) return res.status(404).json({ error: 'Not found' });
      const merged = Object.assign({}, rowToProduct(existing), p);
      db.prepare(`UPDATE products SET slug = ?, category_id = ?, name = ?, price = ?, description = ?, specs = ?, images = ?, featured = ?, sort_order = ? WHERE id = ?`)
        .run(
          merged.slug, merged.categoryId || null, merged.name, merged.price || '',
          merged.description || '',
          JSON.stringify(merged.specs || {}),
          JSON.stringify(merged.images || []),
          merged.featured ? 1 : 0,
          merged.sort_order || 0,
          id
        );
      const row = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
      res.json({ data: rowToProduct(row) });
    });

    app.delete('/api/products/:id', authRequired, (req, res) => {
      db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
      res.json({ ok: true });
    });

    app.post('/api/products/reorder', authRequired, (req, res) => {
      const ids = Array.isArray(req.body) ? req.body : (req.body && req.body.ids ? req.body.ids : []);
      const tx = db.transaction((arr) => {
        const stmt = db.prepare('UPDATE products SET sort_order = ? WHERE id = ?');
        arr.forEach((id, i) => stmt.run(i, id));
      });
      tx(ids);
      res.json({ ok: true });
    });

    app.post('/api/upload', authRequired, upload.single('file'), (req, res) => {
      if (!req.file) return res.status(400).json({ error: 'No file' });
      const url = `/uploads/${req.file.filename}`;
      res.json({ url, filename: req.file.filename, size: req.file.size });
    });

    app.get('/api/inquiries', authRequired, (req, res) => {
      const rows = db.prepare('SELECT * FROM inquiries ORDER BY created_at DESC').all();
      const data = rows.map(r => ({
        id: r.id,
        productId: r.product_id,
        productName: r.product_name,
        name: r.name,
        email: r.email,
        company: r.company,
        country: r.country,
        quantity: r.quantity,
        message: r.message,
        status: r.status,
        reply: r.reply,
        createdAt: r.created_at
      }));
      res.json({ data });
    });

    app.post('/api/inquiries', (req, res) => {
      const b = req.body || {};
      const id = uid();
      const now = Date.now();
      db.prepare(`INSERT INTO inquiries
        (id, product_id, product_name, name, email, company, country, quantity, message, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
          id, b.productId || null, b.productName || '', b.name || '', b.email || '',
          b.company || '', b.country || '', b.quantity || '', b.message || '', 'new', now
        );
      res.json({ data: { id, status: 'new', createdAt: now } });
    });

    app.put('/api/inquiries/:id', authRequired, (req, res) => {
      const id = req.params.id;
      const b = req.body || {};
      const sets = [];
      const values = [];
      if (b.status !== undefined){ sets.push('status = ?'); values.push(b.status); }
      if (b.reply !== undefined){ sets.push('reply = ?'); values.push(b.reply); }
      if (!sets.length) return res.json({ data: db.prepare('SELECT * FROM inquiries WHERE id = ?').get(id) });
      values.push(id);
      db.prepare(`UPDATE inquiries SET ${sets.join(', ')} WHERE id = ?`).run(...values);
      const row = db.prepare('SELECT * FROM inquiries WHERE id = ?').get(id);
      res.json({ data: row });
    });

    app.delete('/api/inquiries/:id', authRequired, (req, res) => {
      db.prepare('DELETE FROM inquiries WHERE id = ?').run(req.params.id);
      res.json({ ok: true });
    });

    app.get('/api/inquiries/stats', authRequired, (req, res) => {
      const rows = db.prepare('SELECT status, COUNT(*) AS c FROM inquiries GROUP BY status').all();
      const total = rows.reduce((s, r) => s + r.c, 0);
      const stats = { total };
      rows.forEach(r => { stats[r.status] = r.c; });
      res.json({ data: stats });
    });

    function rowToProduct(row){
      let specs = {};
      let images = [];
      try { specs = row.specs ? JSON.parse(row.specs) : {}; } catch(e){}
      try { images = row.images ? JSON.parse(row.images) : []; } catch(e){}
      return {
        id: row.id,
        slug: row.slug,
        categoryId: row.category_id,
        name: row.name,
        price: row.price,
        description: row.description,
        specs,
        images,
        featured: !!row.featured,
        sort_order: row.sort_order,
        createdAt: row.created_at
      };
    }

    app.listen(PORT, () => {
      console.log('===============================================');
      console.log('  Nordic Lamp backend running on port', PORT);
      console.log('  Frontend:  http://localhost:' + PORT + '/');
      console.log('  API root:  http://localhost:' + PORT + '/api');
      console.log('===============================================');
    });

  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
