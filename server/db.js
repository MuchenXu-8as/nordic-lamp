const fs = require('fs');
const path = require('path');

let db = null;
let pgMode = false;

async function initDatabase() {
  const usePostgres = process.env.DATABASE_URL || process.env.SUPABASE_URL;

  if (usePostgres) {
    pgMode = true;
    console.log('[db] Using PostgreSQL (Supabase)');
    const { Pool } = require('pg');
    const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_URL;
    
    db = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000
    });
    return db;
  } else {
    const initSqlJs = require('sql.js');
    const DATA_DIR = process.env.RENDER_DISK_PATH
      ? path.join(process.env.RENDER_DISK_PATH, 'data')
      : path.join(__dirname, '..', 'data');
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

    const dbPath = path.join(DATA_DIR, 'nordic-lamp.db');
    let dbBuffer = Buffer.alloc(0);
    if (fs.existsSync(dbPath)) {
      dbBuffer = fs.readFileSync(dbPath);
    }

    const SQL = await initSqlJs({ locateFile: file => `node_modules/sql.js/dist/${file}` });
    db = new SQL.Database(dbBuffer);

    console.log('[db] Using sql.js:', dbPath);
    return db;
  }
}

function saveSqliteDb() {
  if (!pgMode && db && typeof db.export === 'function') {
    const DATA_DIR = process.env.RENDER_DISK_PATH
      ? path.join(process.env.RENDER_DISK_PATH, 'data')
      : path.join(__dirname, '..', 'data');
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    const dbPath = path.join(DATA_DIR, 'nordic-lamp.db');
    const data = db.export();
    fs.writeFileSync(dbPath, Buffer.from(data));
  }
}

async function getDb() {
  if (!db) {
    return await initDatabase();
  }
  return db;
}

async function query(text, params) {
  const d = await getDb();
  if (pgMode) {
    const result = await d.query(text, params);
    return result.rows;
  } else {
    const stmt = d.prepare(text);
    const rows = stmt.all(params || []);
    stmt.free();
    return rows;
  }
}

async function queryOne(text, params) {
  const rows = await query(text, params);
  return rows[0] || null;
}

async function run(text, params) {
  const d = await getDb();
  if (pgMode) {
    const result = await d.query(text, params);
    return { changes: result.rowCount };
  } else {
    const stmt = d.prepare(text);
    const result = stmt.run(params || []);
    stmt.free();
    saveSqliteDb();
    return { changes: result.changes || 1 };
  }
}

async function exec(text) {
  const d = await getDb();
  if (pgMode) {
    const statements = text.split(';').filter(s => s.trim());
    for (const stmt of statements) {
      if (stmt.trim()) {
        await d.query(stmt);
      }
    }
  } else {
    d.run(text);
    saveSqliteDb();
  }
}

function transaction(fn) {
  return async function(...args) {
    const d = await getDb();
    if (pgMode) {
      const client = await d.connect();
      try {
        await client.query('BEGIN');
        const result = await fn(client, ...args);
        await client.query('COMMIT');
        return result;
      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      } finally {
        client.release();
      }
    } else {
      try {
        d.run('BEGIN');
        const result = await fn(d, ...args);
        d.run('COMMIT');
        saveSqliteDb();
        return result;
      } catch (e) {
        d.run('ROLLBACK');
        throw e;
      }
    }
  };
}

module.exports = {
  initDatabase,
  getDb,
  query,
  queryOne,
  run,
  exec,
  transaction,
  isPgMode: () => pgMode
};