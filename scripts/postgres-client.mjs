import pg from 'pg';

const { Pool } = pg;

export function requireDatabaseUrl() {
  const connectionString = process.env.DATABASE_URL || '';
  if (!connectionString) throw new Error('DATABASE_URL is required. Set it before running this command.');
  return connectionString;
}

export function createPool() {
  return new Pool({
    connectionString: requireDatabaseUrl(),
    max: 2,
    connectionTimeoutMillis: 10_000,
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== 'false' } : undefined
  });
}

export async function ensureSchema(pool) {
  await pool.query(`CREATE TABLE IF NOT EXISTS nile_app_state (
    id SMALLINT PRIMARY KEY CHECK (id = 1),
    state JSONB NOT NULL,
    schema_version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);
}
