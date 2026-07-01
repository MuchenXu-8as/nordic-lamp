const fs = require('fs');
const path = require('path');

let db = null;
let pgMode = false;

function initDatabase() {
  const usePostgres = process.env.DATABASE_URL;

  if (usePostgres) {
    pgMode = true;
    console.log('[db] Using PostgreSQL (Supabase)');
    const { Pool } = require('pg');
    
    db = new Pool({
      connectionString: usePostgres,
      ssl: { rejectUnauthorized: false },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000
    });
  } else {
    const SQLiteDatabase = require('better-sqlite3');
    const DATA_DIR = process.env.RENDER_DISK_PATH
      ? path.join(process.env.RENDER_DISK_PATH, 'data')
      : path.join(__dirname, '..', 'data');
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

    const dbPath = path.join(DATA_DIR, 'nordic-lamp.db');
    db = new SQLiteDatabase(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    console.log('[db] Using SQLite:', dbPath);
  }

  return db;
}

function getDb() {
  if (!db) {
    return initDatabase();
  }
  return db;
}

async function query(text, params) {
  const d = getDb();
  if (pgMode) {
    const result = await d.query(text, params);
    return result.rows;
  } else {
    const stmt = d.prepare(text);
    if (params) {
      return stmt.all(...params);
    }
    return stmt.all();
  }
}

async function queryOne(text, params) {
  const rows = await query(text, params);
  return rows[0] || null;
}

async function run(text, params) {
  const d = getDb();
  if (pgMode) {
    const result = await d.query(text, params);
    return { changes: result.rowCount };
  } else {
    const stmt = d.prepare(text);
    if (params) {
      return stmt.run(...params);
    }
    return stmt.run();
  }
}

async function exec(text) {
  const d = getDb();
  if (pgMode) {
    const statements = text.split(';').filter(s => s.trim());
    for (const stmt of statements) {
      if (stmt.trim()) {
        await d.query(stmt);
      }
    }
  } else {
    d.exec(text);
  }
}

function transaction(fn) {
  return async function(...args) {
    const d = getDb();
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
      return d.transaction(fn)(...args);
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
