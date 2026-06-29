const db = require('./db');

function uid(){
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

const DEFAULT_SETTINGS = {
  brand: 'Nordic Lamp',
  brandTag: 'Nordic Lighting 路 Considered Design',
  logo: '',
  heroTitle: 'Timeless Light, Considered Design.',
  heroSub: 'A refined collection of handcrafted lamps designed for calm, modern interiors 鈥?where form follows feeling.',
  aboutIntro: 'We believe lighting is the quietest, most generous form of design. Every piece in our collection is considered 鈥?shaped by natural materials, soft light, and the rituals of everyday life.',
  aboutBody: 'Founded in 2008 in Stockholm, Nordic Lamp began as a small studio of ceramicists and woodworkers. Today we partner with independent designers across Scandinavia, producing a quiet catalogue of lamps intended to age gracefully.\n\nOur approach is slow, our palette is restrained, and our materials are honest 鈥?linen, oak, marble, raw ceramic and hand-blown glass.',
  aboutImage: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=900&q=80',
  contactAddress: 'No. 12 Strandv盲gen, Stockholm, Sweden',
  contactEmail: 'hello@nordiclamp.com',
  contactPhone: '+46 8 123 45 67',
  wholesaleEmail: 'wholesale@nordiclamp.com',
  supportEmail: 'support@nordiclamp.com',
  showroom: 'No. 12 Strandv盲gen, Stockholm, Sweden',
  footerText: '\u00a9 2026 Nordic Lamp AB. All rights reserved.',
  socialIg: '#',
  socialFb: '#',
  socialPi: '#'
};

const DEFAULT_CATEGORIES = [
  { id: 'cat-pendant', name: 'Pendant', slug: 'pendant', description: 'Hanging lamps for overhead presence.', sort_order: 1 },
  { id: 'cat-table-lamp', name: 'Table Lamp', slug: 'table-lamp', description: 'Desk and bedside companions.', sort_order: 2 },
  { id: 'cat-floor-lamp', name: 'Floor Lamp', slug: 'floor-lamp', description: 'Ambient floor pieces.', sort_order: 3 },
  { id: 'cat-wall-sconce', name: 'Wall Sconce', slug: 'wall-sconce', description: 'Soft directional light.', sort_order: 4 }
];

const IMG_POOL = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&q=80',
  'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=900&q=80',
  'https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=900&q=80',
  'https://images.unsplash.com/photo-1532070700348-92722dab938d?w=900&q=80',
  'https://images.unsplash.com/photo-1565636192335-4d77c0c6b5f4?w=900&q=80',
  'https://images.unsplash.com/photo-1526042834513-5cfa0ef105e0?w=900&q=80',
  'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=900&q=80'
];

function img(n){ return IMG_POOL[n % IMG_POOL.length]; }

const DEFAULT_PRODUCTS_SEEDS = [
  { name: 'Mora Pendant', slug: 'mora-pendant', cat: 'cat-pendant', price: 'EUR 249', desc: 'Mouth-blown opal glass pendant on a solid brass base. Silk cord is height-adjustable.', specs: { Material: 'Hand-blown glass, brass', Finish: 'Opal white / brushed brass', Wattage: 'Max 60W E27', Warranty: '2 years' } },
  { name: 'Linen Shade Table Lamp', slug: 'linen-shade-table-lamp', cat: 'cat-table-lamp', price: 'EUR 189', desc: 'Solid oak base with a woven linen shade. Dimmable.', specs: { Material: 'Solid oak, linen', Finish: 'Natural oak / natural linen', Wattage: 'Max 60W E27', Warranty: '2 years' } },
  { name: 'Vasa Floor Lamp', slug: 'vasa-floor-lamp', cat: 'cat-floor-lamp', price: 'EUR 459', desc: 'Minimalist floor lamp in matte black with a cotton drum shade.', specs: { Material: 'Powder-coated steel, cotton', Height: '170 cm', Wattage: 'Max 60W E27', Warranty: '2 years' } },
  { name: 'S枚der Sconce', slug: 'soder-sconce', cat: 'cat-wall-sconce', price: 'EUR 159', desc: 'Ceramic wall sconce with a ribbed glaze. Hard-wired or plug-in options.', specs: { Material: 'Ceramic, brass', Projection: '12 cm', Wattage: 'Max 40W E14', Warranty: '2 years' } },
  { name: 'Granite Table Lamp', slug: 'granite-table-lamp', cat: 'cat-table-lamp', price: 'EUR 219', desc: 'Turned from a single block of Swedish granite. Each piece is unique.', specs: { Material: 'Solid granite, linen', Height: '38 cm', Wattage: 'Max 40W E14' } },
  { name: 'Birch Pendant', slug: 'birch-pendant', cat: 'cat-pendant', price: 'EUR 329', desc: 'A birch veneer pendant with warm cork interior and braided cotton cord.', specs: { Material: 'Birch veneer, cotton', Diameter: '30 cm', Wattage: 'Max 60W E27' } },
  { name: 'Malm枚 Floor Lamp', slug: 'malm枚-floor-lamp', cat: 'cat-floor-lamp', price: 'EUR 519', desc: 'Tripod floor lamp in solid ash with a paper shade.', specs: { Material: 'Solid ash, washi paper', Height: '165 cm', Wattage: 'Max 60W E27' } },
  { name: 'Kivik Sconce', slug: 'kivik-sconce', cat: 'cat-wall-sconce', price: 'EUR 129', desc: 'A hand-patinated brass sconce with a frosted glass diffuser.', specs: { Material: 'Solid brass, frosted glass', Projection: '15 cm', Wattage: 'Max 25W G9' } },
  { name: 'Tiveden Pendant', slug: 'tiveden-pendant', cat: 'cat-pendant', price: 'EUR 389', desc: 'Murano glass pendant with a copper armature. Height-adjustable.', specs: { Material: 'Murano glass, copper', Diameter: '28 cm', Wattage: 'Max 60W E27', Warranty: '2 years' } },
  { name: 'Ljus Table Lamp', slug: 'ljus-table-lamp', cat: 'cat-table-lamp', price: 'EUR 169', desc: 'A compact porcelain table lamp with a cotton shade.', specs: { Material: 'Porcelain, cotton', Height: '32 cm', Wattage: 'Max 40W E14', Warranty: '2 years' } },
  { name: 'Skog Floor Lamp', slug: 'skog-floor-lamp', cat: 'cat-floor-lamp', price: 'EUR 579', desc: 'Oak tripod floor lamp with a washi paper shade in Japanese style.', specs: { Material: 'Solid oak, washi paper', Height: '168 cm', Wattage: 'Max 60W E27', Warranty: '2 years' } },
  { name: 'Strand Sconce', slug: 'strand-sconce', cat: 'cat-wall-sconce', price: 'EUR 149', desc: 'Double glass-shade sconce with solid brass hardware.', specs: { Material: 'Solid brass, opal glass', Projection: '14 cm', Wattage: 'Max 40W E14', Warranty: '2 years' } }
];

async function seed(){
  const info = await db.prepare("SELECT key FROM settings WHERE key = ?").get('seed_version');
  const currentVersion = 4;

  await seedAdmin();

  if (!info){
    console.log('[seed] First run, seeding initial data...');
    await seedCategories();
    await seedProducts();
    await seedSiteSettings();
    await db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)").run('seed_version', String(currentVersion));
    console.log('[seed] Done.');
  } else {
    const v = parseInt(info.value, 10) || 0;
    if (v < currentVersion){
      console.log(`[seed] Upgrading seed from v${v} to v${currentVersion}`);
      await seedCategories(true);
      await seedProducts(true);
      await seedSiteSettings(true);
      try {
        await db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)").run('seed_version', String(currentVersion));
      } catch(e){
        await db.prepare("UPDATE settings SET value = ? WHERE key = ?").run(String(currentVersion), 'seed_version');
      }
    }
  }
}

async function seedAdmin(){
  const bcrypt = require('bcryptjs');
  const hash = bcrypt.hashSync('admin123', 10);
  const now = Date.now();
  const row = await db.prepare("SELECT id FROM admin LIMIT 1").get();
  if (row){
    await db.prepare("UPDATE admin SET username = ?, password = ?, updated_at = ? WHERE id = ?")
      .run('admin', hash, now, row.id);
  } else {
    await db.prepare("INSERT INTO admin (username, password, created_at, updated_at) VALUES (?, ?, ?, ?)")
      .run('admin', hash, now, now);
  }
}

async function seedCategories(force=false){
  const rows = await db.prepare("SELECT id FROM categories").all();
  if (rows.length && !force) return;
  await db.transaction(async (tx) => {
    for (const c of DEFAULT_CATEGORIES){
      await tx.prepare("INSERT INTO categories (id, name, slug, description, sort_order) VALUES (?, ?, ?, ?, ?)")
        .run(c.id, c.name, c.slug, c.description, c.sort_order);
    }
  });
}

async function seedProducts(force=false){
  const rows = await db.prepare("SELECT id FROM products").all();
  if (rows.length && !force) return;
  const now = Date.now();
  await db.transaction(async (tx) => {
    for (let i = 0; i < DEFAULT_PRODUCTS_SEEDS.length; i++){
      const s = DEFAULT_PRODUCTS_SEEDS[i];
      const id = uid();
      const images = [img(i*2), img(i*2+1), img(i*2+2), img(i*2+3)];
      await tx.prepare(`INSERT INTO products
        (id, slug, category_id, name, price, description, specs, images, featured, sort_order, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
        id, s.slug, s.cat, s.name, s.price, s.desc,
        JSON.stringify(s.specs), JSON.stringify(images),
        i < 3 ? 1 : 0, i, now
      );
    }
  });
}

async function seedSiteSettings(force=false){
  const row = await db.prepare("SELECT id FROM site_settings WHERE id = 1").get();
  if (row && !force) return;
  if (row){
    await db.prepare("UPDATE site_settings SET data = ? WHERE id = 1").run(JSON.stringify(DEFAULT_SETTINGS));
  } else {
    await db.prepare("INSERT INTO site_settings (id, data) VALUES (1, ?)").run(JSON.stringify(DEFAULT_SETTINGS));
  }
}

module.exports = { seed, DEFAULT_SETTINGS };
