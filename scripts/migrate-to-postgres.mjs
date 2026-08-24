import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createPool, ensureSchema } from './postgres-client.mjs';

const source = resolve(process.env.DATA_FILE || 'data/store.json');
const force = process.argv.includes('--force');
const raw = await readFile(source, 'utf8').catch((error) => {
  if (error.code === 'ENOENT') throw new Error(`Source datastore not found: ${source}`);
  throw error;
});
const state = JSON.parse(raw);
if (!state || !Array.isArray(state.users) || !Array.isArray(state.products)) throw new Error('Source file is not a valid Nile Stock datastore.');

const pool = createPool();
const client = await pool.connect();
try {
  await ensureSchema(client);
  await client.query('BEGIN');
  const existing = await client.query('SELECT schema_version, updated_at FROM nile_app_state WHERE id = 1 FOR UPDATE');
  if (existing.rows.length && !force) {
    throw new Error('PostgreSQL already contains Nile Stock data. Re-run with --force only if you intend to replace it.');
  }
  if (existing.rows.length) {
    await client.query('UPDATE nile_app_state SET state = $1::jsonb, schema_version = $2, updated_at = NOW() WHERE id = 1', [JSON.stringify(state), state.version || 1]);
  } else {
    await client.query('INSERT INTO nile_app_state (id, state, schema_version) VALUES (1, $1::jsonb, $2)', [JSON.stringify(state), state.version || 1]);
  }
  await client.query('COMMIT');
  console.log(JSON.stringify({ ok: true, source, destination: 'PostgreSQL', storeVersion: state.version, products: state.products.length, users: state.users.length }, null, 2));
} catch (error) {
  await client.query('ROLLBACK').catch(() => {});
  throw error;
} finally {
  client.release();
  await pool.end();
}
