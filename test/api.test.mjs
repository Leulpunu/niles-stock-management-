import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, rm } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { spawn } from 'node:child_process';

const root = resolve(import.meta.dirname, '..');
const testDir = join(root, '.test-data');
const storeFile = join(testDir, 'store.json');
const port = 3197;
const base = `http://127.0.0.1:${port}`;
let server;
let cookie = '';

async function api(path, options = {}) {
  const response = await fetch(`${base}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}), ...(options.headers || {}) },
    body: options.body && typeof options.body !== 'string' ? JSON.stringify(options.body) : options.body
  });
  const setCookie = response.headers.get('set-cookie');
  if (setCookie) cookie = setCookie.split(';')[0];
  const data = await response.json();
  return { response, data };
}

async function waitForServer() {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(`${base}/api/health`);
      if (response.ok) return;
    } catch {}
    await new Promise((resolveWait) => setTimeout(resolveWait, 100));
  }
  throw new Error('Test server did not start.');
}

test.before(async () => {
  await mkdir(testDir, { recursive: true });
  server = spawn(process.execPath, ['server.mjs'], { cwd: root, env: { ...process.env, PORT: String(port), DATA_FILE: storeFile, DATABASE_URL: '', BACKUP_DIR: join(testDir, 'backups'), BACKUP_INTERVAL_HOURS: '0', SESSION_SECRET: 'integration-test-secret' }, stdio: ['ignore', 'pipe', 'pipe'] });
  await waitForServer();
});

test.after(async () => {
  server?.kill('SIGTERM');
  await new Promise((resolveWait) => setTimeout(resolveWait, 100));
  await rm(testDir, { recursive: true, force: true });
});

test('health and authentication', async () => {
  const health = await api('/api/health');
  assert.equal(health.response.status, 200);
  assert.equal(health.data.ok, true);
  assert.equal(health.data.storage, 'json');
  assert.equal(health.response.headers.get('x-frame-options'), 'DENY');
  assert.match(health.response.headers.get('content-security-policy'), /frame-ancestors 'none'/);

  const denied = await api('/api/dashboard');
  assert.equal(denied.response.status, 401);

  const login = await api('/api/auth/login', { method: 'POST', body: { email: 'admin@nile.et', password: 'admin123' } });
  assert.equal(login.response.status, 200);
  assert.equal(login.data.user.role, 'admin');
  assert.match(cookie, /^nile_session=/);

  const bootstrap = await api('/api/bootstrap');
  assert.equal(bootstrap.response.status, 200);
  assert.equal(bootstrap.data.banks.length, 32);
  assert.ok(bootstrap.data.banks.includes('Commercial Bank of Ethiopia'));
  assert.ok(bootstrap.data.banks.includes('Siinqee Bank'));

  const storage = await api('/api/system/storage');
  assert.equal(storage.response.status, 200);
  assert.equal(storage.data.engine, 'json');

  const readiness = await api('/api/system/readiness');
  assert.equal(readiness.response.status, 200);
  assert.equal(readiness.data.ready, false);
  assert.equal(readiness.data.onlinePaymentsReady, false);
  assert.ok(readiness.data.checks.some((check) => check.key === 'database' && !check.passed));
});

test('product, stock adjustment, sale and purchase workflows', async () => {
  const created = await api('/api/products', { method: 'POST', body: { sku: 'TST-900', name: 'Test Fuel Filter', category: 'Filters', costPrice: 100, sellingPrice: 200, stock: 10, reorderLevel: 2, taxable: true } });
  assert.equal(created.response.status, 201);
  assert.equal(created.data.product.stock, 10);
  const productId = created.data.product.id;

  const adjusted = await api(`/api/products/${productId}/adjust`, { method: 'POST', body: { quantity: 2, reference: 'Cycle count' } });
  assert.equal(adjusted.response.status, 200);
  assert.equal(adjusted.data.product.stock, 12);

  const rejectedBank = await api('/api/sales', { method: 'POST', body: { customerId: 'cus_walkin', items: [{ productId, quantity: 1 }], payments: [{ method: 'Bank Transfer', bankName: 'Not A Licensed Bank', amount: 100 }] } });
  assert.equal(rejectedBank.response.status, 400);

  const sale = await api('/api/sales', { method: 'POST', body: { customerId: 'cus_walkin', items: [{ productId, quantity: 2 }], discount: 10, payments: [{ method: 'Bank Transfer', bankName: 'Awash Bank', amount: 200, reference: 'AWASH-TEST' }] } });
  assert.equal(sale.response.status, 201);
  assert.equal(sale.data.sale.subtotal, 400);
  assert.equal(sale.data.sale.tax, 58.5);
  assert.equal(sale.data.sale.total, 448.5);
  assert.equal(sale.data.sale.balance, 248.5);
  assert.equal(sale.data.sale.status, 'partial');
  assert.equal(sale.data.sale.payments[0].bankName, 'Awash Bank');

  const payment = await api(`/api/sales/${sale.data.sale.id}/payments`, { method: 'POST', body: { payments: [{ method: 'Telebirr', amount: 248.5, reference: 'TB-TEST' }] } });
  assert.equal(payment.response.status, 200);
  assert.equal(payment.data.sale.balance, 0);
  assert.equal(payment.data.sale.status, 'paid');

  const purchase = await api('/api/purchases', { method: 'POST', body: { supplierId: 'sup_001', items: [{ productId, quantity: 5, unitCost: 110 }], payments: [] } });
  assert.equal(purchase.response.status, 201);
  assert.equal(purchase.data.purchase.total, 632.5);
  assert.equal(purchase.data.purchase.status, 'credit');

  const products = await api('/api/products');
  assert.equal(products.data.products.find((item) => item.id === productId).stock, 15);
});

test('quotations, returns, refunds, expenses and stock counts', async () => {
  const product = await api('/api/products', { method: 'POST', body: { sku: 'OPS-901', name: 'Operations Test Part', category: 'Testing', costPrice: 50, sellingPrice: 100, stock: 10, reorderLevel: 2, taxable: true } });
  assert.equal(product.response.status, 201);
  const productId = product.data.product.id;

  const quote = await api('/api/quotes', { method: 'POST', body: { customerId: 'cus_walkin', validUntil: '2027-01-31', items: [{ productId, quantity: 2, unitPrice: 100 }], discount: 0, note: 'Integration test quotation' } });
  assert.equal(quote.response.status, 201);
  assert.match(quote.data.quote.quoteNo, /^QT-/);
  assert.equal(quote.data.quote.total, 230);

  const converted = await api(`/api/quotes/${quote.data.quote.id}/convert`, { method: 'POST', body: { payments: [] } });
  assert.equal(converted.response.status, 201);
  assert.equal(converted.data.quote.status, 'converted');
  assert.equal(converted.data.sale.balance, 230);

  const creditedReturn = await api('/api/returns', { method: 'POST', body: { saleId: converted.data.sale.id, items: [{ productId, quantity: 1 }], reason: 'Wrong part', restock: true, refunds: [] } });
  assert.equal(creditedReturn.response.status, 201);
  assert.equal(creditedReturn.data.return.total, 115);
  assert.equal(creditedReturn.data.return.creditApplied, 115);
  assert.equal(creditedReturn.data.return.refunded, 0);
  assert.equal(creditedReturn.data.return.sale.balance, 115);

  const paidSale = await api('/api/sales', { method: 'POST', body: { customerId: 'cus_walkin', items: [{ productId, quantity: 1, unitPrice: 100 }], payments: [{ method: 'Cash', amount: 115 }] } });
  assert.equal(paidSale.response.status, 201);
  const refundedReturn = await api('/api/returns', { method: 'POST', body: { saleId: paidSale.data.sale.id, items: [{ productId, quantity: 1 }], reason: 'Defective part', restock: false, refunds: [{ method: 'Cash', amount: 115 }] } });
  assert.equal(refundedReturn.response.status, 201);
  assert.equal(refundedReturn.data.return.refunded, 115);
  assert.equal(refundedReturn.data.return.restocked, false);

  const expense = await api('/api/expenses', { method: 'POST', body: { category: 'Transport', vendor: 'Test Logistics', amount: 250, method: 'Bank Transfer', bankName: 'Dashen Bank', reference: 'EXP-TEST' } });
  assert.equal(expense.response.status, 201);
  assert.match(expense.data.expense.expenseNo, /^EXP-/);
  assert.equal(expense.data.expense.bankName, 'Dashen Bank');

  const stockCount = await api('/api/stock-counts', { method: 'POST', body: { items: [{ productId, counted: 7 }], note: 'Integration test count' } });
  assert.equal(stockCount.response.status, 201);
  assert.equal(stockCount.data.stockCount.changedItems, 1);
  assert.equal(stockCount.data.stockCount.items[0].difference, -1);

  const products = await api('/api/products');
  assert.equal(products.data.products.find((item) => item.id === productId).stock, 7);
  const ledger = await api('/api/payments');
  assert.ok(ledger.data.payments.some((payment) => payment.entityType === 'return' && payment.amount === 115));
  assert.ok(ledger.data.payments.some((payment) => payment.entityType === 'expense' && payment.amount === 250));
});

test('multi-branch stock isolation and transfers', async () => {
  const branch = await api('/api/branches', { method: 'POST', body: { code: 'ADAMA', name: 'Adama Store', address: 'Adama, Ethiopia', phone: '0911000000' } });
  assert.equal(branch.response.status, 201);
  const adamaId = branch.data.branch.id;

  const created = await api('/api/products', { method: 'POST', body: { branchId: 'br_main', sku: 'BRN-902', name: 'Branch Test Part', category: 'Testing', costPrice: 80, sellingPrice: 120, stock: 10, reorderLevel: 2, taxable: true } });
  assert.equal(created.response.status, 201);
  const productId = created.data.product.id;

  const beforeAdama = await api(`/api/products?branchId=${adamaId}`);
  assert.equal(beforeAdama.data.products.find((item) => item.id === productId).stock, 0);

  const transfer = await api('/api/transfers', { method: 'POST', body: { fromBranchId: 'br_main', toBranchId: adamaId, items: [{ productId, quantity: 4 }], note: 'Opening Adama allocation' } });
  assert.equal(transfer.response.status, 201);
  assert.match(transfer.data.transfer.transferNo, /^TRF-/);

  const mainProducts = await api('/api/products?branchId=br_main');
  const adamaProducts = await api(`/api/products?branchId=${adamaId}`);
  assert.equal(mainProducts.data.products.find((item) => item.id === productId).stock, 6);
  assert.equal(adamaProducts.data.products.find((item) => item.id === productId).stock, 4);
  assert.equal(adamaProducts.data.products.find((item) => item.id === productId).aggregateStock, 10);

  const oversell = await api('/api/sales', { method: 'POST', body: { branchId: adamaId, customerId: 'cus_walkin', items: [{ productId, quantity: 5 }], payments: [] } });
  assert.equal(oversell.response.status, 409);
  const branchSale = await api('/api/sales', { method: 'POST', body: { branchId: adamaId, customerId: 'cus_walkin', items: [{ productId, quantity: 1 }], payments: [] } });
  assert.equal(branchSale.response.status, 201);
  assert.equal(branchSale.data.sale.branchId, adamaId);

  const branchPurchase = await api('/api/purchases', { method: 'POST', body: { branchId: adamaId, supplierId: 'sup_001', items: [{ productId, quantity: 2, unitCost: 80 }], payments: [] } });
  assert.equal(branchPurchase.response.status, 201);
  assert.equal(branchPurchase.data.purchase.branchId, adamaId);

  const finalAdama = await api(`/api/products?branchId=${adamaId}`);
  assert.equal(finalAdama.data.products.find((item) => item.id === productId).stock, 5);
  assert.equal(finalAdama.data.products.find((item) => item.id === productId).aggregateStock, 11);

  const transfers = await api(`/api/transfers?branchId=${adamaId}`);
  assert.equal(transfers.response.status, 200);
  assert.equal(transfers.data.transfers[0].fromBranchName, 'Addis Ababa Main Store');
  assert.equal(transfers.data.transfers[0].toBranchName, 'Adama Store');
  const movements = await api(`/api/movements?branchId=${adamaId}`);
  assert.ok(movements.data.movements.some((movement) => movement.type === 'transfer-in' && movement.after === 4));

  const branchDashboard = await api(`/api/dashboard?branchId=${adamaId}`);
  assert.equal(branchDashboard.response.status, 200);
  assert.ok(branchDashboard.data.recentSales.every((sale) => sale.branchId === adamaId));
});

test('dashboard and reporting aggregates are available', async () => {
  const dashboard = await api('/api/dashboard');
  assert.equal(dashboard.response.status, 200);
  assert.ok(Array.isArray(dashboard.data.salesChart));
  assert.equal(dashboard.data.salesChart.length, 7);

  const reports = await api('/api/reports?from=2020-01-01&to=2030-12-31');
  assert.equal(reports.response.status, 200);
  assert.ok(reports.data.summary.revenue > 0);
  assert.ok(reports.data.summary.returns >= 230);
  assert.ok(reports.data.summary.expenses >= 250);
  assert.equal(reports.data.summary.netProfit, reports.data.summary.grossProfit - reports.data.summary.expenses);
  assert.ok(Array.isArray(reports.data.topProducts));
});

test('employee roles, privileged changes, audit history and password rotation', async () => {
  const weak = await api('/api/users', { method: 'POST', body: { name: 'Weak User', email: 'weak@nile.et', role: 'cashier', password: 'short', currentPassword: 'admin123' } });
  assert.equal(weak.response.status, 400);

  const created = await api('/api/users', { method: 'POST', body: { name: 'Hana Bekele', email: 'hana@nile.et', role: 'manager', password: 'HanaSecurePassphrase2026!', currentPassword: 'admin123' } });
  assert.equal(created.response.status, 201);
  assert.equal(created.data.user.role, 'manager');
  assert.ok(created.data.user.permissions.includes('reports:view'));

  const updated = await api(`/api/users/${created.data.user.id}`, { method: 'PUT', body: { name: 'Hana Bekele', email: 'hana@nile.et', role: 'storekeeper', active: true, currentPassword: 'admin123' } });
  assert.equal(updated.response.status, 200);
  assert.equal(updated.data.user.role, 'storekeeper');

  const adminCookie = cookie;
  const cashierLogin = await api('/api/auth/login', { method: 'POST', body: { email: 'cashier@nile.et', password: 'cashier123' } });
  assert.equal(cashierLogin.response.status, 200);
  assert.ok(cashierLogin.data.user.permissions.includes('pos:sell'));
  const forbiddenUsers = await api('/api/users');
  assert.equal(forbiddenUsers.response.status, 403);
  const forbiddenPurchase = await api('/api/purchases');
  assert.equal(forbiddenPurchase.response.status, 403);
  cookie = adminCookie;

  const audit = await api('/api/audit-logs');
  assert.equal(audit.response.status, 200);
  assert.ok(audit.data.logs.some((log) => log.action === 'user.created'));
  assert.ok(audit.data.logs.some((log) => log.action === 'user.updated'));

  const backup = await api('/api/backups', { method: 'POST' });
  assert.equal(backup.response.status, 201);
  assert.match(backup.data.backup.filename, /^nile-stock-.+\.backup\.json$/);
  assert.equal(backup.data.backup.checksum.length, 64);
  const backups = await api('/api/backups');
  assert.equal(backups.response.status, 200);
  assert.equal(backups.data.backups.length, 1);

  const changed = await api('/api/auth/change-password', { method: 'POST', body: { currentPassword: 'admin123', newPassword: 'NileAdminPassphrase2026!' } });
  assert.equal(changed.response.status, 200);
  const expired = await api('/api/auth/me');
  assert.equal(expired.response.status, 401);
  const oldLogin = await api('/api/auth/login', { method: 'POST', body: { email: 'admin@nile.et', password: 'admin123' } });
  assert.equal(oldLogin.response.status, 401);
  const newLogin = await api('/api/auth/login', { method: 'POST', body: { email: 'admin@nile.et', password: 'NileAdminPassphrase2026!' } });
  assert.equal(newLogin.response.status, 200);
});
