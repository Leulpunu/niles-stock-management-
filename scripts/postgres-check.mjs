import { createPool, ensureSchema } from './postgres-client.mjs';

const pool = createPool();
try {
  await ensureSchema(pool);
  const result = await pool.query('SELECT current_database() AS database, current_user AS user, NOW() AS server_time');
  const state = await pool.query('SELECT schema_version, updated_at FROM nile_app_state WHERE id = 1');
  console.log(JSON.stringify({ ok: true, ...result.rows[0], state: state.rows[0] || null }, null, 2));
} finally {
  await pool.end();
}
