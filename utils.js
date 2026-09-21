/* =========================================================================
   UTILS — الدوال المساعدة
   ========================================================================= */

/* =========================================================================
   TRANSLATION — الترجمة
   ========================================================================= */
function t(key) {
  const lang = TRANSLATIONS[state.language] || TRANSLATIONS.ar;
  return lang[key] || key;
}

/* =========================================================================
   NUMBER FORMATTING — تنسيق الأرقام
   ========================================================================= */
function formatNumber(n) {
  const num = Number(n) || 0;
  return num.toLocaleString('fr-FR');
}

function formatMoney(n) {
  const num = Number(n) || 0;
  return num.toLocaleString('fr-FR') + ' ' + state.store.currency;
}

function formatDate(ts, withTime) {
  if (!ts) return '-';
  const d = new Date(ts);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  if (withTime) {
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    return day + '/' + month + '/' + year + ' ' + h + ':' + m;
  }
  return day + '/' + month + '/' + year;
}

function timeAgo(ts) {
  if (!ts) return '-';
  const diff = Date.now() - ts;
  const s = Math.floor(diff / 1000);
  if (s < 60) return state.language === 'ar' ? 'الان' : 'now';

  const m = Math.floor(s / 60);
  if (m < 60) return state.language === 'ar' ? m + ' د' : m + 'm';

  const h = Math.floor(m / 60);
  if (h < 24) return state.language === 'ar' ? h + ' س' : h + 'h';

  const d = Math.floor(h / 24);
  if (d < 30) return state.language === 'ar' ? d + ' ي' : d + 'd';

  const mo = Math.floor(d / 30);
  return state.language === 'ar' ? mo + ' شهر' : mo + 'mo';
}

/* =========================================================================
   DATE HELPERS — دوال التاريخ
   ========================================================================= */
function startOfDay(ts) {
  const d = new Date(ts || Date.now());
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function endOfDay(ts) {
  const d = new Date(ts || Date.now());
  d.setHours(23, 59, 59, 999);
  return d.getTime();
}

function startOfWeek() {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function startOfMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).getTime();
}

function startOfYear() {
  const d = new Date();
  return new Date(d.getFullYear(), 0, 1).getTime();
}

/* =========================================================================
   ID GENERATION — توليد المعرّفات
   ========================================================================= */
function uid(prefix) {
  return (prefix || 'id') + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6);
}

function nextInvoiceNo() {
  const nums = state.sales.map(function(s) {
    const m = String(s.invoiceNo || '').match(/(\d+)/);
    return m ? parseInt(m[1]) : 1000;
  });
  const max = nums.length ? Math.max.apply(null, nums) : 1000;
  return 'INV-' + (max + 1);
}

/* =========================================================================
   FIND HELPERS — دوال البحث
   ========================================================================= */
function findProduct(id) {
  return state.products.find(function(p) { return p.id === id; });
}

function findCustomer(id) {
  return state.customers.find(function(c) { return c.id === id; });
}

function findSupplier(id) {
  return state.suppliers.find(function(s) { return s.id === id; });
}

function findCategory(id) {
  return state.categories.find(function(c) { return c.id === id; });
}

function getProductStatus(p) {
  if (p.stock <= 0) return 'out';
  if (p.stock <= p.minStock) return 'low';
  return 'in';
}

function getCategoryName(id) {
  const cat = findCategory(id);
  return cat ? cat.name : '-';
}

function getProductSupplier(product) {
  if (!product.supplierId) return null;
  return findSupplier(product.supplierId);
}

/* =========================================================================
   EXPIRY HELPERS — الصلاحية
   ========================================================================= */
function isExpiringSoon(product, daysThreshold) {
  if (!product.expiryDate) return false;
  const now = Date.now();
  const threshold = (daysThreshold || 30) * 864e5;
  return product.expiryDate - now <= threshold && product.expiryDate > now;
}

function isExpired(product) {
  if (!product.expiryDate) return false;
  return product.expiryDate < Date.now();
}

function daysUntilExpiry(product) {
  if (!product.expiryDate) return null;
  return Math.ceil((product.expiryDate - Date.now()) / 864e5);
}

function getExpiredProducts() {
  return state.products.filter(function(p) { return isExpired(p); });
}

function getExpiringSoonProducts(days) {
  return state.products.filter(function(p) { return isExpiringSoon(p, days || 30); });
}

/* =========================================================================
   CALCULATIONS — الحسابات
   ========================================================================= */
function getCashBalance() {
  if (!state.cashMovements.length) return 0;
  const last = state.cashMovements.reduce(function(latest, m) {
    return m.date > latest.date ? m : latest;
  }, state.cashMovements[0]);
  return last.balance || 0;
}

function getTodaySales() {
  const start = startOfDay();
  const end = endOfDay();
  return state.sales.filter(function(s) {
    return s.date >= start && s.date <= end;
  });
}

function getTodayExpenses() {
  const start = startOfDay();
  const end = endOfDay();
  return state.expenses.filter(function(e) {
    return e.date >= start && e.date <= end;
  });
}

function getTodaySalesTotal() {
  return getTodaySales().reduce(function(sum, s) { return sum + (s.total || 0); }, 0);
}

function getTodayExpensesTotal() {
  return getTodayExpenses().reduce(function(sum, e) { return sum + (e.amount || 0); }, 0);
}

function getTodayProfit() {
  const sales = getTodaySales();
  return sales.reduce(function(sum, s) { return sum + (s.profit || 0); }, 0);
}

function getSalesByRange(start, end) {
  return state.sales.filter(function(s) {
    return s.date >= start && s.date <= end;
  });
}

function getExpensesByRange(start, end) {
  return state.expenses.filter(function(e) {
    return e.date >= start && e.date <= end;
  });
}

function getTotalRevenue(start, end) {
  return getSalesByRange(start, end).reduce(function(sum, s) { return sum + (s.total || 0); }, 0);
}

function getTotalProfit(start, end) {
  return getSalesByRange(start, end).reduce(function(sum, s) { return sum + (s.profit || 0); }, 0);
}

function getTotalExpenses(start, end) {
  return getExpensesByRange(start, end).reduce(function(sum, e) { return sum + (e.amount || 0); }, 0);
}

function getLowStockProducts() {
  return state.products.filter(function(p) {
    const st = getProductStatus(p);
    return st === 'low' || st === 'out';
  });
}

function getTotalCustomerDebt() {
  return state.customers.reduce(function(sum, c) { return sum + (c.debt || 0); }, 0);
}

function getTotalSupplierOwed() {
  return state.suppliers.reduce(function(sum, s) { return sum + (s.owed || 0); }, 0);
}

function getSalePaidAmount(sale) {
  return sale.paidAmount !== undefined ? sale.paidAmount : (sale.paid ? sale.total : 0);
}

function getSaleRemaining(sale) {
  return sale.total - getSalePaidAmount(sale);
}

function getNewDebts() {
  return state.sales
    .filter(function(s) { return !s.paid; })
    .reduce(function(sum, s) { return sum + getSaleRemaining(s); }, 0);
}

function getCollectedDebts() {
  return state.payments.reduce(function(sum, p) { return sum + p.amount; }, 0);
}

function getInventoryValue() {
  return state.products.reduce(function(sum, p) {
    return sum + (p.stock * (p.cost || 0));
  }, 0);
}

function getInventoryRetailValue() {
  return state.products.reduce(function(sum, p) {
    return sum + (p.stock * p.price);
  }, 0);
}

/* =========================================================================
   LOYALTY POINTS — نقاط الولاء
   ========================================================================= */
function getCustomerPoints(customerId) {
  const c = findCustomer(customerId);
  return c ? (c.points || 0) : 0;
}

function earnPointsFromSale(customerId, saleTotal) {
  if (!state.loyaltySettings.enabled) return 0;
  if (!customerId || customerId === 'walkin') return 0;

  const c = findCustomer(customerId);
  if (!c) return 0;

  const points = Math.floor(saleTotal * state.loyaltySettings.pointsPerCurrency);
  c.points = (c.points || 0) + points;
  return points;
}

function redeemPoints(customerId, points) {
  const c = findCustomer(customerId);
  if (!c) return 0;

  const available = c.points || 0;
  const toRedeem = Math.min(points, available);
  c.points = available - toRedeem;
  return toRedeem * state.loyaltySettings.pointValue;
}

/* =========================================================================
   TOP PRODUCTS / CUSTOMERS — الأفضل
   ========================================================================= */
function getTopProducts(limit) {
  limit = limit || 5;
  const map = {};

  state.sales.forEach(function(s) {
    (s.items || []).forEach(function(item) {
      if (!map[item.productId]) {
        map[item.productId] = {
          productId: item.productId,
          name: item.name,
          qty: 0,
          revenue: 0,
        };
      }
      map[item.productId].qty += item.qty;
      map[item.productId].revenue += item.qty * item.price;
    });
  });

  return Object.values(map)
    .sort(function(a, b) { return b.qty - a.qty; })
    .slice(0, limit);
}

function getTopCustomers(limit) {
  limit = limit || 5;
  const map = {};

  state.sales.forEach(function(s) {
    if (!s.customerId || s.customerId === 'walkin') return;
    if (!map[s.customerId]) map[s.customerId] = { customerId: s.customerId, count: 0, total: 0 };
    map[s.customerId].count += 1;
    map[s.customerId].total += s.total;
  });

  return Object.entries(map)
    .map(function(entry) {
      const c = findCustomer(entry[0]);
      return { customer: c, count: entry[1].count, total: entry[1].total };
    })
    .filter(function(x) { return x.customer; })
    .sort(function(a, b) { return b.total - a.total; })
    .slice(0, limit);
}

function getWeeklyChart() {
  const days = [];
  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const start = startOfDay(d.getTime());
    const end = endOfDay(d.getTime());
    const total = getTotalRevenue(start, end);
    days.push({ date: d, total: total });
  }
  return days;
}

/* =========================================================================
   ACTIVITY LOG — سجل النشاط
   ========================================================================= */
function logActivity(type, title, detail) {
  const entry = {
    id: uid('act'),
    type: type,
    title: title,
    detail: detail || '',
    date: Date.now(),
  };
  state.activity.unshift(entry);
  if (state.activity.length > 100) state.activity = state.activity.slice(0, 100);
}

/* =========================================================================
   NOTIFICATIONS — الإشعارات
   ========================================================================= */
function getNotifications() {
  const list = [];

  state.products.filter(function(p) { return p.stock <= 0; }).forEach(function(p) {
    list.push({
      id: 'notif-out-' + p.id,
      type: 'danger',
      icon: 'alertCircle',
      title: t('notifOutStock') + ': ' + p.name,
      detail: p.sku,
    });
  });

  state.products.filter(function(p) { return p.stock > 0 && p.stock <= p.minStock; }).forEach(function(p) {
    list.push({
      id: 'notif-low-' + p.id,
      type: 'warning',
      icon: 'alertCircle',
      title: t('notifLowStock') + ': ' + p.name,
      detail: 'Stock: ' + p.stock,
    });
  });

  state.products.filter(function(p) { return isExpired(p); }).forEach(function(p) {
    list.push({
      id: 'notif-expired-' + p.id,
      type: 'danger',
      icon: 'alertCircle',
      title: 'منتج منتهي الصلاحية: ' + p.name,
      detail: 'انتهى في ' + formatDate(p.expiryDate),
    });
  });

  state.products.filter(function(p) { return isExpiringSoon(p, 30); }).forEach(function(p) {
    const days = daysUntilExpiry(p);
    list.push({
      id: 'notif-expiring-' + p.id,
      type: 'warning',
      icon: 'clock',
      title: 'قريب الانتهاء: ' + p.name,
      detail: 'باقي ' + days + ' يوم',
    });
  });

  state.customers.filter(function(c) { return c.debt > 0; }).forEach(function(c) {
    list.push({
      id: 'notif-debt-' + c.id,
      type: 'warning',
      icon: 'user',
      title: t('notifCustomerDebt') + ': ' + c.name,
      detail: formatMoney(c.debt),
    });
  });

  state.suppliers.filter(function(s) { return s.owed > 0; }).forEach(function(s) {
    list.push({
      id: 'notif-owed-' + s.id,
      type: 'info',
      icon: 'truck',
      title: t('notifSupplierOwed') + ': ' + s.name,
      detail: formatMoney(s.owed),
    });
  });

  const hour = new Date().getHours();
  if (hour >= 20) {
    const todaySales = getTodaySalesTotal();
    list.push({
      id: 'notif-dayend',
      type: 'info',
      icon: 'calendar',
      title: t('notifDayEnd'),
      detail: 'مبيعات اليوم: ' + formatMoney(todaySales),
    });
  }

  return list.filter(function(n) {
    return state.readNotifs.indexOf(n.id) === -1;
  });
}

/* =========================================================================
   PERMISSIONS — الصلاحيات
   ========================================================================= */
const PERMISSIONS = {
  admin: [
    'home', 'pos', 'products', 'customers', 'suppliers', 'cash',
    'expenses', 'reports', 'users', 'settings', 'backup', 'log',
    'addProduct', 'editProduct', 'deleteProduct',
    'addSale', 'addCustomer', 'editCustomer', 'deleteCustomer',
    'addSupplier', 'editSupplier', 'deleteSupplier',
    'addCash', 'withdrawCash',
    'addExpense', 'editExpense', 'deleteExpense',
    'addUser', 'editUser', 'deleteUser',
    'exportData', 'resetData',
  ],
  seller: [
    'home', 'pos', 'products', 'customers', 'reports',
    'addProduct', 'editProduct', 'addSale',
    'addCustomer', 'editCustomer', 'addCash',
  ],
  viewer: ['home', 'reports'],
};

function can(perm) {
  if (!state.currentUser) return false;
  const perms = PERMISSIONS[state.currentUser.role] || [];
  return perms.indexOf(perm) !== -1;
}

/* =========================================================================
   FILTERS — الفلترة
   ========================================================================= */
function getFilteredProducts() {
  const q = (state.searchQuery || '').trim().toLowerCase();
  let list = state.products.slice();

  if (q) {
    list = list.filter(function(p) {
      return (p.name || '').toLowerCase().indexOf(q) !== -1 ||
             (p.sku || '').toLowerCase().indexOf(q) !== -1 ||
             (p.barcode || '').toLowerCase().indexOf(q) !== -1;
    });
  }

  if (state.productCategory && state.productCategory !== 'all') {
    list = list.filter(function(p) { return p.categoryId === state.productCategory; });
  }

  if (state.productFilter && state.productFilter !== 'all') {
    list = list.filter(function(p) { return getProductStatus(p) === state.productFilter; });
  }

  const sortBy = state.productSort || 'name';
  list.sort(function(a, b) {
    if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
    if (sortBy === 'price') return (b.price || 0) - (a.price || 0);
    if (sortBy === 'stock') return (b.stock || 0) - (a.stock || 0);
    if (sortBy === 'date') return (b.createdAt || 0) - (a.createdAt || 0);
    return 0;
  });

  return list;
}

function searchProducts(query) {
  const q = (query || '').trim().toLowerCase();
  if (!q) return [];
  return state.products.filter(function(p) {
    return (p.name || '').toLowerCase().indexOf(q) !== -1 ||
           (p.sku || '').toLowerCase().indexOf(q) !== -1 ||
           (p.barcode || '').toLowerCase().indexOf(q) !== -1;
  }).slice(0, 10);
}

/* =========================================================================
   CART OPERATIONS — عمليات السلة
   ========================================================================= */
function addToCart(productId, qty) {
  qty = qty || 1;
  const product = findProduct(productId);
  if (!product) return false;
  if (product.stock <= 0) return false;

  const existing = state.cart.find(function(item) { return item.productId === productId; });
  if (existing) {
    const newQty = existing.qty + qty;
    if (newQty > product.stock) return false;
    existing.qty = newQty;
  } else {
    state.cart.push({
      productId: productId,
      name: product.name,
      icon: product.icon,
      color: product.color,
      price: product.price,
      cost: product.cost || 0,
      qty: qty,
      maxQty: product.stock,
    });
  }
  return true;
}

function removeFromCart(productId) {
  state.cart = state.cart.filter(function(item) { return item.productId !== productId; });
}

function updateCartQty(productId, qty) {
  const item = state.cart.find(function(i) { return i.productId === productId; });
  if (!item) return false;
  const product = findProduct(productId);
  if (!product) return false;

  if (qty <= 0) {
    removeFromCart(productId);
    return true;
  }
  if (qty > product.stock) return false;

  item.qty = qty;
  return true;
}

function clearCart() {
  state.cart = [];
  state.posCustomerId = 'walkin';
  state.posPayment = 'cash';
  state.posDiscount = 0;
  state.posDiscountType = 'none';
}

function getCartSubtotal() {
  return state.cart.reduce(function(sum, item) {
    return sum + (item.price * item.qty);
  }, 0);
}

function getCartDiscount() {
  if (state.posDiscountType === 'percent') {
    return Math.round(getCartSubtotal() * Math.min(100, state.posDiscount) / 100);
  }
  if (state.posDiscountType === 'fixed') {
    return Math.min(getCartSubtotal(), state.posDiscount);
  }
  return 0;
}

function getCartTax() {
  const afterDiscount = getCartSubtotal() - getCartDiscount();
  const rate = Number(state.store.taxRate) || 0;
  return rate > 0 ? Math.round(afterDiscount * rate / 100) : 0;
}

function getCartTotal() {
  return getCartSubtotal() - getCartDiscount() + getCartTax();
}

function getCartProfit() {
  return state.cart.reduce(function(sum, item) {
    return sum + ((item.price - (item.cost || 0)) * item.qty);
  }, 0) - getCartDiscount();
}

function getCartCount() {
  return state.cart.reduce(function(sum, item) { return sum + item.qty; }, 0);
}

/* =========================================================================
   COLOR UTILS — ألوان
   ========================================================================= */
function shadeColor(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  let r = (num >> 16) + Math.round(255 * percent / 100);
  let g = ((num >> 8) & 0x00FF) + Math.round(255 * percent / 100);
  let b = (num & 0x0000FF) + Math.round(255 * percent / 100);
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function hexToRgba(hex, alpha) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = num >> 16;
  const g = (num >> 8) & 0x00FF;
  const b = num & 0x0000FF;
  return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
}

/* =========================================================================
   THEME & LANGUAGE — المظهر واللغة
   ========================================================================= */
function applyLanguage() {
  const isRtl = state.language === 'ar';
  document.documentElement.lang = state.language;
  document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
  document.body.dir = isRtl ? 'rtl' : 'ltr';

  const app = document.getElementById('app');
  if (app) {
    app.classList.toggle('is-rtl', isRtl);
    app.classList.toggle('is-ltr', !isRtl);
  }
}

function applyTheme() {
  document.documentElement.setAttribute('data-theme', state.theme);
  const btn = document.getElementById('themeBtn');
  if (btn) {
    btn.innerHTML = icon(state.theme === 'dark' ? 'sun' : 'moon', 20);
  }
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = state.theme === 'dark' ? '#0a0f1c' : '#f0f3f9';
}

function applyStoreColor() {
  const color = state.store.primaryColor || '#2f6bff';
  document.documentElement.style.setProperty('--primary', color);
  document.documentElement.style.setProperty('--primary-hover', shadeColor(color, -15));
  document.documentElement.style.setProperty('--primary-soft', hexToRgba(color, 0.12));
  document.documentElement.style.setProperty('--primary-glow', '0 0 24px ' + hexToRgba(color, 0.35));
}

/* =========================================================================
   TOAST — الإشعارات المنبثقة
   ========================================================================= */
function toast(message, type) {
  type = type || 'success';

  const root = document.getElementById('toastRoot');
  if (!root) return;

  const el = document.createElement('div');
  el.className = 'toast ' + type;

  const iconName = type === 'error' ? 'xCircle' : 'checkCircle';
  el.innerHTML =
    '<span class="toast-icon">' + icon(iconName, 14, 2.5) + '</span>' +
    '<span>' + message + '</span>';

  root.appendChild(el);

  setTimeout(function() {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity .3s, transform .3s';
    setTimeout(function() { el.remove(); }, 300);
  }, 3000);
}
/* =========================================================================
   CONFIRM ACTION — بديل عن confirm() لا يعمل في بعض المتصفحات
   ========================================================================= */
function confirmAction(message, onConfirm, confirmText, confirmClass) {
  confirmText = confirmText || 'تأكيد';
  confirmClass = confirmClass || 'btn-danger';
  
  const content =
    '<div class="modal-head">' +
    '<div><h2>' + icon('alertCircle', 22) + ' تأكيد</h2></div>' +
    '<button class="modal-close" data-close-modal>' + icon('x', 18) + '</button>' +
    '</div>' +
    
    '<div class="modal-body">' +
    '<p style="text-align:center;font-size:14px;color:var(--text);line-height:1.7;padding:10px 0">' + message + '</p>' +
    '</div>' +
    
    '<div class="modal-actions">' +
    '<button class="btn btn-secondary" data-close-modal>إلغاء</button>' +
    '<button class="btn ' + confirmClass + '" id="confirmActionBtn">' + icon('check', 16) + ' ' + confirmText + '</button>' +
    '</div>';
  
  openModal(content);
  
  document.getElementById('confirmActionBtn').onclick = function() {
    closeModal();
    if (typeof onConfirm === 'function') onConfirm();
  };
}
/* =========================================================================
   UPDATE SPLASH — تحديث شاشة البداية باسم وشعار المتجر
   ========================================================================= */
function updateSplash() {
  const splashLogo = document.getElementById('splashLogo');
  const splashName = document.getElementById('splashName');
  const splashTag = document.getElementById('splashTag');

  if (splashName && state.store && state.store.name) {
    splashName.textContent = state.store.name;
  }
  if (splashTag && state.store && state.store.tagline) {
    splashTag.textContent = state.store.tagline;
  }
  if (splashLogo) {
    if (state.store.logo) {
      splashLogo.innerHTML = '<img src="' + state.store.logo + '" alt="logo" style="width:100%;height:100%;object-fit:cover;border-radius:24px" />';
    } else {
      splashLogo.textContent = (state.store.name || 'م').charAt(0);
    }
  }
}