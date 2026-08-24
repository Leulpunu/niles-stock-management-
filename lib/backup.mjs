import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, rename, stat, unlink, writeFile } from 'node:fs/promises';
import { basename, join, resolve } from 'node:path';

export const DEFAULT_BACKUP_DIR = resolve(process.env.BACKUP_DIR || 'data/backups');

function checksum(stateText) {
  return createHash('sha256').update(stateText).digest('hex');
}

export async function createBackupSnapshot(state, source = 'json', options = {}) {
  const directory = resolve(options.directory || DEFAULT_BACKUP_DIR);
  const retentionCount = Math.max(1, Number(options.retentionCount || process.env.BACKUP_RETENTION_COUNT || 30));
  await mkdir(directory, { recursive: true });
  const stateText = JSON.stringify(state);
  const createdAt = new Date().toISOString();
  const safeStamp = createdAt.replaceAll(':', '-').replaceAll('.', '-');
  const filename = `nile-stock-${safeStamp}.backup.json`;
  const target = join(directory, filename);
  const temp = `${target}.${process.pid}.tmp`;
  const envelope = { format: 'nile-stock-backup', formatVersion: 1, createdAt, source, checksum: checksum(stateText), state };
  await writeFile(temp, JSON.stringify(envelope, null, 2), 'utf8');
  await rename(temp, target);
  await pruneBackups(directory, retentionCount);
  const info = await stat(target);
  return { filename, path: target, createdAt, source, size: info.size, checksum: envelope.checksum };
}

export async function listBackups(directory = DEFAULT_BACKUP_DIR) {
  const target = resolve(directory);
  await mkdir(target, { recursive: true });
  const names = (await readdir(target)).filter((name) => /^nile-stock-.+\.backup\.json$/.test(name));
  const entries = await Promise.all(names.map(async (filename) => {
    const info = await stat(join(target, filename));
    return { filename, path: join(target, filename), createdAt: info.birthtime.toISOString(), modifiedAt: info.mtime.toISOString(), size: info.size };
  }));
  return entries.sort((a, b) => new Date(b.modifiedAt) - new Date(a.modifiedAt));
}

async function pruneBackups(directory, retentionCount) {
  const entries = await listBackups(directory);
  for (const entry of entries.slice(retentionCount)) await unlink(entry.path);
}

export async function readAndVerifyBackup(filePath) {
  const target = resolve(filePath);
  const envelope = JSON.parse(await readFile(target, 'utf8'));
  if (envelope.format !== 'nile-stock-backup' || envelope.formatVersion !== 1 || !envelope.state) throw new Error(`${basename(target)} is not a supported Nile Stock backup.`);
  const actual = checksum(JSON.stringify(envelope.state));
  if (actual !== envelope.checksum) throw new Error('Backup checksum verification failed. The file may be damaged or modified.');
  if (!Array.isArray(envelope.state.users) || !Array.isArray(envelope.state.products)) throw new Error('Backup does not contain a valid Nile Stock datastore.');
  return envelope;
}
