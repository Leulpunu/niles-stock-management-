import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createBackupSnapshot } from '../lib/backup.mjs';
import { createPool, ensureSchema } from './postgres-client.mjs';

let state;
let source;
if (process.env.DATABASE_URL) {
  const pool = createPool();
  try {
    await ensureSchema(pool);
    const result = await pool.query('SELECT state FROM nile_app_state WHERE id = 1');
    if (!result.rows.length) throw new Error('PostgreSQL does not contain Nile Stock data yet.');
    state = result.rows[0].state; source = 'postgresql';
  } finally { await pool.end(); }
} else {
  const file = resolve(process.env.DATA_FILE || 'data/store.json');
  state = JSON.parse(await readFile(file, 'utf8')); source = 'json';
}

const result = await createBackupSnapshot(state, source);
console.log(JSON.stringify({ ok: true, ...result }, null, 2));
