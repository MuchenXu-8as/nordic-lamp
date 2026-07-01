const fs = require('fs');
const path = require('path');

let db = null;
let pgMode = false;

function createMemoryDb() {
  const tables = {};
  const sequences = {};

  function ensureTable(name) {
    if (!tables[name]) {
      tables[name] = [];
    }
    return tables[name];
  }

  function getNextId(name) {
    if (!sequences[name]) sequences[name] = 1;
    return sequences[name]++;
  }

  return {
    query: async function(text, params) {
      const match = text.match(/SELECT\s+(.+?)\s+FROM\s+(\w+)/i);
      if (!match) return [];
      const columns = match[1].trim();
      const tableName = match[2];
      const table = ensureTable(tableName);
      
      if (columns === '*') {
        return [...table];
      }
      
      const colList = columns.split(',').map(c => c.trim());
      return table.map(row => {
        const result = {};
        colList.forEach(col => {
          if (col in row) result[col] = row[col];
        });
        return result;
      });
    },
    queryOne: async function(text, params) {
      const rows = await this.query(text, params);
      return rows[0] || null;
    },
    run: async function(text, params) {
      const insertMatch = text.match(/INSERT\s+INTO\s+(\w+)\s*\(\s*([^)]+)\s*\)\s*VALUES\s*\(\s*([^)]+)\s*\)/i);
      if (insertMatch) {
        const tableName = insertMatch[1];
        const columns = insertMatch[2].split(',').map(c => c.trim());
        const values = insertMatch[3].split(',').map(v => v.trim());
        
        const row = {};
        columns.forEach((col, i) => {
          let val = values[i];
          if (val.startsWith("'") && val.endsWith("'")) {
            val = val.slice(1, -1);
          } else if (!isNaN(val)) {
            val = parseFloat(val);
          } else if (val === 'true') {
            val = true;
          } else if (val === 'false') {
            val = false;
          } else if (val === 'null') {
            val = null;
          }
          row[col] = val;
        });
        
        if (!row.id && tableName === 'admin') {
          row.id = getNextId(tableName);
        }
        
        ensureTable(tableName).push(row);
        return { changes: 1 };
      }
      
      const updateMatch = text.match(/UPDATE\s+(\w+)\s+SET\s+(.+?)\s+WHERE\s+(.+)/i);
      if (updateMatch) {
        const tableName = updateMatch[1];
        const setClause = updateMatch[2];
        const whereClause = updateMatch[3];
        const table = ensureTable(tableName);
        
        const sets = {};
        setClause.split(',').forEach(pair => {
          const [key, value] = pair.split('=').map(s => s.trim());
          let val = value;
          if (val.startsWith("'") && val.endsWith("'")) {
            val = val.slice(1, -1);
          } else if (!isNaN(val)) {
            val = parseFloat(val);
          }
          sets[key] = val;
        });
        
        const [whereKey, whereVal] = whereClause.split('=').map(s => s.trim());
        let compareVal = whereVal;
        if (compareVal.startsWith("'") && compareVal.endsWith("'")) {
          compareVal = compareVal.slice(1, -1);
        } else if (!isNaN(compareVal)) {
          compareVal = parseFloat(compareVal);
        }
        
        table.forEach(row => {
          if (row[whereKey] === compareVal) {
            Object.assign(row, sets);
          }
        });
        return { changes: 1 };
      }
      
      const deleteMatch = text.match(/DELETE\s+FROM\s+(\w+)\s+WHERE\s+(.+)/i);
      if (deleteMatch) {
        const tableName = deleteMatch[1];
        const whereClause = deleteMatch[2];
        const table = ensureTable(tableName);
        
        const [whereKey, whereVal] = whereClause.split('=').map(s => s.trim());
        let compareVal = whereVal;
        if (compareVal.startsWith("'") && compareVal.endsWith("'")) {
          compareVal = compareVal.slice(1, -1);
        } else if (!isNaN(compareVal)) {
          compareVal = parseFloat(compareVal);
        }
        
        const initialLength = table.length;
        tables[tableName] = table.filter(row => row[whereKey] !== compareVal);
        return { changes: initialLength - tables[tableName].length };
      }
      
      return { changes: 0 };
    },
    exec: async function(text) {
      const statements = text.split(';').filter(s => s.trim());
      for (const stmt of statements) {
        if (stmt.trim().toUpperCase().startsWith('CREATE TABLE')) {
          const match = stmt.match(/CREATE TABLE\s+IF NOT EXISTS\s+(\w+)/i);
          if (match) {
            ensureTable(match[1]);
          }
        }
      }
    },
    transaction: function(fn) {
      return async function(...args) {
        return await fn({ query: async (text, params) => ({ rows: await db.query(text, params) }) }, ...args);
      };
    }
  };
}

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
    console.log('[db] Using in-memory storage (for demo only)');
    db = createMemoryDb();
    return db;
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
    return await d.query(text, params);
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
    return await d.run(text, params);
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
    await d.exec(text);
  }
}

function transaction(fn) {
  const d = db;
  if (pgMode) {
    return async function(...args) {
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
    };
  } else {
    return d.transaction(fn);
  }
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