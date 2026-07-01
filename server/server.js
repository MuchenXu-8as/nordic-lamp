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
const { uploadFile: supabaseUpload } = require('./supabase-storage');

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));

const JWT_SECRET = process.env.JWT_SECRET || 'nordic-lamp-dev-secret-change-me';

const ROOT_DIR = path.join(__dirname, '..');
const PUBLIC_DIR = ROOT_DIR;
const ADMIN_DIR = path.join(ROOT_DIR, 'admin');
const PERSIST_DIR = process.env.RENDER_DISK_PATH
  ? path.join(process.env.RENDER_DISK_PATH, 'data')
  : path.join(ROOT_DIR, 'data');
const UPLOAD_DIR = path.join(PERSIST_DIR, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

app.use('/uploads', express.static(UPLOAD_DIR));
app.use(express.static(PUBLIC_DIR, {
  index: 'index.html',
  extensions: ['html']
}));

const useSupabaseStorage = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY;

const storage = useSupabaseStorage
  ? multer.memoryStorage()
  : multer.diskStorage({
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
  res.json({ ok: true, time: Date.now(), db: db.isPgMode() ? 'postgres' : 'sqlite' });
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'Missing credentials' });
  const row = await db.queryOne('SELECT * FROM admin LIMIT 1');
  if (!row) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = bcrypt.compareSync(String(password), row.password);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ sub: row.id, username: row.username }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: row.id, username: row.username } });
});

app.get('/api/auth/me', authRequired, async (req, res) => {
  const row = await db.queryOne('SELECT id, username FROM admin WHERE id = $1', [req.user.sub]);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json({ user: row });
});

app.put('/api/auth/change-password', authRequired, async (req, res) => {
  const { oldPassword, newPassword, username } = req.body || {};
  if (!oldPassword || !newPassword) return res.status(400).json({ error: 'Missing fields' });
  const row = await db.queryOne('SELECT * FROM admin WHERE id = $1', [req.user.sub]);
  if (!row) return res.status(404).json({ error: 'Not found' });
  if (!bcrypt.compareSync(String(oldPassword), row.password)) return res.status(401).json({ error: 'Old password incorrect' });
  const hash = bcrypt.hashSync(String(newPassword), 10);
  const uname = username && username.trim() ? username.trim() : row.username;
  await db.run('UPDATE admin SET username = $1, password = $2, updated_at = $3 WHERE id = $4',
    [uname, hash, Date.now(), row.id]);
  res.json({ ok: true, username: uname });
});

app.get('/api/site/settings', async (req, res) => {
  const row = await db.queryOne('SELECT data FROM site_settings WHERE id = 1');
  let data;
  if (row) {
    if (typeof row.data === 'string') {
      try { data = JSON.parse(row.data); } catch(e) { data = row.data; }
    } else {
      data = row.data;
    }
  }
  res.json({ data: data || DEFAULT_SETTINGS });
});

app.put('/api/site/settings', authRequired, async (req, res) => {
  const data = req.body || {};
  const merged = Object.assign({}, DEFAULT_SETTINGS, data);
  const row = await db.queryOne('SELECT id FROM site_settings WHERE id = 1');
  if (row){
    await db.run('UPDATE site_settings SET data = $1 WHERE id = 1', [JSON.stringify(merged)]);
  } else {
    await db.run('INSERT INTO site_settings (id, data) VALUES (1, $1)', [JSON.stringify(merged)]);
  }
  res.json({ data: merged });
});

app.get('/api/categories', async (req, res) => {
  const rows = await db.query('SELECT * FROM categories ORDER BY sort_order ASC');
  res.json({ data: rows });
});

app.post('/api/categories', authRequired, async (req, res) => {
  const { name, slug, description } = req.body || {};
  if (!name || !slug) return res.status(400).json({ error: 'Missing name/slug' });
  const id = uid();
  const maxRow = await db.queryOne('SELECT COALESCE(MAX(sort_order),0) AS m FROM categories');
  const max = maxRow.m || 0;
  await db.run('INSERT INTO categories (id, name, slug, description, sort_order) VALUES ($1, $2, $3, $4, $5)',
    [id, name, slug, description || '', max + 1]);
  res.json({ data: { id, name, slug, description: description || '', sort_order: max + 1 } });
});

app.put('/api/categories/:id', authRequired, async (req, res) => {
  const id = req.params.id;
  const { name, slug, description, sort_order } = req.body || {};
  const fields = [];
  const values = [];
  if (name !== undefined){ fields.push('name = $' + (values.length + 1)); values.push(name); }
  if (slug !== undefined){ fields.push('slug = $' + (values.length + 1)); values.push(slug); }
  if (description !== undefined){ fields.push('description = $' + (values.length + 1)); values.push(description); }
  if (sort_order !== undefined){ fields.push('sort_order = $' + (values.length + 1)); values.push(sort_order); }
  if (!fields.length) {
    const row = await db.queryOne('SELECT * FROM categories WHERE id = $1', [id]);
    return res.json({ data: row });
  }
  values.push(id);
  await db.run(`UPDATE categories SET ${fields.join(', ')} WHERE id = $${values.length}`, values);
  const row = await db.queryOne('SELECT * FROM categories WHERE id = $1', [id]);
  res.json({ data: row });
});

app.delete('/api/categories/:id', authRequired, async (req, res) => {
  await db.run('DELETE FROM categories WHERE id = $1', [req.params.id]);
  res.json({ ok: true });
});

app.post('/api/categories/reorder', authRequired, async (req, res) => {
  const ids = Array.isArray(req.body) ? req.body : (req.body && req.body.ids ? req.body.ids : []);
  const tx = db.transaction(async (client, arr) => {
    for (let i = 0; i < arr.length; i++) {
      await client.query('UPDATE categories SET sort_order = $1 WHERE id = $2', [i, arr[i]]);
    }
  });
  await tx(ids);
  res.json({ ok: true });
});

app.get('/api/products', async (req, res) => {
  const rows = await db.query('SELECT * FROM products ORDER BY sort_order ASC');
  const data = rows.map(rowToProduct);
  res.json({ data });
});

app.get('/api/products/:id', async (req, res) => {
  const row = await db.queryOne('SELECT * FROM products WHERE id = $1', [req.params.id]);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json({ data: rowToProduct(row) });
});

app.get('/api/products/slug/:slug', async (req, res) => {
  const row = await db.queryOne('SELECT * FROM products WHERE slug = $1', [req.params.slug]);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json({ data: rowToProduct(row) });
});

app.post('/api/products', authRequired, async (req, res) => {
  const p = req.body || {};
  const id = uid();
  const now = Date.now();
  await db.run(
    `INSERT INTO products (id, slug, category_id, name, price, description, specs, images, featured, sort_order, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
    [
      id,
      p.slug || (p.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      p.categoryId || null,
      p.name || '',
      p.price || '',
      p.description || '',
      JSON.stringify(p.specs || {}),
      JSON.stringify(p.images || []),
      p.featured ? true : false,
      p.sort_order || 0,
      now
    ]
  );
  const row = await db.queryOne('SELECT * FROM products WHERE id = $1', [id]);
  res.json({ data: rowToProduct(row) });
});

app.put('/api/products/:id', authRequired, async (req, res) => {
  const id = req.params.id;
  const p = req.body || {};
  const existing = await db.queryOne('SELECT * FROM products WHERE id = $1', [id]);
  if (!existing) return res.status(404).json({ error: 'Not found' });
  const merged = Object.assign({}, rowToProduct(existing), p);
  await db.run(
    `UPDATE products SET slug = $1, category_id = $2, name = $3, price = $4, description = $5, specs = $6, images = $7, featured = $8, sort_order = $9 WHERE id = $10`,
    [
      merged.slug, merged.categoryId || null, merged.name, merged.price || '',
      merged.description || '',
      JSON.stringify(merged.specs || {}),
      JSON.stringify(merged.images || []),
      merged.featured ? true : false,
      merged.sort_order || 0,
      id
    ]
  );
  const row = await db.queryOne('SELECT * FROM products WHERE id = $1', [id]);
  res.json({ data: rowToProduct(row) });
});

app.delete('/api/products/:id', authRequired, async (req, res) => {
  await db.run('DELETE FROM products WHERE id = $1', [req.params.id]);
  res.json({ ok: true });
});

app.post('/api/products/reorder', authRequired, async (req, res) => {
  const ids = Array.isArray(req.body) ? req.body : (req.body && req.body.ids ? req.body.ids : []);
  const tx = db.transaction(async (client, arr) => {
    for (let i = 0; i < arr.length; i++) {
      await client.query('UPDATE products SET sort_order = $1 WHERE id = $2', [i, arr[i]]);
    }
  });
  await tx(ids);
  res.json({ ok: true });
});

app.post('/api/upload', authRequired, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  
  try {
    if (useSupabaseStorage) {
      const result = await supabaseUpload(req.file.buffer, req.file.originalname, req.file.mimetype);
      res.json({ url: result.url, filename: result.filename, size: result.size });
    } else {
      const url = `/uploads/${req.file.filename}`;
      res.json({ url, filename: req.file.filename, size: req.file.size });
    }
  } catch (error) {
    console.error('[upload] Error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

app.get('/api/inquiries', authRequired, async (req, res) => {
  const rows = await db.query('SELECT * FROM inquiries ORDER BY created_at DESC');
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

app.post('/api/inquiries', async (req, res) => {
  const b = req.body || {};
  const id = uid();
  const now = Date.now();
  await db.run(
    `INSERT INTO inquiries
     (id, product_id, product_name, name, email, company, country, quantity, message, status, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
    [id, b.productId || null, b.productName || '', b.name || '', b.email || '',
     b.company || '', b.country || '', b.quantity || '', b.message || '', 'new', now]
  );
  res.json({ data: { id, status: 'new', createdAt: now } });
});

app.put('/api/inquiries/:id', authRequired, async (req, res) => {
  const id = req.params.id;
  const b = req.body || {};
  const sets = [];
  const values = [];
  if (b.status !== undefined){ sets.push('status = $' + (values.length + 1)); values.push(b.status); }
  if (b.reply !== undefined){ sets.push('reply = $' + (values.length + 1)); values.push(b.reply); }
  if (!sets.length) {
    const row = await db.queryOne('SELECT * FROM inquiries WHERE id = $1', [id]);
    return res.json({ data: row });
  }
  values.push(id);
  await db.run(`UPDATE inquiries SET ${sets.join(', ')} WHERE id = $${values.length}`, values);
  const row = await db.queryOne('SELECT * FROM inquiries WHERE id = $1', [id]);
  res.json({ data: row });
});

app.delete('/api/inquiries/:id', authRequired, async (req, res) => {
  await db.run('DELETE FROM inquiries WHERE id = $1', [req.params.id]);
  res.json({ ok: true });
});

app.get('/api/inquiries/stats', authRequired, async (req, res) => {
  const rows = await db.query('SELECT status, COUNT(*) AS c FROM inquiries GROUP BY status');
  const total = rows.reduce((s, r) => s + Number(r.c), 0);
  const stats = { total };
  rows.forEach(r => { stats[r.status] = Number(r.c); });
  res.json({ data: stats });
});

function rowToProduct(row){
  let specs = {};
  let images = [];
  try {
    if (typeof row.specs === 'string') {
      specs = JSON.parse(row.specs);
    } else if (row.specs && typeof row.specs === 'object') {
      specs = row.specs;
    }
  } catch(e){}
  try {
    if (typeof row.images === 'string') {
      images = JSON.parse(row.images);
    } else if (row.images && Array.isArray(row.images)) {
      images = row.images;
    }
  } catch(e){}
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

let appInitialized = false;
let initError = null;

async function initializeApp() {
  if (appInitialized) return;
  if (initError) throw initError;
  try {
    await db.initDatabase();
    await initSchema();
    await seed();
    appInitialized = true;
    console.log('[init] App initialized successfully');
  } catch (err) {
    initError = err;
    console.error('Failed to initialize app:', err);
    throw err;
  }
}

async function ensureInitialized(req, res, next) {
  try {
    await initializeApp();
    next();
  } catch (err) {
    console.error('Initialization error:', err);
    res.status(500).json({ error: 'Service initialization failed' });
  }
}

app.use(ensureInitialized);

if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
  module.exports = app;
} else {
  const PORT = process.env.PORT || 3000;
  initializeApp().then(() => {
    app.listen(PORT, () => {
      console.log('===============================================');
      console.log('  Nordic Lamp backend running on port', PORT);
      console.log('  Database:', db.isPgMode() ? 'PostgreSQL (Supabase)' : 'In-Memory');
      console.log('  Storage:', useSupabaseStorage ? 'Supabase Storage' : 'Local Disk');
      console.log('  Frontend:  http://localhost:' + PORT + '/');
      console.log('  API root:  http://localhost:' + PORT + '/api');
      console.log('===============================================');
    });
  }).catch(err => {
    console.error('Failed to start app:', err);
    process.exit(1);
  });
}