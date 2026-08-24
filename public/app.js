const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const icons = {
  dashboard: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
  inventory: '<path d="m7.5 4.3 9 5.2v10l-9 5.2-9-5.2v-10z" transform="translate(4 -2.5) scale(.8)"/><path d="m5 8 7 4 7-4M12 12v8"/>',
  sale: '<path d="M6 2h12l2 5-2 3H6L4 7z"/><path d="M5 10v10h14V10M9 20v-6h6v6"/>',
  receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 7h6M9 11h6M9 15h3"/>',
  purchase: '<path d="M3 5h2l2 10h10l2-7H6M9 19h.01M17 19h.01"/>',
  people: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  payments: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h2"/>',
  reports: '<path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1 1.55V21h-4v-.08a1.7 1.7 0 0 0-1.1-1.55 1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.55-1H3v-4h.08A1.7 1.7 0 0 0 4.63 9 1.7 1.7 0 0 0 4.3 7.1l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6h.02A1.7 1.7 0 0 0 10 3.08V3h4v.08A1.7 1.7 0 0 0 15 4.63a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9v.02A1.7 1.7 0 0 0 20.92 10H21v4h-.08A1.7 1.7 0 0 0 19.4 15z"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  eye: '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12"/><circle cx="12" cy="12" r="2.5"/>',
  'eye-off': '<path d="m3 3 18 18M10.6 6.2c.45-.13.92-.2 1.4-.2 6.5 0 10 6 10 6a17 17 0 0 1-2.2 2.9M6.6 6.7C3.6 8.5 2 12 2 12s3.5 6 10 6c1.7 0 3.1-.4 4.3-1M10 10a3 3 0 0 0 4 4"/>',
  'arrow-right': '<path d="M5 12h14M13 6l6 6-6 6"/>',
  'arrow-up': '<path d="m18 15-6-6-6 6"/>',
  'arrow-down': '<path d="m6 9 6 6 6-6"/>',
  sparkles: '<path d="m12 3-1 3-3 1 3 1 1 3 1-3 3-1-3-1zM5 14l-1 2-2 1 2 1 1 2 1-2 2-1-2-1zM18 13l-1 3-3 1 3 1 1 3 1-3 3-1-3-1z"/>',
  headphones: '<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><path d="M4 14h3v6H5a2 2 0 0 1-2-2v-2a2 2 0 0 1 1-2ZM20 14h-3v6h2a2 2 0 0 0 2-2v-2a2 2 0 0 0-1-2Z"/>',
  logout: '<path d="M10 17l5-5-5-5M15 12H3M14 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  package: '<path d="m21 8-9-5-9 5 9 5zM3 8v8l9 5 9-5V8M12 13v8"/>',
  cart: '<circle cx="9" cy="20" r="1"/><circle cx="19" cy="20" r="1"/><path d="M3 4h2l2.6 11.4a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L21 8H6"/>',
  wallet: '<path d="M20 7V5a2 2 0 0 0-2-2H5a3 3 0 0 0 0 6h16v10a2 2 0 0 1-2 2H5a3 3 0 0 1-3-3V6"/><path d="M16 13h2"/>',
  bank: '<path d="m3 10 9-6 9 6M5 10v8M9 10v8M15 10v8M19 10v8M3 21h18M2 18h20"/>',
  phone: '<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>',
  card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
  chapa: '<path d="M7 4h10l4 8-4 8H7l-4-8z"/><path d="m10 8-2 4 2 4M14 8l2 4-2 4"/>',
  edit: '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4z"/>',
  sliders: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
  history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>',
  more: '<circle cx="5" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="19" cy="12" r="1" fill="currentColor"/>',
  printer: '<path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
  download: '<path d="M12 3v13M7 11l5 5 5-5M5 21h14"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  truck: '<path d="M10 17h4V5H2v12h3M14 9h4l4 4v4h-3M7.5 20a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM16.5 20a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"/>',
  pin: '<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  alert: '<path d="M10.3 3.4 2 18a2 2 0 0 0 1.7 3h16.6a2 2 0 0 0 1.7-3L13.7 3.4a2 2 0 0 0-3.4 0ZM12 9v4M12 17h.01"/>',
  tag: '<path d="M20.6 13.6 11 4H4v7l9.6 9.6a2 2 0 0 0 2.8 0l4.2-4.2a2 2 0 0 0 0-2.8Z"/><circle cx="7.5" cy="7.5" r=".8" fill="currentColor"/>',
  wrench: '<path d="M14.7 6.3a4 4 0 0 0-5-5l2.1 2.1-2.4 2.4-2.1-2.1a4 4 0 0 0 5 5l6.7 6.7a2 2 0 0 1-2.8 2.8l-6.7-6.7a4 4 0 0 0-5-5"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  money: '<circle cx="12" cy="12" r="9"/><path d="M16 8h-6a2 2 0 0 0 0 4h4a2 2 0 0 1 0 4H8M12 6v12"/>',
  profit: '<path d="M3 17 9 11l4 4 8-9"/><path d="M14 6h7v7"/>',
  database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v6c0 1.7 4 3 9 3s9-1.3 9-3V5M3 11v6c0 1.7 4 3 9 3s9-1.3 9-3v-6"/>',
  vat: '<path d="M19 5 5 19M7 5h.01M17 19h.01"/><circle cx="7" cy="5" r="2"/><circle cx="17" cy="19" r="2"/>',
  arrowup: '<path d="M12 19V5M5 12l7-7 7 7"/>',
  arrowdown: '<path d="M12 5v14M19 12l-7 7-7-7"/>'
};

function icon(name) {
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[name] || icons.package}</svg>`;
}

function applyIcons(root = document) {
  $$('[data-icon]', root).forEach((node) => { node.innerHTML = icon(node.dataset.icon); });
  $$('[data-icon-button]', root).forEach((node) => {
    let holder = node.querySelector(':scope > i[data-rendered-icon]');
    if (!holder) {
      holder = document.createElement('i');
      holder.dataset.renderedIcon = 'true';
      node.prepend(holder);
    }
    holder.innerHTML = icon(node.dataset.iconButton);
  });
}

const state = {
  user: null, settings: null, banks: [], categories: [], customers: [], suppliers: [], currentPage: 'dashboard',
  products: [], sales: [], purchases: [], returns: [], quotes: [], expenses: [], stockCounts: [], transfers: [], branches: [], allBranches: [], parties: [], payments: [], users: [], auditLogs: [], backups: [], storage: null, readiness: null, currentBranchId: '',
  cart: [], posCategory: 'All', posSearch: '', peopleType: 'customer', inventoryFilter: 'all'
};

const pageMeta = {
  dashboard: ['Dashboard', 'Here’s what’s happening in your store today.'],
  inventory: ['Inventory', 'Manage parts, pricing and stock levels.'],
  pos: ['Point of sale', 'Create a fast, accurate customer sale.'],
  sales: ['Sales & invoices', 'Track invoices, balances and payment status.'],
  purchases: ['Purchases', 'Receive stock and manage supplier bills.'],
  people: ['Customers & suppliers', 'Keep every business relationship organized.'],
  payments: ['Payments', 'Review money received and supplier payments.'],
  reports: ['Reports', 'Understand sales, profit and inventory performance.'],
  settings: ['Settings', 'Configure your business and tax preferences.']
};

const navItems = [
  ['MAIN', 'dashboard', 'dashboard', 'Dashboard', 'dashboard:view'],
  ['', 'inventory', 'inventory', 'Inventory', 'inventory:view'],
  ['', 'pos', 'sale', 'Point of sale', 'pos:sell'],
  ['', 'sales', 'receipt', 'Sales & invoices', 'sales:view'],
  ['OPERATIONS', 'purchases', 'purchase', 'Purchases', 'purchases:view'],
  ['', 'people', 'people', 'Customers & suppliers', 'people:view'],
  ['', 'payments', 'payments', 'Payments', 'payments:view'],
  ['INSIGHTS', 'reports', 'reports', 'Reports', 'reports:view'],
  ['', 'settings', 'settings', 'Settings', 'settings:manage']
];

function esc(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
}

const num = (value) => Number(value) || 0;
const round = (value) => Math.round((num(value) + Number.EPSILON) * 100) / 100;
const formatMoney = (value, compact = false) => {
  const amount = num(value);
  if (compact && Math.abs(amount) >= 1_000_000) return `ETB ${(amount / 1_000_000).toFixed(1)}M`;
  if (compact && Math.abs(amount) >= 1000) return `ETB ${(amount / 1000).toFixed(1)}K`;
  return new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB', minimumFractionDigits: 2 }).format(amount).replace('ETB', 'ETB ');
};
const formatDate = (value, detailed = false) => new Intl.DateTimeFormat('en-ET', detailed ? { dateStyle: 'medium', timeStyle: 'short' } : { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));
const initials = (name) => String(name || 'N').split(/\s+/).map((word) => word[0]).slice(0, 2).join('').toUpperCase();
const productById = (id) => state.products.find((item) => item.id === id);
const customerById = (id) => state.customers.find((item) => item.id === id);
const bankOptions = (selected = '') => `<option value="">Select Ethiopian bank</option>${state.banks.map((bank) => `<option value="${esc(bank)}" ${bank === selected ? 'selected' : ''}>${esc(bank)}</option>`).join('')}`;
const can = (permission) => state.user?.permissions?.includes('*') || state.user?.permissions?.includes(permission);
const pagePermission = (page) => navItems.find((item) => item[1] === page)?.[4];
const branchPath = (path) => `${path}${path.includes('?') ? '&' : '?'}branchId=${encodeURIComponent(state.currentBranchId)}`;
const currentBranch = () => state.branches.find((branch) => branch.id === state.currentBranchId);

async function request(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    body: options.body && typeof options.body !== 'string' ? JSON.stringify(options.body) : options.body
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && state.user) showLogin();
    const error = new Error(result.error || 'Something went wrong.');
    error.status = response.status;
    throw error;
  }
  return result;
}

function toast(title, message = '', type = 'success') {
  const root = $('#toast-root');
  const node = document.createElement('div');
  node.className = `toast ${type}`;
  node.innerHTML = `<i>${icon(type === 'error' ? 'alert' : 'check')}</i><div><strong>${esc(title)}</strong>${message ? `<span>${esc(message)}</span>` : ''}</div><button aria-label="Dismiss">${icon('close')}</button>`;
  root.append(node);
  $('button', node).onclick = () => node.remove();
  setTimeout(() => node.remove(), 4500);
}

function setBusy(button, busy, label = 'Saving...') {
  if (!button) return;
  if (busy) { button.dataset.label = button.innerHTML; button.disabled = true; button.textContent = label; }
  else { button.disabled = false; button.innerHTML = button.dataset.label || button.innerHTML; applyIcons(button); }
}

function showLogin() {
  state.user = null;
  $('#app').classList.add('hidden');
  $('#login-screen').classList.remove('hidden');
}

async function startApp(data) {
  state.user = data.user;
  state.settings = data.settings;
  $('#login-screen').classList.add('hidden');
  $('#app').classList.remove('hidden');
  await loadBootstrap();
  renderNav();
  renderUser();
  $('#quick-sale-button').classList.toggle('hidden', !can('pos:sell'));
  navigate(location.hash.slice(1) || 'dashboard');
}

async function loadBootstrap() {
  const data = await request('/api/bootstrap');
  Object.assign(state, data);
  state.settings = data.settings;
  const savedBranch = localStorage.getItem('nile_branch');
  if (!state.currentBranchId || !state.branches.some((branch) => branch.id === state.currentBranchId)) state.currentBranchId = state.branches.some((branch) => branch.id === savedBranch) ? savedBranch : (state.settings.defaultBranchId || state.branches[0]?.id || '');
  renderBranchSelector();
}

function renderBranchSelector() {
  const select = $('#branch-selector'); if (!select) return;
  select.innerHTML = state.branches.map((branch) => `<option value="${branch.id}" ${branch.id === state.currentBranchId ? 'selected' : ''}>${esc(branch.code)} · ${esc(branch.name)}</option>`).join('');
  select.onchange = async () => {
    state.currentBranchId = select.value; localStorage.setItem('nile_branch', state.currentBranchId); state.products = []; state.sales = []; state.cart = [];
    toast('Branch changed', `${currentBranch()?.name || 'Branch'} is now active.`); await navigate(state.currentPage);
  };
}

function renderNav() {
  let html = '';
  for (const [group, key, iconName, label, permission] of navItems) {
    if (permission && !can(permission)) continue;
    if (group) html += `<div class="nav-group-label">${group}</div>`;
    const badge = key === 'inventory' ? '<span class="nav-badge hidden" id="nav-stock-badge">0</span>' : '';
    html += `<button class="nav-item ${state.currentPage === key ? 'active' : ''}" data-page="${key}"><i>${icon(iconName)}</i><span>${label}</span>${badge}</button>`;
  }
  $('#main-nav').innerHTML = html;
  $$('[data-page]', $('#main-nav')).forEach((button) => button.onclick = () => navigate(button.dataset.page));
}

function renderUser() {
  $('#sidebar-user').innerHTML = `<span class="avatar">${esc(initials(state.user.name))}</span><button id="account-button" class="user-copy" title="Account security"><strong>${esc(state.user.name)}</strong><span>${esc(state.user.role)} · Account</span></button><button id="logout-button" class="icon-btn" title="Sign out">${icon('logout')}</button>`;
  $('#account-button').onclick = openAccountSecurityModal;
  $('#logout-button').onclick = logout;
}

async function logout() {
  try { await request('/api/auth/logout', { method: 'POST' }); } catch {}
  showLogin();
}

function updateHeader(page) {
  const [title, subtitle] = pageMeta[page] || pageMeta.dashboard;
  $('#page-title').textContent = title;
  $('#page-subtitle').textContent = subtitle;
  document.title = `${title} — Nile Stock`;
  $$('.nav-item').forEach((item) => item.classList.toggle('active', item.dataset.page === page));
}

function loading() {
  $('#page-content').innerHTML = `<div class="page-loading">${Array.from({ length: 4 }, () => '<div class="skeleton"></div>').join('')}</div>`;
}

async function navigate(page) {
  if (!pageMeta[page] || (pagePermission(page) && !can(pagePermission(page)))) page = 'dashboard';
  state.currentPage = page;
  location.hash = page;
  updateHeader(page);
  closeSidebar();
  loading();
  try {
    const render = { dashboard: renderDashboard, inventory: renderInventory, pos: renderPOS, sales: renderSales, purchases: renderPurchases, people: renderPeople, payments: renderPayments, reports: renderReports, settings: renderSettings }[page];
    await render();
    $('#page-content').focus({ preventScroll: true });
  } catch (error) {
    $('#page-content').innerHTML = `<div class="card empty-state"><div class="empty-icon">${icon('alert')}</div><h3>We couldn’t load this page</h3><p>${esc(error.message)}</p><button class="button secondary small" id="retry-page" style="margin-top:14px">Try again</button></div>`;
    $('#retry-page').onclick = () => navigate(page);
  }
}

function closeSidebar() {
  $('#sidebar').classList.remove('open');
  $('#sidebar-overlay').classList.remove('visible');
}

function emptyRow(columns, title = 'Nothing here yet', message = 'Records will appear here when you add them.') {
  return `<tr><td colspan="${columns}"><div class="empty-state"><div class="empty-icon">${icon('package')}</div><h3>${esc(title)}</h3><p>${esc(message)}</p></div></td></tr>`;
}

function statusBadge(status) {
  const label = status === 'credit' ? 'Unpaid' : status.replaceAll('-', ' ');
  return `<span class="badge ${esc(status)}">${esc(label)}</span>`;
}

function openModal({ title, subtitle = '', content, footer = '', size = '' }) {
  const root = $('#modal-root');
  root.innerHTML = `<div class="modal-backdrop"><section class="modal ${size}" role="dialog" aria-modal="true" aria-labelledby="modal-title"><header class="modal-head"><div><h2 id="modal-title">${esc(title)}</h2>${subtitle ? `<p>${esc(subtitle)}</p>` : ''}</div><button class="icon-btn modal-close" aria-label="Close">${icon('close')}</button></header><div class="modal-body">${content}</div>${footer ? `<footer class="modal-foot">${footer}</footer>` : ''}</section></div>`;
  $('.modal-close', root).onclick = closeModal;
  $('.modal-backdrop', root).onclick = (event) => { if (event.target.classList.contains('modal-backdrop')) closeModal(); };
  document.addEventListener('keydown', modalEscape);
  return root;
}

function modalEscape(event) { if (event.key === 'Escape') closeModal(); }
function closeModal() { $('#modal-root').innerHTML = ''; document.removeEventListener('keydown', modalEscape); }

async function renderDashboard() {
  const data = await request(branchPath('/api/dashboard'));
  const max = Math.max(...data.salesChart.map((item) => item.total), 1);
  const monthTotal = data.metrics.monthRevenue;
  $('#alert-dot').classList.toggle('visible', data.metrics.lowStockCount > 0);
  const navBadge = $('#nav-stock-badge');
  if (navBadge) { navBadge.textContent = data.metrics.lowStockCount; navBadge.classList.toggle('hidden', !data.metrics.lowStockCount); }
  $('#page-content').innerHTML = `
    <div class="page-head"><div><h2>Selam, ${esc(state.user.name.split(' ')[0])} 👋</h2><p>${new Intl.DateTimeFormat('en-ET', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date())}</p></div><div class="head-actions"><button class="button secondary" data-go="inventory">${icon('package')} View inventory</button><button class="button primary" data-go="pos">${icon('plus')} New sale</button></div></div>
    <section class="metrics-grid">
      ${metricCard('money', formatMoney(data.metrics.todayRevenue, true), 'Today’s revenue', `${data.metrics.todayOrders} orders`, 'lime')}
      ${metricCard('profit', formatMoney(data.metrics.monthRevenue, true), 'This month', 'Gross sales', '')}
      ${metricCard('database', formatMoney(data.metrics.inventoryValue, true), 'Inventory value', `${state.products.length || 'All'} active items`, 'blue')}
      ${metricCard('alert', String(data.metrics.lowStockCount), 'Low-stock items', 'Need attention', 'amber')}
    </section>
    <section class="dashboard-grid">
      <article class="card chart-card"><header class="card-header"><div><h3>Sales overview</h3><p>Revenue over the last 7 days</p></div><div class="chart-summary"><div><strong>${formatMoney(monthTotal, true)}</strong><span>This month</span></div><div><strong>${data.salesChart.reduce((sum, day) => sum + day.count, 0)}</strong><span>7-day orders</span></div></div></header><div class="card-body"><div class="bar-chart">${data.salesChart.map((item) => `<div class="bar-col"><div class="bar" style="height:${Math.max(3, item.total / max * 160)}px" data-value="${formatMoney(item.total)}"></div><label>${new Intl.DateTimeFormat('en', { weekday: 'short' }).format(new Date(item.date))}</label></div>`).join('')}</div></div></article>
      <article class="card"><header class="card-header"><div><h3>Stock alerts</h3><p>Items at or below reorder level</p></div><button class="link-button" data-go="inventory">View all</button></header><div class="stock-list">${data.lowStock.length ? data.lowStock.map((product) => `<div class="stock-alert-row"><span class="part-thumb">${icon('wrench')}</span><div><strong title="${esc(product.name)}">${esc(product.name)}</strong><span>${esc(product.sku)} · Reorder at ${product.reorderLevel}</span></div><strong class="stock-count">${product.stock} left</strong></div>`).join('') : '<div class="empty-state" style="padding:45px 10px"><div class="empty-icon">' + icon('check') + '</div><h3>Stock looks healthy</h3><p>No items need reordering.</p></div>'}</div></article>
    </section>
    <section class="card"><header class="card-header"><div><h3>Recent sales</h3><p>Latest invoices from your team</p></div><button class="link-button" data-go="sales">View all sales</button></header>${salesTable(data.recentSales, true)}</section>
    <section class="card" style="margin-top:16px"><header class="card-header"><div><h3>Quick actions</h3><p>Common tasks, one click away</p></div></header><div class="quick-actions">
      ${quickAction('sale', 'Create sale', 'Open the point of sale', 'pos')}
      ${quickAction('package', 'Add product', 'Create a stock item', 'add-product')}
      ${quickAction('purchase', 'Receive stock', 'Record a supplier purchase', 'add-purchase')}
      ${quickAction('people', 'Add contact', 'Customer or supplier', 'add-party')}
    </div></section>`;
  $$('[data-go]', $('#page-content')).forEach((button) => button.onclick = () => navigate(button.dataset.go));
  $$('[data-action]', $('#page-content')).forEach((button) => button.onclick = () => quickActionRun(button.dataset.action));
}

function metricCard(iconName, value, label, detail, tone) {
  return `<article class="card metric-card"><div class="metric-top"><span class="metric-icon ${tone}">${icon(iconName)}</span><span class="trend">Live</span></div><h3>${value}</h3><p>${esc(label)} · ${esc(detail)}</p></article>`;
}

function quickAction(iconName, title, desc, action) {
  return `<button class="quick-action" data-action="${action}"><i>${icon(iconName)}</i><div><strong>${title}</strong><span>${desc}</span></div></button>`;
}

async function quickActionRun(action) {
  if (action === 'pos') return navigate('pos');
  if (action === 'add-product') { if (!can('inventory:manage')) return toast('Permission required', 'Your role cannot create products.', 'error'); await ensureProducts(); return openProductModal(); }
  if (action === 'add-purchase') { if (!can('purchases:manage')) return toast('Permission required', 'Your role cannot receive purchases.', 'error'); await Promise.all([ensureProducts(), loadBootstrap()]); return openPurchaseModal(); }
  if (action === 'add-party') return openPartyModal();
}

async function ensureProducts(force = false) {
  if (!state.products.length || force) state.products = (await request(branchPath('/api/products'))).products;
  return state.products;
}

async function renderInventory() {
  await ensureProducts(true);
  const categories = ['All', ...new Set(state.products.map((product) => product.category))];
  $('#page-content').innerHTML = `
    <div class="page-head"><div><h2>Parts inventory</h2><p>${state.products.length} products · ${state.products.reduce((sum, p) => sum + p.stock, 0)} units at ${esc(currentBranch()?.name || 'this branch')}</p></div><div class="head-actions"><button class="button secondary" id="movement-button">${icon('history')} Stock history</button>${can('inventory:manage') ? `${state.branches.length > 1 ? `<button class="button secondary" id="transfer-stock-button">${icon('truck')} Transfer stock</button>` : ''}<button class="button secondary" id="stock-count-button">${icon('check')} Stock count</button><button class="button primary" id="add-product-button">${icon('plus')} Add product</button>` : ''}</div></div>
    <div class="toolbar"><div class="toolbar-left"><label class="search-box"><i>${icon('search')}</i><input id="inventory-search" placeholder="Search name, SKU, barcode..."></label><select id="category-filter" class="filter-select">${categories.map((category) => `<option>${esc(category)}</option>`).join('')}</select><select id="stock-filter" class="filter-select"><option value="all">All stock</option><option value="low">Low stock</option><option value="out">Out of stock</option><option value="healthy">Healthy stock</option></select></div><div class="toolbar-right"><span class="muted" id="inventory-count" style="font-size:10px"></span></div></div>
    <section class="card"><div class="table-wrap"><table class="data-table"><thead><tr><th>Product</th><th>SKU / Barcode</th><th>Category</th><th>Cost</th><th>Selling price</th><th>Stock</th><th>Location</th><th></th></tr></thead><tbody id="inventory-body"></tbody></table></div><div class="table-footer"><span id="inventory-footer"></span><span>Inventory value ${formatMoney(state.products.reduce((sum, p) => sum + p.stockValue, 0))}</span></div></section>`;
  const update = () => {
    const query = $('#inventory-search').value.trim().toLowerCase();
    const category = $('#category-filter').value;
    const stock = $('#stock-filter').value;
    const filtered = state.products.filter((product) => {
      const matchesSearch = !query || [product.name, product.sku, product.barcode, product.brand, product.compatibility].join(' ').toLowerCase().includes(query);
      const matchesCategory = category === 'All' || product.category === category;
      const matchesStock = stock === 'all' || (stock === 'low' && product.stock <= product.reorderLevel && product.stock > 0) || (stock === 'out' && product.stock === 0) || (stock === 'healthy' && product.stock > product.reorderLevel);
      return matchesSearch && matchesCategory && matchesStock;
    });
    $('#inventory-count').textContent = `${filtered.length} result${filtered.length === 1 ? '' : 's'}`;
    $('#inventory-footer').textContent = `Showing ${filtered.length} of ${state.products.length} products`;
    $('#inventory-body').innerHTML = filtered.length ? filtered.map(productRow).join('') : emptyRow(8, 'No matching products', 'Try changing your filters or search term.');
    $$('[data-edit-product]').forEach((button) => button.onclick = () => openProductModal(productById(button.dataset.editProduct)));
    $$('[data-adjust-product]').forEach((button) => button.onclick = () => openAdjustmentModal(productById(button.dataset.adjustProduct)));
  };
  $('#inventory-search').oninput = update;
  $('#category-filter').onchange = update;
  $('#stock-filter').onchange = update;
  $('#movement-button').onclick = openMovementsModal;
  if ($('#transfer-stock-button')) $('#transfer-stock-button').onclick = openTransferModal;
  if ($('#stock-count-button')) $('#stock-count-button').onclick = openStockCountModal;
  if ($('#add-product-button')) $('#add-product-button').onclick = () => openProductModal();
  update();
}

function productRow(product) {
  const status = product.stock === 0 ? 'out-of-stock' : product.stock <= product.reorderLevel ? 'low' : 'in-stock';
  const max = Math.max(product.reorderLevel * 3, product.stock, 1);
  return `<tr><td><div class="primary-cell"><span class="part-thumb">${icon('wrench')}</span><div><strong title="${esc(product.name)}">${esc(product.name)}</strong><span>${esc(product.brand || 'No brand')} · ${esc(product.compatibility || 'Universal')}</span></div></div></td><td><span class="sku">${esc(product.sku)}</span><br><span class="faint" style="font-size:8px">${esc(product.barcode || '—')}</span></td><td>${esc(product.category)}</td><td class="money">${formatMoney(product.costPrice)}</td><td class="money">${formatMoney(product.sellingPrice)}<br><span class="faint" style="font-size:8px">${product.margin}% margin</span></td><td><div class="stock-level ${status === 'low' || status === 'out-of-stock' ? 'low' : ''}"><strong>${product.stock}</strong><span class="stock-track"><span style="width:${Math.min(100, product.stock / max * 100)}%"></span></span></div><span class="faint" style="font-size:8px">${status.replaceAll('-', ' ')}</span></td><td>${esc(product.location || '—')}</td><td><div class="row-actions">${can('inventory:manage') ? `<button class="icon-btn" title="Adjust stock" data-adjust-product="${product.id}">${icon('sliders')}</button><button class="icon-btn" title="Edit product" data-edit-product="${product.id}">${icon('edit')}</button>` : ''}</div></td></tr>`;
}

function openProductModal(product = null) {
  if (!can('inventory:manage')) return;
  const categories = [...new Set(state.products.map((item) => item.category))];
  openModal({
    title: product ? 'Edit product' : 'Add new product', subtitle: product ? `Update ${product.sku}` : 'Create a spare part and opening balance', size: 'large',
    content: `<form id="product-form"><div class="form-grid">
      <div class="form-field"><label>Product name <em>*</em></label><input name="name" value="${esc(product?.name || '')}" placeholder="e.g. Front brake pad set" required></div>
      <div class="form-field"><label>SKU <em>*</em></label><input name="sku" value="${esc(product?.sku || '')}" placeholder="e.g. BRK-001" required></div>
      <div class="form-field"><label>Category <em>*</em></label><input name="category" value="${esc(product?.category || '')}" list="category-list" placeholder="Brake System" required><datalist id="category-list">${categories.map((item) => `<option value="${esc(item)}">`).join('')}</datalist></div>
      <div class="form-field"><label>Brand</label><input name="brand" value="${esc(product?.brand || '')}" placeholder="e.g. Denso"></div>
      <div class="form-field full"><label>Vehicle compatibility</label><input name="compatibility" value="${esc(product?.compatibility || '')}" placeholder="Make, model and year range"></div>
      <div class="form-field"><label>Cost price (ETB)</label><input name="costPrice" type="number" min="0" step="0.01" value="${product?.costPrice ?? ''}" required></div>
      <div class="form-field"><label>Selling price (ETB) <em>*</em></label><input name="sellingPrice" type="number" min="0.01" step="0.01" value="${product?.sellingPrice ?? ''}" required></div>
      ${product ? '' : `<div class="form-field"><label>Opening stock · ${esc(currentBranch()?.code || '')}</label><input name="stock" type="number" min="0" step="1" value="0"></div>`}
      <div class="form-field"><label>Reorder level</label><input name="reorderLevel" type="number" min="0" step="1" value="${product?.reorderLevel ?? state.settings.lowStockDefault}"></div>
      <div class="form-field"><label>Storage location</label><input name="location" value="${esc(product?.location || '')}" placeholder="e.g. A-03"></div>
      <div class="form-field"><label>Barcode</label><input name="barcode" value="${esc(product?.barcode || '')}" placeholder="Scan or enter barcode"></div>
      <div class="form-field"><label>Unit</label><select name="unit">${['pcs','set','pair','litre','box'].map((unit) => `<option ${product?.unit === unit ? 'selected' : ''}>${unit}</option>`).join('')}</select></div>
      <div class="form-field"><label>Tax</label><label class="check-field"><input name="taxable" type="checkbox" ${product?.taxable !== false ? 'checked' : ''}><span>VAT applies to this item</span></label></div>
      ${product ? `<div class="form-field full"><label class="check-field"><input name="active" type="checkbox" ${product.active ? 'checked' : ''}><span>Product is active and available for sale</span></label></div>` : ''}
    </div></form>`,
    footer: `<button class="button secondary modal-cancel">Cancel</button><button class="button primary" id="save-product">${product ? 'Save changes' : 'Add product'}</button>`
  });
  $('.modal-cancel').onclick = closeModal;
  $('#save-product').onclick = async () => {
    const form = $('#product-form'); if (!form.reportValidity()) return;
    const values = Object.fromEntries(new FormData(form));
    values.taxable = Boolean(form.elements.taxable.checked);
    values.branchId = state.currentBranchId;
    if (product) values.active = Boolean(form.elements.active.checked);
    setBusy($('#save-product'), true);
    try {
      await request(product ? `/api/products/${product.id}` : '/api/products', { method: product ? 'PUT' : 'POST', body: values });
      closeModal(); toast(product ? 'Product updated' : 'Product added', `${values.name} is ready.`);
      if (state.currentPage === 'inventory') await renderInventory(); else await navigate('inventory');
    } catch (error) { toast('Could not save product', error.message, 'error'); setBusy($('#save-product'), false); }
  };
}

function openAdjustmentModal(product) {
  openModal({
    title: 'Adjust stock', subtitle: `${product.name} · ${product.stock} ${product.unit} at ${currentBranch()?.name}`,
    content: `<form id="adjust-form"><div class="form-grid"><div class="form-field"><label>Adjustment <em>*</em></label><input name="quantity" type="number" step="1" placeholder="Use + to add or − to remove" required><small>Example: 5 adds stock, -2 removes stock.</small></div><div class="form-field"><label>Reference</label><input name="reference" placeholder="Count, damage, return..."></div><div class="form-field full"><label>Reason / note</label><textarea name="note" placeholder="Explain why this stock changed"></textarea></div></div></form>`,
    footer: `<button class="button secondary modal-cancel">Cancel</button><button class="button primary" id="save-adjustment">Save adjustment</button>`
  });
  $('.modal-cancel').onclick = closeModal;
  $('#save-adjustment').onclick = async () => {
    const form = $('#adjust-form'); if (!form.reportValidity()) return;
    const values = Object.fromEntries(new FormData(form));
    setBusy($('#save-adjustment'), true);
    try { await request(`/api/products/${product.id}/adjust`, { method: 'POST', body: { ...values, branchId: state.currentBranchId } }); closeModal(); toast('Stock adjusted', `${product.name} was updated at ${currentBranch()?.name}.`); await renderInventory(); }
    catch (error) { toast('Could not adjust stock', error.message, 'error'); setBusy($('#save-adjustment'), false); }
  };
}

async function openMovementsModal() {
  const movements = (await request(branchPath('/api/movements'))).movements;
  openModal({ title: 'Stock movement history', subtitle: 'Latest 250 stock changes', size: 'xlarge', content: `<div class="table-wrap"><table class="data-table"><thead><tr><th>Date</th><th>Product</th><th>Type</th><th>Change</th><th>Stock</th><th>Reference</th></tr></thead><tbody>${movements.length ? movements.map((move) => `<tr><td class="no-wrap">${formatDate(move.createdAt, true)}</td><td><strong>${esc(move.product?.name || 'Unknown')}</strong><br><span class="sku">${esc(move.product?.sku || '')}</span></td><td>${statusBadge(move.quantity > 0 ? 'in' : 'out')} <span style="font-size:9px">${esc(move.type)}</span></td><td class="money" style="color:${move.quantity > 0 ? 'var(--primary-2)' : 'var(--red)'}">${move.quantity > 0 ? '+' : ''}${move.quantity}</td><td>${move.before} → <strong>${move.after}</strong></td><td>${esc(move.reference)}</td></tr>`).join('') : emptyRow(6)}</tbody></table></div>` });
}

function openStockCountModal() {
  openModal({ title: 'Complete stock count', subtitle: 'Enter the physical quantity found for each part', size: 'xlarge', content: `<div class="security-callout"><i>${icon('inventory')}</i><div><strong>Physical inventory reconciliation</strong><span>Saving creates an adjustment for every difference and records it in the audit trail.</span></div></div><label class="search-box" style="width:100%;margin-bottom:12px"><i>${icon('search')}</i><input id="count-search" placeholder="Search products while counting..."></label><form id="stock-count-form"><div class="table-wrap stock-count-table"><table class="data-table"><thead><tr><th>Product</th><th>Location</th><th>System qty</th><th style="width:130px">Counted qty</th><th>Difference</th></tr></thead><tbody id="stock-count-body">${state.products.filter((product) => product.active).map((product) => `<tr data-count-row data-search="${esc(`${product.name} ${product.sku} ${product.location}`.toLowerCase())}"><td><strong>${esc(product.name)}</strong><br><span class="sku">${esc(product.sku)}</span></td><td>${esc(product.location || '—')}</td><td><strong>${product.stock}</strong> ${esc(product.unit)}</td><td><input data-counted="${product.id}" data-expected="${product.stock}" type="number" min="0" step="1" value="${product.stock}"></td><td data-count-difference="${product.id}">0</td></tr>`).join('')}</tbody></table></div><div class="form-field" style="margin-top:14px"><label>Count note</label><input id="stock-count-note" placeholder="Team, shelf range, reason..."></div></form>`, footer: `<button class="button secondary modal-cancel">Cancel</button><button class="button primary" id="save-stock-count">Complete count</button>` });
  $('.modal-cancel').onclick = closeModal;
  $('#count-search').oninput = (event) => $$('[data-count-row]').forEach((row) => row.classList.toggle('hidden', !row.dataset.search.includes(event.target.value.toLowerCase())));
  $$('[data-counted]').forEach((input) => input.oninput = () => {
    const difference = num(input.value) - num(input.dataset.expected); const target = $(`[data-count-difference="${input.dataset.counted}"]`);
    target.textContent = `${difference > 0 ? '+' : ''}${difference}`; target.style.color = difference ? (difference > 0 ? 'var(--primary-2)' : 'var(--red)') : '';
  });
  $('#save-stock-count').onclick = async () => {
    const items = $$('[data-counted]').map((input) => ({ productId: input.dataset.counted, counted: input.value }));
    setBusy($('#save-stock-count'), true, 'Reconciling...');
    try { const { stockCount } = await request('/api/stock-counts', { method: 'POST', body: { branchId: state.currentBranchId, items, note: $('#stock-count-note').value } }); closeModal(); toast('Stock count completed', `${stockCount.changedItems} products were adjusted at ${currentBranch()?.name}.`); await renderInventory(); }
    catch (error) { toast('Could not complete count', error.message, 'error'); setBusy($('#save-stock-count'), false); }
  };
}

async function openTransferModal() {
  const destinations = state.branches.filter((branch) => branch.id !== state.currentBranchId);
  if (!destinations.length) return toast('Add another branch first', 'Stock transfers require two active branches.', 'error');
  const recent = (await request(branchPath('/api/transfers'))).transfers;
  const firstProduct = state.products.find((product) => product.active && product.stock > 0);
  if (!firstProduct) return toast('No stock to transfer', `${currentBranch()?.name || 'This branch'} has no available items.`, 'error');
  let lines = [{ productId: firstProduct?.id || '', quantity: 1 }];
  openModal({ title: 'Transfer stock', subtitle: `Move parts from ${currentBranch()?.name}`, size: 'xlarge', content: `<form id="transfer-form"><div class="form-grid"><div class="form-field"><label>From branch</label><input value="${esc(currentBranch()?.name || '')}" disabled></div><div class="form-field"><label>Destination branch <em>*</em></label><select name="toBranchId" required>${destinations.map((branch) => `<option value="${branch.id}">${esc(branch.code)} · ${esc(branch.name)}</option>`).join('')}</select></div><div class="form-field full"><label>Transfer note</label><input name="note" placeholder="Driver, vehicle, delivery or approval reference"></div></div><div class="form-section" style="margin-top:20px">Transfer items</div><div class="line-builder"><div class="line-builder-head"><span>Product</span><span>Available</span><span>Quantity</span><span></span><span></span></div><div id="transfer-lines"></div></div><div class="builder-foot"><button class="button secondary small" type="button" id="add-transfer-line">${icon('plus')} Add line</button></div></form>${recent.length ? `<div class="form-section" style="margin-top:20px">Recent branch transfers</div><div class="table-wrap"><table class="data-table"><thead><tr><th>Transfer</th><th>Route</th><th>Date</th><th>Items</th></tr></thead><tbody>${recent.slice(0, 5).map((transfer) => `<tr><td><strong>${esc(transfer.transferNo)}</strong></td><td>${esc(transfer.fromBranchName)} → ${esc(transfer.toBranchName)}</td><td>${formatDate(transfer.createdAt)}</td><td>${transfer.items.reduce((sum, item) => sum + item.quantity, 0)} units</td></tr>`).join('')}</tbody></table></div>` : ''}`, footer: `<button class="button secondary modal-cancel">Cancel</button><button class="button primary" id="save-transfer">Complete transfer</button>` });
  $('.modal-cancel').onclick = closeModal;
  const renderLines = () => {
    $('#transfer-lines').innerHTML = lines.map((line, index) => { const product = productById(line.productId); return `<div class="line-builder-row"><select data-transfer-product="${index}">${state.products.filter((item) => item.active && item.stock > 0).map((item) => `<option value="${item.id}" ${item.id === line.productId ? 'selected' : ''}>${esc(item.sku)} — ${esc(item.name)}</option>`).join('')}</select><span>${product?.stock || 0} ${esc(product?.unit || '')}</span><input data-transfer-quantity="${index}" type="number" min="1" max="${product?.stock || 0}" step="1" value="${line.quantity}"><span></span><button class="icon-btn" type="button" data-remove-transfer-line="${index}" ${lines.length === 1 ? 'disabled' : ''}>${icon('close')}</button></div>`; }).join('');
    $$('[data-transfer-product]').forEach((select) => select.onchange = () => { lines[num(select.dataset.transferProduct)].productId = select.value; lines[num(select.dataset.transferProduct)].quantity = 1; renderLines(); });
    $$('[data-transfer-quantity]').forEach((input) => input.onchange = () => { lines[num(input.dataset.transferQuantity)].quantity = Math.max(1, Math.floor(num(input.value))); renderLines(); });
    $$('[data-remove-transfer-line]').forEach((button) => button.onclick = () => { lines.splice(num(button.dataset.removeTransferLine), 1); renderLines(); });
  };
  $('#add-transfer-line').onclick = () => { lines.push({ productId: firstProduct?.id || '', quantity: 1 }); renderLines(); };
  $('#save-transfer').onclick = async () => {
    const form = $('#transfer-form'); if (!form.reportValidity()) return;
    setBusy($('#save-transfer'), true, 'Transferring...');
    try { const values = Object.fromEntries(new FormData(form)); const { transfer } = await request('/api/transfers', { method: 'POST', body: { ...values, fromBranchId: state.currentBranchId, items: lines } }); closeModal(); toast('Stock transferred', `${transfer.transferNo} was completed.`); await renderInventory(); }
    catch (error) { toast('Could not transfer stock', error.message, 'error'); setBusy($('#save-transfer'), false); }
  };
  renderLines();
}

async function renderPOS() {
  await ensureProducts(true);
  state.categories = ['All', ...new Set(state.products.map((product) => product.category))];
  renderPOSView();
}

function cartTotals() {
  const subtotal = round(state.cart.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0));
  const discount = Math.min(num($('#pos-discount')?.value || state.cartDiscount || 0), subtotal);
  state.cartDiscount = discount;
  const taxable = state.cart.reduce((sum, line) => sum + (line.product.taxable ? line.quantity * line.unitPrice : 0), 0);
  const tax = state.settings.vatRegistered ? round(taxable * (1 - (subtotal ? discount / subtotal : 0)) * num(state.settings.vatRate) / 100) : 0;
  return { subtotal, discount, tax, total: round(subtotal - discount + tax) };
}

function renderPOSView() {
  const query = state.posSearch.toLowerCase();
  const products = state.products.filter((product) => product.active && (state.posCategory === 'All' || product.category === state.posCategory) && (!query || [product.name, product.sku, product.barcode, product.brand].join(' ').toLowerCase().includes(query)));
  $('#page-content').innerHTML = `<div class="pos-layout"><section class="pos-products"><div class="page-head" style="margin-bottom:0"><div><h2>Select parts</h2><p>Search by part name, SKU or barcode</p></div><span class="muted" style="font-size:10px">${products.length} products</span></div><label class="search-box" style="width:100%;margin-top:13px"><i>${icon('search')}</i><input id="pos-search" value="${esc(state.posSearch)}" placeholder="Search or scan barcode..."></label><div class="category-chips">${state.categories.map((category) => `<button class="chip ${state.posCategory === category ? 'active' : ''}" data-pos-category="${esc(category)}">${esc(category)}</button>`).join('')}</div><div class="product-grid">${products.length ? products.map((product) => `<button class="product-tile" data-add-cart="${product.id}" ${product.stock <= 0 ? 'disabled' : ''}><div class="tile-top"><span class="tile-icon">${icon('wrench')}</span><span class="tile-stock ${product.stock <= product.reorderLevel ? 'low' : ''}">${product.stock > 0 ? `${product.stock} ${esc(product.unit)}` : 'Out'}</span></div><h3 title="${esc(product.name)}">${esc(product.name)}</h3><p>${esc(product.sku)} · ${esc(product.brand || product.category)}</p><span class="tile-price">${formatMoney(product.sellingPrice)}</span></button>`).join('') : `<div class="card empty-state" style="grid-column:1/-1"><div class="empty-icon">${icon('search')}</div><h3>No products found</h3><p>Try another search or category.</p></div>`}</div></section>${cartHTML()}</div>`;
  $('#pos-search').oninput = (event) => { state.posSearch = event.target.value; renderPOSView(); const input = $('#pos-search'); input.focus(); input.setSelectionRange(input.value.length, input.value.length); };
  $$('[data-pos-category]').forEach((button) => button.onclick = () => { state.posCategory = button.dataset.posCategory; renderPOSView(); });
  $$('[data-add-cart]').forEach((button) => button.onclick = () => addToCart(button.dataset.addCart));
  attachCartEvents();
}

function cartHTML() {
  const totals = cartTotals();
  return `<aside class="card pos-cart"><header class="card-header"><div class="cart-title"><h3>Current sale</h3><span class="cart-count">${state.cart.reduce((sum, line) => sum + line.quantity, 0)}</span></div><button class="link-button" id="clear-cart" ${state.cart.length ? '' : 'disabled'}>Clear</button></header><div class="cart-customer"><label>Customer</label><select id="cart-customer">${state.customers.map((customer) => `<option value="${customer.id}" ${customer.id === (state.cartCustomer || 'cus_walkin') ? 'selected' : ''}>${esc(customer.name)}</option>`).join('')}</select></div><div class="cart-lines">${state.cart.length ? state.cart.map((line) => `<div class="cart-line"><div class="cart-line-head"><div><strong>${esc(line.product.name)}</strong><div class="cart-line-meta">${esc(line.product.sku)} · ${formatMoney(line.unitPrice)} each</div></div><button class="icon-btn" data-cart-remove="${line.product.id}">${icon('close')}</button></div><div class="cart-line-foot"><div class="qty-control"><button data-cart-minus="${line.product.id}">−</button><span>${line.quantity}</span><button data-cart-plus="${line.product.id}">+</button></div><strong class="money">${formatMoney(line.quantity * line.unitPrice)}</strong></div></div>`).join('') : `<div class="cart-empty"><i>${icon('cart')}</i><h4>Your cart is empty</h4><p>Select a part to start this sale.</p></div>`}</div><div class="cart-summary"><div class="summary-row"><span>Subtotal</span><strong>${formatMoney(totals.subtotal)}</strong></div><div class="summary-row"><span>Discount</span><input id="pos-discount" type="number" min="0" max="${totals.subtotal}" step="0.01" value="${state.cartDiscount || 0}"></div><div class="summary-row"><span>VAT (${state.settings.vatRegistered ? state.settings.vatRate : 0}%)</span><strong>${formatMoney(totals.tax)}</strong></div><div class="summary-row total"><span>Total</span><strong>${formatMoney(totals.total)}</strong></div></div><div class="cart-checkout"><button class="button primary wide" id="checkout-button" ${state.cart.length ? '' : 'disabled'}>${icon('payments')} Proceed to payment</button></div></aside>`;
}

function attachCartEvents() {
  $('#clear-cart').onclick = () => { state.cart = []; state.cartDiscount = 0; renderPOSView(); };
  $('#cart-customer').onchange = (event) => { state.cartCustomer = event.target.value; };
  $('#pos-discount').onchange = (event) => { state.cartDiscount = Math.max(0, num(event.target.value)); renderPOSView(); };
  $$('[data-cart-remove]').forEach((button) => button.onclick = () => { state.cart = state.cart.filter((line) => line.product.id !== button.dataset.cartRemove); renderPOSView(); });
  $$('[data-cart-minus]').forEach((button) => button.onclick = () => changeCartQty(button.dataset.cartMinus, -1));
  $$('[data-cart-plus]').forEach((button) => button.onclick = () => changeCartQty(button.dataset.cartPlus, 1));
  $('#checkout-button').onclick = openCheckoutModal;
}

function addToCart(productId) {
  const product = productById(productId);
  const existing = state.cart.find((line) => line.product.id === productId);
  if (existing) {
    if (existing.quantity >= product.stock) return toast('Not enough stock', `Only ${product.stock} ${product.unit} are available.`, 'error');
    existing.quantity += 1;
  } else state.cart.push({ product, quantity: 1, unitPrice: product.sellingPrice });
  renderPOSView();
}

function changeCartQty(productId, amount) {
  const line = state.cart.find((item) => item.product.id === productId);
  if (!line) return;
  if (line.quantity + amount > line.product.stock) return toast('Stock limit reached', `Only ${line.product.stock} available.`, 'error');
  line.quantity += amount;
  if (line.quantity <= 0) state.cart = state.cart.filter((item) => item !== line);
  renderPOSView();
}

function openCheckoutModal() {
  if (!state.cart.length) return;
  const totals = cartTotals();
  const methods = [['Cash','wallet','Cash received'], ['Telebirr','phone','Mobile money'], ['CBE Birr','phone','Mobile money'], ['Bank Transfer','bank',`${state.banks.length} Ethiopian banks`], ['POS / Card','card','Bank card'], ['Chapa','chapa','Online checkout']];
  openModal({
    title: 'Complete payment', subtitle: `Customer: ${customerById(state.cartCustomer || 'cus_walkin')?.name || 'Walk-in Customer'}`, size: 'large',
    content: `<div class="checkout-total"><div><span>Amount due</span><div style="font-size:9px;color:rgba(255,255,255,.55)">${state.cart.reduce((sum, line) => sum + line.quantity, 0)} items · VAT ${formatMoney(totals.tax)}</div></div><strong>${formatMoney(totals.total)}</strong></div><div class="form-section">Choose payment method</div><div class="payment-options">${methods.map(([method, iconName, desc], index) => `<button class="payment-option ${index === 0 ? 'active' : ''}" data-payment-method="${method}"><i>${icon(iconName)}</i><div><strong>${method}</strong><span>${desc}</span></div></button>`).join('')}</div><div class="form-section" style="display:flex;justify-content:space-between"><span>Payment details</span><button class="link-button" id="add-split-payment">+ Split payment</button></div><div id="payment-entries"></div><div class="checkout-balance"><div><span>Sale total</span><strong>${formatMoney(totals.total)}</strong></div><div><span>Paying now</span><strong id="paying-now">${formatMoney(totals.total)}</strong></div><div class="due"><span>Credit balance</span><strong id="credit-balance">${formatMoney(0)}</strong></div></div><div class="form-field" style="margin-top:14px"><label>Sale note</label><textarea id="sale-note" placeholder="Optional note for this invoice"></textarea></div>`,
    footer: `<button class="button secondary modal-cancel">Cancel</button><button class="button primary" id="complete-sale">${icon('check')} Complete sale</button>`
  });
  $('.modal-cancel').onclick = closeModal;
  let entries = [{ method: 'Cash', bankName: '', amount: totals.total, reference: '' }];
  const renderEntries = () => {
    $('#payment-entries').innerHTML = entries.map((entry, index) => `<div class="payment-entry"><select data-pay-field="method" data-pay-index="${index}">${methods.map(([method]) => `<option ${entry.method === method ? 'selected' : ''}>${method}</option>`).join('')}</select><input data-pay-field="amount" data-pay-index="${index}" type="number" min="0" step="0.01" value="${entry.amount}" placeholder="Amount ETB"><button class="icon-btn" data-remove-payment="${index}" ${entries.length === 1 ? 'disabled' : ''}>${icon('close')}</button>${entry.method === 'Bank Transfer' ? `<select data-pay-field="bankName" data-pay-index="${index}" style="grid-column:1/-1" required>${bankOptions(entry.bankName)}</select>` : ''}<input data-pay-field="reference" data-pay-index="${index}" style="grid-column:1/-1" value="${esc(entry.reference)}" placeholder="Reference / transaction ID (optional)"></div>`).join('');
    $$('[data-pay-field]').forEach((input) => input.onchange = () => {
      const entry = entries[num(input.dataset.payIndex)];
      entry[input.dataset.payField] = input.dataset.payField === 'amount' ? num(input.value) : input.value;
      if (input.dataset.payField === 'method') {
        entry.bankName = input.value === 'Bank Transfer' ? (entry.bankName || 'Commercial Bank of Ethiopia') : '';
        renderEntries();
      }
      updateBalance();
    });
    $$('[data-remove-payment]').forEach((button) => button.onclick = () => { entries.splice(num(button.dataset.removePayment), 1); renderEntries(); updateBalance(); });
    $$('.payment-option').forEach((button) => button.classList.toggle('active', entries[0]?.method === button.dataset.paymentMethod));
  };
  const updateBalance = () => {
    const paying = round(entries.reduce((sum, entry) => sum + num(entry.amount), 0));
    $('#paying-now').textContent = formatMoney(paying);
    $('#credit-balance').textContent = formatMoney(Math.max(0, totals.total - paying));
  };
  $$('.payment-option').forEach((button) => button.onclick = () => { entries[0].method = button.dataset.paymentMethod; entries[0].bankName = entries[0].method === 'Bank Transfer' ? (entries[0].bankName || 'Commercial Bank of Ethiopia') : ''; renderEntries(); });
  $('#add-split-payment').onclick = () => { entries.push({ method: 'Telebirr', bankName: '', amount: 0, reference: '' }); renderEntries(); };
  $('#complete-sale').onclick = async () => {
    const paying = round(entries.reduce((sum, entry) => sum + num(entry.amount), 0));
    if (paying > totals.total + .01) return toast('Payment is too high', 'The total paid cannot exceed the sale total.', 'error');
    if (entries.some((entry) => num(entry.amount) > 0 && entry.method === 'Bank Transfer' && !entry.bankName)) return toast('Select a bank', 'Every bank transfer needs an Ethiopian bank.', 'error');
    if (entries.some((entry) => entry.method === 'Chapa')) return toast('Use Chapa after invoice creation', 'Complete this as credit, then collect it from Sales using Chapa.', 'error');
    const payload = { branchId: state.currentBranchId, customerId: state.cartCustomer || 'cus_walkin', items: state.cart.map((line) => ({ productId: line.product.id, quantity: line.quantity, unitPrice: line.unitPrice })), discount: totals.discount, payments: entries.filter((entry) => num(entry.amount) > 0), note: $('#sale-note').value };
    setBusy($('#complete-sale'), true, 'Completing...');
    try {
      const { sale } = await request('/api/sales', { method: 'POST', body: payload });
      state.cart = []; state.cartDiscount = 0; closeModal(); toast('Sale completed', `${sale.invoiceNo} was created.`); showSaleDetail(sale, true);
    } catch (error) { toast('Could not complete sale', error.message, 'error'); setBusy($('#complete-sale'), false); }
  };
  renderEntries();
}

function salesTable(sales, compact = false) {
  return `<div class="table-wrap"><table class="data-table"><thead><tr><th>Invoice</th><th>Customer</th><th>Date</th><th>Total</th><th>Paid</th><th>Status</th>${compact ? '' : '<th></th>'}</tr></thead><tbody>${sales.length ? sales.map((sale) => `<tr><td><strong>${esc(sale.invoiceNo)}</strong></td><td>${esc(sale.customerName || customerById(sale.customerId)?.name || 'Unknown')}</td><td class="no-wrap">${formatDate(sale.createdAt, compact)}</td><td class="money">${formatMoney(sale.total)}</td><td class="money">${formatMoney(sale.paid)}</td><td>${statusBadge(sale.status)}</td>${compact ? '' : `<td><div class="row-actions"><button class="icon-btn" title="View invoice" data-view-sale="${sale.id}">${icon('eye')}</button></div></td>`}</tr>`).join('') : emptyRow(compact ? 6 : 7, 'No sales yet', 'Create your first sale from the point of sale.')}</tbody></table></div>`;
}

async function renderSales() {
  const [salesData, quoteData, returnData] = await Promise.all([request(branchPath('/api/sales')), request(branchPath('/api/quotes')), request(branchPath('/api/returns')), ensureProducts(), loadBootstrap()]);
  state.sales = salesData.sales; state.quotes = quoteData.quotes; state.returns = returnData.returns;
  const netSales = state.sales.reduce((sum, sale) => sum + sale.total, 0) - state.returns.reduce((sum, item) => sum + item.total, 0);
  $('#page-content').innerHTML = `<div class="page-head"><div><h2>Sales & invoices</h2><p>${state.sales.length} invoices · ${formatMoney(netSales)} net sales</p></div><div class="head-actions">${can('sales:manage') ? `<button class="button secondary" id="new-quote-button">${icon('receipt')} New quotation</button>` : ''}${can('pos:sell') ? `<button class="button primary" data-go="pos">${icon('plus')} New sale</button>` : ''}</div></div><div class="toolbar"><div class="toolbar-left"><label class="search-box"><i>${icon('search')}</i><input id="sales-search" placeholder="Search invoice or customer..."></label><select id="sales-status" class="filter-select"><option value="all">All status</option><option value="paid">Paid</option><option value="partial">Partial</option><option value="credit">Unpaid</option></select></div><div class="toolbar-right"><span id="sales-count" class="muted" style="font-size:10px"></span></div></div><section class="card" id="sales-table"></section><section class="report-grid operations-grid"><article class="card"><header class="card-header"><div><h3>Quotations</h3><p>Draft prices that can be converted to invoices</p></div><span class="badge neutral">${state.quotes.length}</span></header><div id="quotes-table"></div></article><article class="card"><header class="card-header"><div><h3>Returns & refunds</h3><p>Returned items, credits and cash refunds</p></div><span class="badge neutral">${state.returns.length}</span></header><div id="returns-table"></div></article></section>`;
  if ($('[data-go]')) $('[data-go]').onclick = () => navigate('pos');
  if ($('#new-quote-button')) $('#new-quote-button').onclick = openQuoteModal;
  const update = () => {
    const q = $('#sales-search').value.toLowerCase(); const status = $('#sales-status').value;
    const filtered = state.sales.filter((sale) => (!q || [sale.invoiceNo, sale.customerName].join(' ').toLowerCase().includes(q)) && (status === 'all' || sale.status === status));
    $('#sales-count').textContent = `${filtered.length} invoice${filtered.length === 1 ? '' : 's'}`;
    $('#sales-table').innerHTML = salesTable(filtered);
    $$('[data-view-sale]').forEach((button) => button.onclick = () => showSaleDetail(state.sales.find((sale) => sale.id === button.dataset.viewSale)));
  };
  $('#sales-search').oninput = update; $('#sales-status').onchange = update; update();
  $('#quotes-table').innerHTML = `<div class="table-wrap"><table class="data-table"><thead><tr><th>Quotation</th><th>Customer</th><th>Valid until</th><th>Total</th><th>Status</th><th></th></tr></thead><tbody>${state.quotes.length ? state.quotes.slice(0, 10).map((quote) => `<tr><td><strong>${esc(quote.quoteNo)}</strong></td><td>${esc(quote.customerName)}</td><td>${formatDate(quote.validUntil)}</td><td class="money">${formatMoney(quote.total)}</td><td>${statusBadge(quote.status)}</td><td>${quote.status === 'draft' && can('sales:manage') ? `<button class="button small secondary" data-convert-quote="${quote.id}">Convert</button>` : quote.convertedSaleId ? `<button class="icon-btn" title="View invoice" data-quote-sale="${quote.convertedSaleId}">${icon('eye')}</button>` : ''}</td></tr>`).join('') : emptyRow(6, 'No quotations yet', 'Create a quotation for a customer before committing stock.')}</tbody></table></div>`;
  $('#returns-table').innerHTML = `<div class="table-wrap"><table class="data-table"><thead><tr><th>Return</th><th>Invoice</th><th>Date</th><th>Restocked</th><th class="text-right">Total</th></tr></thead><tbody>${state.returns.length ? state.returns.slice(0, 10).map((item) => `<tr><td><strong>${esc(item.returnNo)}</strong><br><span class="faint">${esc(item.customerName)}</span></td><td>${esc(item.invoiceNo)}</td><td>${formatDate(item.createdAt)}</td><td>${statusBadge(item.restocked ? 'yes' : 'no')}</td><td class="money text-right">${formatMoney(item.total)}</td></tr>`).join('') : emptyRow(5, 'No returns recorded', 'Returns created from an invoice will appear here.')}</tbody></table></div>`;
  $$('[data-convert-quote]').forEach((button) => button.onclick = async () => {
    setBusy(button, true, 'Converting...');
    try { const { sale } = await request(`/api/quotes/${button.dataset.convertQuote}/convert`, { method: 'POST', body: { payments: [] } }); toast('Quotation converted', `${sale.invoiceNo} was created as an unpaid invoice.`); await renderSales(); showSaleDetail(sale); }
    catch (error) { toast('Could not convert quotation', error.message, 'error'); setBusy(button, false); }
  });
  $$('[data-quote-sale]').forEach((button) => button.onclick = () => showSaleDetail(state.sales.find((sale) => sale.id === button.dataset.quoteSale)));
}

function openQuoteModal() {
  if (!can('sales:manage')) return;
  const firstProduct = state.products.find((product) => product.active);
  let lines = [{ productId: firstProduct?.id || '', quantity: 1, unitPrice: firstProduct?.sellingPrice || 0 }];
  const validUntil = new Date(); validUntil.setDate(validUntil.getDate() + 14);
  openModal({ title: 'New quotation', subtitle: 'Prepare a price offer without reducing stock', size: 'xlarge', content: `<form id="quote-form"><div class="form-grid"><div class="form-field"><label>Customer <em>*</em></label><select name="customerId" required>${state.customers.map((customer) => `<option value="${customer.id}">${esc(customer.name)}</option>`).join('')}</select></div><div class="form-field"><label>Valid until</label><input name="validUntil" type="date" value="${dateInput(validUntil)}" required></div><div class="form-field"><label>Discount (ETB)</label><input name="discount" type="number" min="0" step="0.01" value="0"></div><div class="form-field"><label>Note</label><input name="note" placeholder="Terms or delivery details"></div></div><div class="form-section" style="margin-top:20px">Quoted items</div><div class="line-builder"><div class="line-builder-head"><span>Product</span><span>Quantity</span><span>Unit price</span><span>Total</span><span></span></div><div id="quote-lines"></div></div><div class="builder-foot"><button class="button secondary small" type="button" id="add-quote-line">${icon('plus')} Add line</button><div class="builder-total"><span>Estimated total incl. VAT</span><strong id="quote-total">${formatMoney(0)}</strong></div></div></form>`, footer: `<button class="button secondary modal-cancel">Cancel</button><button class="button primary" id="save-quote">Save quotation</button>` });
  $('.modal-cancel').onclick = closeModal;
  const renderLines = () => {
    $('#quote-lines').innerHTML = lines.map((line, index) => `<div class="line-builder-row"><select data-quote-field="productId" data-line="${index}">${state.products.filter((product) => product.active).map((product) => `<option value="${product.id}" ${product.id === line.productId ? 'selected' : ''}>${esc(product.sku)} — ${esc(product.name)}</option>`).join('')}</select><input data-quote-field="quantity" data-line="${index}" type="number" min="1" step="1" value="${line.quantity}"><input data-quote-field="unitPrice" data-line="${index}" type="number" min="0.01" step="0.01" value="${line.unitPrice}"><span class="line-total">${formatMoney(line.quantity * line.unitPrice)}</span><button class="icon-btn" type="button" data-remove-quote-line="${index}" ${lines.length === 1 ? 'disabled' : ''}>${icon('close')}</button></div>`).join('');
    $$('[data-quote-field]').forEach((field) => field.onchange = () => { const line = lines[num(field.dataset.line)]; line[field.dataset.quoteField] = field.dataset.quoteField === 'productId' ? field.value : num(field.value); if (field.dataset.quoteField === 'productId') line.unitPrice = productById(field.value)?.sellingPrice || 0; renderLines(); });
    $$('[data-remove-quote-line]').forEach((button) => button.onclick = () => { lines.splice(num(button.dataset.removeQuoteLine), 1); renderLines(); });
    const discount = num($('#quote-form [name="discount"]')?.value); const subtotal = lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0); const taxable = Math.max(0, subtotal - discount); const total = taxable + (state.settings.vatRegistered ? taxable * state.settings.vatRate / 100 : 0);
    $('#quote-total').textContent = formatMoney(total);
  };
  $('#quote-form [name="discount"]').oninput = renderLines;
  $('#add-quote-line').onclick = () => { lines.push({ productId: firstProduct?.id || '', quantity: 1, unitPrice: firstProduct?.sellingPrice || 0 }); renderLines(); };
  $('#save-quote').onclick = async () => {
    const form = $('#quote-form'); if (!form.reportValidity()) return;
    setBusy($('#save-quote'), true);
    try { const values = Object.fromEntries(new FormData(form)); const { quote } = await request('/api/quotes', { method: 'POST', body: { ...values, branchId: state.currentBranchId, items: lines } }); closeModal(); toast('Quotation saved', `${quote.quoteNo} is ready.`); await renderSales(); }
    catch (error) { toast('Could not save quotation', error.message, 'error'); setBusy($('#save-quote'), false); }
  };
  renderLines();
}

function receiptHTML(sale) {
  const customer = sale.customerName || customerById(sale.customerId)?.name || 'Customer';
  const branch = state.branches.find((item) => item.id === sale.branchId) || currentBranch();
  return `<article class="receipt"><div class="receipt-brand"><h2>${esc(state.settings.businessName)}</h2><p>${esc(state.settings.businessNameAm)}</p><p>${esc(branch?.name || '')} · ${esc(branch?.address || state.settings.address)} · ${esc(branch?.phone || state.settings.phone)}</p><p>TIN: ${esc(state.settings.tin)} ${state.settings.vatRegistered ? `· VAT: ${esc(state.settings.vatNumber)}` : ''}</p></div><div class="receipt-heading"><div><h3>SALES INVOICE</h3><span>${esc(sale.invoiceNo)}</span></div><div style="text-align:right"><span>${formatDate(sale.createdAt, true)}</span><br><span>Customer: ${esc(customer)}</span></div></div><table><thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Amount</th></tr></thead><tbody>${sale.items.map((line) => `<tr><td>${esc(line.product?.name || productById(line.productId)?.name || 'Part')}</td><td>${line.quantity}</td><td>${formatMoney(line.unitPrice)}</td><td>${formatMoney(line.quantity * line.unitPrice)}</td></tr>`).join('')}</tbody></table><div class="document-total"><div class="summary-row"><span>Subtotal</span><strong>${formatMoney(sale.subtotal)}</strong></div><div class="summary-row"><span>Discount</span><strong>− ${formatMoney(sale.discount)}</strong></div><div class="summary-row"><span>VAT (${state.settings.vatRate}%)</span><strong>${formatMoney(sale.tax)}</strong></div><div class="summary-row"><span>Original total</span><strong>${formatMoney(sale.total)}</strong></div>${sale.returnsTotal ? `<div class="summary-row"><span>Returns</span><strong>− ${formatMoney(sale.returnsTotal)}</strong></div>` : ''}<div class="summary-row total"><span>Net total</span><strong>${formatMoney(Math.max(0, sale.total - num(sale.returnsTotal)))}</strong></div><div class="summary-row"><span>Paid</span><strong>${formatMoney(sale.paid)}</strong></div><div class="summary-row"><span>Balance due</span><strong>${formatMoney(sale.balance)}</strong></div></div>${sale.payments?.length ? `<div class="receipt-payments"><strong>Payment details</strong>${sale.payments.map((payment) => `<div><span>${esc(payment.method)}${payment.bankName ? ` · ${esc(payment.bankName)}` : ''}${payment.reference ? ` · ${esc(payment.reference)}` : ''}</span><b>${formatMoney(payment.amount)}</b></div>`).join('')}</div>` : ''}<p class="receipt-footer">${esc(state.settings.receiptFooter)}</p></article>`;
}

function showSaleDetail(sale, afterCheckout = false) {
  openModal({
    title: afterCheckout ? 'Sale completed' : sale.invoiceNo, subtitle: afterCheckout ? `${sale.invoiceNo} is ready to print` : `${sale.customerName} · ${formatDate(sale.createdAt, true)}`, size: 'large',
    content: `${receiptHTML(sale)}${sale.balance > 0 ? `<div class="balance-callout"><div><strong>${formatMoney(sale.balance)} outstanding</strong><span>Record a payment now or collect it later.</span></div><button class="button small primary" id="record-sale-payment">Record payment</button></div>` : ''}`,
    footer: `<button class="button secondary modal-cancel">Close</button>${can('sales:manage') ? `<button class="button secondary" id="return-sale">${icon('arrowdown')} Return items</button>` : ''}<button class="button primary" id="print-sale">${icon('printer')} Print invoice</button>`
  });
  $('.modal-cancel').onclick = () => { closeModal(); if (afterCheckout) navigate('pos'); };
  $('#print-sale').onclick = () => printReceipt(sale);
  if ($('#record-sale-payment')) $('#record-sale-payment').onclick = () => openSalePaymentModal(sale);
  if ($('#return-sale')) $('#return-sale').onclick = () => openSaleReturnModal(sale);
}

function openSaleReturnModal(sale) {
  const previous = state.returns.filter((item) => item.saleId === sale.id).flatMap((item) => item.items).reduce((map, item) => ({ ...map, [item.productId]: num(map[item.productId]) + item.quantity }), {});
  const returnable = sale.items.map((line) => ({ ...line, soldQuantity: line.quantity, available: line.quantity - num(previous[line.productId]), returnQuantity: 0 })).filter((line) => line.available > 0);
  if (!returnable.length) return toast('Nothing left to return', 'All items on this invoice have already been returned.', 'error');
  openModal({ title: 'Return sale items', subtitle: `${sale.invoiceNo} · ${sale.customerName}`, size: 'large', content: `<div class="security-callout"><i>${icon('history')}</i><div><strong>Credit is applied before a cash refund</strong><span>The invoice balance will be reduced first. Any remainder must be refunded using the selected payment method.</span></div></div><form id="return-form"><div class="table-wrap"><table class="data-table"><thead><tr><th>Item</th><th>Sold</th><th>Available</th><th>Return qty</th></tr></thead><tbody>${returnable.map((line, index) => `<tr><td><strong>${esc(line.product?.name || 'Part')}</strong><br><span class="sku">${esc(line.product?.sku || '')}</span></td><td>${line.soldQuantity}</td><td>${line.available}</td><td><input class="compact-input" data-return-quantity="${index}" type="number" min="0" max="${line.available}" step="1" value="0"></td></tr>`).join('')}</tbody></table></div><div class="form-grid" style="margin-top:18px"><div class="form-field full"><label>Reason <em>*</em></label><input name="reason" required maxlength="300" placeholder="e.g. Wrong part supplied or defective item"></div><div class="form-field"><label>Refund method</label><select id="return-method" name="method">${['Cash','Telebirr','CBE Birr','Bank Transfer','POS / Card'].map((item) => `<option>${item}</option>`).join('')}</select></div><div class="form-field"><label>Refund reference</label><input name="reference" placeholder="Optional"></div><div class="form-field full hidden" id="return-bank-field"><label>Ethiopian bank <em>*</em></label><select name="bankName">${bankOptions('Commercial Bank of Ethiopia')}</select></div><div class="form-field full"><label class="check-field"><input name="restock" type="checkbox" checked><span>Return sellable items to stock</span></label></div></div><div class="document-total"><div class="summary-row"><span>Return total</span><strong id="return-total">${formatMoney(0)}</strong></div><div class="summary-row"><span>Credit against balance</span><strong id="return-credit">${formatMoney(0)}</strong></div><div class="summary-row total"><span>Cash refund due</span><strong id="return-refund">${formatMoney(0)}</strong></div></div></form>`, footer: `<button class="button secondary modal-cancel">Cancel</button><button class="button primary" id="save-return">Complete return</button>` });
  $('.modal-cancel').onclick = closeModal;
  let refundDue = 0;
  const update = () => {
    const total = round(returnable.reduce((sum, line, index) => {
      line.returnQuantity = Math.min(line.available, Math.max(0, Math.floor(num($(`[data-return-quantity="${index}"]`).value))));
      const gross = line.unitPrice * line.returnQuantity; const ratio = sale.subtotal ? gross / sale.subtotal : 0;
      return sum + gross - sale.discount * ratio + (line.taxable ? sale.tax * ratio : 0);
    }, 0));
    const credit = Math.min(sale.balance, total); refundDue = round(total - credit);
    $('#return-total').textContent = formatMoney(total); $('#return-credit').textContent = formatMoney(credit); $('#return-refund').textContent = formatMoney(refundDue);
  };
  $$('[data-return-quantity]').forEach((input) => input.oninput = update);
  $('#return-method').onchange = () => $('#return-bank-field').classList.toggle('hidden', $('#return-method').value !== 'Bank Transfer');
  $('#save-return').onclick = async () => {
    const form = $('#return-form'); if (!form.reportValidity()) return; const selected = returnable.filter((line) => line.returnQuantity > 0);
    if (!selected.length) return toast('Select returned items', 'Enter at least one return quantity.', 'error');
    const values = Object.fromEntries(new FormData(form)); const refunds = refundDue > 0 ? [{ method: values.method, bankName: values.method === 'Bank Transfer' ? values.bankName : '', amount: refundDue, reference: values.reference }] : [];
    setBusy($('#save-return'), true, 'Returning...');
    try { const result = await request('/api/returns', { method: 'POST', body: { saleId: sale.id, items: selected.map((line) => ({ productId: line.productId, quantity: line.returnQuantity })), reason: values.reason, restock: Boolean(values.restock), refunds } }); closeModal(); toast('Return completed', `${result.return.returnNo} was recorded.`); await renderSales(); }
    catch (error) { toast('Could not complete return', error.message, 'error'); setBusy($('#save-return'), false); }
  };
  update();
}

function printReceipt(sale) {
  $('#print-root').innerHTML = receiptHTML(sale);
  window.print();
  setTimeout(() => { $('#print-root').innerHTML = ''; }, 1000);
}

function openSalePaymentModal(sale) {
  const content = `<div class="checkout-total"><div><span>Balance due</span><div style="font-size:9px;color:rgba(255,255,255,.55)">${esc(sale.invoiceNo)}</div></div><strong>${formatMoney(sale.balance)}</strong></div><form id="sale-payment-form"><div class="form-grid"><div class="form-field"><label>Payment method</label><select id="sale-payment-method" name="method">${['Cash','Telebirr','CBE Birr','Bank Transfer','POS / Card'].map((item) => `<option>${item}</option>`).join('')}</select></div><div class="form-field"><label>Amount (ETB)</label><input name="amount" type="number" min="0.01" max="${sale.balance}" step="0.01" value="${sale.balance}" required></div><div class="form-field full hidden" id="sale-bank-field"><label>Ethiopian bank <em>*</em></label><select name="bankName">${bankOptions('Commercial Bank of Ethiopia')}</select><small>Current NBE-licensed bank list · ${state.banks.length} banks</small></div><div class="form-field full"><label>Reference / transaction ID</label><input name="reference" placeholder="Optional"></div><div class="form-field full"><label>Note</label><textarea name="note" placeholder="Optional payment note"></textarea></div></div></form>${state.settings.chapaEnabled ? `<div class="gateway-card" style="margin-top:16px"><div class="gateway-brand"><span class="gateway-logo">Chapa</span><div><strong>Collect online with Chapa</strong><span>Secure hosted checkout for the full balance</span></div></div><button class="button secondary small" id="chapa-collect">Open checkout</button></div>` : ''}`;
  openModal({ title: 'Record payment', subtitle: `${sale.customerName || 'Customer'} · ${sale.invoiceNo}`, content, footer: `<button class="button secondary modal-cancel">Cancel</button><button class="button primary" id="save-sale-payment">Save payment</button>` });
  $('.modal-cancel').onclick = closeModal;
  $('#sale-payment-method').onchange = () => $('#sale-bank-field').classList.toggle('hidden', $('#sale-payment-method').value !== 'Bank Transfer');
  $('#save-sale-payment').onclick = async () => {
    const form = $('#sale-payment-form'); if (!form.reportValidity()) return;
    const values = Object.fromEntries(new FormData(form));
    if (values.method !== 'Bank Transfer') values.bankName = '';
    setBusy($('#save-sale-payment'), true);
    try { const result = await request(`/api/sales/${sale.id}/payments`, { method: 'POST', body: { payments: [values], note: values.note } }); closeModal(); toast('Payment recorded', `${formatMoney(values.amount)} received.`); if (state.currentPage === 'sales') await renderSales(); else showSaleDetail(result.sale); }
    catch (error) { toast('Could not record payment', error.message, 'error'); setBusy($('#save-sale-payment'), false); }
  };
  if ($('#chapa-collect')) $('#chapa-collect').onclick = async () => {
    setBusy($('#chapa-collect'), true, 'Connecting...');
    try { const result = await request('/api/payments/chapa/initialize', { method: 'POST', body: { saleId: sale.id } }); window.location.href = result.checkoutUrl; }
    catch (error) { toast('Chapa unavailable', error.message, 'error'); setBusy($('#chapa-collect'), false); }
  };
}

async function renderPurchases() {
  [state.purchases] = await Promise.all([request(branchPath('/api/purchases')).then((data) => data.purchases), ensureProducts(true), loadBootstrap().then(() => state.suppliers)]);
  $('#page-content').innerHTML = `<div class="page-head"><div><h2>Supplier purchases</h2><p>Receive inventory and track what you owe.</p></div><div class="head-actions"><button class="button primary" id="add-purchase-button">${icon('plus')} New purchase</button></div></div><div class="toolbar"><div class="toolbar-left"><label class="search-box"><i>${icon('search')}</i><input id="purchase-search" placeholder="Search PO, supplier, reference..."></label><select id="purchase-status" class="filter-select"><option value="all">All status</option><option value="paid">Paid</option><option value="partial">Partial</option><option value="credit">Unpaid</option></select></div></div><section class="card" id="purchases-table"></section>`;
  const update = () => {
    const q = $('#purchase-search').value.toLowerCase(); const status = $('#purchase-status').value;
    const filtered = state.purchases.filter((purchase) => (!q || [purchase.purchaseNo, purchase.supplierName, purchase.reference].join(' ').toLowerCase().includes(q)) && (status === 'all' || purchase.status === status));
    $('#purchases-table').innerHTML = `<div class="table-wrap"><table class="data-table"><thead><tr><th>Purchase</th><th>Supplier</th><th>Reference</th><th>Date</th><th>Total</th><th>Balance</th><th>Status</th><th></th></tr></thead><tbody>${filtered.length ? filtered.map((purchase) => `<tr><td><strong>${esc(purchase.purchaseNo)}</strong><br><span class="faint" style="font-size:8px">${purchase.items.length} line items</span></td><td>${esc(purchase.supplierName)}</td><td>${esc(purchase.reference || '—')}</td><td>${formatDate(purchase.createdAt)}</td><td class="money">${formatMoney(purchase.total)}</td><td class="money">${formatMoney(purchase.balance)}</td><td>${statusBadge(purchase.status)}</td><td><div class="row-actions"><button class="icon-btn" data-view-purchase="${purchase.id}">${icon('eye')}</button></div></td></tr>`).join('') : emptyRow(8, 'No purchases found', 'Receive stock to create your first purchase.')}</tbody></table></div>`;
    $$('[data-view-purchase]').forEach((button) => button.onclick = () => showPurchaseDetail(state.purchases.find((item) => item.id === button.dataset.viewPurchase)));
  };
  $('#purchase-search').oninput = update; $('#purchase-status').onchange = update; $('#add-purchase-button').onclick = openPurchaseModal; update();
}

function openPurchaseModal() {
  let lines = [{ productId: state.products[0]?.id || '', quantity: 1, unitCost: state.products[0]?.costPrice || 0 }];
  openModal({ title: 'New supplier purchase', subtitle: 'Receive stock and record supplier payment', size: 'xlarge', content: `<form id="purchase-form"><div class="form-grid"><div class="form-field"><label>Supplier <em>*</em></label><select name="supplierId" required>${state.suppliers.map((supplier) => `<option value="${supplier.id}">${esc(supplier.name)}</option>`).join('')}</select></div><div class="form-field"><label>Supplier invoice / reference</label><input name="reference" placeholder="e.g. MAI-2048"></div><div class="form-field full"><label>Note</label><input name="note" placeholder="Optional purchase note"></div></div><div class="form-section" style="margin-top:20px">Purchase items</div><div class="line-builder"><div class="line-builder-head"><span>Product</span><span>Quantity</span><span>Unit cost</span><span>Total</span><span></span></div><div id="purchase-lines"></div></div><div class="builder-foot"><button class="button secondary small" type="button" id="add-purchase-line">${icon('plus')} Add line</button><div class="builder-total"><span>Total incl. VAT</span><strong id="purchase-total">${formatMoney(0)}</strong></div></div><div class="form-section" style="margin-top:20px">Payment now</div><div class="form-grid"><div class="form-field"><label>Method</label><select id="purchase-payment-method" name="paymentMethod"><option>Bank Transfer</option><option>Cash</option><option>Telebirr</option><option>CBE Birr</option><option>POS / Card</option></select></div><div class="form-field"><label>Amount (leave 0 for credit)</label><input name="paymentAmount" type="number" min="0" step="0.01" value="0"></div><div class="form-field full" id="purchase-bank-field"><label>Ethiopian bank <em>*</em></label><select name="bankName">${bankOptions('Commercial Bank of Ethiopia')}</select><small>Choose the bank used for this transfer.</small></div><div class="form-field full"><label>Payment reference</label><input name="paymentReference" placeholder="Optional transaction reference"></div></div></form>`, footer: `<button class="button secondary modal-cancel">Cancel</button><button class="button primary" id="save-purchase">Receive stock</button>` });
  $('.modal-cancel').onclick = closeModal;
  $('#purchase-payment-method').onchange = () => $('#purchase-bank-field').classList.toggle('hidden', $('#purchase-payment-method').value !== 'Bank Transfer');
  const renderLines = () => {
    $('#purchase-lines').innerHTML = lines.map((line, index) => `<div class="line-builder-row"><select data-purchase-field="productId" data-line="${index}">${state.products.filter((product) => product.active).map((product) => `<option value="${product.id}" ${product.id === line.productId ? 'selected' : ''}>${esc(product.sku)} — ${esc(product.name)}</option>`).join('')}</select><input data-purchase-field="quantity" data-line="${index}" type="number" min="1" step="1" value="${line.quantity}"><input data-purchase-field="unitCost" data-line="${index}" type="number" min="0.01" step="0.01" value="${line.unitCost}"><span class="line-total">${formatMoney(line.quantity * line.unitCost)}</span><button class="icon-btn" data-remove-line="${index}" ${lines.length === 1 ? 'disabled' : ''}>${icon('close')}</button></div>`).join('');
    $$('[data-purchase-field]').forEach((field) => field.onchange = () => {
      const line = lines[num(field.dataset.line)]; line[field.dataset.purchaseField] = field.dataset.purchaseField === 'productId' ? field.value : num(field.value);
      if (field.dataset.purchaseField === 'productId') line.unitCost = productById(field.value)?.costPrice || 0;
      renderLines();
    });
    $$('[data-remove-line]').forEach((button) => button.onclick = () => { lines.splice(num(button.dataset.removeLine), 1); renderLines(); });
    const subtotal = lines.reduce((sum, line) => sum + line.quantity * line.unitCost, 0);
    $('#purchase-total').textContent = formatMoney(subtotal * (1 + (state.settings.vatRegistered ? state.settings.vatRate / 100 : 0)));
  };
  $('#add-purchase-line').onclick = () => { const product = state.products[0]; lines.push({ productId: product?.id || '', quantity: 1, unitCost: product?.costPrice || 0 }); renderLines(); };
  $('#save-purchase').onclick = async () => {
    const form = $('#purchase-form'); if (!form.reportValidity()) return;
    const values = Object.fromEntries(new FormData(form));
    const payload = { branchId: state.currentBranchId, supplierId: values.supplierId, reference: values.reference, note: values.note, items: lines, payments: num(values.paymentAmount) > 0 ? [{ method: values.paymentMethod, bankName: values.paymentMethod === 'Bank Transfer' ? values.bankName : '', amount: values.paymentAmount, reference: values.paymentReference }] : [] };
    setBusy($('#save-purchase'), true, 'Receiving...');
    try { const { purchase } = await request('/api/purchases', { method: 'POST', body: payload }); closeModal(); toast('Stock received', `${purchase.purchaseNo} added ${lines.reduce((sum, line) => sum + line.quantity, 0)} units.`); if (state.currentPage === 'purchases') await renderPurchases(); else await navigate('purchases'); }
    catch (error) { toast('Could not save purchase', error.message, 'error'); setBusy($('#save-purchase'), false); }
  };
  renderLines();
}

function showPurchaseDetail(purchase) {
  openModal({ title: purchase.purchaseNo, subtitle: `${purchase.supplierName} · ${formatDate(purchase.createdAt, true)}`, size: 'large', content: `<div class="detail-meta"><div><span>Supplier</span><strong>${esc(purchase.supplierName)}</strong></div><div><span>Reference</span><strong>${esc(purchase.reference || '—')}</strong></div><div><span>Status</span><strong>${purchase.status.toUpperCase()}</strong></div><div><span>Balance</span><strong>${formatMoney(purchase.balance)}</strong></div></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Product</th><th>Qty</th><th>Unit cost</th><th class="text-right">Amount</th></tr></thead><tbody>${purchase.items.map((line) => `<tr><td><strong>${esc(line.product?.name || 'Unknown')}</strong><br><span class="sku">${esc(line.product?.sku || '')}</span></td><td>${line.quantity}</td><td>${formatMoney(line.unitCost)}</td><td class="money text-right">${formatMoney(line.quantity * line.unitCost)}</td></tr>`).join('')}</tbody></table></div><div class="document-total"><div class="summary-row"><span>Subtotal</span><strong>${formatMoney(purchase.subtotal)}</strong></div><div class="summary-row"><span>VAT</span><strong>${formatMoney(purchase.tax)}</strong></div><div class="summary-row total"><span>Total</span><strong>${formatMoney(purchase.total)}</strong></div><div class="summary-row"><span>Paid</span><strong>${formatMoney(purchase.paid)}</strong></div><div class="summary-row"><span>Balance</span><strong>${formatMoney(purchase.balance)}</strong></div></div>${purchase.payments?.length ? `<div class="receipt-payments"><strong>Supplier payments</strong>${purchase.payments.map((payment) => `<div><span>${esc(payment.method)}${payment.bankName ? ` · ${esc(payment.bankName)}` : ''}${payment.reference ? ` · ${esc(payment.reference)}` : ''}</span><b>${formatMoney(payment.amount)}</b></div>`).join('')}</div>` : ''}` });
}

async function renderPeople() {
  state.parties = (await request('/api/parties')).parties;
  state.customers = state.parties.filter((party) => party.type === 'customer');
  state.suppliers = state.parties.filter((party) => party.type === 'supplier');
  $('#page-content').innerHTML = `<div class="page-head"><div><h2>Business contacts</h2><p>Customers, garages, fleet buyers and suppliers.</p></div><div class="head-actions"><button class="button primary" id="add-party-button">${icon('plus')} Add contact</button></div></div><div class="toolbar"><div class="toolbar-left"><div class="segmented"><button data-people-type="customer" class="${state.peopleType === 'customer' ? 'active' : ''}">Customers</button><button data-people-type="supplier" class="${state.peopleType === 'supplier' ? 'active' : ''}">Suppliers</button></div><label class="search-box"><i>${icon('search')}</i><input id="people-search" placeholder="Search name, phone, TIN..."></label></div></div><section id="people-grid" class="people-grid"></section>`;
  const update = () => {
    const q = $('#people-search').value.toLowerCase();
    const filtered = state.parties.filter((party) => party.type === state.peopleType && (!q || [party.name, party.phone, party.tin, party.address].join(' ').toLowerCase().includes(q)));
    $('#people-grid').innerHTML = filtered.length ? filtered.map(personCard).join('') : `<div class="card empty-state" style="grid-column:1/-1"><div class="empty-icon">${icon('people')}</div><h3>No contacts found</h3><p>Add a ${state.peopleType} to get started.</p></div>`;
  };
  $$('[data-people-type]').forEach((button) => button.onclick = () => { state.peopleType = button.dataset.peopleType; renderPeople(); });
  $('#people-search').oninput = update; $('#add-party-button').onclick = () => openPartyModal(state.peopleType); update();
}

function personCard(person) {
  return `<article class="card person-card"><div class="person-top"><span class="avatar">${esc(initials(person.name))}</span><div><strong>${esc(person.name)}</strong><span>${person.type === 'supplier' ? 'Supplier' : person.id === 'cus_walkin' ? 'Default customer' : 'Customer'}</span></div></div><div class="person-info"><div>${icon('phone')}<span>${esc(person.phone || 'No phone number')}</span></div><div>${icon('mail')}<span>${esc(person.email || 'No email address')}</span></div><div>${icon('pin')}<span>${esc(person.address || 'No address')}</span></div><div>${icon('receipt')}<span>TIN: ${esc(person.tin || 'Not provided')}</span></div></div><div class="person-balance"><span>${person.type === 'supplier' ? 'Amount payable' : 'Amount receivable'}</span><strong>${formatMoney(person.balance)}</strong></div></article>`;
}

function openPartyModal(type = 'customer') {
  openModal({ title: `Add ${type}`, subtitle: 'Save contact and tax information', content: `<form id="party-form"><div class="form-grid"><div class="form-field full"><label>Contact type</label><select name="type"><option value="customer" ${type === 'customer' ? 'selected' : ''}>Customer</option><option value="supplier" ${type === 'supplier' ? 'selected' : ''}>Supplier</option></select></div><div class="form-field"><label>Name / company <em>*</em></label><input name="name" required placeholder="Full name or company"></div><div class="form-field"><label>Phone</label><input name="phone" placeholder="09xx xxx xxx"></div><div class="form-field"><label>Email</label><input name="email" type="email" placeholder="name@example.com"></div><div class="form-field"><label>TIN</label><input name="tin" placeholder="Tax identification number"></div><div class="form-field full"><label>Address</label><input name="address" placeholder="Sub-city, city, Ethiopia"></div></div></form>`, footer: `<button class="button secondary modal-cancel">Cancel</button><button class="button primary" id="save-party">Save contact</button>` });
  $('.modal-cancel').onclick = closeModal;
  $('#save-party').onclick = async () => {
    const form = $('#party-form'); if (!form.reportValidity()) return;
    setBusy($('#save-party'), true);
    try { const values = Object.fromEntries(new FormData(form)); await request('/api/parties', { method: 'POST', body: values }); closeModal(); toast('Contact added', `${values.name} is saved.`); await loadBootstrap(); if (state.currentPage === 'people') renderPeople(); }
    catch (error) { toast('Could not add contact', error.message, 'error'); setBusy($('#save-party'), false); }
  };
}

async function renderPayments() {
  const [paymentData, expenseData] = await Promise.all([request(branchPath('/api/payments')), request(branchPath('/api/expenses'))]);
  state.payments = paymentData.payments; state.expenses = expenseData.expenses;
  const incoming = state.payments.filter((payment) => payment.direction === 'in').reduce((sum, payment) => sum + payment.amount, 0);
  const outgoing = state.payments.filter((payment) => payment.direction === 'out').reduce((sum, payment) => sum + payment.amount, 0);
  $('#page-content').innerHTML = `<div class="page-head"><div><h2>Payment ledger</h2><p>All money received, refunds, supplier payments and expenses in one place.</p></div><div class="head-actions">${can('expenses:manage') ? `<button class="button primary" id="add-expense-button">${icon('plus')} Add expense</button>` : ''}<button class="button secondary" id="export-payments">${icon('download')} Export CSV</button></div></div><section class="metrics-grid">${metricCard('arrowdown', formatMoney(incoming, true), 'Money received', `${state.payments.filter((p) => p.direction === 'in').length} transactions`, 'lime')}${metricCard('arrowup', formatMoney(outgoing, true), 'Money paid out', `${state.payments.filter((p) => p.direction === 'out').length} transactions`, 'amber')}${metricCard('wallet', formatMoney(incoming - outgoing, true), 'Net cash flow', 'Recorded payments', 'blue')}${metricCard('bank', String(state.banks.length), 'Ethiopian banks', 'Current NBE directory', '')}</section><div class="toolbar"><div class="toolbar-left"><label class="search-box"><i>${icon('search')}</i><input id="payment-search" placeholder="Search bank, reference or invoice..."></label><select id="payment-direction" class="filter-select"><option value="all">All directions</option><option value="in">Money in</option><option value="out">Money out</option></select><select id="payment-method" class="filter-select"><option value="all">All methods</option>${[...new Set(state.payments.map((p) => p.method))].map((method) => `<option>${esc(method)}</option>`).join('')}</select><select id="payment-bank" class="filter-select"><option value="all">All Ethiopian banks</option>${state.banks.map((bank) => `<option value="${esc(bank)}">${esc(bank)}</option>`).join('')}</select></div></div><section class="card" id="payment-table"></section><section class="card" style="margin-top:16px"><header class="card-header"><div><h3>Operating expenses</h3><p>Rent, salaries, transport, utilities and other overhead</p></div><strong>${formatMoney(state.expenses.reduce((sum, expense) => sum + expense.amount, 0))}</strong></header><div class="table-wrap"><table class="data-table"><thead><tr><th>Expense</th><th>Category</th><th>Vendor</th><th>Date</th><th>Method</th><th>Reference</th><th class="text-right">Amount</th></tr></thead><tbody>${state.expenses.length ? state.expenses.slice(0, 30).map((expense) => `<tr><td><strong>${esc(expense.expenseNo)}</strong></td><td>${esc(expense.category)}</td><td>${esc(expense.vendor || '—')}</td><td>${formatDate(expense.createdAt)}</td><td>${esc(expense.method)}${expense.bankName ? `<br><span class="faint">${esc(expense.bankName)}</span>` : ''}</td><td class="sku">${esc(expense.reference || '—')}</td><td class="money text-right">${formatMoney(expense.amount)}</td></tr>`).join('') : emptyRow(7, 'No operating expenses', 'Record overhead costs to calculate net profit.')}</tbody></table></div></section>`;
  const update = () => {
    const q = $('#payment-search').value.toLowerCase(); const direction = $('#payment-direction').value; const method = $('#payment-method').value; const bank = $('#payment-bank').value;
    const filtered = state.payments.filter((payment) => (!q || [payment.reference, payment.entityNumber, payment.method, payment.bankName].join(' ').toLowerCase().includes(q)) && (direction === 'all' || payment.direction === direction) && (method === 'all' || payment.method === method) && (bank === 'all' || payment.bankName === bank));
    $('#payment-table').innerHTML = `<div class="table-wrap"><table class="data-table"><thead><tr><th>Date</th><th>Direction</th><th>Document</th><th>Method</th><th>Bank</th><th>Reference</th><th class="text-right">Amount</th></tr></thead><tbody>${filtered.length ? filtered.map((payment) => `<tr><td>${formatDate(payment.createdAt, true)}</td><td>${statusBadge(payment.direction)}</td><td><strong>${esc(payment.entityNumber)}</strong><br><span class="faint" style="font-size:8px">${esc(payment.entityType)}</span></td><td>${esc(payment.method)}</td><td>${esc(payment.bankName || '—')}</td><td class="sku">${esc(payment.reference || '—')}</td><td class="money text-right" style="color:${payment.direction === 'in' ? 'var(--primary-2)' : 'var(--red)'}">${payment.direction === 'in' ? '+' : '−'} ${formatMoney(payment.amount)}</td></tr>`).join('') : emptyRow(7, 'No payments found', 'Try changing your filters.')}</tbody></table></div><div class="table-footer"><span>${filtered.length} transactions</span><strong>${formatMoney(filtered.reduce((sum, p) => sum + (p.direction === 'in' ? p.amount : -p.amount), 0))} net</strong></div>`;
  };
  $('#payment-search').oninput = update; $('#payment-direction').onchange = update; $('#payment-method').onchange = update; $('#payment-bank').onchange = update;
  $('#export-payments').onclick = () => downloadCSV('nile-payments.csv', state.payments.map((p) => ({ Date: p.createdAt, Direction: p.direction, Document: p.entityNumber, Method: p.method, Bank: p.bankName || '', Reference: p.reference, Amount: p.amount })));
  if ($('#add-expense-button')) $('#add-expense-button').onclick = openExpenseModal;
  update();
}

function openExpenseModal() {
  const methods = ['Cash', 'Telebirr', 'CBE Birr', 'Bank Transfer', 'POS / Card'];
  const categories = ['Rent', 'Utilities', 'Salaries', 'Transport', 'Customs & Freight', 'Maintenance', 'Office', 'Marketing', 'Other'];
  openModal({ title: 'Record operating expense', subtitle: 'This payment will be included in net-profit reporting', content: `<form id="expense-form"><div class="form-grid"><div class="form-field"><label>Category <em>*</em></label><select name="category" required>${categories.map((item) => `<option>${item}</option>`).join('')}</select></div><div class="form-field"><label>Amount (ETB) <em>*</em></label><input name="amount" type="number" min="0.01" step="0.01" required></div><div class="form-field"><label>Vendor / payee</label><input name="vendor" placeholder="Landlord, employee or supplier"></div><div class="form-field"><label>Expense date</label><input name="date" type="date" value="${dateInput(new Date())}" required></div><div class="form-field"><label>Payment method</label><select id="expense-method" name="method">${methods.map((item) => `<option>${item}</option>`).join('')}</select></div><div class="form-field"><label>Reference</label><input name="reference" placeholder="Receipt or transaction number"></div><div class="form-field full hidden" id="expense-bank-field"><label>Ethiopian bank <em>*</em></label><select name="bankName">${bankOptions('Commercial Bank of Ethiopia')}</select></div><div class="form-field full"><label>Note</label><textarea name="note" maxlength="300" placeholder="Optional expense details"></textarea></div></div></form>`, footer: `<button class="button secondary modal-cancel">Cancel</button><button class="button primary" id="save-expense">Record expense</button>` });
  $('.modal-cancel').onclick = closeModal;
  $('#expense-method').onchange = () => $('#expense-bank-field').classList.toggle('hidden', $('#expense-method').value !== 'Bank Transfer');
  $('#save-expense').onclick = async () => {
    const form = $('#expense-form'); if (!form.reportValidity()) return; const values = Object.fromEntries(new FormData(form)); if (values.method !== 'Bank Transfer') values.bankName = '';
    setBusy($('#save-expense'), true);
    try { const { expense } = await request('/api/expenses', { method: 'POST', body: { ...values, branchId: state.currentBranchId } }); closeModal(); toast('Expense recorded', `${expense.expenseNo} · ${formatMoney(expense.amount)}`); await renderPayments(); }
    catch (error) { toast('Could not record expense', error.message, 'error'); setBusy($('#save-expense'), false); }
  };
}

function dateInput(date) { return new Date(date).toISOString().slice(0, 10); }

async function renderReports() {
  const end = new Date(); const start = new Date(); start.setDate(start.getDate() - 30);
  $('#page-content').innerHTML = `<div class="page-head"><div><h2>Business performance</h2><p>Sales and margin reporting based on recorded transactions.</p></div><div class="report-filter"><div class="form-field"><label>From</label><input id="report-from" type="date" value="${dateInput(start)}"></div><div class="form-field"><label>To</label><input id="report-to" type="date" value="${dateInput(end)}"></div><button class="button primary" id="run-report">Run report</button></div></div><div id="report-content"><div class="page-loading"><div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div></div></div>`;
  $('#run-report').onclick = loadReport;
  await loadReport();
}

async function loadReport() {
  const from = $('#report-from').value; const to = $('#report-to').value;
  setBusy($('#run-report'), true, 'Loading...');
  try {
    const report = await request(branchPath(`/api/reports?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`));
    const totalPayments = report.paymentMethods.reduce((sum, item) => sum + item.amount, 0) || 1;
    const colors = ['#123f35','#dbe956','#e89a35','#3f70c6','#a8b3ae','#8b5cc7'];
    const stops = []; let position = 0;
    report.paymentMethods.forEach((item, index) => { const next = position + item.amount / totalPayments * 100; stops.push(`${colors[index % colors.length]} ${position}% ${next}%`); position = next; });
    $('#report-content').innerHTML = `<section class="metrics-grid">${metricCard('money', formatMoney(report.summary.revenue, true), 'Net revenue', `${formatMoney(report.summary.grossRevenue)} gross less returns`, 'lime')}${metricCard('profit', formatMoney(report.summary.grossProfit, true), 'Gross profit', 'After returned cost of goods', '')}${metricCard('arrowup', formatMoney(report.summary.expenses, true), 'Operating expenses', 'Recorded overhead', 'amber')}${metricCard('wallet', formatMoney(report.summary.netProfit, true), 'Net profit', `${report.summary.orders} orders`, 'blue')}</section><section class="report-grid"><article class="card"><header class="card-header"><div><h3>Top-selling products</h3><p>Ranked by sales revenue</p></div><button class="link-button" id="export-report">Export sales</button></header><div class="rank-list">${report.topProducts.length ? report.topProducts.map((item, index) => `<div class="rank-row"><span class="rank-number">${index + 1}</span><div><strong>${esc(item.product?.name || 'Unknown')}</strong><span>${item.quantity} units sold · ${esc(item.product?.sku || '')}</span></div><strong>${formatMoney(item.revenue)}</strong></div>`).join('') : `<div class="empty-state"><div class="empty-icon">${icon('reports')}</div><h3>No sales in this period</h3><p>Choose a wider date range.</p></div>`}</div></article><article class="card"><header class="card-header"><div><h3>Payment mix</h3><p>Money received by channel</p></div></header><div class="donut-wrap">${report.paymentMethods.length ? `<div class="donut" style="background:conic-gradient(${stops.join(',')})"><div class="donut-center"><strong>${formatMoney(totalPayments, true)}</strong><span>Collected</span></div></div><div class="legend">${report.paymentMethods.map((item, index) => `<div class="legend-row"><i style="background:${colors[index % colors.length]}"></i><span>${esc(item.method)}</span><strong>${Math.round(item.amount / totalPayments * 100)}%</strong></div>`).join('')}</div>` : `<div class="empty-state"><h3>No payments</h3><p>No money received in this range.</p></div>`}</div></article></section><section class="card" style="margin-top:16px"><header class="card-header"><div><h3>Period summary</h3><p>${formatDate(report.from)} to ${formatDate(report.to)}</p></div></header><div class="quick-actions"><div class="quick-action"><i>${icon('receipt')}</i><div><strong>${formatMoney(report.summary.costOfGoods)}</strong><span>Cost of goods sold</span></div></div><div class="quick-action"><i>${icon('purchase')}</i><div><strong>${formatMoney(report.summary.purchases)}</strong><span>Purchases received</span></div></div><div class="quick-action"><i>${icon('history')}</i><div><strong>${formatMoney(report.summary.returns)}</strong><span>Sales returns</span></div></div><div class="quick-action"><i>${icon('vat')}</i><div><strong>${formatMoney(report.summary.vatCollected)}</strong><span>VAT collected</span></div></div></div></section>`;
    $('#export-report').onclick = () => downloadCSV(`sales-${from}-to-${to}.csv`, report.sales.map((s) => ({ Invoice: s.invoiceNo, Customer: s.customerName, Date: s.createdAt, Subtotal: s.subtotal, Discount: s.discount, VAT: s.tax, Total: s.total, Paid: s.paid, Balance: s.balance, Status: s.status })));
  } catch (error) { toast('Report failed', error.message, 'error'); }
  finally { setBusy($('#run-report'), false); }
}

function downloadCSV(filename, rows) {
  if (!rows.length) return toast('Nothing to export', 'There are no records in this view.', 'error');
  const headers = Object.keys(rows[0]);
  const quote = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
  const csv = [headers.map(quote).join(','), ...rows.map((row) => headers.map((header) => quote(row[header])).join(','))].join('\r\n');
  const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' })); link.download = filename; link.click(); URL.revokeObjectURL(link.href);
}

function openAccountSecurityModal() {
  openModal({
    title: 'Account security', subtitle: `${state.user.name} · ${state.user.email}`,
    content: `<div class="security-callout"><i>${icon('lock')}</i><div><strong>Change your password</strong><span>You will be signed out on every device after this change.</span></div></div><form id="password-form"><div class="form-grid"><div class="form-field full"><label>Current password <em>*</em></label><input name="currentPassword" type="password" autocomplete="current-password" required></div><div class="form-field"><label>New password <em>*</em></label><input id="new-password" name="newPassword" type="password" minlength="12" maxlength="128" autocomplete="new-password" required><small>Use at least 12 characters. Passphrases work well.</small></div><div class="form-field"><label>Confirm new password <em>*</em></label><input name="confirmPassword" type="password" minlength="12" maxlength="128" autocomplete="new-password" required></div><div class="form-field full"><div class="password-strength"><span id="password-strength-bar"></span></div><small id="password-strength-label">Enter a new password</small></div></div></form>`,
    footer: `<button class="button secondary modal-cancel">Cancel</button><button class="button primary" id="change-password">Change password</button>`
  });
  $('.modal-cancel').onclick = closeModal;
  $('#new-password').oninput = (event) => {
    const length = event.target.value.length; const score = Math.min(100, length / 16 * 100);
    $('#password-strength-bar').style.width = `${score}%`;
    $('#password-strength-label').textContent = length < 12 ? `${12 - length} more characters needed` : length < 16 ? 'Good password length' : 'Strong passphrase length';
  };
  $('#change-password').onclick = async () => {
    const form = $('#password-form'); if (!form.reportValidity()) return;
    const values = Object.fromEntries(new FormData(form));
    if (values.newPassword !== values.confirmPassword) return toast('Passwords do not match', 'Enter the same new password twice.', 'error');
    setBusy($('#change-password'), true, 'Changing...');
    try {
      const email = state.user.email;
      await request('/api/auth/change-password', { method: 'POST', body: values });
      closeModal(); showLogin(); toast('Password changed', 'Sign in again with your new password.');
      $('#login-email').value = email;
      $('#login-password').value = '';
    } catch (error) { toast('Could not change password', error.message, 'error'); setBusy($('#change-password'), false); }
  };
}

const roleDetails = {
  admin: ['Administrator', 'Full access, team management and settings'],
  manager: ['Manager', 'Operations, reports and audit history'],
  cashier: ['Cashier', 'POS, sales, customers and payment collection'],
  storekeeper: ['Storekeeper', 'Inventory, stock adjustments and purchases']
};

function employeeTable(users) {
  return `<div class="table-wrap"><table class="data-table"><thead><tr><th>Employee</th><th>Role</th><th>Status</th><th>Last sign-in</th><th>Created</th><th></th></tr></thead><tbody>${users.map((employee) => `<tr><td><div class="primary-cell"><span class="avatar">${esc(initials(employee.name))}</span><div><strong>${esc(employee.name)}${employee.id === state.user.id ? ' (you)' : ''}</strong><span>${esc(employee.email)}</span></div></div></td><td><strong>${esc(roleDetails[employee.role]?.[0] || employee.role)}</strong><br><span class="faint" style="font-size:8px">${esc(roleDetails[employee.role]?.[1] || '')}</span></td><td>${statusBadge(employee.active ? 'active' : 'neutral')}</td><td>${employee.lastLoginAt ? formatDate(employee.lastLoginAt, true) : '<span class="faint">Never</span>'}</td><td>${formatDate(employee.createdAt)}</td><td><div class="row-actions"><button class="icon-btn" data-edit-employee="${employee.id}" title="Edit employee">${icon('edit')}</button></div></td></tr>`).join('')}</tbody></table></div>`;
}

function auditTable(logs) {
  return `<div class="table-wrap"><table class="data-table"><thead><tr><th>Date</th><th>Employee</th><th>Activity</th><th>Details</th><th>IP address</th></tr></thead><tbody>${logs.length ? logs.slice(0, 80).map((log) => `<tr><td class="no-wrap">${formatDate(log.createdAt, true)}</td><td><strong>${esc(log.userName)}</strong></td><td><span class="badge neutral">${esc(log.action.replaceAll('.', ' '))}</span></td><td>${esc(log.summary)}</td><td class="sku">${esc(log.ipAddress || 'Local')}</td></tr>`).join('') : emptyRow(5, 'No activity recorded yet', 'Security and business activity will appear here.')}</tbody></table></div>`;
}

function openEmployeeModal(employee = null) {
  openModal({
    title: employee ? 'Edit employee' : 'Add employee', subtitle: employee ? 'Update access or reset the employee password' : 'Create a secure employee account', size: 'large',
    content: `<form id="employee-form"><div class="form-grid"><div class="form-field"><label>Full name <em>*</em></label><input name="name" value="${esc(employee?.name || '')}" required></div><div class="form-field"><label>Email address <em>*</em></label><input name="email" type="email" value="${esc(employee?.email || '')}" required></div><div class="form-field full"><label>Role <em>*</em></label><select name="role">${Object.entries(roleDetails).map(([role, [label, detail]]) => `<option value="${role}" ${employee?.role === role ? 'selected' : ''}>${label} — ${detail}</option>`).join('')}</select></div><div class="form-field full"><label>${employee ? 'New password (optional)' : 'Temporary password'} ${employee ? '' : '<em>*</em>'}</label><input name="password" type="password" minlength="12" maxlength="128" autocomplete="new-password" ${employee ? '' : 'required'}><small>${employee ? 'Leave empty to keep the current password.' : 'At least 12 characters. Share it securely.'}</small></div>${employee ? `<div class="form-field full"><label class="check-field"><input name="active" type="checkbox" ${employee.active ? 'checked' : ''} ${employee.id === state.user.id ? 'disabled' : ''}><span>Account is active</span></label></div>` : ''}<div class="form-field full admin-confirm"><label>Your administrator password <em>*</em></label><input name="currentPassword" type="password" autocomplete="current-password" required><small>Required to authorize this security-sensitive change.</small></div></div></form>`,
    footer: `<button class="button secondary modal-cancel">Cancel</button><button class="button primary" id="save-employee">${employee ? 'Save employee' : 'Create employee'}</button>`
  });
  $('.modal-cancel').onclick = closeModal;
  $('#save-employee').onclick = async () => {
    const form = $('#employee-form'); if (!form.reportValidity()) return;
    const values = Object.fromEntries(new FormData(form));
    if (employee) values.active = employee.id === state.user.id ? true : form.elements.active.checked;
    setBusy($('#save-employee'), true);
    try {
      await request(employee ? `/api/users/${employee.id}` : '/api/users', { method: employee ? 'PUT' : 'POST', body: values });
      closeModal(); toast(employee ? 'Employee updated' : 'Employee created', `${values.name}'s access is ready.`); await renderSettings();
    } catch (error) { toast('Could not save employee', error.message, 'error'); setBusy($('#save-employee'), false); }
  };
}

function openBranchModal(branch = null) {
  openModal({ title: branch ? 'Edit branch' : 'Add branch', subtitle: branch ? `Update ${branch.name}` : 'Create another stock location', content: `<form id="branch-form"><div class="form-grid"><div class="form-field"><label>Branch code <em>*</em></label><input name="code" maxlength="20" value="${esc(branch?.code || '')}" placeholder="e.g. ADAMA" required></div><div class="form-field"><label>Branch name <em>*</em></label><input name="name" maxlength="120" value="${esc(branch?.name || '')}" placeholder="e.g. Adama Store" required></div><div class="form-field full"><label>Address</label><input name="address" value="${esc(branch?.address || '')}" placeholder="City, sub-city and street"></div><div class="form-field full"><label>Phone</label><input name="phone" value="${esc(branch?.phone || '')}" placeholder="+251 ..."></div>${branch ? `<div class="form-field full"><label class="check-field"><input name="active" type="checkbox" ${branch.active ? 'checked' : ''} ${branch.id === state.settings.defaultBranchId ? 'disabled' : ''}><span>Branch is active</span></label></div>` : ''}</div></form>`, footer: `<button class="button secondary modal-cancel">Cancel</button><button class="button primary" id="save-branch">${branch ? 'Save branch' : 'Add branch'}</button>` });
  $('.modal-cancel').onclick = closeModal;
  $('#save-branch').onclick = async () => {
    const form = $('#branch-form'); if (!form.reportValidity()) return; const values = Object.fromEntries(new FormData(form)); if (branch) values.active = branch.id === state.settings.defaultBranchId ? true : form.elements.active.checked;
    setBusy($('#save-branch'), true);
    try { await request(branch ? `/api/branches/${branch.id}` : '/api/branches', { method: branch ? 'PUT' : 'POST', body: values }); closeModal(); toast(branch ? 'Branch updated' : 'Branch added', `${values.name} is ready.`); await loadBootstrap(); await renderSettings(); }
    catch (error) { toast('Could not save branch', error.message, 'error'); setBusy($('#save-branch'), false); }
  };
}

async function renderSettings() {
  const [{ settings }, team, auditData, storage, backupData, readiness, branchData] = await Promise.all([request('/api/settings'), request('/api/users'), request('/api/audit-logs'), request('/api/system/storage'), request('/api/backups'), request('/api/system/readiness'), request('/api/branches')]); state.settings = settings; state.users = team.users; state.auditLogs = auditData.logs; state.storage = storage; state.backups = backupData.backups; state.readiness = readiness; state.allBranches = branchData.branches;
  $('#page-content').innerHTML = `<div class="page-head"><div><h2>Business settings</h2><p>Details used throughout invoices, taxes and stock alerts.</p></div></div><div class="settings-layout"><aside class="card settings-nav"><button class="active">${icon('settings')} Business profile</button><button>${icon('vat')} Tax & invoices</button><button>${icon('payments')} Payments</button></aside><section class="card"><header class="card-header"><div><h3>Company profile</h3><p>This information appears on printed invoices.</p></div></header><div class="card-body"><form id="settings-form"><div class="form-section">Business identity</div><div class="form-grid"><div class="form-field"><label>Business name</label><input name="businessName" value="${esc(settings.businessName)}" required></div><div class="form-field"><label>Amharic name</label><input name="businessNameAm" value="${esc(settings.businessNameAm)}"></div><div class="form-field"><label>Phone</label><input name="phone" value="${esc(settings.phone)}"></div><div class="form-field"><label>Email</label><input name="email" type="email" value="${esc(settings.email)}"></div><div class="form-field full"><label>Address</label><input name="address" value="${esc(settings.address)}"></div><div class="form-field"><label>TIN</label><input name="tin" value="${esc(settings.tin)}"></div><div class="form-field"><label>VAT registration number</label><input name="vatNumber" value="${esc(settings.vatNumber)}"></div></div><div class="form-section" style="margin-top:22px">Tax and numbering</div><div class="form-grid three"><div class="form-field"><label>VAT rate (%)</label><input name="vatRate" type="number" min="0" max="100" step="0.01" value="${settings.vatRate}"></div><div class="form-field"><label>Invoice prefix</label><input name="invoicePrefix" value="${esc(settings.invoicePrefix)}"></div><div class="form-field"><label>Purchase prefix</label><input name="purchasePrefix" value="${esc(settings.purchasePrefix)}"></div><div class="form-field"><label>Default low-stock level</label><input name="lowStockDefault" type="number" min="0" step="1" value="${settings.lowStockDefault}"></div><div class="form-field"><label>VAT status</label><label class="check-field"><input name="vatRegistered" type="checkbox" ${settings.vatRegistered ? 'checked' : ''}><span>VAT registered</span></label></div></div><div class="form-field" style="margin-top:14px"><label>Receipt footer</label><textarea name="receiptFooter">${esc(settings.receiptFooter)}</textarea></div><div class="form-section" style="margin-top:22px">Online payment</div><div class="gateway-card"><div class="gateway-brand"><span class="gateway-logo">Chapa</span><div><strong>Chapa hosted checkout</strong><span>${settings.chapaEnabled ? 'Connected through the server environment' : 'Add CHAPA_SECRET_KEY to enable online collection'}</span></div></div>${statusBadge(settings.chapaEnabled ? 'active' : 'neutral')}</div><div style="display:flex;justify-content:flex-end;margin-top:20px"><button class="button primary" id="save-settings" type="button">Save settings</button></div></form></div></section></div>`;
  $('#page-content').insertAdjacentHTML('beforeend', `<section class="card team-card"><header class="card-header"><div><h3>Data storage & backups</h3><p>Production database readiness and verified recovery snapshots</p></div>${statusBadge(storage.engine === 'postgresql' ? 'active' : 'neutral')}</header><div class="card-body"><div class="storage-status"><i>${icon('database')}</i><div><strong>${storage.engine === 'postgresql' ? 'PostgreSQL connected' : 'Local JSON development mode'}</strong><span>${storage.engine === 'postgresql' ? 'Business data is stored transactionally in PostgreSQL.' : 'Set DATABASE_URL and run npm.cmd run db:migrate before production deployment.'}</span></div><code>Store v${storage.storeVersion}</code></div><div class="backup-status"><div><strong>${state.backups.length ? `${state.backups.length} verified backup${state.backups.length === 1 ? '' : 's'}` : 'No backups created yet'}</strong><span>${state.backups[0] ? `Latest: ${formatDate(state.backups[0].modifiedAt, true)} · ${(state.backups[0].size / 1024).toFixed(1)} KB` : `Automatic every ${backupData.intervalHours} hours · keep ${backupData.retentionCount}`}</span></div><button class="button secondary small" id="create-backup">${icon('database')} Back up now</button></div></div></section><section class="card team-card"><header class="card-header"><div><h3>Employees & access</h3><p>${state.users.filter((employee) => employee.active).length} active accounts · role-based permissions</p></div><button class="button primary small" id="add-employee">${icon('plus')} Add employee</button></header>${employeeTable(state.users)}</section><section class="card team-card"><header class="card-header"><div><h3>Activity & security log</h3><p>Latest employee and business changes · retained up to 2,000 events</p></div><button class="button secondary small" id="export-audit">${icon('download')} Export log</button></header>${auditTable(state.auditLogs)}</section>`);
  $('#page-content').insertAdjacentHTML('beforeend', `<section class="card team-card"><header class="card-header"><div><h3>Branches & locations</h3><p>${state.allBranches.filter((branch) => branch.active).length} active stock locations</p></div><button class="button primary small" id="add-branch">${icon('plus')} Add branch</button></header><div class="branch-settings"><div class="form-field"><label>Default branch</label><div class="inline-setting"><select id="default-branch">${state.allBranches.filter((branch) => branch.active).map((branch) => `<option value="${branch.id}" ${branch.id === settings.defaultBranchId ? 'selected' : ''}>${esc(branch.code)} · ${esc(branch.name)}</option>`).join('')}</select><button class="button secondary small" id="save-default-branch">Save default</button></div></div></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Code</th><th>Branch</th><th>Address</th><th>Phone</th><th>Status</th><th></th></tr></thead><tbody>${state.allBranches.map((branch) => `<tr><td><span class="sku">${esc(branch.code)}</span></td><td><strong>${esc(branch.name)}</strong>${branch.id === settings.defaultBranchId ? '<br><span class="faint">Default branch</span>' : ''}</td><td>${esc(branch.address || '—')}</td><td>${esc(branch.phone || '—')}</td><td>${statusBadge(branch.active ? 'active' : 'neutral')}</td><td><button class="icon-btn" data-edit-branch="${branch.id}" title="Edit branch">${icon('edit')}</button></td></tr>`).join('')}</tbody></table></div></section><section class="card team-card"><header class="card-header"><div><h3>Production readiness</h3><p>${readiness.ready ? 'Required launch protections are configured' : 'Complete the required items before using real business data'}</p></div><span class="readiness-summary ${readiness.ready ? 'ready' : 'pending'}">${readiness.checks.filter((check) => check.passed).length}/${readiness.checks.length} ready</span></header><div class="readiness-grid">${readiness.checks.map((check) => `<div class="readiness-item ${check.passed ? 'passed' : 'missing'}"><i>${icon(check.passed ? 'check' : 'alert')}</i><div><strong>${esc(check.label)}${check.required ? '' : ' (optional)'}</strong><span>${check.passed ? 'Configured' : esc(check.action)}</span></div></div>`).join('')}</div></section>`);
  $('#add-branch').onclick = () => openBranchModal();
  $$('[data-edit-branch]').forEach((button) => button.onclick = () => openBranchModal(state.allBranches.find((branch) => branch.id === button.dataset.editBranch)));
  $('#save-default-branch').onclick = async () => { setBusy($('#save-default-branch'), true); try { const result = await request('/api/settings', { method: 'PUT', body: { defaultBranchId: $('#default-branch').value } }); state.settings = result.settings; await loadBootstrap(); toast('Default branch saved', `${currentBranch()?.name || 'Branch'} remains available from the header selector.`); await renderSettings(); } catch (error) { toast('Could not save default branch', error.message, 'error'); setBusy($('#save-default-branch'), false); } };
  $('#create-backup').onclick = async () => {
    setBusy($('#create-backup'), true, 'Backing up...');
    try { const { backup } = await request('/api/backups', { method: 'POST' }); toast('Backup created', `${backup.filename} passed checksum protection.`); await renderSettings(); }
    catch (error) { toast('Backup failed', error.message, 'error'); setBusy($('#create-backup'), false); }
  };
  $('#add-employee').onclick = () => openEmployeeModal();
  $$('[data-edit-employee]').forEach((button) => button.onclick = () => openEmployeeModal(state.users.find((employee) => employee.id === button.dataset.editEmployee)));
  $('#export-audit').onclick = () => downloadCSV('nile-audit-log.csv', state.auditLogs.map((log) => ({ Date: log.createdAt, Employee: log.userName, Action: log.action, Entity: log.entityType, Details: log.summary, IP: log.ipAddress })));
  $('#save-settings').onclick = async () => {
    const form = $('#settings-form'); if (!form.reportValidity()) return;
    const values = Object.fromEntries(new FormData(form)); values.vatRegistered = form.elements.vatRegistered.checked;
    setBusy($('#save-settings'), true);
    try { state.settings = (await request('/api/settings', { method: 'PUT', body: values })).settings; toast('Settings saved', 'New business preferences are active.'); }
    catch (error) { toast('Could not save settings', error.message, 'error'); }
    finally { setBusy($('#save-settings'), false); }
  };
}

async function openCommand() {
  await Promise.all([ensureProducts(), !can('sales:view') || state.sales.length ? Promise.resolve() : request(branchPath('/api/sales')).then((data) => { state.sales = data.sales; })]);
  const root = $('#command-root');
  root.innerHTML = `<div class="command-backdrop"><section class="command"><div class="command-input">${icon('search')}<input id="command-input" placeholder="Search products, invoices or jump to a page..."><kbd>ESC</kbd></div><div class="command-results" id="command-results"></div></section></div>`;
  const input = $('#command-input');
  const render = () => {
    const q = input.value.toLowerCase();
    const pages = navItems.filter(([, key,, label, permission]) => (!permission || can(permission)) && (!q || label.toLowerCase().includes(q))).slice(0, 5);
    const products = state.products.filter((product) => !q || [product.name, product.sku, product.barcode].join(' ').toLowerCase().includes(q)).slice(0, 6);
    const sales = state.sales.filter((sale) => q && [sale.invoiceNo, sale.customerName].join(' ').toLowerCase().includes(q)).slice(0, 5);
    $('#command-results').innerHTML = `${pages.length ? `<div class="command-label">Go to</div>${pages.map(([, key, iconName, label]) => `<button class="command-row" data-command-page="${key}"><i>${icon(iconName)}</i><div><strong>${label}</strong><span>Open page</span></div><em>↵</em></button>`).join('')}` : ''}${products.length ? `<div class="command-label">Products</div>${products.map((product) => `<button class="command-row" data-command-product="${product.id}"><i>${icon('wrench')}</i><div><strong>${esc(product.name)}</strong><span>${esc(product.sku)} · ${product.stock} in stock</span></div><em>${formatMoney(product.sellingPrice)}</em></button>`).join('')}` : ''}${sales.length ? `<div class="command-label">Invoices</div>${sales.map((sale) => `<button class="command-row" data-command-sale="${sale.id}"><i>${icon('receipt')}</i><div><strong>${esc(sale.invoiceNo)}</strong><span>${esc(sale.customerName)}</span></div><em>${formatMoney(sale.total)}</em></button>`).join('')}` : ''}${!pages.length && !products.length && !sales.length ? '<div class="empty-state"><h3>No results</h3><p>Try another search term.</p></div>' : ''}`;
    $$('[data-command-page]').forEach((button) => button.onclick = () => { closeCommand(); navigate(button.dataset.commandPage); });
    $$('[data-command-product]').forEach((button) => button.onclick = () => { const product = productById(button.dataset.commandProduct); closeCommand(); navigate('inventory').then(() => { $('#inventory-search').value = product.sku; $('#inventory-search').dispatchEvent(new Event('input')); }); });
    $$('[data-command-sale]').forEach((button) => button.onclick = () => { const sale = state.sales.find((item) => item.id === button.dataset.commandSale); closeCommand(); showSaleDetail(sale); });
  };
  input.oninput = render; input.focus(); render();
  $('.command-backdrop').onclick = (event) => { if (event.target.classList.contains('command-backdrop')) closeCommand(); };
}

function closeCommand() { $('#command-root').innerHTML = ''; }

async function showStockAlerts() {
  await ensureProducts(true);
  const low = state.products.filter((product) => product.stock <= product.reorderLevel);
  openModal({ title: 'Stock alerts', subtitle: `${low.length} items need attention`, content: low.length ? `<div class="stock-list">${low.map((product) => `<div class="stock-alert-row"><span class="part-thumb">${icon('wrench')}</span><div><strong>${esc(product.name)}</strong><span>${esc(product.sku)} · Reorder at ${product.reorderLevel}</span></div><strong class="stock-count">${product.stock} left</strong></div>`).join('')}</div>` : `<div class="empty-state"><div class="empty-icon">${icon('check')}</div><h3>All stock is healthy</h3><p>No products are below reorder level.</p></div>`, footer: `<button class="button secondary modal-cancel">Close</button><button class="button primary" id="go-inventory">View inventory</button>` });
  $('.modal-cancel').onclick = closeModal; $('#go-inventory').onclick = () => { closeModal(); navigate('inventory'); };
}

function setupEvents() {
  applyIcons();
  $('#login-form').onsubmit = async (event) => {
    event.preventDefault(); $('#login-error').textContent = '';
    const button = $('.login-submit'); setBusy(button, true, 'Signing in...');
    try { const data = await request('/api/auth/login', { method: 'POST', body: { email: $('#login-email').value, password: $('#login-password').value } }); await startApp({ ...data, settings: null }); }
    catch (error) { $('#login-error').textContent = error.message; }
    finally { setBusy(button, false); }
  };
  $('.password-toggle').onclick = () => {
    const input = $('#login-password'); input.type = input.type === 'password' ? 'text' : 'password';
    $('.password-toggle').dataset.iconButton = input.type === 'password' ? 'eye' : 'eye-off'; applyIcons($('.password-toggle'));
  };
  $('#menu-toggle').onclick = () => { $('#sidebar').classList.add('open'); $('#sidebar-overlay').classList.add('visible'); };
  $('#sidebar-overlay').onclick = closeSidebar;
  $('#quick-sale-button').onclick = () => navigate('pos');
  $('#global-search-button').onclick = openCommand;
  $('#notification-button').onclick = showStockAlerts;
  window.addEventListener('hashchange', () => { const page = location.hash.slice(1); if (state.user && page !== state.currentPage) navigate(page); });
  document.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); openCommand(); }
    if (event.key === 'Escape' && $('#command-root').innerHTML) closeCommand();
  });
}

setupEvents();

(async () => {
  try { const data = await request('/api/auth/me'); await startApp(data); }
  catch { showLogin(); }
  const payment = new URLSearchParams(location.search).get('payment');
  if (payment) {
    history.replaceState({}, '', location.pathname + location.hash);
    toast(payment === 'success' ? 'Payment confirmed' : 'Payment not completed', payment === 'success' ? 'The Chapa payment was verified and applied.' : 'The online payment could not be verified.', payment === 'success' ? 'success' : 'error');
  }
})();
