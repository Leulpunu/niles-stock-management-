import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const debugPort = process.env.EDGE_DEBUG_PORT || '9333';
const targets = await fetch(`http://127.0.0.1:${debugPort}/json/list`).then((response) => response.json());
const target = targets.find((item) => item.type === 'page' && item.url.includes('127.0.0.1:3000')) || targets.find((item) => item.type === 'page');
if (!target) throw new Error('No browser page target found.');

const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolveOpen, reject) => {
  socket.addEventListener('open', resolveOpen, { once: true });
  socket.addEventListener('error', reject, { once: true });
});

let sequence = 0;
const pending = new Map();
const exceptions = [];
socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    const { resolve: done, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(message.error.message)); else done(message.result);
  }
  if (message.method === 'Runtime.exceptionThrown') exceptions.push(message.params.exceptionDetails.text);
});

function call(method, params = {}) {
  const id = ++sequence;
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolveCall, reject) => pending.set(id, { resolve: resolveCall, reject }));
}

async function evaluate(expression) {
  const result = await call('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
  return result.result.value;
}

await call('Runtime.enable');
await call('Page.enable');
for (let attempt = 0; attempt < 30; attempt += 1) {
  const loginReady = await evaluate(`Boolean(document.querySelector('#login-form'))`);
  if (loginReady) break;
  await new Promise((resolveWait) => setTimeout(resolveWait, 100));
}
await evaluate(`(() => {
  document.querySelector('#login-email').value = 'admin@nile.et';
  document.querySelector('#login-password').value = 'admin123';
  document.querySelector('#login-form').requestSubmit();
  return true;
})()`);

let ready = false;
for (let attempt = 0; attempt < 50; attempt += 1) {
  await new Promise((resolveWait) => setTimeout(resolveWait, 100));
  ready = await evaluate(`!document.querySelector('#app').classList.contains('hidden') && document.querySelectorAll('.metric-card').length === 4`);
  if (ready) break;
}

if (!ready) {
  const diagnostic = await evaluate(`({
    appHidden: document.querySelector('#app')?.classList.contains('hidden'),
    loginHidden: document.querySelector('#login-screen')?.classList.contains('hidden'),
    loginError: document.querySelector('#login-error')?.textContent,
    pageTitle: document.querySelector('#page-title')?.textContent,
    content: document.querySelector('#page-content')?.textContent?.slice(0, 500),
    hash: location.hash
  })`);
  throw new Error(`Dashboard did not render after login: ${JSON.stringify(diagnostic)}; exceptions: ${exceptions.join('; ')}`);
}
const result = await evaluate(`({
  pageTitle: document.querySelector('#page-title')?.textContent,
  metrics: document.querySelectorAll('.metric-card').length,
  navItems: document.querySelectorAll('.nav-item').length,
  branchOptions: document.querySelectorAll('#branch-selector option').length,
  hasRecentSales: document.body.textContent.includes('Recent sales'),
  loginError: document.querySelector('#login-error')?.textContent
})`);
if (result.pageTitle !== 'Dashboard' || result.metrics !== 4 || result.branchOptions < 1 || !result.hasRecentSales || result.loginError) {
  throw new Error(`Unexpected dashboard state: ${JSON.stringify(result)}`);
}
if (exceptions.length) throw new Error(`Browser exceptions: ${exceptions.join('; ')}`);

const screenshot = await call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
await writeFile(resolve('dashboard-preview.png'), Buffer.from(screenshot.data, 'base64'));

await evaluate(`document.querySelector('[data-page="pos"]').click()`);
let posReady = false;
for (let attempt = 0; attempt < 50; attempt += 1) {
  await new Promise((resolveWait) => setTimeout(resolveWait, 100));
  posReady = await evaluate(`document.querySelectorAll('.product-tile').length > 0 && Boolean(document.querySelector('.pos-cart'))`);
  if (posReady) break;
}
if (!posReady) throw new Error('Point of sale did not render product tiles and cart.');
await evaluate(`document.querySelector('.product-tile:not(:disabled)').click()`);
const cartLines = await evaluate(`document.querySelectorAll('.cart-line').length`);
if (cartLines !== 1) throw new Error('Adding a product to the POS cart failed.');
await evaluate(`document.querySelector('#checkout-button').click()`);
await evaluate(`document.querySelector('[data-payment-method="Bank Transfer"]').click()`);
const bankOptions = await evaluate(`document.querySelectorAll('[data-pay-field="bankName"] option').length`);
if (bankOptions !== 33) throw new Error(`Expected 32 Ethiopian banks plus the prompt, found ${bankOptions - 1}.`);
await evaluate(`document.querySelector('.modal-close').click()`);

await evaluate(`document.querySelector('[data-page="inventory"]').click()`);
let inventoryReady = false;
for (let attempt = 0; attempt < 50; attempt += 1) {
  await new Promise((resolveWait) => setTimeout(resolveWait, 100));
  inventoryReady = await evaluate(`document.querySelectorAll('#inventory-body tr').length >= 10`);
  if (inventoryReady) break;
}
if (!inventoryReady) throw new Error('Inventory table did not render seeded products.');
const operationsReady = await evaluate(`Boolean(document.querySelector('#stock-count-button'))`);
if (!operationsReady) throw new Error('Physical stock count control did not render.');
await evaluate(`document.querySelector('[data-page="sales"]').click()`);
let salesOperationsReady = false;
for (let attempt = 0; attempt < 50; attempt += 1) {
  await new Promise((resolveWait) => setTimeout(resolveWait, 100));
  salesOperationsReady = await evaluate(`Boolean(document.querySelector('#new-quote-button')) && Boolean(document.querySelector('#quotes-table')) && Boolean(document.querySelector('#returns-table'))`);
  if (salesOperationsReady) break;
}
if (!salesOperationsReady) throw new Error('Quotation and return controls did not render.');
await evaluate(`document.querySelector('[data-page="payments"]').click()`);
let expenseReady = false;
for (let attempt = 0; attempt < 50; attempt += 1) {
  await new Promise((resolveWait) => setTimeout(resolveWait, 100));
  expenseReady = await evaluate(`Boolean(document.querySelector('#add-expense-button'))`);
  if (expenseReady) break;
}
if (!expenseReady) throw new Error('Operating expense control did not render.');
await evaluate(`document.querySelector('[data-page="settings"]').click()`);
let securityReady = false;
for (let attempt = 0; attempt < 50; attempt += 1) {
  await new Promise((resolveWait) => setTimeout(resolveWait, 100));
  securityReady = await evaluate(`Boolean(document.querySelector('#add-employee')) && document.querySelectorAll('[data-edit-employee]').length >= 2 && Boolean(document.querySelector('#export-audit')) && Boolean(document.querySelector('#add-branch')) && Boolean(document.querySelector('#default-branch'))`);
  if (securityReady) break;
}
if (!securityReady) throw new Error('Employee and audit security settings did not render.');
await evaluate(`document.querySelector('#account-button').click()`);
const passwordSecurityReady = await evaluate(`Boolean(document.querySelector('#password-form input[name="currentPassword"]')) && document.querySelector('#new-password')?.minLength === 12`);
if (!passwordSecurityReady) throw new Error('Account password security form did not render correctly.');
await evaluate(`document.querySelector('.modal-close').click()`);
if (exceptions.length) throw new Error(`Browser exceptions: ${exceptions.join('; ')}`);
socket.close();
console.log(JSON.stringify({ ok: true, ...result, posCartLines: cartLines, bankCount: bankOptions - 1, inventoryReady, operationsReady, salesOperationsReady, expenseReady, securityReady, passwordSecurityReady }));
