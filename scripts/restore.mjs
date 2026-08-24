import { readFile, rename, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createBackupSnapshot, readAndVerifyBackup } from '../lib/backup.mjs';
import { createPool, ensureSchema } from './postgres-client.mjs';

const backupArg = process.argv.slice(2).find((arg) => !arg.startsWith('--'));
if (!backupArg) throw new Error('Provide a backup path: npm.cmd run backup:restore -- data/backups/<file> --confirm');
if (!process.argv.includes('--confirm')) throw new Error('Restore changes live data. Review the file, then re-run with --confirm.');
const envelope = await readAndVerifyBackup(resolve(backupArg));

if (process.env.DATABASE_URL) {
  const pool = createPool(); const client = await pool.connect();
  try {
    await ensureSchema(client); await client.query('BEGIN');
    const current = await client.query('SELECT state FROM nile_app_state WHERE id = 1 FOR UPDATE');
    if (current.rows.length) await createBackupSnapshot(current.rows[0].state, 'postgresql-pre-restore');
    await client.query(`INSERT INTO nile_app_state (id, state, schema_version) VALUES (1, $1::jsonb, $2)
      ON CONFLICT (id) DO UPDATE SET state = EXCLUDED.state, schema_version = EXCLUDED.schema_version, updated_at = NOW()`, [JSON.stringify(envelope.state), envelope.state.version || 1]);
    await client.query('COMMIT');
  } catch (error) { await client.query('ROLLBACK').catch(() => {}); throw error; }
  finally { client.release(); await pool.end(); }
} else {
  const target = resolve(process.env.DATA_FILE || 'data/store.json');
  const current = JSON.parse(await readFile(target, 'utf8'));
  await createBackupSnapshot(current, 'json-pre-restore');
  const temp = `${target}.${process.pid}.restore.tmp`;
  await writeFile(temp, JSON.stringify(envelope.state, null, 2), 'utf8');
  await rename(temp, target);
}

console.log(JSON.stringify({ ok: true, restoredFrom: resolve(backupArg), backupCreatedAt: envelope.createdAt, storeVersion: envelope.state.version }, null, 2));
