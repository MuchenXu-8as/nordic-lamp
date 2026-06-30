const { query, queryOne, run, transaction, isPgMode } = require('./db');
const bcrypt = require('bcryptjs');

const DEFAULT_SETTINGS = {
  siteTitle: 'Nordic Lamp',
  siteDescription: 'Premium lighting fixtures for modern living',
  contactEmail: 'sales@nordic-lamp.com',
  phone: '+86 138 0000 0000',
  address: 'Shenzhen, China',
  logo: '/images/logo.svg',
  heroImage: '/images/hero.jpg',
  heroTitle: 'Illuminate Your Space',
  heroSubtitle: 'Sustainable Scandinavian Design',
  socialMedia: {
    facebook: '#',
    instagram: '#',
    linkedin: '#'
  }
};

const DEFAULT_CATEGORIES = [
  { id: 'cat-chandeliers', name: 'Chandeliers', slug: 'chandeliers', description: 'Elegant centerpiece lighting', sort_order: 1 },
  { id: 'cat-pendants', name: 'Pendants', slug: 'pendants', description: 'Versatile hanging lights', sort_order: 2 },
  { id: 'cat-wall-lamps', name: 'Wall Lamps', slug: 'wall-lamps', description: 'Decorative wall lighting', sort_order: 3 },
  { id: 'cat-table-lamps', name: 'Table Lamps', slug: 'table-lamps', description: 'Desk and accent lighting', sort_order: 4 },
  { id: 'cat-floor-lamps', name: 'Floor Lamps', slug: 'floor-lamps', description: 'Standalone floor lighting', sort_order: 5 },
  { id: 'cat-outdoor', name: 'Outdoor', slug: 'outdoor', description: 'Weather-resistant outdoor lights', sort_order: 6 }
];

const DEFAULT_PRODUCTS = [
  {
    id: 'p-nordic-crystal',
    slug: 'nordic-crystal-chandelier',
    category_id: 'cat-chandeliers',
    name: 'Nordic Crystal Chandelier',
    price: 'from $899',
    description: 'Hand-blown glass crystal chandelier with brass finish. Perfect for entryways and living rooms.',
    specs: { 'Material': 'Glass, Brass', 'Bulbs': '5 x E14', 'Diameter': '60cm', 'Height': '45cm' },
    images: ['/images/products/chandelier-1.jpg', '/images/products/chandelier-2.jpg'],
    featured: true,
    sort_order: 1
  },
  {
    id: 'p-aurora-pendant',
    slug: 'aurora-pendant-light',
    category_id: 'cat-pendants',
    name: 'Aurora Pendant Light',
    price: 'from $299',
    description: 'Minimalist pendant with opal glass shade and brushed brass cord.',
    specs: { 'Material': 'Glass, Brass', 'Bulb': '1 x E27', 'Diameter': '20cm', 'Cord Length': '1.5m' },
    images: ['/images/products/pendant-1.jpg'],
    featured: true,
    sort_order: 2
  },
  {
    id: 'p-moss-wall',
    slug: 'moss-wall-lamp',
    category_id: 'cat-wall-lamps',
    name: 'Moss Wall Lamp',
    price: 'from $189',
    description: 'Nature-inspired wall lamp with cast aluminum frame and frosted glass.',
    specs: { 'Material': 'Aluminum, Glass', 'Bulbs': '2 x G9', 'Width': '30cm', 'Height': '25cm' },
    images: ['/images/products/wall-1.jpg'],
    featured: false,
    sort_order: 3
  },
  {
    id: 'p-fjord-table',
    slug: 'fjord-table-lamp',
    category_id: 'cat-table-lamps',
    name: 'Fjord Table Lamp',
    price: 'from $149',
    description: 'Walnut wood base with linen drum shade. Dimmable LED compatible.',
    specs: { 'Material': 'Walnut, Linen', 'Bulb': '1 x E27', 'Height': '42cm', 'Base': '15cm' },
    images: ['/images/products/table-1.jpg'],
    featured: false,
    sort_order: 4
  },
  {
    id: 'p-tundra-floor',
    slug: 'tundra-floor-lamp',
    category_id: 'cat-floor-lamps',
    name: 'Tundra Floor Lamp',
    price: 'from $399',
    description: 'Arc floor lamp with marble base and adjustable brass arm.',
    specs: { 'Material': 'Marble, Brass', 'Bulb': '1 x E27', 'Height': '180cm', 'Reach': '60cm' },
    images: ['/images/products/floor-1.jpg'],
    featured: true,
    sort_order: 5
  },
  {
    id: 'p-cedar-outdoor',
    slug: 'cedar-outdoor-lamp',
    category_id: 'cat-outdoor',
    name: 'Cedar Outdoor Lamp',
    price: 'from $249',
    description: 'IP65 rated outdoor wall lamp with solid brass construction.',
    specs: { 'Material': 'Brass', 'Bulb': '1 x GU10', 'IP Rating': 'IP65', 'Height': '28cm' },
    images: ['/images/products/outdoor-1.jpg'],
    featured: false,
    sort_order: 6
  }
];

async function seedAdmin(){
  const hash = bcrypt.hashSync('admin123', 10);
  const now = Date.now();
  const existing = await queryOne('SELECT id FROM admin LIMIT 1');
  
  if (isPgMode()) {
    if (existing) {
      await run('UPDATE admin SET username = $1, password = $2, updated_at = $3 WHERE id = $4',
        ['admin', hash, now, existing.id]);
    } else {
      await run('INSERT INTO admin (username, password, created_at, updated_at) VALUES ($1, $2, $3, $4)',
        ['admin', hash, now, now]);
    }
  } else {
    if (existing) {
      await run('UPDATE admin SET username = ?, password = ?, updated_at = ? WHERE id = ?',
        ['admin', hash, now, existing.id]);
    } else {
      await run('INSERT INTO admin (username, password, created_at, updated_at) VALUES (?, ?, ?, ?)',
        ['admin', hash, now, now]);
    }
  }
  console.log('[seed] Admin user ensured (admin/admin123)');
}

async function seedCategories(force){
  const countRow = await queryOne('SELECT COUNT(*) as count FROM categories');
  if (!force && countRow.count > 0) return;
  
  console.log('[seed] Seeding categories...');
  const pg = isPgMode();
  for (const cat of DEFAULT_CATEGORIES) {
    const existing = await queryOne(pg ? 'SELECT id FROM categories WHERE id = $1' : 'SELECT id FROM categories WHERE id = ?', [cat.id]);
    if (!existing) {
      if (pg) {
        await run('INSERT INTO categories (id, name, slug, description, sort_order) VALUES ($1, $2, $3, $4, $5)',
          [cat.id, cat.name, cat.slug, cat.description, cat.sort_order]);
      } else {
        await run('INSERT INTO categories (id, name, slug, description, sort_order) VALUES (?, ?, ?, ?, ?)',
          [cat.id, cat.name, cat.slug, cat.description, cat.sort_order]);
      }
    }
  }
  console.log('[seed] Categories done.');
}

async function seedProducts(force){
  const countRow = await queryOne('SELECT COUNT(*) as count FROM products');
  if (!force && countRow.count > 0) return;
  
  console.log('[seed] Seeding products...');
  const pg = isPgMode();
  for (const p of DEFAULT_PRODUCTS) {
    const existing = await queryOne(pg ? 'SELECT id FROM products WHERE id = $1' : 'SELECT id FROM products WHERE id = ?', [p.id]);
    if (!existing) {
      const specsJson = JSON.stringify(p.specs);
      const imagesJson = JSON.stringify(p.images);
      if (pg) {
        await run(
          'INSERT INTO products (id, slug, category_id, name, price, description, specs, images, featured, sort_order, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
          [p.id, p.slug, p.category_id, p.name, p.price, p.description, specsJson, imagesJson, p.featured, p.sort_order, Date.now()]
        );
      } else {
        await run(
          'INSERT INTO products (id, slug, category_id, name, price, description, specs, images, featured, sort_order, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [p.id, p.slug, p.category_id, p.name, p.price, p.description, specsJson, imagesJson, p.featured, p.sort_order, Date.now()]
        );
      }
    }
  }
  console.log('[seed] Products done.');
}

async function seedSiteSettings(force){
  const existing = await queryOne('SELECT id FROM site_settings WHERE id = 1');
  if (!force && existing) return;
  
  console.log('[seed] Seeding site settings...');
  const settingsJson = JSON.stringify(DEFAULT_SETTINGS);
  if (isPgMode()) {
    await run('INSERT INTO site_settings (id, data) VALUES (1, $1) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data',
      [settingsJson]);
  } else {
    if (existing) {
      await run('UPDATE site_settings SET data = ? WHERE id = 1', [settingsJson]);
    } else {
      await run('INSERT INTO site_settings (id, data) VALUES (1, ?)', [settingsJson]);
    }
  }
  console.log('[seed] Site settings done.');
}

async function seed(){
  const info = await queryOne(isPgMode() ? 'SELECT value FROM settings WHERE key = $1' : 'SELECT value FROM settings WHERE key = ?', ['seed_version']);
  const currentVersion = 4;

  await seedAdmin();

  if (!info){
    console.log('[seed] First run, seeding initial data...');
    await seedCategories(true);
    await seedProducts(true);
    await seedSiteSettings(true);
    if (isPgMode()) {
      await run('INSERT INTO settings (key, value) VALUES ($1, $2)', ['seed_version', String(currentVersion)]);
    } else {
      await run('INSERT INTO settings (key, value) VALUES (?, ?)', ['seed_version', String(currentVersion)]);
    }
    console.log('[seed] Done.');
  } else {
    const v = parseInt(info.value, 10) || 0;
    if (v < currentVersion){
      console.log(`[seed] Upgrading seed from v${v} to v${currentVersion}`);
      await seedCategories(true);
      await seedProducts(true);
      await seedSiteSettings(true);
      if (isPgMode()) {
        await run('INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $3',
          ['seed_version', String(currentVersion), String(currentVersion)]);
      } else {
        const existing = await queryOne('SELECT key FROM settings WHERE key = ?', ['seed_version']);
        if (existing) {
          await run('UPDATE settings SET value = ? WHERE key = ?', [String(currentVersion), 'seed_version']);
        } else {
          await run('INSERT INTO settings (key, value) VALUES (?, ?)', ['seed_version', String(currentVersion)]);
        }
      }
    }
  }
}

module.exports = { seed, DEFAULT_SETTINGS };
