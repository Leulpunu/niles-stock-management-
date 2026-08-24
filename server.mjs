import http from 'node:http';
import { createReadStream } from 'node:fs';
import { access, mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, extname, join, normalize, resolve } from 'node:path';
import { createHmac, randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { createBackupSnapshot, listBackups } from './lib/backup.mjs';

const { Pool } = pg;

const ROOT = fileURLToPath(new URL('.', import.meta.url));
const PUBLIC_DIR = join(ROOT, 'public');
const STORE_FILE = process.env.DATA_FILE ? resolve(process.env.DATA_FILE) : join(ROOT, 'data', 'store.json');
const DATA_DIR = dirname(STORE_FILE);
const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '127.0.0.1';
const NODE_ENV = process.env.NODE_ENV || 'development';
const COOKIE_SECURE = process.env.COOKIE_SECURE === 'true';
const SESSION_SECRET_PROVIDED = Boolean(process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 32);
const SESSION_SECRET = process.env.SESSION_SECRET || randomBytes(32).toString('hex');
const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL || `http://localhost:${PORT}`;
const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY || '';
const DATABASE_URL = process.env.DATABASE_URL || '';
const DATABASE_SSL = process.env.DATABASE_SSL === 'true';
const DATABASE_SSL_REJECT_UNAUTHORIZED = process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== 'false';
const SESSION_TTL = 1000 * 60 * 60 * 12;
const SESSION_ABSOLUTE_TTL = 1000 * 60 * 60 * 24;
const sessions = new Map();
const loginAttempts = new Map();
let store;
let mutationQueue = Promise.resolve();
let postgresPool = null;
let postgresLockClient = null;
let storageEngine = 'json';
let backupTimer = null;

const ROLE_PERMISSIONS = {
  admin: ['*'],
  manager: ['dashboard:view', 'inventory:view', 'inventory:manage', 'pos:sell', 'sales:view', 'sales:manage', 'purchases:view', 'purchases:manage', 'people:view', 'people:manage', 'payments:view', 'expenses:manage', 'reports:view', 'audit:view'],
  cashier: ['dashboard:view', 'inventory:view', 'pos:sell', 'sales:view', 'sales:manage', 'people:view', 'people:manage', 'payments:view'],
  storekeeper: ['dashboard:view', 'inventory:view', 'inventory:manage', 'purchases:view', 'purchases:manage', 'people:view']
};
const USER_ROLES = Object.keys(ROLE_PERMISSIONS);

const ETHIOPIAN_BANKS = [
  'Abay Bank',
  'Addis International Bank',
  'Ahadu Bank',
  'Amhara Bank',
  'Awash Bank',
  'Bank of Abyssinia',
  'Berhan Bank',
  'Bunna Bank',
  'Commercial Bank of Ethiopia',
  'Cooperative Bank of Oromia',
  'Dashen Bank',
  'Development Bank of Ethiopia',
  'Enat Bank',
  'Gadaa Bank',
  'Global Bank Ethiopia',
  'Goh Betoch Bank',
  'Hibret Bank',
  'Hijra Bank',
  'Lion International Bank',
  'Nib International Bank',
  'Oromia Bank',
  'Omo Bank',
  'Rammis Bank',
  'Shabelle Bank',
  'Sidama Bank',
  'Siinqee Bank',
  'Siket Bank',
  'Tsedey Bank',
  'Tsehay Bank',
  'Wegagen Bank',
  'ZamZam Bank',
  'Zemen Bank'
];

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json'
};

const now = () => new Date().toISOString();
const day = (offset = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString();
};
const id = (prefix) => `${prefix}_${randomUUID().replaceAll('-', '').slice(0, 12)}`;
const round = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;
const money = (value) => round(Math.max(0, Number(value) || 0));
const number = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;

function passwordHash(password, salt = randomBytes(16).toString('hex')) {
  return `${salt}:${scryptSync(password, salt, 64).toString('hex')}`;
}

function passwordMatches(password, saved) {
  const [salt, encoded] = String(saved).split(':');
  if (!salt || !encoded) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(encoded, 'hex');
  return expected.length === candidate.length && timingSafeEqual(expected, candidate);
}

function seedStore() {
  const products = [
    ['BRK-001', 'Front Brake Pad Set', 'Brake System', 'Toyota Corolla 2008–2018', 'Hi-Q', 1250, 1850, 18, 5, 'A-01', '890100001'],
    ['FLT-002', 'Engine Oil Filter', 'Filters', 'Toyota / Isuzu / Nissan', 'Sakura', 280, 450, 34, 10, 'A-03', '890100002'],
    ['FLT-003', 'Air Filter Element', 'Filters', 'Toyota Hilux 2012–2022', 'JS Asakashi', 620, 950, 7, 8, 'A-04', '890100003'],
    ['BLT-004', 'Alternator Fan Belt', 'Engine Parts', 'Toyota 1HZ / 1KD', 'Bando', 780, 1150, 4, 6, 'B-02', '890100004'],
    ['SPK-005', 'Iridium Spark Plug', 'Ignition', 'Toyota / Hyundai / Kia', 'NGK', 520, 790, 42, 12, 'B-05', '890100005'],
    ['LGT-006', 'Headlamp Assembly RH', 'Electrical', 'Toyota Corolla 2014–2016', 'Depo', 4800, 6500, 3, 3, 'C-01', '890100006'],
    ['BRG-007', 'Front Wheel Bearing', 'Suspension', 'Toyota Vitz / Yaris', 'Koyo', 1950, 2850, 9, 4, 'C-04', '890100007'],
    ['CLT-008', 'Clutch Disc 275mm', 'Transmission', 'Isuzu NPR', 'Exedy', 5200, 7100, 2, 3, 'D-01', '890100008'],
    ['OIL-009', '15W-40 Diesel Engine Oil 5L', 'Lubricants', 'Diesel engines', 'Total Quartz', 1900, 2450, 21, 8, 'D-05', '890100009'],
    ['BAT-010', '12V 70Ah Maintenance-free Battery', 'Electrical', 'Passenger / light commercial', 'Bosch', 7200, 8900, 5, 3, 'E-01', '890100010'],
    ['WPR-011', 'Universal Wiper Blade 22in', 'Body & Exterior', 'Universal', 'Denso', 420, 650, 25, 8, 'E-04', '890100011'],
    ['SHK-012', 'Front Shock Absorber', 'Suspension', 'Toyota Corolla 2008–2013', 'KYB', 3900, 5250, 6, 4, 'C-06', '890100012']
  ].map((p, index) => ({
    id: `prd_${String(index + 1).padStart(3, '0')}`,
    sku: p[0], name: p[1], category: p[2], compatibility: p[3], brand: p[4],
    costPrice: p[5], sellingPrice: p[6], stock: p[7], reorderLevel: p[8],
    location: p[9], barcode: p[10], unit: 'pcs', taxable: true, active: true, branchStock: { br_main: p[7] },
    createdAt: day(-90 + index), updatedAt: day(-index)
  }));
  const customers = [
    { id: 'cus_walkin', type: 'customer', name: 'Walk-in Customer', phone: '', email: '', address: 'Addis Ababa', tin: '', balance: 0, active: true, createdAt: day(-120) },
    { id: 'cus_001', type: 'customer', name: 'Abel Auto Garage', phone: '0911 245 678', email: 'abelgarage@example.com', address: 'Bole, Addis Ababa', tin: '0014839201', balance: 1572.5, active: true, createdAt: day(-80) },
    { id: 'cus_002', type: 'customer', name: 'Mekdes Transport PLC', phone: '0922 503 114', email: 'finance@mekdestransport.et', address: 'Akaki Kality, Addis Ababa', tin: '0029384712', balance: 0, active: true, createdAt: day(-54) },
    { id: 'cus_003', type: 'customer', name: 'Yonas Desta', phone: '0977 110 281', email: '', address: 'Kazanchis, Addis Ababa', tin: '', balance: 0, active: true, createdAt: day(-32) }
  ];
  const suppliers = [
    { id: 'sup_001', type: 'supplier', name: 'Merkato Auto Import', phone: '0911 770 440', email: 'sales@merkatoauto.et', address: 'Merkato, Addis Ababa', tin: '0007438210', balance: 8200, active: true, createdAt: day(-140) },
    { id: 'sup_002', type: 'supplier', name: 'Ethio Lubricants Distribution', phone: '0944 610 292', email: 'orders@ethlub.et', address: 'Nifas Silk, Addis Ababa', tin: '0012873492', balance: 0, active: true, createdAt: day(-110) },
    { id: 'sup_003', type: 'supplier', name: 'Habesha Parts Trading', phone: '0912 990 810', email: '', address: 'Gotera, Addis Ababa', tin: '0038172041', balance: 0, active: true, createdAt: day(-65) }
  ];
  const sales = [
    { id: 'sal_001', invoiceNo: 'INV-2026-0001', branchId: 'br_main', customerId: 'cus_002', items: [{ productId: 'prd_009', quantity: 2, unitPrice: 2450, costPrice: 1900, taxable: true }], discount: 200, subtotal: 4900, tax: 705, total: 5405, paid: 5405, balance: 0, status: 'paid', note: 'Fleet service', createdAt: day(-6), createdBy: 'usr_admin' },
    { id: 'sal_002', invoiceNo: 'INV-2026-0002', branchId: 'br_main', customerId: 'cus_walkin', items: [{ productId: 'prd_002', quantity: 2, unitPrice: 450, costPrice: 280, taxable: true }, { productId: 'prd_005', quantity: 4, unitPrice: 790, costPrice: 520, taxable: true }], discount: 0, subtotal: 4060, tax: 609, total: 4669, paid: 4669, balance: 0, status: 'paid', note: '', createdAt: day(-4), createdBy: 'usr_cashier' },
    { id: 'sal_003', invoiceNo: 'INV-2026-0003', branchId: 'br_main', customerId: 'cus_001', items: [{ productId: 'prd_001', quantity: 1, unitPrice: 1850, costPrice: 1250, taxable: true }], discount: 100, subtotal: 1850, tax: 262.5, total: 2012.5, paid: 440, balance: 1572.5, status: 'partial', note: 'Balance due in 7 days', createdAt: day(-2), createdBy: 'usr_admin' },
    { id: 'sal_004', invoiceNo: 'INV-2026-0004', branchId: 'br_main', customerId: 'cus_003', items: [{ productId: 'prd_011', quantity: 2, unitPrice: 650, costPrice: 420, taxable: true }], discount: 0, subtotal: 1300, tax: 195, total: 1495, paid: 1495, balance: 0, status: 'paid', note: '', createdAt: day(-1), createdBy: 'usr_cashier' }
  ];
  const purchases = [
    { id: 'pur_001', purchaseNo: 'PO-2026-0001', branchId: 'br_main', supplierId: 'sup_002', items: [{ productId: 'prd_009', quantity: 12, unitCost: 1900 }], subtotal: 22800, tax: 3420, total: 26220, paid: 26220, balance: 0, status: 'paid', reference: 'ELD-8821', createdAt: day(-14), createdBy: 'usr_admin' },
    { id: 'pur_002', purchaseNo: 'PO-2026-0002', branchId: 'br_main', supplierId: 'sup_001', items: [{ productId: 'prd_001', quantity: 8, unitCost: 1250 }, { productId: 'prd_008', quantity: 2, unitCost: 5200 }], subtotal: 20400, tax: 3060, total: 23460, paid: 15260, balance: 8200, status: 'partial', reference: 'MAI-1044', createdAt: day(-8), createdBy: 'usr_admin' }
  ];
  const payments = [
    { id: 'pay_001', direction: 'in', entityType: 'sale', entityId: 'sal_001', method: 'Bank Transfer', bankName: 'Commercial Bank of Ethiopia', amount: 5405, reference: 'CBE-819442', note: '', createdAt: day(-6), createdBy: 'usr_admin' },
    { id: 'pay_002', direction: 'in', entityType: 'sale', entityId: 'sal_002', method: 'Cash', amount: 4669, reference: '', note: '', createdAt: day(-4), createdBy: 'usr_cashier' },
    { id: 'pay_003', direction: 'in', entityType: 'sale', entityId: 'sal_003', method: 'Telebirr', amount: 440, reference: 'TB-330918', note: '', createdAt: day(-2), createdBy: 'usr_admin' },
    { id: 'pay_004', direction: 'in', entityType: 'sale', entityId: 'sal_004', method: 'CBE Birr', amount: 1495, reference: 'CB-770421', note: '', createdAt: day(-1), createdBy: 'usr_cashier' },
    { id: 'pay_005', direction: 'out', entityType: 'purchase', entityId: 'pur_001', method: 'Bank Transfer', bankName: 'Commercial Bank of Ethiopia', amount: 26220, reference: 'CBE-551890', note: '', createdAt: day(-14), createdBy: 'usr_admin' },
    { id: 'pay_006', direction: 'out', entityType: 'purchase', entityId: 'pur_002', method: 'Bank Transfer', bankName: 'Commercial Bank of Ethiopia', amount: 15260, reference: 'CBE-562021', note: '', createdAt: day(-8), createdBy: 'usr_admin' }
  ].map((payment) => ({ ...payment, branchId: 'br_main' }));
  const movements = products.slice(0, 7).map((product, index) => ({
    id: `mov_${String(index + 1).padStart(3, '0')}`, productId: product.id, branchId: 'br_main', type: 'opening', quantity: product.stock,
    before: 0, after: product.stock, reference: 'Opening balance', note: '', createdAt: day(-30 - index), createdBy: 'usr_admin'
  }));
  return {
    version: 4,
    settings: {
      businessName: 'Nile Auto Parts', businessNameAm: 'ናይል አውቶ መለዋወጫ', phone: '+251 911 234 567', email: 'hello@nileautoparts.et',
      address: 'Bole Road, Addis Ababa, Ethiopia', tin: '0012345678', vatNumber: 'VAT-1002345', currency: 'ETB',
      vatRegistered: true, vatRate: 15, invoicePrefix: 'INV', purchasePrefix: 'PO', lowStockDefault: 5,
      receiptFooter: 'Thank you for choosing Nile Auto Parts. እናመሰግናለን!', chapaEnabled: Boolean(CHAPA_SECRET_KEY), defaultBranchId: 'br_main'
    },
    users: [
      { id: 'usr_admin', name: 'Meron Tesfaye', email: 'admin@nile.et', role: 'admin', active: true, passwordHash: passwordHash('admin123'), createdAt: day(-180), updatedAt: day(-180), lastLoginAt: null },
      { id: 'usr_cashier', name: 'Dawit Alemu', email: 'cashier@nile.et', role: 'cashier', active: true, passwordHash: passwordHash('cashier123'), createdAt: day(-100), updatedAt: day(-100), lastLoginAt: null }
    ],
    branches: [{ id: 'br_main', code: 'MAIN', name: 'Addis Ababa Main Store', address: 'Bole Road, Addis Ababa', phone: '+251 911 234 567', active: true, createdAt: day(-180) }],
    products, parties: [...customers, ...suppliers], sales, purchases, payments, movements,
    returns: [], quotes: [], expenses: [], stockCounts: [], transfers: [], gatewayTransactions: [], auditLogs: [],
    counters: { invoice: 4, purchase: 2, return: 0, quote: 0, expense: 0, stockCount: 0, transfer: 0 }, createdAt: now(), updatedAt: now()
  };
}

async function loadStore() {
  await mkdir(DATA_DIR, { recursive: true });
  if (DATABASE_URL) {
    postgresPool = new Pool({
      connectionString: DATABASE_URL,
      max: Math.max(2, Math.min(20, number(process.env.DATABASE_POOL_SIZE, 10))),
      connectionTimeoutMillis: 10_000,
      idleTimeoutMillis: 30_000,
      ssl: DATABASE_SSL ? { rejectUnauthorized: DATABASE_SSL_REJECT_UNAUTHORIZED } : undefined
    });
    postgresPool.on('error', (error) => console.error('PostgreSQL pool error:', error.message));
    await postgresPool.query(`CREATE TABLE IF NOT EXISTS nile_app_state (
      id SMALLINT PRIMARY KEY CHECK (id = 1),
      state JSONB NOT NULL,
      schema_version INTEGER NOT NULL DEFAULT 1,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`);
    postgresLockClient = await postgresPool.connect();
    const lock = await postgresLockClient.query('SELECT pg_try_advisory_lock($1) AS acquired', [73120426]);
    if (!lock.rows[0].acquired) fail(503, 'Another Nile Stock server is already connected to this database.');
    const result = await postgresPool.query('SELECT state FROM nile_app_state WHERE id = 1');
    if (result.rows.length) store = result.rows[0].state;
    else {
      try { store = JSON.parse(await readFile(STORE_FILE, 'utf8')); }
      catch (error) { if (error.code !== 'ENOENT') throw error; store = seedStore(); }
      await postgresPool.query('INSERT INTO nile_app_state (id, state, schema_version) VALUES (1, $1::jsonb, $2)', [JSON.stringify(store), store.version || 1]);
    }
    storageEngine = 'postgresql';
    if (migrateLoadedStore()) await persist();
    return;
  }
  try {
    store = JSON.parse(await readFile(STORE_FILE, 'utf8'));
    if (migrateLoadedStore()) await persist();
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    store = seedStore();
    await persist();
  }
}

function migrateLoadedStore() {
  let migrated = false;
  for (const payment of store.payments || []) {
    if (payment.method === 'Bank Transfer' && !payment.bankName && /^CBE[-\s]/i.test(payment.reference || '')) {
      payment.bankName = 'Commercial Bank of Ethiopia'; migrated = true;
    }
  }
  if (store.version < 2) { store.version = 2; migrated = true; }
  if (!Array.isArray(store.auditLogs)) { store.auditLogs = []; migrated = true; }
  for (const user of store.users || []) {
    if (!user.updatedAt) { user.updatedAt = user.createdAt || now(); migrated = true; }
    if (!('lastLoginAt' in user)) { user.lastLoginAt = null; migrated = true; }
  }
  if (store.version < 3) { store.version = 3; migrated = true; }
  for (const collection of ['returns', 'quotes', 'expenses', 'stockCounts']) {
    if (!Array.isArray(store[collection])) { store[collection] = []; migrated = true; }
  }
  store.counters ||= {};
  for (const counter of ['return', 'quote', 'expense', 'stockCount']) {
    if (!Number.isFinite(store.counters[counter])) { store.counters[counter] = 0; migrated = true; }
  }
  if (store.version < 4) { store.version = 4; migrated = true; }
  if (!Array.isArray(store.branches) || !store.branches.length) {
    store.branches = [{ id: 'br_main', code: 'MAIN', name: 'Addis Ababa Main Store', address: store.settings.address || 'Addis Ababa', phone: store.settings.phone || '', active: true, createdAt: store.createdAt || now() }]; migrated = true;
  }
  const defaultBranchId = store.settings.defaultBranchId || store.branches[0].id;
  if (!store.settings.defaultBranchId) { store.settings.defaultBranchId = defaultBranchId; migrated = true; }
  for (const product of store.products || []) {
    if (!product.branchStock || typeof product.branchStock !== 'object') { product.branchStock = { [defaultBranchId]: number(product.stock) }; migrated = true; }
    const aggregate = Object.values(product.branchStock).reduce((sum, quantity) => sum + Math.max(0, Math.floor(number(quantity))), 0);
    if (product.stock !== aggregate) { product.stock = aggregate; migrated = true; }
  }
  for (const collection of ['sales', 'purchases', 'returns', 'quotes', 'expenses', 'stockCounts']) for (const item of store[collection] || []) {
    if (!item.branchId) { item.branchId = defaultBranchId; migrated = true; }
  }
  for (const movement of store.movements || []) if (!movement.branchId) { movement.branchId = defaultBranchId; migrated = true; }
  for (const payment of store.payments || []) if (!payment.branchId) {
    const entity = [...(store.sales || []), ...(store.purchases || []), ...(store.returns || []), ...(store.expenses || [])].find((item) => item.id === payment.entityId);
    payment.branchId = entity?.branchId || defaultBranchId; migrated = true;
  }
  if (!Array.isArray(store.transfers)) { store.transfers = []; migrated = true; }
  if (!Number.isFinite(store.counters.transfer)) { store.counters.transfer = 0; migrated = true; }
  if (store.version < 5) { store.version = 5; migrated = true; }
  return migrated;
}

async function persist() {
  store.updatedAt = now();
  if (postgresPool) {
    await postgresPool.query('UPDATE nile_app_state SET state = $1::jsonb, schema_version = $2, updated_at = NOW() WHERE id = 1', [JSON.stringify(store), store.version || 1]);
    return;
  }
  const temp = `${STORE_FILE}.${process.pid}.tmp`;
  await writeFile(temp, JSON.stringify(store, null, 2), 'utf8');
  await rename(temp, STORE_FILE);
}

function mutate(operation) {
  const task = mutationQueue.then(async () => {
    const result = await operation();
    await persist();
    return result;
  });
  mutationQueue = task.catch(() => {});
  return task;
}

function json(res, status, body, headers = {}) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers });
  res.end(JSON.stringify(body));
}

function securityHeaders() {
  return {
    'Content-Security-Policy': "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self' https://checkout.chapa.co; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'",
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    ...(COOKIE_SECURE ? { 'Strict-Transport-Security': 'max-age=31536000; includeSubDomains' } : {})
  };
}

function fail(status, message, details) {
  const error = new Error(message);
  error.status = status;
  error.details = details;
  throw error;
}

async function body(req) {
  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 1_000_000) fail(413, 'Request is too large.');
  }
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { fail(400, 'Invalid JSON request.'); }
}

function cookieMap(req) {
  return Object.fromEntries(String(req.headers.cookie || '').split(';').filter(Boolean).map((pair) => {
    const index = pair.indexOf('=');
    return [pair.slice(0, index).trim(), decodeURIComponent(pair.slice(index + 1))];
  }));
}

function sessionSignature(token) {
  return createHmac('sha256', SESSION_SECRET).update(token).digest('hex');
}

function currentUser(req) {
  const signed = cookieMap(req).nile_session || '';
  const [token, signature] = signed.split('.');
  if (!token || !signature) return null;
  const expected = sessionSignature(token);
  if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  const session = sessions.get(token);
  if (!session || session.expiresAt < Date.now() || session.absoluteExpiresAt < Date.now()) {
    sessions.delete(token);
    return null;
  }
  session.expiresAt = Math.min(Date.now() + SESSION_TTL, session.absoluteExpiresAt);
  session.lastSeenAt = Date.now();
  return store.users.find((user) => user.id === session.userId && user.active) || null;
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role, active: user.active, permissions: ROLE_PERMISSIONS[user.role] || [], createdAt: user.createdAt, updatedAt: user.updatedAt, lastLoginAt: user.lastLoginAt || null };
}

function requireUser(req, roles) {
  const user = currentUser(req);
  if (!user) fail(401, 'Please sign in to continue.');
  if (roles && !roles.includes(user.role)) fail(403, 'You do not have permission for this action.');
  return user;
}

function hasPermission(user, permission) {
  const permissions = ROLE_PERMISSIONS[user?.role] || [];
  return permissions.includes('*') || permissions.includes(permission);
}

function requirePermission(req, permission) {
  const user = requireUser(req);
  if (!hasPermission(user, permission)) fail(403, 'You do not have permission for this action.');
  return user;
}

function requireStrongPassword(password) {
  const value = String(password || '');
  if (value.length < 12) fail(400, 'Use a password with at least 12 characters.');
  if (value.length > 128) fail(400, 'Password is too long.');
  const blocked = ['password1234', 'admin123456', 'qwerty123456', '123456789012'];
  if (blocked.includes(value.toLowerCase())) fail(400, 'Choose a less common password.');
  return value;
}

function requireCurrentPassword(user, password) {
  if (!passwordMatches(String(password || ''), user.passwordHash)) fail(403, 'Current password is incorrect.');
}

function revokeUserSessions(userId, exceptToken = '') {
  for (const [token, session] of sessions) if (session.userId === userId && token !== exceptToken) sessions.delete(token);
}

function audit(user, action, entityType, entityId, summary, req = null) {
  store.auditLogs ||= [];
  store.auditLogs.unshift({
    id: id('aud'), userId: user?.id || null, userName: user?.name || 'System', action,
    entityType, entityId: entityId || null, summary: cleanText(summary, 300),
    ipAddress: cleanText(req?.socket?.remoteAddress || '', 64), createdAt: now()
  });
  if (store.auditLogs.length > 2000) store.auditLogs.length = 2000;
}

function cleanText(value, max = 250) {
  return String(value ?? '').trim().slice(0, max);
}

function safeDate(value, fallback) {
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? fallback : date;
}

function within(dateValue, from, to) {
  const value = new Date(dateValue);
  return value >= from && value <= to;
}

function branchById(branchId, activeOnly = true) {
  const target = branchId || store.settings.defaultBranchId;
  const branch = store.branches.find((item) => item.id === target && (!activeOnly || item.active));
  if (!branch) fail(400, 'Select a valid active branch.');
  return branch;
}

function getBranchStock(product, branchId) {
  return Math.max(0, Math.floor(number(product.branchStock?.[branchId])));
}

function setBranchStock(product, branchId, quantity) {
  product.branchStock ||= {};
  product.branchStock[branchId] = Math.max(0, Math.floor(number(quantity)));
  product.stock = Object.values(product.branchStock).reduce((sum, value) => sum + Math.max(0, Math.floor(number(value))), 0);
}

function productView(product, branchId = null) {
  const stock = branchId ? getBranchStock(product, branchId) : product.stock;
  return { ...product, stock, aggregateStock: product.stock, stockValue: round(stock * product.costPrice), margin: product.sellingPrice ? round(((product.sellingPrice - product.costPrice) / product.sellingPrice) * 100) : 0 };
}

function partyName(partyId) {
  return store.parties.find((party) => party.id === partyId)?.name || 'Unknown';
}

function addEntityNames(entity) {
  if (entity.customerId) return { ...entity, customerName: partyName(entity.customerId) };
  if (entity.supplierId) return { ...entity, supplierName: partyName(entity.supplierId) };
  return entity;
}

function nextNumber(kind) {
  store.counters[kind] += 1;
  const prefix = kind === 'invoice' ? store.settings.invoicePrefix : store.settings.purchasePrefix;
  return `${prefix}-${new Date().getFullYear()}-${String(store.counters[kind]).padStart(4, '0')}`;
}

function recalculateBalance(entity) {
  entity.paid = round(store.payments.filter((payment) => payment.entityId === entity.id && payment.direction === (entity.invoiceNo ? 'in' : 'out')).reduce((sum, payment) => sum + payment.amount, 0));
  const netTotal = entity.invoiceNo ? Math.max(0, entity.total - number(entity.returnsTotal)) : entity.total;
  entity.balance = round(Math.max(0, netTotal - entity.paid));
  entity.status = entity.balance <= 0 ? 'paid' : entity.paid > 0 ? 'partial' : 'credit';
}

function adjustPartyBalance(entity, previousBalance = 0) {
  const partyId = entity.customerId || entity.supplierId;
  const party = store.parties.find((item) => item.id === partyId);
  if (party) party.balance = round(Math.max(0, party.balance - previousBalance + entity.balance));
}

function saleDetails(sale) {
  return addEntityNames({
    ...sale,
    items: sale.items.map((item) => ({ ...item, product: store.products.find((product) => product.id === item.productId) || null })),
    payments: store.payments.filter((payment) => payment.entityId === sale.id && payment.direction === 'in').sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  });
}

function purchaseDetails(purchase) {
  return addEntityNames({
    ...purchase,
    items: purchase.items.map((item) => ({ ...item, product: store.products.find((product) => product.id === item.productId) || null })),
    payments: store.payments.filter((payment) => payment.entityId === purchase.id && payment.direction === 'out').sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  });
}

function validatePayments(payments, maxAmount) {
  const allowed = ['Cash', 'Telebirr', 'CBE Birr', 'Bank Transfer', 'POS / Card', 'Chapa'];
  const cleaned = (Array.isArray(payments) ? payments : []).map((payment) => ({
    method: cleanText(payment.method, 40), bankName: cleanText(payment.bankName, 100), amount: money(payment.amount), reference: cleanText(payment.reference, 100)
  })).filter((payment) => payment.amount > 0);
  if (cleaned.some((payment) => !allowed.includes(payment.method))) fail(400, 'Unsupported payment method.');
  if (cleaned.some((payment) => payment.method === 'Bank Transfer' && !ETHIOPIAN_BANKS.includes(payment.bankName))) fail(400, 'Select a valid Ethiopian bank for every bank transfer.');
  if (cleaned.some((payment) => payment.bankName && !ETHIOPIAN_BANKS.includes(payment.bankName))) fail(400, 'Unsupported bank selection.');
  const total = round(cleaned.reduce((sum, payment) => sum + payment.amount, 0));
  if (total > round(maxAmount) + 0.01) fail(400, 'Payment cannot exceed the amount due.');
  return cleaned;
}

function calculateSale(lines, discountInput, branchId = store.settings.defaultBranchId) {
  if (!Array.isArray(lines) || !lines.length) fail(400, 'Add at least one product.');
  const items = lines.map((line) => {
    const product = store.products.find((item) => item.id === line.productId && item.active);
    if (!product) fail(400, 'One of the selected products is unavailable.');
    const quantity = Math.floor(number(line.quantity));
    if (quantity < 1) fail(400, `Enter a valid quantity for ${product.name}.`);
    const available = getBranchStock(product, branchId);
    if (quantity > available) fail(409, `${product.name} has only ${available} ${product.unit} in stock at this branch.`);
    const unitPrice = money(line.unitPrice ?? product.sellingPrice);
    if (unitPrice <= 0) fail(400, `Enter a valid price for ${product.name}.`);
    return { productId: product.id, quantity, unitPrice, costPrice: product.costPrice, taxable: product.taxable };
  });
  const subtotal = round(items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0));
  const discount = Math.min(money(discountInput), subtotal);
  const taxableSubtotal = items.filter((item) => item.taxable).reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const discountRatio = subtotal ? discount / subtotal : 0;
  const taxableAfterDiscount = taxableSubtotal * (1 - discountRatio);
  const tax = store.settings.vatRegistered ? round(taxableAfterDiscount * (number(store.settings.vatRate) / 100)) : 0;
  return { items, subtotal, discount, tax, total: round(subtotal - discount + tax) };
}

async function createSale(payload, user) {
  const customer = store.parties.find((party) => party.id === payload.customerId && party.type === 'customer');
  if (!customer) fail(400, 'Select a valid customer.');
  const branch = branchById(payload.branchId);
  const calculated = calculateSale(payload.items, payload.discount, branch.id);
  const payments = validatePayments(payload.payments, calculated.total);
  const createdAt = now();
  const sale = {
    id: id('sal'), invoiceNo: nextNumber('invoice'), branchId: branch.id, customerId: customer.id, ...calculated,
    paid: 0, balance: calculated.total, status: 'credit', note: cleanText(payload.note, 500), createdAt, createdBy: user.id
  };
  for (const line of sale.items) {
    const product = store.products.find((item) => item.id === line.productId);
    const before = getBranchStock(product, branch.id);
    setBranchStock(product, branch.id, before - line.quantity);
    product.updatedAt = createdAt;
    store.movements.unshift({ id: id('mov'), productId: product.id, branchId: branch.id, type: 'sale', quantity: -line.quantity, before, after: getBranchStock(product, branch.id), reference: sale.invoiceNo, note: '', createdAt, createdBy: user.id });
  }
  store.sales.unshift(sale);
  for (const payment of payments) {
    store.payments.unshift({ id: id('pay'), direction: 'in', branchId: branch.id, entityType: 'sale', entityId: sale.id, ...payment, note: '', createdAt, createdBy: user.id });
  }
  recalculateBalance(sale);
  adjustPartyBalance(sale);
  audit(user, 'sale.created', 'sale', sale.id, `Created ${sale.invoiceNo} for ${customer.name}; total ${sale.total}`);
  return saleDetails(sale);
}

async function createPurchase(payload, user) {
  const supplier = store.parties.find((party) => party.id === payload.supplierId && party.type === 'supplier');
  if (!supplier) fail(400, 'Select a valid supplier.');
  const branch = branchById(payload.branchId);
  if (!Array.isArray(payload.items) || !payload.items.length) fail(400, 'Add at least one product.');
  const items = payload.items.map((line) => {
    const product = store.products.find((item) => item.id === line.productId && item.active);
    if (!product) fail(400, 'One of the selected products is unavailable.');
    const quantity = Math.floor(number(line.quantity));
    const unitCost = money(line.unitCost);
    if (quantity < 1 || unitCost <= 0) fail(400, `Enter a valid quantity and cost for ${product.name}.`);
    return { productId: product.id, quantity, unitCost };
  });
  const subtotal = round(items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0));
  const tax = store.settings.vatRegistered ? round(subtotal * number(store.settings.vatRate) / 100) : 0;
  const total = round(subtotal + tax);
  const payments = validatePayments(payload.payments, total);
  const createdAt = now();
  const purchase = {
    id: id('pur'), purchaseNo: nextNumber('purchase'), branchId: branch.id, supplierId: supplier.id, items, subtotal, tax, total,
    paid: 0, balance: total, status: 'credit', reference: cleanText(payload.reference, 100), note: cleanText(payload.note, 500), createdAt, createdBy: user.id
  };
  for (const line of items) {
    const product = store.products.find((item) => item.id === line.productId);
    const before = getBranchStock(product, branch.id);
    setBranchStock(product, branch.id, before + line.quantity);
    product.costPrice = line.unitCost;
    product.updatedAt = createdAt;
    store.movements.unshift({ id: id('mov'), productId: product.id, branchId: branch.id, type: 'purchase', quantity: line.quantity, before, after: getBranchStock(product, branch.id), reference: purchase.purchaseNo, note: purchase.reference, createdAt, createdBy: user.id });
  }
  store.purchases.unshift(purchase);
  for (const payment of payments) {
    store.payments.unshift({ id: id('pay'), direction: 'out', branchId: branch.id, entityType: 'purchase', entityId: purchase.id, ...payment, note: '', createdAt, createdBy: user.id });
  }
  recalculateBalance(purchase);
  adjustPartyBalance(purchase);
  audit(user, 'purchase.created', 'purchase', purchase.id, `Created ${purchase.purchaseNo} from ${supplier.name}; total ${purchase.total}`);
  return purchaseDetails(purchase);
}

function operationNumber(kind, prefix) {
  store.counters[kind] = number(store.counters[kind]) + 1;
  return `${prefix}-${new Date().getFullYear()}-${String(store.counters[kind]).padStart(4, '0')}`;
}

function quoteDetails(quote) {
  return addEntityNames({ ...quote, items: quote.items.map((item) => ({ ...item, product: store.products.find((product) => product.id === item.productId) || null })) });
}

function createQuote(payload, user) {
  const customer = store.parties.find((party) => party.id === payload.customerId && party.type === 'customer');
  if (!customer) fail(400, 'Select a valid customer.');
  const branch = branchById(payload.branchId);
  const calculated = calculateSale(payload.items, payload.discount, branch.id);
  const createdAt = now();
  const quote = { id: id('quo'), quoteNo: operationNumber('quote', 'QT'), branchId: branch.id, customerId: customer.id, ...calculated, status: 'draft', validUntil: safeDate(payload.validUntil, new Date(Date.now() + 14 * 86400000)).toISOString(), note: cleanText(payload.note, 500), createdAt, updatedAt: createdAt, createdBy: user.id, convertedSaleId: null };
  store.quotes.unshift(quote); audit(user, 'quote.created', 'quote', quote.id, `Created ${quote.quoteNo} for ${customer.name}; total ${quote.total}`); return quoteDetails(quote);
}

function createSaleReturn(payload, user) {
  const sale = store.sales.find((item) => item.id === payload.saleId); if (!sale) fail(404, 'Sale not found.');
  if (!Array.isArray(payload.items) || !payload.items.length) fail(400, 'Select at least one item to return.');
  const previousByProduct = store.returns.filter((item) => item.saleId === sale.id).flatMap((item) => item.items).reduce((map, item) => ({ ...map, [item.productId]: (map[item.productId] || 0) + item.quantity }), {});
  const items = payload.items.map((requested) => {
    const original = sale.items.find((item) => item.productId === requested.productId); if (!original) fail(400, 'Returned item was not sold on this invoice.');
    const quantity = Math.floor(number(requested.quantity)); const available = original.quantity - number(previousByProduct[original.productId]);
    if (quantity < 1 || quantity > available) fail(400, `Only ${available} units remain returnable for this item.`);
    const gross = round(original.unitPrice * quantity); const ratio = sale.subtotal ? gross / sale.subtotal : 0;
    const discount = round(sale.discount * ratio); const tax = original.taxable ? round(sale.tax * ratio) : 0;
    return { productId: original.productId, quantity, unitPrice: original.unitPrice, costPrice: original.costPrice, gross, discount, tax, total: round(gross - discount + tax) };
  });
  const total = round(items.reduce((sum, item) => sum + item.total, 0)); const previousBalance = sale.balance;
  const creditApplied = Math.min(previousBalance, total); const refundDue = round(total - creditApplied);
  const refunds = validatePayments(payload.refunds, refundDue);
  if (round(refunds.reduce((sum, payment) => sum + payment.amount, 0)) !== refundDue) fail(400, `Refund payments must equal ${refundDue.toFixed(2)} ETB.`);
  const createdAt = now(); const saleReturn = { id: id('ret'), returnNo: operationNumber('return', 'RTN'), branchId: sale.branchId || store.settings.defaultBranchId, saleId: sale.id, customerId: sale.customerId, items, subtotal: round(items.reduce((sum, item) => sum + item.gross, 0)), discount: round(items.reduce((sum, item) => sum + item.discount, 0)), tax: round(items.reduce((sum, item) => sum + item.tax, 0)), total, creditApplied, refunded: refundDue, restocked: payload.restock !== false, reason: cleanText(payload.reason, 300), createdAt, createdBy: user.id };
  if (saleReturn.restocked) for (const line of items) {
    const product = store.products.find((item) => item.id === line.productId); const before = getBranchStock(product, saleReturn.branchId); setBranchStock(product, saleReturn.branchId, before + line.quantity); product.updatedAt = createdAt;
    store.movements.unshift({ id: id('mov'), productId: product.id, branchId: saleReturn.branchId, type: 'sale-return', quantity: line.quantity, before, after: getBranchStock(product, saleReturn.branchId), reference: saleReturn.returnNo, note: saleReturn.reason, createdAt, createdBy: user.id });
  }
  store.returns.unshift(saleReturn); sale.returnsTotal = round(number(sale.returnsTotal) + total); recalculateBalance(sale); adjustPartyBalance(sale, previousBalance);
  for (const refund of refunds) store.payments.unshift({ id: id('pay'), direction: 'out', branchId: saleReturn.branchId, entityType: 'return', entityId: saleReturn.id, ...refund, note: saleReturn.reason, createdAt, createdBy: user.id });
  audit(user, 'sale.returned', 'return', saleReturn.id, `${saleReturn.returnNo} against ${sale.invoiceNo}; total ${total}; ${saleReturn.restocked ? 'restocked' : 'not restocked'}`);
  return { ...saleReturn, sale: saleDetails(sale), customerName: partyName(sale.customerId), items: saleReturn.items.map((item) => ({ ...item, product: store.products.find((product) => product.id === item.productId) })) };
}

function createExpense(payload, user) {
  const branch = branchById(payload.branchId);
  const amount = money(payload.amount); if (amount <= 0) fail(400, 'Expense amount must be greater than zero.');
  const payments = validatePayments([{ method: payload.method, bankName: payload.bankName, amount, reference: payload.reference }], amount);
  const category = cleanText(payload.category, 80); if (!category) fail(400, 'Expense category is required.');
  const createdAt = safeDate(payload.date, new Date()).toISOString();
  const expense = { id: id('exp'), expenseNo: operationNumber('expense', 'EXP'), branchId: branch.id, category, vendor: cleanText(payload.vendor, 120), amount, method: payments[0].method, bankName: payments[0].bankName, reference: payments[0].reference, note: cleanText(payload.note, 300), createdAt, recordedAt: now(), createdBy: user.id };
  store.expenses.unshift(expense); store.payments.unshift({ id: id('pay'), direction: 'out', branchId: branch.id, entityType: 'expense', entityId: expense.id, method: expense.method, bankName: expense.bankName, amount, reference: expense.reference, note: expense.note, createdAt, createdBy: user.id });
  audit(user, 'expense.created', 'expense', expense.id, `${expense.expenseNo} · ${category} · ${amount}`); return expense;
}

function completeStockCount(payload, user) {
  if (!Array.isArray(payload.items) || !payload.items.length) fail(400, 'Enter at least one counted product.');
  const branch = branchById(payload.branchId);
  const createdAt = now(); const items = payload.items.map((line) => {
    const product = store.products.find((item) => item.id === line.productId); if (!product) fail(400, 'One counted product no longer exists.');
    const counted = Math.floor(number(line.counted)); if (counted < 0) fail(400, 'Counted quantity cannot be negative.');
    const expected = getBranchStock(product, branch.id);
    return { productId: product.id, expected, counted, difference: counted - expected };
  });
  const stockCount = { id: id('cnt'), countNo: operationNumber('stockCount', 'COUNT'), branchId: branch.id, items, changedItems: items.filter((item) => item.difference).length, note: cleanText(payload.note, 300), status: 'completed', createdAt, createdBy: user.id };
  for (const line of items.filter((item) => item.difference)) {
    const product = store.products.find((item) => item.id === line.productId); const before = getBranchStock(product, branch.id); setBranchStock(product, branch.id, line.counted); product.updatedAt = createdAt;
    store.movements.unshift({ id: id('mov'), productId: product.id, branchId: branch.id, type: 'stock-count', quantity: line.difference, before, after: getBranchStock(product, branch.id), reference: stockCount.countNo, note: stockCount.note, createdAt, createdBy: user.id });
  }
  store.stockCounts.unshift(stockCount); audit(user, 'stock.counted', 'stockCount', stockCount.id, `${stockCount.countNo}; ${items.length} counted; ${stockCount.changedItems} adjusted`); return stockCount;
}

function createTransfer(payload, user) {
  const fromBranch = branchById(payload.fromBranchId); const toBranch = branchById(payload.toBranchId);
  if (fromBranch.id === toBranch.id) fail(400, 'Source and destination branches must be different.');
  if (!Array.isArray(payload.items) || !payload.items.length) fail(400, 'Add at least one product to transfer.');
  const seen = new Set();
  const items = payload.items.map((line) => {
    const product = store.products.find((item) => item.id === line.productId && item.active); if (!product) fail(400, 'One transfer product is unavailable.');
    if (seen.has(product.id)) fail(400, 'Each product can appear only once in a transfer.'); seen.add(product.id);
    const quantity = Math.floor(number(line.quantity)); const available = getBranchStock(product, fromBranch.id);
    if (quantity < 1) fail(400, `Enter a valid quantity for ${product.name}.`);
    if (quantity > available) fail(409, `${product.name} has only ${available} ${product.unit} at ${fromBranch.name}.`);
    return { productId: product.id, quantity };
  });
  const createdAt = now();
  const transfer = { id: id('trf'), transferNo: operationNumber('transfer', 'TRF'), fromBranchId: fromBranch.id, toBranchId: toBranch.id, items, status: 'completed', note: cleanText(payload.note, 300), createdAt, createdBy: user.id };
  for (const line of items) {
    const product = store.products.find((item) => item.id === line.productId);
    const beforeFrom = getBranchStock(product, fromBranch.id); const beforeTo = getBranchStock(product, toBranch.id);
    setBranchStock(product, fromBranch.id, beforeFrom - line.quantity); setBranchStock(product, toBranch.id, beforeTo + line.quantity); product.updatedAt = createdAt;
    store.movements.unshift({ id: id('mov'), productId: product.id, branchId: toBranch.id, counterpartyBranchId: fromBranch.id, type: 'transfer-in', quantity: line.quantity, before: beforeTo, after: beforeTo + line.quantity, reference: transfer.transferNo, note: transfer.note, createdAt, createdBy: user.id });
    store.movements.unshift({ id: id('mov'), productId: product.id, branchId: fromBranch.id, counterpartyBranchId: toBranch.id, type: 'transfer-out', quantity: -line.quantity, before: beforeFrom, after: beforeFrom - line.quantity, reference: transfer.transferNo, note: transfer.note, createdAt, createdBy: user.id });
  }
  store.transfers.unshift(transfer); audit(user, 'stock.transferred', 'transfer', transfer.id, `${transfer.transferNo}; ${fromBranch.name} to ${toBranch.name}; ${items.length} lines`); return transfer;
}

function productionReadiness() {
  const defaultCredentials = store.users.some((user) =>
    (user.email.toLowerCase() === 'admin@nile.et' && passwordMatches('admin123', user.passwordHash)) ||
    (user.email.toLowerCase() === 'cashier@nile.et' && passwordMatches('cashier123', user.passwordHash))
  );
  const backupInterval = Math.max(0, number(process.env.BACKUP_INTERVAL_HOURS, 24));
  const checks = [
    { key: 'database', label: 'PostgreSQL database', passed: storageEngine === 'postgresql', required: true, action: 'Set DATABASE_URL and run the migration command.' },
    { key: 'sessionSecret', label: 'Persistent session secret', passed: SESSION_SECRET_PROVIDED, required: true, action: 'Set SESSION_SECRET to a random value of at least 32 characters.' },
    { key: 'https', label: 'Public HTTPS URL', passed: /^https:\/\//i.test(PUBLIC_BASE_URL), required: true, action: 'Set PUBLIC_BASE_URL to the deployed HTTPS address.' },
    { key: 'secureCookie', label: 'Secure session cookies', passed: COOKIE_SECURE, required: true, action: 'Set COOKIE_SECURE=true after HTTPS is active.' },
    { key: 'credentials', label: 'Demo passwords changed', passed: !defaultCredentials, required: true, action: 'Change both seeded account passwords before launch.' },
    { key: 'backups', label: 'Scheduled backups', passed: backupInterval > 0, required: true, action: 'Set BACKUP_INTERVAL_HOURS to a positive value.' },
    { key: 'chapa', label: 'Chapa online checkout', passed: Boolean(CHAPA_SECRET_KEY), required: false, action: 'Set the live CHAPA_SECRET_KEY to accept hosted online payments.' }
  ];
  return { ready: checks.filter((check) => check.required).every((check) => check.passed), onlinePaymentsReady: Boolean(CHAPA_SECRET_KEY) && /^https:\/\//i.test(PUBLIC_BASE_URL), environment: NODE_ENV, checks };
}

function dashboard(branchId = null) {
  if (branchId) branchById(branchId);
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const monthStart = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1);
  const scopedSales = store.sales.filter((sale) => !branchId || sale.branchId === branchId);
  const scopedPurchases = store.purchases.filter((purchase) => !branchId || purchase.branchId === branchId);
  const stockProducts = store.products.map((product) => productView(product, branchId)).filter((product) => product.active);
  const todaySales = scopedSales.filter((sale) => new Date(sale.createdAt) >= todayStart);
  const monthSales = scopedSales.filter((sale) => new Date(sale.createdAt) >= monthStart);
  const scopedReturns = store.returns.filter((item) => !branchId || item.branchId === branchId);
  const todayReturns = scopedReturns.filter((item) => new Date(item.createdAt) >= todayStart);
  const monthReturns = scopedReturns.filter((item) => new Date(item.createdAt) >= monthStart);
  const lowStock = stockProducts.filter((product) => product.stock <= product.reorderLevel).sort((a, b) => (a.stock - a.reorderLevel) - (b.stock - b.reorderLevel));
  const chart = Array.from({ length: 7 }, (_, index) => {
    const target = new Date(todayStart); target.setDate(target.getDate() - (6 - index));
    const next = new Date(target); next.setDate(next.getDate() + 1);
    const sales = scopedSales.filter((sale) => new Date(sale.createdAt) >= target && new Date(sale.createdAt) < next);
    const returns = scopedReturns.filter((item) => new Date(item.createdAt) >= target && new Date(item.createdAt) < next);
    return { date: target.toISOString(), total: round(sales.reduce((sum, sale) => sum + sale.total, 0) - returns.reduce((sum, item) => sum + item.total, 0)), count: sales.length };
  });
  return {
    metrics: {
      todayRevenue: round(todaySales.reduce((sum, sale) => sum + sale.total, 0) - todayReturns.reduce((sum, item) => sum + item.total, 0)), todayOrders: todaySales.length,
      monthRevenue: round(monthSales.reduce((sum, sale) => sum + sale.total, 0) - monthReturns.reduce((sum, item) => sum + item.total, 0)),
      inventoryValue: round(stockProducts.reduce((sum, product) => sum + product.stock * product.costPrice, 0)),
      receivables: round(scopedSales.reduce((sum, sale) => sum + sale.balance, 0)),
      payables: round(scopedPurchases.reduce((sum, purchase) => sum + purchase.balance, 0)), lowStockCount: lowStock.length
    },
    salesChart: chart, lowStock: lowStock.slice(0, 6), recentSales: scopedSales.slice(0, 6).map(addEntityNames)
  };
}

function report(url) {
  const fallbackFrom = new Date(); fallbackFrom.setDate(fallbackFrom.getDate() - 30); fallbackFrom.setHours(0, 0, 0, 0);
  const fallbackTo = new Date(); fallbackTo.setHours(23, 59, 59, 999);
  const from = safeDate(url.searchParams.get('from'), fallbackFrom);
  const to = safeDate(url.searchParams.get('to'), fallbackTo); to.setHours(23, 59, 59, 999);
  const branchId = url.searchParams.get('branchId'); if (branchId) branchById(branchId);
  const scoped = (item) => !branchId || item.branchId === branchId;
  const sales = store.sales.filter((sale) => scoped(sale) && within(sale.createdAt, from, to));
  const purchases = store.purchases.filter((purchase) => scoped(purchase) && within(purchase.createdAt, from, to));
  const returns = store.returns.filter((item) => scoped(item) && within(item.createdAt, from, to));
  const expenses = store.expenses.filter((item) => scoped(item) && within(item.createdAt, from, to));
  const grossRevenue = round(sales.reduce((sum, sale) => sum + sale.total, 0));
  const returnsTotal = round(returns.reduce((sum, item) => sum + item.total, 0));
  const revenue = round(grossRevenue - returnsTotal);
  const discounts = round(sales.reduce((sum, sale) => sum + sale.discount, 0));
  const vatCollected = round(sales.reduce((sum, sale) => sum + sale.tax, 0) - returns.reduce((sum, item) => sum + item.tax, 0));
  const returnedCost = returns.reduce((sum, item) => sum + item.items.reduce((lineSum, line) => lineSum + number(line.costPrice) * line.quantity, 0), 0);
  const costOfGoods = round(sales.reduce((sum, sale) => sum + sale.items.reduce((lineSum, line) => lineSum + line.costPrice * line.quantity, 0), 0) - returnedCost);
  const grossProfit = round(revenue - vatCollected - costOfGoods);
  const expenseTotal = round(expenses.reduce((sum, item) => sum + item.amount, 0));
  const netProfit = round(grossProfit - expenseTotal);
  const topMap = new Map();
  for (const sale of sales) for (const line of sale.items) {
    const current = topMap.get(line.productId) || { quantity: 0, revenue: 0 };
    current.quantity += line.quantity; current.revenue += line.unitPrice * line.quantity; topMap.set(line.productId, current);
  }
  for (const saleReturn of returns) for (const line of saleReturn.items) {
    const current = topMap.get(line.productId) || { quantity: 0, revenue: 0 };
    current.quantity -= line.quantity; current.revenue -= line.gross; topMap.set(line.productId, current);
  }
  const topProducts = [...topMap.entries()].map(([productId, values]) => ({ product: store.products.find((item) => item.id === productId), quantity: values.quantity, revenue: round(values.revenue) })).sort((a, b) => b.revenue - a.revenue).slice(0, 8);
  const paymentMethods = Object.entries(store.payments.filter((payment) => scoped(payment) && payment.direction === 'in' && within(payment.createdAt, from, to)).reduce((group, payment) => ({ ...group, [payment.method]: round((group[payment.method] || 0) + payment.amount) }), {})).map(([method, amount]) => ({ method, amount })).sort((a, b) => b.amount - a.amount);
  return { from, to, summary: { grossRevenue, returns: returnsTotal, revenue, discounts, vatCollected, costOfGoods, grossProfit, expenses: expenseTotal, netProfit, purchases: round(purchases.reduce((sum, purchase) => sum + purchase.total, 0)), orders: sales.length, averageOrder: sales.length ? round(revenue / sales.length) : 0 }, topProducts, paymentMethods, sales: sales.map(addEntityNames) };
}

async function initializeChapa(payload, user) {
  if (!CHAPA_SECRET_KEY) fail(503, 'Chapa is not configured. Add CHAPA_SECRET_KEY to the server environment.');
  const sale = store.sales.find((item) => item.id === payload.saleId);
  if (!sale || sale.balance <= 0) fail(400, 'Select an invoice with an outstanding balance.');
  const customer = store.parties.find((party) => party.id === sale.customerId);
  const [firstName, ...last] = (customer?.name || 'Customer').split(' ');
  const txRef = `NILE-${Date.now()}-${randomBytes(3).toString('hex')}`;
  const gatewayPayload = {
    amount: String(sale.balance), currency: 'ETB', email: customer?.email || store.settings.email,
    first_name: firstName, last_name: last.join(' ') || 'Customer', phone_number: String(customer?.phone || '').replace(/\s/g, '') || undefined,
    tx_ref: txRef, callback_url: `${PUBLIC_BASE_URL}/api/payments/chapa/callback`, return_url: `${PUBLIC_BASE_URL}/?payment=return`,
    customization: { title: store.settings.businessName, description: `Payment for ${sale.invoiceNo}` },
    meta: { invoices: sale.items.map((line) => ({ key: store.products.find((product) => product.id === line.productId)?.name || 'Part', value: `${line.quantity} pcs` })) }
  };
  if (!/^0[79]\d{8}$/.test(gatewayPayload.phone_number || '')) delete gatewayPayload.phone_number;
  const response = await fetch('https://api.chapa.co/v1/transaction/initialize', { method: 'POST', headers: { Authorization: `Bearer ${CHAPA_SECRET_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify(gatewayPayload) });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.status !== 'success') fail(502, data.message || 'Chapa could not initialize the payment.');
  store.gatewayTransactions.unshift({ id: id('gw'), provider: 'Chapa', txRef, branchId: sale.branchId || store.settings.defaultBranchId, saleId: sale.id, amount: sale.balance, status: 'pending', checkoutUrl: data.data?.checkout_url, createdAt: now(), createdBy: user.id });
  return { checkoutUrl: data.data?.checkout_url, txRef };
}

async function verifyChapa(txRef) {
  if (!CHAPA_SECRET_KEY || !txRef) return false;
  const gateway = store.gatewayTransactions.find((item) => item.txRef === txRef);
  if (!gateway || gateway.status === 'success') return Boolean(gateway);
  const response = await fetch(`https://api.chapa.co/v1/transaction/verify/${encodeURIComponent(txRef)}`, { headers: { Authorization: `Bearer ${CHAPA_SECRET_KEY}` } });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.status !== 'success' || result.data?.status !== 'success') {
    gateway.status = result.data?.status || 'failed';
    return false;
  }
  const sale = store.sales.find((item) => item.id === gateway.saleId);
  if (!sale) return false;
  const amount = Math.min(money(result.data.amount), sale.balance);
  if (amount > 0 && !store.payments.some((payment) => payment.reference === txRef)) {
    const previousBalance = sale.balance;
    store.payments.unshift({ id: id('pay'), direction: 'in', branchId: sale.branchId || store.settings.defaultBranchId, entityType: 'sale', entityId: sale.id, method: 'Chapa', amount, reference: txRef, note: 'Verified online payment', createdAt: now(), createdBy: gateway.createdBy });
    recalculateBalance(sale); adjustPartyBalance(sale, previousBalance);
  }
  gateway.status = 'success'; gateway.verifiedAt = now();
  return true;
}

async function api(req, res, url) {
  const path = url.pathname;
  if (path === '/api/health') return json(res, 200, { ok: true, version: store.version, storage: storageEngine });
  if (path === '/api/auth/login' && req.method === 'POST') {
    const payload = await body(req);
    const email = cleanText(payload.email, 120).toLowerCase();
    const attemptKey = `${req.socket.remoteAddress || 'local'}:${email}`;
    const attempt = loginAttempts.get(attemptKey);
    if (attempt && attempt.resetAt > Date.now() && attempt.count >= 5) fail(429, 'Too many sign-in attempts. Try again in 15 minutes.');
    if (attempt && attempt.resetAt <= Date.now()) loginAttempts.delete(attemptKey);
    const user = store.users.find((item) => item.email.toLowerCase() === email && item.active);
    if (!user || !passwordMatches(String(payload.password || ''), user.passwordHash)) {
      const current = loginAttempts.get(attemptKey) || { count: 0, resetAt: Date.now() + 15 * 60 * 1000 };
      current.count += 1; loginAttempts.set(attemptKey, current);
      fail(401, 'Email or password is incorrect.');
    }
    loginAttempts.delete(attemptKey);
    const token = randomBytes(32).toString('base64url');
    const sessionNow = Date.now();
    sessions.set(token, { userId: user.id, createdAt: sessionNow, lastSeenAt: sessionNow, expiresAt: sessionNow + SESSION_TTL, absoluteExpiresAt: sessionNow + SESSION_ABSOLUTE_TTL });
    await mutate(() => { user.lastLoginAt = now(); user.updatedAt ||= user.createdAt; audit(user, 'auth.login', 'user', user.id, 'Signed in successfully', req); });
    const value = `${token}.${sessionSignature(token)}`;
    return json(res, 200, { user: publicUser(user) }, { 'Set-Cookie': `nile_session=${encodeURIComponent(value)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_TTL / 1000}${COOKIE_SECURE ? '; Secure' : ''}` });
  }
  if (path === '/api/payments/chapa/callback') {
    const payload = req.method === 'POST' ? await body(req) : {};
    const txRef = url.searchParams.get('trx_ref') || url.searchParams.get('tx_ref') || payload.trx_ref || payload.tx_ref;
    const ok = await mutate(() => verifyChapa(txRef));
    if (req.method === 'GET') { res.writeHead(302, { Location: `/?payment=${ok ? 'success' : 'failed'}` }); return res.end(); }
    return json(res, ok ? 200 : 400, { ok });
  }
  const user = requireUser(req);
  if (path === '/api/auth/logout' && req.method === 'POST') {
    const [token] = (cookieMap(req).nile_session || '').split('.'); sessions.delete(token);
    return json(res, 200, { ok: true }, { 'Set-Cookie': `nile_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${COOKIE_SECURE ? '; Secure' : ''}` });
  }
  if (path === '/api/auth/me' && req.method === 'GET') return json(res, 200, { user: publicUser(user), settings: store.settings });
  if (path === '/api/auth/change-password' && req.method === 'POST') {
    const payload = await body(req);
    requireCurrentPassword(user, payload.currentPassword);
    const nextPassword = requireStrongPassword(payload.newPassword);
    if (passwordMatches(nextPassword, user.passwordHash)) fail(400, 'New password must be different from the current password.');
    await mutate(() => {
      user.passwordHash = passwordHash(nextPassword); user.updatedAt = now();
      audit(user, 'auth.password_changed', 'user', user.id, 'Changed own password; all sessions revoked', req);
      revokeUserSessions(user.id);
    });
    return json(res, 200, { ok: true, reauthenticate: true }, { 'Set-Cookie': `nile_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${COOKIE_SECURE ? '; Secure' : ''}` });
  }
  if (path === '/api/bootstrap' && req.method === 'GET') return json(res, 200, { user: publicUser(user), settings: store.settings, banks: ETHIOPIAN_BANKS, branches: store.branches.filter((branch) => branch.active), categories: [...new Set(store.products.map((item) => item.category))].sort(), customers: store.parties.filter((item) => item.type === 'customer' && item.active), suppliers: store.parties.filter((item) => item.type === 'supplier' && item.active) });
  if (path === '/api/branches' && req.method === 'GET') {
    requirePermission(req, 'inventory:view'); return json(res, 200, { branches: store.branches });
  }
  if (path === '/api/branches' && req.method === 'POST') {
    requirePermission(req, 'settings:manage'); const payload = await body(req);
    const branch = await mutate(() => {
      const name = cleanText(payload.name, 120); const code = cleanText(payload.code, 20).toUpperCase().replace(/[^A-Z0-9-]/g, '');
      if (!name || !code) fail(400, 'Branch name and code are required.');
      if (store.branches.some((item) => item.code.toUpperCase() === code)) fail(409, 'This branch code already exists.');
      const item = { id: id('br'), code, name, address: cleanText(payload.address, 200), phone: cleanText(payload.phone, 40), active: true, createdAt: now() };
      store.branches.push(item); for (const product of store.products) { product.branchStock ||= {}; product.branchStock[item.id] = 0; }
      audit(user, 'branch.created', 'branch', item.id, `Created ${code} · ${name}`, req); return item;
    });
    return json(res, 201, { branch });
  }
  const branchMatch = path.match(/^\/api\/branches\/([^/]+)$/);
  if (branchMatch && req.method === 'PUT') {
    requirePermission(req, 'settings:manage'); const payload = await body(req);
    const branch = await mutate(() => {
      const item = store.branches.find((branchItem) => branchItem.id === branchMatch[1]); if (!item) fail(404, 'Branch not found.');
      const name = cleanText(payload.name ?? item.name, 120); const code = cleanText(payload.code ?? item.code, 20).toUpperCase().replace(/[^A-Z0-9-]/g, ''); const active = payload.active ?? item.active;
      if (!name || !code) fail(400, 'Branch name and code are required.');
      if (store.branches.some((branchItem) => branchItem.id !== item.id && branchItem.code.toUpperCase() === code)) fail(409, 'This branch code already exists.');
      if (!active && item.id === store.settings.defaultBranchId) fail(400, 'The default branch cannot be deactivated.');
      if (!active && store.products.some((product) => getBranchStock(product, item.id) > 0)) fail(409, 'Transfer or count this branch stock to zero before deactivating it.');
      item.name = name; item.code = code; item.address = cleanText(payload.address ?? item.address, 200); item.phone = cleanText(payload.phone ?? item.phone, 40); item.active = Boolean(active); item.updatedAt = now();
      audit(user, 'branch.updated', 'branch', item.id, `Updated ${code} · ${name}`, req); return item;
    });
    return json(res, 200, { branch });
  }
  if (path === '/api/users' && req.method === 'GET') {
    requirePermission(req, 'users:manage');
    return json(res, 200, { users: store.users.map(publicUser), roles: USER_ROLES.map((role) => ({ role, permissions: ROLE_PERMISSIONS[role] })) });
  }
  if (path === '/api/users' && req.method === 'POST') {
    requirePermission(req, 'users:manage'); const payload = await body(req); requireCurrentPassword(user, payload.currentPassword);
    const name = cleanText(payload.name, 120); const email = cleanText(payload.email, 120).toLowerCase(); const role = cleanText(payload.role, 30);
    if (!name || !/^\S+@\S+\.\S+$/.test(email)) fail(400, 'Enter a valid employee name and email address.');
    if (!USER_ROLES.includes(role)) fail(400, 'Select a valid employee role.');
    if (store.users.some((item) => item.email.toLowerCase() === email)) fail(409, 'An employee with this email already exists.');
    const password = requireStrongPassword(payload.password);
    const created = await mutate(() => {
      const employee = { id: id('usr'), name, email, role, active: true, passwordHash: passwordHash(password), createdAt: now(), updatedAt: now(), lastLoginAt: null };
      store.users.push(employee); audit(user, 'user.created', 'user', employee.id, `Created ${role} account for ${name}`, req); return publicUser(employee);
    });
    return json(res, 201, { user: created });
  }
  const userMatch = path.match(/^\/api\/users\/([^/]+)$/);
  if (userMatch && req.method === 'PUT') {
    requirePermission(req, 'users:manage'); const payload = await body(req); requireCurrentPassword(user, payload.currentPassword);
    const updated = await mutate(() => {
      const employee = store.users.find((item) => item.id === userMatch[1]); if (!employee) fail(404, 'Employee not found.');
      const name = cleanText(payload.name ?? employee.name, 120); const email = cleanText(payload.email ?? employee.email, 120).toLowerCase(); const role = cleanText(payload.role ?? employee.role, 30); const active = payload.active ?? employee.active;
      if (!name || !/^\S+@\S+\.\S+$/.test(email)) fail(400, 'Enter a valid employee name and email address.');
      if (!USER_ROLES.includes(role)) fail(400, 'Select a valid employee role.');
      if (store.users.some((item) => item.id !== employee.id && item.email.toLowerCase() === email)) fail(409, 'An employee with this email already exists.');
      if (employee.id === user.id && (!active || role !== 'admin')) fail(400, 'You cannot deactivate or remove your own administrator access.');
      const otherAdmins = store.users.filter((item) => item.active && item.role === 'admin' && item.id !== employee.id);
      if (employee.role === 'admin' && employee.active && (!active || role !== 'admin') && !otherAdmins.length) fail(400, 'At least one active administrator is required.');
      employee.name = name; employee.email = email; employee.role = role; employee.active = Boolean(active); employee.updatedAt = now();
      if (payload.password) employee.passwordHash = passwordHash(requireStrongPassword(payload.password));
      revokeUserSessions(employee.id);
      audit(user, 'user.updated', 'user', employee.id, `Updated ${employee.name}; role ${role}; ${employee.active ? 'active' : 'inactive'}; sessions revoked`, req);
      return publicUser(employee);
    });
    return json(res, 200, { user: updated });
  }
  if (path === '/api/audit-logs' && req.method === 'GET') {
    requirePermission(req, 'audit:view');
    return json(res, 200, { logs: store.auditLogs.slice(0, 500) });
  }
  if (path === '/api/system/storage' && req.method === 'GET') {
    requirePermission(req, 'settings:manage');
    return json(res, 200, { engine: storageEngine, databaseConfigured: Boolean(DATABASE_URL), ssl: DATABASE_SSL, storeVersion: store.version, updatedAt: store.updatedAt });
  }
  if (path === '/api/system/readiness' && req.method === 'GET') {
    requirePermission(req, 'settings:manage');
    return json(res, 200, productionReadiness());
  }
  if (path === '/api/backups' && req.method === 'GET') {
    requirePermission(req, 'settings:manage');
    const backups = await listBackups();
    return json(res, 200, { backups: backups.map(({ path: _path, ...backup }) => backup), retentionCount: Math.max(1, number(process.env.BACKUP_RETENTION_COUNT, 30)), intervalHours: Math.max(0, number(process.env.BACKUP_INTERVAL_HOURS, 24)) });
  }
  if (path === '/api/backups' && req.method === 'POST') {
    requirePermission(req, 'settings:manage');
    const created = await mutate(async () => {
      const backup = await createBackupSnapshot(store, storageEngine);
      audit(user, 'backup.created', 'backup', backup.filename, `Created ${storageEngine} backup ${backup.filename}`, req);
      const { path: _path, ...safeBackup } = backup; return safeBackup;
    });
    return json(res, 201, { backup: created });
  }
  if (path === '/api/dashboard' && req.method === 'GET') { requirePermission(req, 'dashboard:view'); return json(res, 200, dashboard(url.searchParams.get('branchId'))); }
  if (path === '/api/products' && req.method === 'GET') { requirePermission(req, 'inventory:view'); const branchId = url.searchParams.get('branchId'); if (branchId) branchById(branchId); return json(res, 200, { products: store.products.map((product) => productView(product, branchId)) }); }
  if (path === '/api/products' && req.method === 'POST') {
    requirePermission(req, 'inventory:manage'); const payload = await body(req);
    const branch = branchById(payload.branchId);
    const sku = cleanText(payload.sku, 60).toUpperCase();
    if (!sku || !cleanText(payload.name)) fail(400, 'SKU and product name are required.');
    if (store.products.some((item) => item.sku.toUpperCase() === sku)) fail(409, 'This SKU already exists.');
    const created = await mutate(() => {
      const openingStock = Math.max(0, Math.floor(number(payload.stock)));
      const product = { id: id('prd'), sku, name: cleanText(payload.name), category: cleanText(payload.category, 100) || 'Other', compatibility: cleanText(payload.compatibility), brand: cleanText(payload.brand, 100), costPrice: money(payload.costPrice), sellingPrice: money(payload.sellingPrice), stock: openingStock, branchStock: Object.fromEntries(store.branches.map((item) => [item.id, item.id === branch.id ? openingStock : 0])), reorderLevel: Math.max(0, Math.floor(number(payload.reorderLevel, store.settings.lowStockDefault))), location: cleanText(payload.location, 50), barcode: cleanText(payload.barcode, 80), unit: cleanText(payload.unit, 20) || 'pcs', taxable: payload.taxable !== false, active: true, createdAt: now(), updatedAt: now() };
      if (product.sellingPrice <= 0) fail(400, 'Selling price must be greater than zero.');
      store.products.unshift(product);
      if (product.stock) store.movements.unshift({ id: id('mov'), productId: product.id, branchId: branch.id, type: 'opening', quantity: product.stock, before: 0, after: product.stock, reference: 'Opening balance', note: '', createdAt: now(), createdBy: user.id });
      audit(user, 'product.created', 'product', product.id, `Created ${product.sku} · ${product.name}`);
      return productView(product);
    });
    return json(res, 201, { product: created });
  }
  const productMatch = path.match(/^\/api\/products\/([^/]+)$/);
  if (productMatch && req.method === 'PUT') {
    requirePermission(req, 'inventory:manage'); const payload = await body(req);
    const updated = await mutate(() => {
      const product = store.products.find((item) => item.id === productMatch[1]); if (!product) fail(404, 'Product not found.');
      const sku = cleanText(payload.sku ?? product.sku, 60).toUpperCase();
      if (store.products.some((item) => item.id !== product.id && item.sku.toUpperCase() === sku)) fail(409, 'This SKU already exists.');
      Object.assign(product, { sku, name: cleanText(payload.name ?? product.name), category: cleanText(payload.category ?? product.category, 100), compatibility: cleanText(payload.compatibility ?? product.compatibility), brand: cleanText(payload.brand ?? product.brand, 100), costPrice: money(payload.costPrice ?? product.costPrice), sellingPrice: money(payload.sellingPrice ?? product.sellingPrice), reorderLevel: Math.max(0, Math.floor(number(payload.reorderLevel, product.reorderLevel))), location: cleanText(payload.location ?? product.location, 50), barcode: cleanText(payload.barcode ?? product.barcode, 80), unit: cleanText(payload.unit ?? product.unit, 20), taxable: payload.taxable ?? product.taxable, active: payload.active ?? product.active, updatedAt: now() });
      if (!product.name || product.sellingPrice <= 0) fail(400, 'Product name and valid selling price are required.');
      audit(user, 'product.updated', 'product', product.id, `Updated ${product.sku} · ${product.name}`);
      return productView(product);
    });
    return json(res, 200, { product: updated });
  }
  const adjustMatch = path.match(/^\/api\/products\/([^/]+)\/adjust$/);
  if (adjustMatch && req.method === 'POST') {
    requirePermission(req, 'inventory:manage'); const payload = await body(req);
    const branch = branchById(payload.branchId);
    const result = await mutate(() => {
      const product = store.products.find((item) => item.id === adjustMatch[1]); if (!product) fail(404, 'Product not found.');
      const quantity = Math.trunc(number(payload.quantity)); if (!quantity) fail(400, 'Adjustment quantity cannot be zero.');
      const before = getBranchStock(product, branch.id); if (before + quantity < 0) fail(400, 'Adjustment would make branch stock negative.');
      setBranchStock(product, branch.id, before + quantity); product.updatedAt = now();
      store.movements.unshift({ id: id('mov'), productId: product.id, branchId: branch.id, type: quantity > 0 ? 'adjustment-in' : 'adjustment-out', quantity, before, after: getBranchStock(product, branch.id), reference: cleanText(payload.reference, 100) || 'Manual adjustment', note: cleanText(payload.note, 300), createdAt: now(), createdBy: user.id });
      audit(user, 'stock.adjusted', 'product', product.id, `${product.sku} adjusted ${quantity > 0 ? '+' : ''}${quantity} at ${branch.name}; ${before} to ${getBranchStock(product, branch.id)}`);
      return productView(product, branch.id);
    });
    return json(res, 200, { product: result });
  }
  if (path === '/api/movements' && req.method === 'GET') { requirePermission(req, 'inventory:view'); const branchId = url.searchParams.get('branchId'); return json(res, 200, { movements: store.movements.filter((movement) => !branchId || movement.branchId === branchId).slice(0, 250).map((movement) => ({ ...movement, branchName: store.branches.find((branch) => branch.id === movement.branchId)?.name || 'Unknown', product: store.products.find((product) => product.id === movement.productId) })) }); }
  if (path === '/api/parties' && req.method === 'GET') { requirePermission(req, 'people:view'); return json(res, 200, { parties: store.parties }); }
  if (path === '/api/parties' && req.method === 'POST') {
    requirePermission(req, 'people:manage'); const payload = await body(req); const type = payload.type === 'supplier' ? 'supplier' : 'customer';
    const party = await mutate(() => {
      if (!cleanText(payload.name)) fail(400, 'Name is required.');
      const item = { id: id(type === 'customer' ? 'cus' : 'sup'), type, name: cleanText(payload.name), phone: cleanText(payload.phone, 40), email: cleanText(payload.email, 120), address: cleanText(payload.address), tin: cleanText(payload.tin, 40), balance: 0, active: true, createdAt: now() };
      store.parties.unshift(item); audit(user, 'party.created', type, item.id, `Created ${type} ${item.name}`); return item;
    });
    return json(res, 201, { party });
  }
  if (path === '/api/sales' && req.method === 'GET') { requirePermission(req, 'sales:view'); const branchId = url.searchParams.get('branchId'); return json(res, 200, { sales: store.sales.filter((sale) => !branchId || sale.branchId === branchId).map(saleDetails) }); }
  if (path === '/api/sales' && req.method === 'POST') {
    requirePermission(req, 'pos:sell'); const payload = await body(req); const sale = await mutate(() => createSale(payload, user)); return json(res, 201, { sale });
  }
  if (path === '/api/returns' && req.method === 'GET') {
    requirePermission(req, 'sales:view');
    const branchId = url.searchParams.get('branchId');
    return json(res, 200, { returns: store.returns.filter((item) => !branchId || item.branchId === branchId).map((item) => ({ ...item, customerName: partyName(item.customerId), invoiceNo: store.sales.find((sale) => sale.id === item.saleId)?.invoiceNo || '—', items: item.items.map((line) => ({ ...line, product: store.products.find((product) => product.id === line.productId) })) })) });
  }
  if (path === '/api/returns' && req.method === 'POST') {
    requirePermission(req, 'sales:manage'); const payload = await body(req); const saleReturn = await mutate(() => createSaleReturn(payload, user)); return json(res, 201, { return: saleReturn });
  }
  if (path === '/api/quotes' && req.method === 'GET') {
    requirePermission(req, 'sales:view'); const branchId = url.searchParams.get('branchId'); return json(res, 200, { quotes: store.quotes.filter((quote) => !branchId || quote.branchId === branchId).map(quoteDetails) });
  }
  if (path === '/api/quotes' && req.method === 'POST') {
    requirePermission(req, 'sales:manage'); const payload = await body(req); const quote = await mutate(() => createQuote(payload, user)); return json(res, 201, { quote });
  }
  const quoteConvertMatch = path.match(/^\/api\/quotes\/([^/]+)\/convert$/);
  if (quoteConvertMatch && req.method === 'POST') {
    requirePermission(req, 'sales:manage'); const payload = await body(req);
    const result = await mutate(async () => {
      const quote = store.quotes.find((item) => item.id === quoteConvertMatch[1]); if (!quote) fail(404, 'Quotation not found.');
      if (quote.status === 'converted') fail(409, 'This quotation was already converted.');
      const sale = await createSale({ branchId: quote.branchId, customerId: quote.customerId, items: quote.items, discount: quote.discount, note: `Converted from ${quote.quoteNo}${quote.note ? ` · ${quote.note}` : ''}`, payments: payload.payments || [] }, user);
      quote.status = 'converted'; quote.convertedSaleId = sale.id; quote.updatedAt = now(); audit(user, 'quote.converted', 'quote', quote.id, `${quote.quoteNo} converted to ${sale.invoiceNo}`); return { quote: quoteDetails(quote), sale };
    });
    return json(res, 201, result);
  }
  const salePaymentMatch = path.match(/^\/api\/sales\/([^/]+)\/payments$/);
  if (salePaymentMatch && req.method === 'POST') {
    requirePermission(req, 'sales:manage'); const payload = await body(req);
    const sale = await mutate(() => {
      const target = store.sales.find((item) => item.id === salePaymentMatch[1]); if (!target) fail(404, 'Sale not found.');
      const payments = validatePayments(payload.payments, target.balance); if (!payments.length) fail(400, 'Enter a payment amount.');
      const previousBalance = target.balance;
      for (const payment of payments) store.payments.unshift({ id: id('pay'), direction: 'in', branchId: target.branchId || store.settings.defaultBranchId, entityType: 'sale', entityId: target.id, ...payment, note: cleanText(payload.note, 300), createdAt: now(), createdBy: user.id });
      recalculateBalance(target); adjustPartyBalance(target, previousBalance); audit(user, 'payment.received', 'sale', target.id, `Received ${round(payments.reduce((sum, payment) => sum + payment.amount, 0))} for ${target.invoiceNo}`); return saleDetails(target);
    });
    return json(res, 200, { sale });
  }
  if (path === '/api/purchases' && req.method === 'GET') { requirePermission(req, 'purchases:view'); const branchId = url.searchParams.get('branchId'); return json(res, 200, { purchases: store.purchases.filter((purchase) => !branchId || purchase.branchId === branchId).map(purchaseDetails) }); }
  if (path === '/api/purchases' && req.method === 'POST') {
    requirePermission(req, 'purchases:manage'); const payload = await body(req); const purchase = await mutate(() => createPurchase(payload, user)); return json(res, 201, { purchase });
  }
  if (path === '/api/expenses' && req.method === 'GET') { requirePermission(req, 'payments:view'); const branchId = url.searchParams.get('branchId'); return json(res, 200, { expenses: store.expenses.filter((expense) => !branchId || expense.branchId === branchId) }); }
  if (path === '/api/expenses' && req.method === 'POST') { requirePermission(req, 'expenses:manage'); const payload = await body(req); const expense = await mutate(() => createExpense(payload, user)); return json(res, 201, { expense }); }
  if (path === '/api/stock-counts' && req.method === 'GET') { requirePermission(req, 'inventory:view'); const branchId = url.searchParams.get('branchId'); return json(res, 200, { stockCounts: store.stockCounts.filter((count) => !branchId || count.branchId === branchId) }); }
  if (path === '/api/stock-counts' && req.method === 'POST') { requirePermission(req, 'inventory:manage'); const payload = await body(req); const stockCount = await mutate(() => completeStockCount(payload, user)); return json(res, 201, { stockCount }); }
  if (path === '/api/transfers' && req.method === 'GET') { requirePermission(req, 'inventory:view'); const branchId = url.searchParams.get('branchId'); return json(res, 200, { transfers: store.transfers.filter((transfer) => !branchId || transfer.fromBranchId === branchId || transfer.toBranchId === branchId).map((transfer) => ({ ...transfer, fromBranchName: store.branches.find((branch) => branch.id === transfer.fromBranchId)?.name, toBranchName: store.branches.find((branch) => branch.id === transfer.toBranchId)?.name, items: transfer.items.map((line) => ({ ...line, product: store.products.find((product) => product.id === line.productId) })) })) }); }
  if (path === '/api/transfers' && req.method === 'POST') { requirePermission(req, 'inventory:manage'); const payload = await body(req); const transfer = await mutate(() => createTransfer(payload, user)); return json(res, 201, { transfer }); }
  if (path === '/api/payments' && req.method === 'GET') { requirePermission(req, 'payments:view'); const branchId = url.searchParams.get('branchId'); return json(res, 200, { payments: store.payments.filter((payment) => !branchId || payment.branchId === branchId).map((payment) => ({ ...payment, entityNumber: store.sales.find((sale) => sale.id === payment.entityId)?.invoiceNo || store.purchases.find((purchase) => purchase.id === payment.entityId)?.purchaseNo || store.returns.find((item) => item.id === payment.entityId)?.returnNo || store.expenses.find((item) => item.id === payment.entityId)?.expenseNo || '—' })) }); }
  if (path === '/api/payments/chapa/initialize' && req.method === 'POST') {
    requirePermission(req, 'sales:manage'); const payload = await body(req); const result = await mutate(() => initializeChapa(payload, user)); return json(res, 200, result);
  }
  if (path === '/api/reports' && req.method === 'GET') { requirePermission(req, 'reports:view'); return json(res, 200, report(url)); }
  if (path === '/api/settings' && req.method === 'GET') { requirePermission(req, 'settings:manage'); return json(res, 200, { settings: store.settings }); }
  if (path === '/api/settings' && req.method === 'PUT') {
    requirePermission(req, 'settings:manage'); const payload = await body(req);
    const settings = await mutate(() => {
      const fields = ['businessName', 'businessNameAm', 'phone', 'email', 'address', 'tin', 'vatNumber', 'receiptFooter', 'invoicePrefix', 'purchasePrefix'];
      for (const field of fields) if (field in payload) store.settings[field] = cleanText(payload[field], field === 'receiptFooter' ? 300 : 150);
      if ('vatRegistered' in payload) store.settings.vatRegistered = Boolean(payload.vatRegistered);
      if ('vatRate' in payload) store.settings.vatRate = Math.max(0, Math.min(100, number(payload.vatRate, 15)));
      if ('lowStockDefault' in payload) store.settings.lowStockDefault = Math.max(0, Math.floor(number(payload.lowStockDefault, 5)));
      if ('defaultBranchId' in payload) store.settings.defaultBranchId = branchById(payload.defaultBranchId).id;
      store.settings.chapaEnabled = Boolean(CHAPA_SECRET_KEY); audit(user, 'settings.updated', 'settings', 'business', 'Updated business and tax settings', req); return store.settings;
    });
    return json(res, 200, { settings });
  }
  fail(404, 'API route not found.');
}

async function serveStatic(req, res, url) {
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === '/') pathname = '/index.html';
  const relative = normalize(pathname).replace(/^([/\\])+/, '');
  const filePath = resolve(PUBLIC_DIR, relative);
  if (!filePath.startsWith(resolve(PUBLIC_DIR))) fail(403, 'Forbidden.');
  try { await access(filePath); } catch {
    if (!extname(pathname)) return serveStatic(req, res, new URL('/index.html', url));
    fail(404, 'File not found.');
  }
  const statHeaders = { 'Content-Type': mime[extname(filePath)] || 'application/octet-stream', 'Cache-Control': extname(filePath) === '.html' ? 'no-cache' : 'public, max-age=3600' };
  res.writeHead(200, statHeaders); createReadStream(filePath).pipe(res);
}

function sameOrigin(req) {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) return true;
  const origin = req.headers.origin; if (!origin) return true;
  const host = req.headers.host; return new URL(origin).host === host;
}

await loadStore();

const backupIntervalHours = Math.max(0, number(process.env.BACKUP_INTERVAL_HOURS, 24));
if (backupIntervalHours > 0) {
  backupTimer = setInterval(() => {
    mutationQueue.then(() => createBackupSnapshot(store, storageEngine)).catch((error) => console.error('Scheduled backup failed:', error.message));
  }, backupIntervalHours * 60 * 60 * 1000);
  backupTimer.unref();
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || `localhost:${PORT}`}`);
  try {
    for (const [name, value] of Object.entries(securityHeaders())) res.setHeader(name, value);
    if (!sameOrigin(req)) fail(403, 'Cross-origin request blocked.');
    if (url.pathname.startsWith('/api/')) await api(req, res, url);
    else await serveStatic(req, res, url);
  } catch (error) {
    if (!res.headersSent) json(res, error.status || 500, { error: error.status ? error.message : 'Unexpected server error.', details: error.details });
    if (!error.status) console.error(error);
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Nile Auto Parts is running at http://${HOST}:${PORT}`);
  console.log('Demo admin: admin@nile.et / admin123');
});

function shutdown() {
  server.close(async () => {
    try {
      if (backupTimer) clearInterval(backupTimer);
      if (postgresLockClient) { await postgresLockClient.query('SELECT pg_advisory_unlock($1)', [73120426]); postgresLockClient.release(); }
      if (postgresPool) await postgresPool.end();
    } finally { process.exit(0); }
  });
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
