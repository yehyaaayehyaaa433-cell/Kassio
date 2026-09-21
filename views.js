/* =========================================================================
   VIEWS — شاشات العرض
   ========================================================================= */

/* =========================================================================
   ROUTER
   ========================================================================= */
const VIEWS = {
  home: renderHome,
  pos: renderPOS,
  products: renderProducts,
  customers: renderCustomers,
  suppliers: renderSuppliers,
  cash: renderCash,
  expenses: renderExpenses,
  reports: renderReports,
  users: renderUsers,
  settings: renderSettings,
  backup: renderBackup,
  log: renderLog,
};

function navigate(view) {
  if (!can(view) && view !== 'home') {
    toast(t('noPermission'), 'error');
    return;
  }
  state.activeView = view;
  saveState();
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* =========================================================================
   RENDER — الدالة الرئيسية
   ========================================================================= */
function render() {
  const viewFn = VIEWS[state.activeView] || renderHome;
  const root = document.getElementById('viewRoot');
  if (!root) return;

  root.innerHTML = viewFn();
  
  buildSidebar();
  bindViewEvents();
  setupSearchListeners();
  updateTopbar();
  bindTopbarButtons();
  updateSidebarActive();
  updateAppTitle();

  if (state.activeView === 'reports') {
    setTimeout(function() {
      if (typeof initCharts === 'function') initCharts();
    }, 50);
  } else {
    if (typeof destroyCharts === 'function') destroyCharts();
  }
}

/* =========================================================================
   UPDATE APP TITLE — تحديث عنوان التبويب
   ========================================================================= */
function updateAppTitle() {
  const title = document.getElementById('appTitle');
  if (title && state.store && state.store.name) {
    title.textContent = state.store.name + ' | نظام نقطة البيع';
  }
}

/* =========================================================================
   BIND TOPBAR BUTTONS
   ========================================================================= */
function bindTopbarButtons() {
  var themeBtn = document.getElementById('themeBtn');
  if (themeBtn) themeBtn.onclick = toggleTheme;

  var notifBtn = document.getElementById('notifBtn');
  if (notifBtn) notifBtn.onclick = toggleNotifications;

  var menuBtn = document.getElementById('menuBtn');
  if (menuBtn) menuBtn.onclick = openMenuModal;
}

/* =========================================================================
   UPDATE TOPBAR
   ========================================================================= */
function updateTopbar() {
  const store = state.store;
  const nameEl = document.getElementById('topbarName');
  const tagEl = document.getElementById('topbarTag');
  const logoEl = document.getElementById('topbarLogo');

  if (nameEl) nameEl.textContent = store.name || t('appName');
  if (tagEl) tagEl.textContent = store.tagline || t('appTag');
  if (logoEl) {
    if (store.logo) logoEl.innerHTML = '<img src="' + store.logo + '" alt="logo" />';
    else logoEl.textContent = (store.name || 'M').charAt(0);
  }

  const themeBtn = document.getElementById('themeBtn');
  if (themeBtn) {
    themeBtn.innerHTML = state.theme === 'dark' ? '☀️' : '🌙';
  }

  const notifBtn = document.getElementById('notifBtn');
  if (notifBtn) {
    const notifs = getNotifications();
    const badge = document.getElementById('notifBadge');
    if (badge) {
      if (notifs.length > 0) {
        badge.textContent = notifs.length > 99 ? '99+' : notifs.length;
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }
    }
  }
}

/* =========================================================================
   BIND VIEW EVENTS
   ========================================================================= */
function bindViewEvents() {
  document.querySelectorAll('[data-action]').forEach(function(el) {
    el.onclick = function(e) {
      e.preventDefault();
      handleAction(el.dataset.action, el.dataset);
    };
  });
}

/* =========================================================================
   HANDLE ACTION
   ========================================================================= */
function handleAction(action, data) {
  switch (action) {
    case 'nav': 
      closeModal();
      navigate(data.view); 
      break;
    case 'open-notif': toggleNotifications(); break;
    case 'toggle-theme': toggleTheme(); break;
    case 'add-product': openProductModal(); break;
    case 'edit-product': openProductModal(data.id); break;
    case 'delete-product': confirmDeleteProduct(data.id); break;
    case 'view-product': openProductDetails(data.id); break;
    case 'add-customer': openCustomerModal(); break;
    case 'edit-customer': openCustomerModal(data.id); break;
    case 'delete-customer': confirmDeleteCustomer(data.id); break;
    case 'view-customer': openCustomerDetails(data.id); break;
    case 'pay-customer-debt': openPayDebtModal(data.id); break;
    case 'add-supplier': openSupplierModal(); break;
    case 'edit-supplier': openSupplierModal(data.id); break;
    case 'delete-supplier': confirmDeleteSupplier(data.id); break;
    case 'pay-supplier': openPaySupplierModal(data.id); break;
    case 'add-cash': openCashModal('in'); break;
    case 'withdraw-cash': openCashModal('out'); break;
    case 'add-expense': openExpenseModal(); break;
    case 'edit-expense': openExpenseModal(data.id); break;
    case 'delete-expense': confirmDeleteExpense(data.id); break;
    case 'add-user': openUserModal(); break;
    case 'edit-user': openUserModal(data.id); break;
    case 'delete-user': confirmDeleteUser(data.id); break;
    case 'save-settings': saveSettings(); break;
    case 'upload-logo': document.getElementById('logoInput').click(); break;
    case 'remove-logo': removeLogo(); break;
    case 'change-color': setPrimaryColor(data.color); break;
    case 'set-lang': setLanguage(data.lang); break;
    case 'set-theme': setTheme(data.theme); break;
    case 'export-backup': exportBackup(); break;
    case 'import-backup': document.getElementById('backupInput').click(); break;
    case 'reset-data': confirmResetData(); break;
    case 'clear-log': confirmClearLog(); break;
    case 'pos-add': addToCartFromSearch(data.id); break;
    case 'pos-clear': clearCartAndRender(); break;
    case 'pos-payment': setPayment(data.payment); break;
    case 'pos-qty-minus': changeCartQty(data.id, -1); break;
    case 'pos-qty-plus': changeCartQty(data.id, 1); break;
    case 'pos-remove': removeFromCartAndRender(data.id); break;
    case 'pos-complete': completeSale(true); break;   // مع فاتورة
    case 'pos-complete-noinv': completeSale(false); break;  // بدون فاتورة
    case 'pos-log': openSalesLog(); break;
    case 'filter-category': setProductCategory(data.cat); break;
    case 'filter-status': setProductFilter(data.status); break;
    case 'print-invoice': printInvoice(data.id); break;
  }
}

function toggleTheme() {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  applyTheme();
  saveState();
  render();
}

function toggleNotifications() {
  openNotificationsModal();
}

/* =========================================================================
   HOME
   ========================================================================= */
function renderHome() {
  const user = state.currentUser;
  const greeting = getGreeting() + (user ? ', ' + user.fullName.split(' ')[0] : '');
  const balance = getCashBalance();
  const todaySales = getTodaySalesTotal();
  const todayExpenses = getTodayExpensesTotal();
  const lowStock = getLowStockProducts();
  const productsCount = state.products.length;

  const cashCard =
    '<div class="cash-card" data-action="nav" data-view="cash" style="cursor:pointer">' +
    '<div class="cash-label">' + icon('wallet', 18) + ' ' + t('cashBalance') + '</div>' +
    '<div class="cash-value">' + formatNumber(balance) + ' <span style="font-size:20px">' + state.store.currency + '</span></div>' +
    '<div class="cash-sub">' + formatDate(Date.now(), true) + '</div>' +
    '</div>';

  const statsGrid =
    '<div class="grid grid-3 mt-4">' +
    '<div class="stat">' +
    '<div class="stat-label">' + icon('shoppingBag', 14) + ' ' + t('todaySales') + '</div>' +
    '<div class="stat-value">' + formatNumber(todaySales) + ' <small>' + state.store.currency + '</small></div>' +
    '</div>' +
    '<div class="stat">' +
    '<div class="stat-label">' + icon('receipt', 14) + ' ' + t('todayExpenses') + '</div>' +
    '<div class="stat-value">' + formatNumber(todayExpenses) + ' <small>' + state.store.currency + '</small></div>' +
    '</div>' +
    '<div class="stat">' +
    '<div class="stat-label">' + icon('package', 14) + ' ' + t('productsCount') + '</div>' +
    '<div class="stat-value">' + productsCount + '</div>' +
    '</div>' +
    '</div>';

  let alertHtml = '';
  if (lowStock.length > 0) {
    alertHtml =
      '<div class="alert-card mt-4" data-action="nav" data-view="products" style="cursor:pointer">' +
      '<div class="alert-icon">' + icon('alertCircle', 22) + '</div>' +
      '<div class="alert-text">' +
      '<strong>⚠️ ' + t('lowStockAlert') + '</strong>' +
      '<small>' + lowStock.length + ' ' + t('lowStockDesc') + '</small>' +
      '</div>' +
      icon('chevronLeft', 20) +
      '</div>';
  }

  const navItems = [
    { view: 'pos', icon: 'cart', color: 'primary', title: t('navPOS'), desc: t('posSub').split(' ').slice(0, 2).join(' ') },
    { view: 'products', icon: 'package', color: 'success', title: t('navProducts'), desc: productsCount + ' ' + t('cartItems') },
    { view: 'customers', icon: 'users', color: 'purple', title: t('navCustomers'), desc: state.customers.length + ' ' + t('navCustomers') },
    { view: 'suppliers', icon: 'truck', color: 'cyan', title: t('navSuppliers'), desc: state.suppliers.length + ' ' + t('navSuppliers') },
    { view: 'cash', icon: 'wallet', color: 'primary', title: t('navCash'), desc: formatNumber(balance) + ' ' + state.store.currency },
    { view: 'expenses', icon: 'trendingDown', color: 'danger', title: t('navExpenses'), desc: state.expenses.length + ' ' + t('navExpenses') },
    { view: 'reports', icon: 'chart', color: 'warning', title: t('navReports'), desc: t('reportsSub') },
    { view: 'backup', icon: 'database', color: 'cyan', title: t('navBackup'), desc: 'JSON' },
    { view: 'settings', icon: 'settings', color: 'purple', title: t('navSettings'), desc: t('settingsSub') },
  ];
  if (can('users')) navItems.splice(7, 0, { view: 'users', icon: 'shield', color: 'danger', title: t('navUsers'), desc: state.users.length + ' ' + t('navUsers') });
  if (can('log')) navItems.push({ view: 'log', icon: 'activity', color: 'warning', title: t('navLog'), desc: state.activity.length + ' ' + t('navLog') });

  const navGrid =
    '<h2 class="quick-access-title" style="font-size:15px;font-weight:800;margin:24px 0 12px">' + t('quickAccess') + '</h2>' +
    '<div class="nav-grid">' +
    navItems.map(function(item) {
      return '<div class="nav-card" data-action="nav" data-view="' + item.view + '">' +
        '<div class="nav-card-icon ' + item.color + '">' + icon(item.icon, 26) + '</div>' +
        '<span>' + item.title + '</span>' +
        '<small>' + item.desc + '</small>' +
        '</div>';
    }).join('') +
    '</div>';

  const recentSales = state.sales.slice().sort(function(a, b) { return b.date - a.date; }).slice(0, 5);
  let recentHtml = '';
  if (recentSales.length) {
    recentHtml =
      '<div class="flex justify-between items-center mb-3 mt-4">' +
      '<h2 style="font-size:15px;font-weight:800">' + t('recentSales') + '</h2>' +
      '<button class="btn btn-ghost btn-sm" data-action="nav" data-view="reports">' + t('viewAll') + ' ' + icon('chevronLeft', 14) + '</button>' +
      '</div>' +
      '<div class="grid" style="gap:8px">' +
      recentSales.map(function(s) {
        const c = s.customerId === 'walkin' ? null : findCustomer(s.customerId);
        return '<div class="card" style="display:flex;align-items:center;gap:12px;padding:12px">' +
          '<div class="stat-icon success" style="width:40px;height:40px">' + icon('receipt', 18) + '</div>' +
          '<div style="flex:1;min-width:0">' +
          '<strong style="display:block;color:var(--text);font-size:13px;font-weight:700">' + s.invoiceNo + '</strong>' +
          '<small style="display:block;color:var(--text-muted);font-size:11px;margin-top:3px">' +
          (c ? c.name : t('walkInCustomer')) + ' · ' + timeAgo(s.date) +
          '</small>' +
          '</div>' +
          '<div style="text-align:end">' +
          '<strong style="color:var(--success);font-size:14px;direction:ltr">' + formatNumber(s.total) + ' ' + state.store.currency + '</strong>' +
          '</div>' +
          '</div>';
      }).join('') +
      '</div>';
  }

  return '<div>' +
    '<div class="page-head">' +
    '<div><h1>' + greeting + '</h1><p>' + t('dashboardSub') + '</p></div>' +
    '</div>' +
    cashCard +
    statsGrid +
    alertHtml +
    navGrid +
    recentHtml +
    '</div>';
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return t('greetingMorning');
  if (hour < 18) return t('greeting');
  return t('greetingEvening');
}

/* =========================================================================
   POS — صفحة البيع
   ========================================================================= */
function renderPOS() {
  const subtotal = getCartSubtotal();
  const discount = getCartDiscount();
  const tax = getCartTax();
  const total = getCartTotal();
  const count = getCartCount();

  // بطاقة الإجمالي
  const totalCard =
    '<div class="pos-total-card">' +
    '<div class="pos-total-label">' + t('grandTotal') + '</div>' +
    '<div class="pos-total-value">' + formatNumber(total) + '</div>' +
    '<div class="pos-total-meta">' +
    '<span>' + icon('shoppingBag', 14) + ' ' + count + ' ' + t('cartItems') + '</span>' +
    (discount > 0 ? '<span style="color:var(--danger)">-' + formatNumber(discount) + ' ' + state.store.currency + '</span>' : '') +
    '</div>' +
    '</div>';

  // اختيار العميل (اختياري)
  const customerOptions = '<option value="walkin">' + t('walkInCustomer') + '</option>' +
    state.customers.map(function(c) {
      return '<option value="' + c.id + '"' + (state.posCustomerId === c.id ? ' selected' : '') + '>' + c.name + '</option>';
    }).join('');

  const customerBox =
    '<div class="input-wrap mt-4">' + icon('user', 18) +
    '<select id="posCustomerSelect" style="flex:1;background:transparent;color:var(--text);border:none;outline:none;font-size:13px;cursor:pointer">' + customerOptions + '</select>' +
    '</div>';

  // حقل البحث + زر الكاميرا
  const searchBox =
    '<div class="input-wrap mt-3" style="padding-inline-end:0">' + icon('search', 18) +
    '<input type="text" id="posSearchInput" placeholder="' + t('searchProduct') + '" autocomplete="off" />' +
    '<button type="button" id="barcodeScanBtn" style="display:grid;place-items:center;width:44px;height:44px;border-radius:12px;background:var(--primary);color:#fff;border:none;cursor:pointer;margin-inline-end:4px;flex-shrink:0" title="مسح الباركود">' +
    icon('camera', 22) +
    '</button>' +
    '</div>' +
    '<div id="posSearchResults"></div>';

  // السلة
  let cartHtml = '';
  if (state.cart.length === 0) {
    cartHtml =
      '<div class="cart-empty">' +
      icon('shoppingBag', 48) +
      '<p>' + t('cartEmpty') + '</p>' +
      '<small style="color:var(--text-muted);font-size:11px">' + t('cartEmptyDesc') + '</small>' +
      '</div>';
  } else {
    cartHtml = '<div class="cart-list">' +
      state.cart.map(function(item) {
        return '<div class="cart-item">' +
          '<div class="cart-item-thumb" style="background:' + hexToRgba(item.color || '#3b82f6', .15) + ';color:' + (item.color || '#3b82f6') + '">' + (item.icon || '📦') + '</div>' +
          '<div class="cart-item-body">' +
          '<strong>' + item.name + '</strong>' +
          '<small>' + formatNumber(item.price) + ' ' + state.store.currency + '</small>' +
          '</div>' +
          '<div class="cart-item-qty">' +
          '<button class="minus" data-action="pos-qty-minus" data-id="' + item.productId + '">' + icon('minus', 14) + '</button>' +
          '<span>' + item.qty + '</span>' +
          '<button class="plus" data-action="pos-qty-plus" data-id="' + item.productId + '">' + icon('plus', 14) + '</button>' +
          '</div>' +
          '<div class="cart-item-total">' + formatNumber(item.price * item.qty) + '</div>' +
          '<button class="cart-item-remove" data-action="pos-remove" data-id="' + item.productId + '">' + icon('trash', 16) + '</button>' +
          '</div>';
      }).join('') +
      '</div>';
  }

  // ملخص الطلب
  let summaryHtml = '';
  if (state.cart.length > 0) {
    summaryHtml =
      '<div class="card mt-4" style="padding:14px">' +
      '<div class="flex justify-between" style="font-size:12px;color:var(--text-soft);margin-bottom:6px">' +
      '<span>' + t('subtotal') + '</span>' +
      '<strong style="direction:ltr">' + formatNumber(subtotal) + ' ' + state.store.currency + '</strong>' +
      '</div>' +
      (discount > 0 ?
        '<div class="flex justify-between" style="font-size:12px;color:var(--danger);margin-bottom:6px">' +
        '<span>' + t('discount') + '</span>' +
        '<strong style="direction:ltr">-' + formatNumber(discount) + ' ' + state.store.currency + '</strong>' +
        '</div>' : '') +
      (tax > 0 ?
        '<div class="flex justify-between" style="font-size:12px;color:var(--primary);margin-bottom:6px">' +
        '<span>' + t('tax') + '</span>' +
        '<strong style="direction:ltr">' + formatNumber(tax) + ' ' + state.store.currency + '</strong>' +
        '</div>' : '') +
      '<div class="flex justify-between" style="padding-top:10px;border-top:1px dashed var(--border);margin-top:6px">' +
      '<strong>' + t('grandTotal') + '</strong>' +
      '<strong style="color:var(--success);font-size:16px;direction:ltr">' + formatNumber(total) + ' ' + state.store.currency + '</strong>' +
      '</div>' +
      '</div>';
  }

  // طرق الدفع
  const paymentHtml =
    '<div class="payment-tabs">' +
    '<div class="payment-tab ' + (state.posPayment === 'cash' ? 'active' : '') + '" data-action="pos-payment" data-payment="cash">' +
    icon('cash', 18) + ' ' + t('cash') +
    '</div>' +
    '<div class="payment-tab ' + (state.posPayment === 'credit' ? 'active' : '') + '" data-action="pos-payment" data-payment="credit">' +
    icon('creditCard', 18) + ' ' + t('credit') +
    '</div>' +
    '</div>';

  // أزرار الإجراءات (مع فاتورة / بدون فاتورة)
  const actionsHtml =
    '<div class="pos-actions">' +
    '<div class="pos-action success" data-action="pos-complete">' + icon('checkCircle', 22) + '<span>إتمام مع فاتورة</span></div>' +
    '<div class="pos-action primary" data-action="pos-complete-noinv">' + icon('check', 22) + '<span>إتمام بدون فاتورة</span></div>' +
    '<div class="pos-action" data-action="pos-clear">' + icon('xCircle', 22) + '<span>' + t('clearCart') + '</span></div>' +
    '<div class="pos-action" data-action="pos-log">' + icon('receipt', 22) + '<span>' + t('salesLog') + '</span></div>' +
    '</div>';

  return '<div class="pos-wrap">' +
    '<div class="pos-main">' +
    '<div class="page-head"><div><h1>' + icon('cart', 24) + ' ' + t('posTitle') + '</h1><p>' + t('posSub') + '</p></div></div>' +
    customerBox +
    searchBox +
    cartHtml +
    summaryHtml +
    '</div>' +
    '<div class="pos-cart-side">' +
    totalCard +
    paymentHtml +
    actionsHtml +
    '</div>' +
    '</div>';
}

function addToCartFromSearch(productId) {
  const product = findProduct(productId);
  if (!product) return;
  if (product.stock <= 0) { toast(t('outOfStock'), 'error'); return; }

  if (addToCart(productId, 1)) {
    saveState();
    render();
    const input = document.getElementById('posSearchInput');
    if (input) { input.value = ''; input.focus(); }
  } else {
    toast(t('insufficientStock'), 'error');
  }
}

function changeCartQty(productId, delta) {
  const item = state.cart.find(function(i) { return i.productId === productId; });
  if (!item) return;
  const newQty = item.qty + delta;
  if (updateCartQty(productId, newQty)) {
    saveState();
    render();
  } else {
    toast(t('insufficientStock'), 'error');
  }
}

function removeFromCartAndRender(productId) {
  removeFromCart(productId);
  saveState();
  render();
}

function clearCartAndRender() {
  if (!state.cart.length) return;
  
  confirmAction(
    'هل أنت متأكد من مسح السلة؟',
    function() {
      clearCart();
      saveState();
      render();
      toast(t('cartCleared'));
    },
    'مسح السلة',
    'btn-danger'
  );
}

function setPayment(payment) {
  state.posPayment = payment;
  render();
}

function renderSearchResults(query) {
  const results = document.getElementById('posSearchResults');
  if (!results) return;
  if (!query || query.length < 1) { results.innerHTML = ''; return; }

  const list = searchProducts(query);
  if (!list.length) {
    results.innerHTML = '<div class="empty" style="padding:20px"><p>' + t('productNotFound') + '</p></div>';
    return;
  }

  results.innerHTML = '<div class="search-results">' +
    list.map(function(p) {
      const st = getProductStatus(p);
      const stColor = st === 'in' ? 'var(--success)' : st === 'low' ? 'var(--warning)' : 'var(--danger)';
      return '<div class="search-item" data-action="pos-add" data-id="' + p.id + '">' +
        '<div class="search-item-icon" style="background:' + hexToRgba(p.color, .15) + ';color:' + p.color + '">' + (p.icon || '📦') + '</div>' +
        '<div class="search-item-body">' +
        '<strong>' + p.name + '</strong>' +
        '<small>' + p.sku + ' · <span style="color:' + stColor + '">' + p.stock + ' ' + t('productStock') + '</span></small>' +
        '</div>' +
        '<div class="search-item-price">' + formatNumber(p.price) + '</div>' +
        '</div>';
    }).join('') +
    '</div>';

  document.querySelectorAll('#posSearchResults [data-action="pos-add"]').forEach(function(el) {
    el.onclick = function(e) {
      e.preventDefault();
      addToCartFromSearch(this.dataset.id);
    };
  });
}

/* =========================================================================
   COMPLETE SALE — مع أو بدون فاتورة
   ========================================================================= */
function completeSale(printInvoiceFlag) {
  if (!state.cart.length) { toast(t('cartEmpty'), 'error'); return; }

  const subtotal = getCartSubtotal();
  const discount = getCartDiscount();
  const tax = getCartTax();
  const total = getCartTotal();
  const profit = getCartProfit();
  const invoiceNo = nextInvoiceNo();
  const saleId = uid('sale');
  const isPaid = state.posPayment === 'cash';

  const sale = {
    id: saleId,
    invoiceNo: invoiceNo,
    customerId: state.posCustomerId,
    items: state.cart.map(function(item) {
      return {
        productId: item.productId,
        name: item.name,
        qty: item.qty,
        price: item.price,
        cost: item.cost || 0,
      };
    }),
    subtotal: subtotal,
    discount: discount,
    tax: tax,
    total: total,
    profit: profit,
    payment: state.posPayment,
    paid: isPaid,
    paidAmount: isPaid ? total : 0,
    date: Date.now(),
    soldBy: state.currentUser.id,
  };
  state.sales.push(sale);

  state.cart.forEach(function(item) {
    const p = findProduct(item.productId);
    if (p) p.stock = Math.max(0, p.stock - item.qty);
  });

  if (state.posCustomerId && state.posCustomerId !== 'walkin') {
    const c = findCustomer(state.posCustomerId);
    if (c) {
      c.totalPurchases = (c.totalPurchases || 0) + total;
      if (state.posPayment === 'credit') c.debt = (c.debt || 0) + total;
      earnPointsFromSale(state.posCustomerId, total);
    }
  }

  if (isPaid) {
    const currentBalance = getCashBalance();
    state.cashMovements.push({
      id: uid('cash'),
      type: 'sale',
      amount: total,
      balance: currentBalance + total,
      reason: t('logSale') + ' ' + invoiceNo,
      refId: sale.id,
      date: Date.now(),
    });
  }

  logActivity('sale', t('logSale') + ' ' + invoiceNo, formatMoney(total));
  saveState();

  // طباعة الفاتورة إذا طُلب ذلك
  if (printInvoiceFlag) {
    setTimeout(function() { printInvoice(sale.id); }, 300);
  }

  clearCart();
  saveState();
  render();
  toast(t('saleCompleted') + ': ' + invoiceNo);
}

/* =========================================================================
   SALES LOG
   ========================================================================= */
function openSalesLog() {
  const recent = state.sales.slice().sort(function(a, b) { return b.date - a.date; }).slice(0, 50);
  let body = '';

  if (!recent.length) {
    body = '<div class="empty"><div class="empty-icon">' + icon('receipt', 32) + '</div><h3>' + t('noData') + '</h3></div>';
  } else {
    body = '<div class="grid" style="gap:8px">' +
      recent.map(function(s) {
        const c = s.customerId === 'walkin' ? null : findCustomer(s.customerId);
        return '<div class="card" style="display:flex;align-items:center;gap:12px;padding:12px;cursor:pointer" data-action="print-invoice" data-id="' + s.id + '">' +
          '<div class="stat-icon ' + (s.paid ? 'success' : 'warning') + '" style="width:40px;height:40px">' + icon('receipt', 18) + '</div>' +
          '<div style="flex:1;min-width:0">' +
          '<strong style="display:block;color:var(--text);font-size:13px;font-weight:700">' + s.invoiceNo + '</strong>' +
          '<small style="display:block;color:var(--text-muted);font-size:11px;margin-top:3px">' +
          (c ? c.name : t('walkInCustomer')) + ' · ' + formatDate(s.date, true) +
          '</small>' +
          '</div>' +
          '<div style="text-align:end">' +
          '<strong style="display:block;color:var(--success);font-size:14px;direction:ltr">' + formatNumber(s.total) + ' ' + state.store.currency + '</strong>' +
          '<small style="color:var(--text-muted);font-size:10px">' + (s.paid ? t('invoicePaid') : t('invoicePending')) + '</small>' +
          '</div>' +
          '</div>';
      }).join('') +
      '</div>';
  }

  document.getElementById('modalRoot').innerHTML =
    '<div class="modal-backdrop"><div class="modal modal-lg">' +
    '<div class="modal-head"><div><h2>' + icon('receipt', 22) + ' ' + t('salesLog') + '</h2>' +
    '<p>' + recent.length + ' ' + t('salesCount') + '</p></div>' +
    '<button class="modal-close" data-close-modal>' + icon('x', 18) + '</button></div>' +
    '<div class="modal-body">' + body + '</div>' +
    '</div></div>';
  if (typeof bindModalEvents === 'function') bindModalEvents();
}

/* =========================================================================
   PRODUCTS
   ========================================================================= */
function renderProducts() {
  const list = getFilteredProducts();
  const all = state.products.length;
  const inStock = state.products.filter(function(p) { return getProductStatus(p) === 'in'; }).length;
  const low = state.products.filter(function(p) { return getProductStatus(p) === 'low'; }).length;
  const out = state.products.filter(function(p) { return getProductStatus(p) === 'out'; }).length;
  const expired = state.products.filter(function(p) { return isExpired(p); }).length;

  const catChips =
    '<button class="filter-chip ' + (state.productCategory === 'all' ? 'active' : '') + '" data-action="filter-category" data-cat="all">' +
    t('categoryAll') + '</button>' +
    state.categories.map(function(c) {
      return '<button class="filter-chip ' + (state.productCategory === c.id ? 'active' : '') + '" data-action="filter-category" data-cat="' + c.id + '">' +
        (c.icon || '') + ' ' + c.name + '</button>';
    }).join('');

  const statusChips =
    '<button class="filter-chip ' + (state.productFilter === 'all' ? 'active' : '') + '" data-action="filter-status" data-status="all">' +
    t('all') + ' <small>' + all + '</small></button>' +
    '<button class="filter-chip ' + (state.productFilter === 'in' ? 'active' : '') + '" data-action="filter-status" data-status="in">' +
    t('inStock') + ' <small>' + inStock + '</small></button>' +
    '<button class="filter-chip ' + (state.productFilter === 'low' ? 'active' : '') + '" data-action="filter-status" data-status="low">' +
    t('lowStock') + ' <small>' + low + '</small></button>' +
    '<button class="filter-chip ' + (state.productFilter === 'out' ? 'active' : '') + '" data-action="filter-status" data-status="out">' +
    t('outStock') + ' <small>' + out + '</small></button>';

  let expiredBadge = '';
  if (expired > 0) {
    expiredBadge =
      '<div class="alert-card mb-3">' +
      '<div class="alert-icon">' + icon('alertCircle', 22) + '</div>' +
      '<div class="alert-text">' +
      '<strong>⚠️ ' + expired + ' منتج منتهي الصلاحية</strong>' +
      '<small>يرجى المراجعة</small>' +
      '</div>' +
      '</div>';
  }

  let gridHtml = '';
  if (!list.length) {
    gridHtml = '<div class="empty"><div class="empty-icon">' + icon('package', 32) + '</div>' +
      '<h3>' + t('noResults') + '</h3>' +
      (can('addProduct') ? '<button class="btn btn-primary" data-action="add-product">' + icon('plus', 18) + ' ' + t('addProduct') + '</button>' : '') +
      '</div>';
  } else {
    gridHtml = '<div class="grid grid-auto">' +
      list.map(function(p) {
        const st = getProductStatus(p);
        const stColor = st === 'in' ? 'var(--success)' : st === 'low' ? 'var(--warning)' : 'var(--danger)';
        const stBg = st === 'in' ? 'var(--success-soft)' : st === 'low' ? 'var(--warning-soft)' : 'var(--danger-soft)';
        const stLabel = st === 'in' ? t('inStock') : st === 'low' ? t('lowStock') : t('outStock');
        const expiring = isExpiringSoon(p, 30);
        const isExp = isExpired(p);

        let expiryBadge = '';
        if (isExp) {
          expiryBadge = '<span style="position:absolute;top:-6px;left:-6px;padding:2px 6px;border-radius:6px;background:var(--danger);color:#fff;font-size:9px;font-weight:800">منتهي</span>';
        } else if (expiring) {
          expiryBadge = '<span style="position:absolute;top:-6px;left:-6px;padding:2px 6px;border-radius:6px;background:var(--warning);color:#fff;font-size:9px;font-weight:800">' + daysUntilExpiry(p) + ' يوم</span>';
        }

        return '<div class="card" style="position:relative;padding:14px;cursor:pointer" data-action="view-product" data-id="' + p.id + '">' +
          expiryBadge +
          '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">' +
          '<div class="cart-item-thumb" style="background:' + hexToRgba(p.color, .15) + ';color:' + p.color + ';width:44px;height:44px;font-size:22px">' + (p.icon || '📦') + '</div>' +
          '<span style="padding:3px 8px;border-radius:6px;background:' + stBg + ';color:' + stColor + ';font-size:10px;font-weight:700">' + stLabel + '</span>' +
          '</div>' +
          '<strong style="display:block;color:var(--text);font-size:13px;font-weight:700;line-height:1.3;margin-bottom:4px;min-height:34px">' + p.name + '</strong>' +
          '<small style="display:block;color:var(--text-muted);font-size:10px;direction:ltr;margin-bottom:8px">' + p.sku + '</small>' +
          '<div style="display:flex;justify-content:space-between;align-items:center;padding-top:8px;border-top:1px solid var(--border)">' +
          '<strong style="color:var(--success);font-size:14px;direction:ltr">' + formatNumber(p.price) + '</strong>' +
          '<span style="color:var(--text-soft);font-size:11px;direction:ltr">' + p.stock + ' ' + (p.unit ? t(p.unit) : '') + '</span>' +
          '</div>' +
          '</div>';
      }).join('') +
      '</div>';
  }

  return '<div>' +
    '<div class="page-head">' +
    '<div><h1>' + icon('package', 24) + ' ' + t('productsTitle') + '</h1>' +
    '<p>' + t('productsSub') + ' · ' + all + ' ' + t('cartItems') + '</p></div>' +
    (can('addProduct') ? '<button class="btn btn-primary" data-action="add-product">' + icon('plus', 18) + ' ' + t('addProduct') + '</button>' : '') +
    '</div>' +
    expiredBadge +
    '<div class="input-wrap mb-3">' + icon('search', 18) +
    '<input type="text" id="productSearchInput" placeholder="' + t('searchProduct') + '" value="' + (state.searchQuery || '') + '" autocomplete="off" /></div>' +
    '<div style="display:flex;gap:8px;overflow-x:auto;padding-bottom:8px;margin-bottom:12px">' + catChips + '</div>' +
    '<div style="display:flex;gap:8px;overflow-x:auto;padding-bottom:8px;margin-bottom:12px">' + statusChips + '</div>' +
    gridHtml +
    '</div>';
}

function setProductCategory(cat) {
  state.productCategory = cat;
  saveState();
  render();
}

function setProductFilter(status) {
  state.productFilter = status;
  saveState();
  render();
}

/* =========================================================================
   CUSTOMERS
   ========================================================================= */
function renderCustomers() {
  const q = (state.searchQuery || '').trim().toLowerCase();
  let list = state.customers.slice();

  if (q) {
    list = list.filter(function(c) {
      return (c.name || '').toLowerCase().indexOf(q) !== -1 ||
             (c.phone || '').toLowerCase().indexOf(q) !== -1 ||
             (c.email || '').toLowerCase().indexOf(q) !== -1;
    });
  }
  list.sort(function(a, b) { return (b.totalPurchases || 0) - (a.totalPurchases || 0); });

  const totalDebt = getTotalCustomerDebt();
  const withDebt = state.customers.filter(function(c) { return c.debt > 0; }).length;

  const stats =
    '<div class="grid grid-3 mb-4">' +
    '<div class="stat"><div class="stat-label">' + icon('users', 14) + ' ' + t('customersTitle') + '</div>' +
    '<div class="stat-value">' + state.customers.length + '</div></div>' +
    '<div class="stat"><div class="stat-label">' + icon('trendingDown', 14) + ' ' + t('customerDebt') + '</div>' +
    '<div class="stat-value" style="color:var(--danger)">' + formatNumber(totalDebt) + ' <small>' + state.store.currency + '</small></div></div>' +
    '<div class="stat"><div class="stat-label">' + icon('alertCircle', 14) + ' عليهم دين</div>' +
    '<div class="stat-value" style="color:var(--warning)">' + withDebt + '</div></div>' +
    '</div>';

  let listHtml = '';
  if (!list.length) {
    listHtml = '<div class="empty"><div class="empty-icon">' + icon('users', 32) + '</div>' +
      '<h3>' + t('noResults') + '</h3>' +
      (can('addCustomer') ? '<button class="btn btn-primary" data-action="add-customer">' + icon('userPlus', 18) + ' ' + t('addCustomer') + '</button>' : '') +
      '</div>';
  } else {
    listHtml = '<div class="grid" style="gap:10px">' +
      list.map(function(c) {
        const initials = (c.name || '?').split(' ').map(function(w) { return w[0]; }).slice(0, 2).join('');
        return '<div class="card" style="padding:14px;cursor:pointer" data-action="view-customer" data-id="' + c.id + '">' +
          '<div style="display:flex;align-items:center;gap:12px">' +
          '<div style="display:grid;width:48px;height:48px;place-items:center;border-radius:50%;background:var(--primary-soft);color:var(--primary);font-weight:800;font-size:16px;flex-shrink:0">' + initials + '</div>' +
          '<div style="flex:1;min-width:0">' +
          '<strong style="display:block;color:var(--text);font-size:14px;font-weight:700">' + c.name + '</strong>' +
          '<small style="display:block;color:var(--text-muted);font-size:11px;margin-top:3px;direction:ltr">' + (c.phone || '-') + '</small>' +
          (c.points ? '<small style="display:block;color:var(--warning);font-size:11px;margin-top:3px">🎁 ' + c.points + ' نقطة</small>' : '') +
          '</div>' +
          (c.debt > 0 ?
            '<div style="text-align:end;flex-shrink:0">' +
            '<small style="display:block;color:var(--text-muted);font-size:10px">' + t('customerDebt') + '</small>' +
            '<strong style="display:block;color:var(--danger);font-size:14px;direction:ltr">' + formatNumber(c.debt) + '</strong>' +
            '</div>' :
            '<div style="text-align:end;flex-shrink:0">' +
            '<small style="display:block;color:var(--text-muted);font-size:10px">' + t('totalPurchases') + '</small>' +
            '<strong style="display:block;color:var(--success);font-size:14px;direction:ltr">' + formatNumber(c.totalPurchases || 0) + '</strong>' +
            '</div>') +
          '</div>' +
          '</div>';
      }).join('') +
      '</div>';
  }

  return '<div>' +
    '<div class="page-head">' +
    '<div><h1>' + icon('users', 24) + ' ' + t('customersTitle') + '</h1><p>' + t('customersSub') + '</p></div>' +
    (can('addCustomer') ? '<button class="btn btn-primary" data-action="add-customer">' + icon('userPlus', 18) + ' ' + t('addCustomer') + '</button>' : '') +
    '</div>' +
    stats +
    '<div class="input-wrap mb-3">' + icon('search', 18) +
    '<input type="text" id="customerSearchInput" placeholder="' + t('search') + '" autocomplete="off" /></div>' +
    listHtml +
    '</div>';
}

/* =========================================================================
   SUPPLIERS
   ========================================================================= */
function renderSuppliers() {
  const q = (state.searchQuery || '').trim().toLowerCase();
  let list = state.suppliers.slice();

  if (q) {
    list = list.filter(function(s) {
      return (s.name || '').toLowerCase().indexOf(q) !== -1 ||
             (s.company || '').toLowerCase().indexOf(q) !== -1 ||
             (s.phone || '').toLowerCase().indexOf(q) !== -1;
    });
  }

  const totalOwed = getTotalSupplierOwed();

  const stats =
    '<div class="grid grid-3 mb-4">' +
    '<div class="stat"><div class="stat-label">' + icon('truck', 14) + ' ' + t('suppliersTitle') + '</div>' +
    '<div class="stat-value">' + state.suppliers.length + '</div></div>' +
    '<div class="stat"><div class="stat-label">' + icon('trendingUp', 14) + ' ' + t('supplierOwed') + '</div>' +
    '<div class="stat-value" style="color:var(--warning)">' + formatNumber(totalOwed) + ' <small>' + state.store.currency + '</small></div></div>' +
    '<div class="stat"><div class="stat-label">' + icon('package', 14) + ' ' + t('productsCount') + '</div>' +
    '<div class="stat-value">' + state.products.length + '</div></div>' +
    '</div>';

  let listHtml = '';
  if (!list.length) {
    listHtml = '<div class="empty"><div class="empty-icon">' + icon('truck', 32) + '</div>' +
      '<h3>' + t('noResults') + '</h3>' +
      (can('addSupplier') ? '<button class="btn btn-primary" data-action="add-supplier">' + icon('plus', 18) + ' ' + t('addSupplier') + '</button>' : '') +
      '</div>';
  } else {
    listHtml = '<div class="grid" style="gap:10px">' +
      list.map(function(s) {
        const initials = (s.name || '?').split(' ').map(function(w) { return w[0]; }).slice(0, 2).join('');
        return '<div class="card" style="padding:14px">' +
          '<div style="display:flex;align-items:center;gap:12px">' +
          '<div style="display:grid;width:48px;height:48px;place-items:center;border-radius:12px;background:var(--cyan-soft);color:var(--cyan);font-weight:800;font-size:16px;flex-shrink:0">' + initials + '</div>' +
          '<div style="flex:1;min-width:0">' +
          '<strong style="display:block;color:var(--text);font-size:14px;font-weight:700">' + s.name + '</strong>' +
          '<small style="display:block;color:var(--text-muted);font-size:11px;margin-top:3px">' + (s.company || '') + '</small>' +
          '<small style="display:block;color:var(--text-muted);font-size:11px;margin-top:2px;direction:ltr">' + (s.phone || '') + '</small>' +
          '</div>' +
          (s.owed > 0 ?
            '<div style="text-align:end;flex-shrink:0">' +
            '<small style="display:block;color:var(--text-muted);font-size:10px">' + t('supplierOwed') + '</small>' +
            '<strong style="display:block;color:var(--warning);font-size:14px;direction:ltr">' + formatNumber(s.owed) + '</strong>' +
            '</div>' : '') +
          '</div>' +
          '<div style="display:flex;gap:6px;margin-top:12px;padding-top:12px;border-top:1px solid var(--border)">' +
          (s.owed > 0 && can('addCash') ? '<button class="btn btn-sm btn-success" style="flex:1" data-action="pay-supplier" data-id="' + s.id + '">' + icon('wallet', 14) + ' ' + t('paySupplier') + '</button>' : '') +
          (can('editSupplier') ? '<button class="btn btn-sm btn-secondary" data-action="edit-supplier" data-id="' + s.id + '">' + icon('edit', 14) + '</button>' : '') +
          (can('deleteSupplier') ? '<button class="btn btn-sm btn-secondary" style="color:var(--danger)" data-action="delete-supplier" data-id="' + s.id + '">' + icon('trash', 14) + '</button>' : '') +
          '</div>' +
          '</div>';
      }).join('') +
      '</div>';
  }

  return '<div>' +
    '<div class="page-head">' +
    '<div><h1>' + icon('truck', 24) + ' ' + t('suppliersTitle') + '</h1><p>' + t('suppliersSub') + '</p></div>' +
    (can('addSupplier') ? '<button class="btn btn-primary" data-action="add-supplier">' + icon('plus', 18) + ' ' + t('addSupplier') + '</button>' : '') +
    '</div>' +
    stats +
    '<div class="input-wrap mb-3">' + icon('search', 18) +
    '<input type="text" id="supplierSearchInput" placeholder="' + t('search') + '" autocomplete="off" /></div>' +
    listHtml +
    '</div>';
}

/* =========================================================================
   CASH
   ========================================================================= */
function renderCash() {
  const balance = getCashBalance();
  const movements = state.cashMovements.slice().sort(function(a, b) { return b.date - a.date; });
  const todayStart = startOfDay();
  const todayEnd = endOfDay();
  const todayIn = state.cashMovements
    .filter(function(m) { return m.date >= todayStart && m.date <= todayEnd && m.amount > 0; })
    .reduce(function(s, m) { return s + m.amount; }, 0);
  const todayOut = state.cashMovements
    .filter(function(m) { return m.date >= todayStart && m.date <= todayEnd && m.amount < 0; })
    .reduce(function(s, m) { return s + Math.abs(m.amount); }, 0);

  const balanceCard =
    '<div class="cash-card mb-4">' +
    '<div class="cash-label">' + icon('wallet', 18) + ' ' + t('currentBalance') + '</div>' +
    '<div class="cash-value">' + formatNumber(balance) + ' <span style="font-size:20px">' + state.store.currency + '</span></div>' +
    '<div class="cash-sub">' + formatDate(Date.now(), true) + '</div>' +
    '</div>';

  const todayStats =
    '<div class="grid grid-2 mb-4">' +
    '<div class="stat"><div class="stat-label">' + icon('trendingUp', 14) + ' ' + t('cashIn') + '</div>' +
    '<div class="stat-value" style="color:var(--success)">+' + formatNumber(todayIn) + ' <small>' + state.store.currency + '</small></div></div>' +
    '<div class="stat"><div class="stat-label">' + icon('trendingDown', 14) + ' ' + t('cashOut') + '</div>' +
    '<div class="stat-value" style="color:var(--danger)">-' + formatNumber(todayOut) + ' <small>' + state.store.currency + '</small></div></div>' +
    '</div>';

  const actions =
    '<div class="grid grid-2 mb-4">' +
    (can('addCash') ? '<button class="btn btn-success" data-action="add-cash">' + icon('plus', 18) + ' ' + t('addCash') + '</button>' : '') +
    (can('withdrawCash') ? '<button class="btn btn-danger" data-action="withdraw-cash">' + icon('minus', 18) + ' ' + t('withdrawCash') + '</button>' : '') +
    '</div>';

  let movementsHtml = '';
  if (!movements.length) {
    movementsHtml = '<div class="empty"><div class="empty-icon">' + icon('activity', 32) + '</div><h3>' + t('noData') + '</h3></div>';
  } else {
    movementsHtml = '<h2 style="font-size:15px;font-weight:800;margin:20px 0 12px">' + t('cashMovements') + '</h2>' +
      '<div class="grid" style="gap:8px">' +
      movements.slice(0, 50).map(function(m) {
        const isPositive = m.amount > 0;
        const typeColor = isPositive ? 'var(--success)' : 'var(--danger)';
        const typeIcon = m.type === 'sale' ? 'shoppingBag' :
                        m.type === 'expense' ? 'trendingDown' :
                        m.type === 'opening' ? 'wallet' :
                        isPositive ? 'trendingUp' : 'trendingDown';
        return '<div class="card" style="display:flex;align-items:center;gap:12px;padding:12px">' +
          '<div class="stat-icon ' + (isPositive ? 'success' : 'danger') + '" style="width:40px;height:40px">' + icon(typeIcon, 18) + '</div>' +
          '<div style="flex:1;min-width:0">' +
          '<strong style="display:block;color:var(--text);font-size:13px;font-weight:700">' + m.reason + '</strong>' +
          '<small style="display:block;color:var(--text-muted);font-size:11px;margin-top:3px">' + formatDate(m.date, true) + '</small>' +
          '</div>' +
          '<div style="text-align:end;flex-shrink:0">' +
          '<strong style="display:block;color:' + typeColor + ';font-size:14px;direction:ltr">' +
          (isPositive ? '+' : '') + formatNumber(m.amount) +
          '</strong>' +
          '<small style="display:block;color:var(--text-muted);font-size:10px;direction:ltr">' + formatNumber(m.balance) + '</small>' +
          '</div>' +
          '</div>';
      }).join('') +
      '</div>';
  }

  return '<div>' +
    '<div class="page-head">' +
    '<div><h1>' + icon('wallet', 24) + ' ' + t('cashTitle') + '</h1><p>' + t('cashSub') + '</p></div>' +
    '</div>' +
    balanceCard +
    todayStats +
    actions +
    movementsHtml +
    '</div>';
}

/* =========================================================================
   EXPENSES
   ========================================================================= */
function renderExpenses() {
  const expenses = state.expenses.slice().sort(function(a, b) { return b.date - a.date; });
  const todayStart = startOfDay();
  const monthStart = startOfMonth();
  const todayTotal = state.expenses.filter(function(e) { return e.date >= todayStart; })
    .reduce(function(s, e) { return s + e.amount; }, 0);
  const monthTotal = state.expenses.filter(function(e) { return e.date >= monthStart; })
    .reduce(function(s, e) { return s + e.amount; }, 0);
  const allTotal = state.expenses.reduce(function(s, e) { return s + e.amount; }, 0);

  const stats =
    '<div class="grid grid-3 mb-4">' +
    '<div class="stat"><div class="stat-label">' + icon('calendar', 14) + ' ' + t('today') + '</div>' +
    '<div class="stat-value" style="color:var(--danger)">' + formatNumber(todayTotal) + '</div></div>' +
    '<div class="stat"><div class="stat-label">' + icon('calendar', 14) + ' ' + t('thisMonth') + '</div>' +
    '<div class="stat-value" style="color:var(--danger)">' + formatNumber(monthTotal) + '</div></div>' +
    '<div class="stat"><div class="stat-label">' + icon('receipt', 14) + ' ' + t('totalExpenses') + '</div>' +
    '<div class="stat-value" style="color:var(--danger)">' + formatNumber(allTotal) + '</div></div>' +
    '</div>';

  let listHtml = '';
  if (!expenses.length) {
    listHtml = '<div class="empty"><div class="empty-icon">' + icon('trendingDown', 32) + '</div>' +
      '<h3>' + t('noData') + '</h3>' +
      (can('addExpense') ? '<button class="btn btn-primary" data-action="add-expense">' + icon('plus', 18) + ' ' + t('addExpense') + '</button>' : '') +
      '</div>';
  } else {
    listHtml = '<div class="grid" style="gap:8px">' +
      expenses.map(function(e) {
        return '<div class="card" style="display:flex;align-items:center;gap:12px;padding:12px">' +
          '<div class="stat-icon danger" style="width:40px;height:40px">' + icon('trendingDown', 18) + '</div>' +
          '<div style="flex:1;min-width:0">' +
          '<strong style="display:block;color:var(--text);font-size:13px;font-weight:700">' + e.name + '</strong>' +
          '<small style="display:block;color:var(--text-muted);font-size:11px;margin-top:3px">' +
          t(e.category) + ' · ' + formatDate(e.date) +
          '</small>' +
          '</div>' +
          '<div style="text-align:end;flex-shrink:0">' +
          '<strong style="display:block;color:var(--danger);font-size:14px;direction:ltr">' + formatNumber(e.amount) + '</strong>' +
          '</div>' +
          (can('editExpense') ? '<button class="icon-btn" style="width:32px;height:32px" data-action="edit-expense" data-id="' + e.id + '">' + icon('edit', 14) + '</button>' : '') +
          (can('deleteExpense') ? '<button class="icon-btn danger" style="width:32px;height:32px" data-action="delete-expense" data-id="' + e.id + '">' + icon('trash', 14) + '</button>' : '') +
          '</div>';
      }).join('') +
      '</div>';
  }

  return '<div>' +
    '<div class="page-head">' +
    '<div><h1>' + icon('trendingDown', 24) + ' ' + t('expensesTitle') + '</h1><p>' + t('expensesSub') + '</p></div>' +
    (can('addExpense') ? '<button class="btn btn-primary" data-action="add-expense">' + icon('plus', 18) + ' ' + t('addExpense') + '</button>' : '') +
    '</div>' +
    stats +
    listHtml +
    '</div>';
}

/* =========================================================================
   REPORTS
   ========================================================================= */
function renderReports() {
  const todayStart = startOfDay();
  const weekStart = startOfWeek();
  const monthStart = startOfMonth();
  const now = Date.now();

  const todayRevenue = getTotalRevenue(todayStart, now);
  const weekRevenue = getTotalRevenue(weekStart, now);
  const monthRevenue = getTotalRevenue(monthStart, now);
  const todayProfit = getTotalProfit(todayStart, now);
  const monthProfit = getTotalProfit(monthStart, now);
  const monthExpenses = getTotalExpenses(monthStart, now);
  const monthSales = getSalesByRange(monthStart, now);
  const avgTicket = monthSales.length ? monthRevenue / monthSales.length : 0;
  const newDebts = getNewDebts();
  const collectedDebts = getCollectedDebts();

  const stats =
    '<div class="reports-grid">' +
    '<div class="stat"><div class="stat-label">' + icon('shoppingBag', 14) + ' ' + t('todayRevenue') + '</div>' +
    '<div class="stat-value" style="color:var(--success)">' + formatNumber(todayRevenue) + ' <small>' + state.store.currency + '</small></div></div>' +
    '<div class="stat"><div class="stat-label">' + icon('trendingUp', 14) + ' ' + t('todayProfit') + '</div>' +
    '<div class="stat-value" style="color:var(--primary)">' + formatNumber(todayProfit) + ' <small>' + state.store.currency + '</small></div></div>' +
    '<div class="stat"><div class="stat-label">' + icon('chart', 14) + ' ' + t('monthRevenue') + '</div>' +
    '<div class="stat-value">' + formatNumber(monthRevenue) + ' <small>' + state.store.currency + '</small></div></div>' +
    '<div class="stat"><div class="stat-label">' + icon('receipt', 14) + ' ' + t('salesCount') + '</div>' +
    '<div class="stat-value">' + monthSales.length + '</div></div>' +
    '</div>';

  const stats2 =
    '<div class="reports-grid">' +
    '<div class="stat"><div class="stat-label">' + icon('trendingDown', 14) + ' ' + t('totalExpenses') + '</div>' +
    '<div class="stat-value" style="color:var(--danger)">' + formatNumber(monthExpenses) + '</div></div>' +
    '<div class="stat"><div class="stat-label">' + icon('receipt', 14) + ' ' + t('avgTicket') + '</div>' +
    '<div class="stat-value">' + formatNumber(Math.round(avgTicket)) + '</div></div>' +
    '<div class="stat"><div class="stat-label">' + icon('user', 14) + ' ديون جديدة</div>' +
    '<div class="stat-value" style="color:var(--warning)">' + formatNumber(newDebts) + '</div></div>' +
    '<div class="stat"><div class="stat-label">' + icon('checkCircle', 14) + ' ديون محصلة</div>' +
    '<div class="stat-value" style="color:var(--success)">' + formatNumber(collectedDebts) + '</div></div>' +
    '</div>';

  const charts =
    '<div class="chart-card"><div class="chart-title">' + icon('chart', 18) + ' 📈 المبيعات مقابل المشتريات (12 شهر)</div>' +
    '<div class="chart-container tall"><canvas id="chartSalesVsPurchases"></canvas></div></div>' +

    '<div class="chart-card"><div class="chart-title">' + icon('calendar', 18) + ' 📊 المبيعات حسب الفترة</div>' +
    '<div class="chart-tabs" id="periodChartTabs">' +
    '<div class="chart-tab active" data-period="7d">7 أيام</div>' +
    '<div class="chart-tab" data-period="30d">30 يوم</div>' +
    '<div class="chart-tab" data-period="12m">12 شهر</div></div>' +
    '<div class="chart-container tall"><canvas id="chartPeriodSales"></canvas></div></div>' +

    '<div class="chart-card"><div class="chart-title">' + icon('creditCard', 18) + ' 🥧 توزيع طرق الدفع</div>' +
    '<div class="chart-container"><canvas id="chartPaymentMethods"></canvas></div></div>' +

    '<div class="chart-card"><div class="chart-title">' + icon('award', 18) + ' 🏆 أفضل 5 منتجات</div>' +
    '<div class="chart-container tall"><canvas id="chartTopProducts"></canvas></div></div>' +

    '<div class="chart-card"><div class="chart-title">' + icon('trendingUp', 18) + ' 📉 الربح حسب الفترة (30 يوم)</div>' +
    '<div class="chart-container tall"><canvas id="chartProfit"></canvas></div></div>' +

    '<div class="chart-card"><div class="chart-title">' + icon('tag', 18) + ' 🥧 توزيع الفئات</div>' +
    '<div class="chart-container"><canvas id="chartCategories"></canvas></div></div>';

  return '<div>' +
    '<div class="page-head">' +
    '<div><h1>' + icon('chart', 24) + ' ' + t('reportsTitle') + '</h1><p>' + t('reportsSub') + '</p></div>' +
    '<button class="btn btn-secondary" id="exportExcelBtn">' + icon('download', 16) + ' تصدير Excel</button>' +
    '</div>' +
    stats +
    '<div style="height:12px"></div>' +
    stats2 +
    '<div style="height:20px"></div>' +
    charts +
    '</div>';
}

/* =========================================================================
   USERS
   ========================================================================= */
function renderUsers() {
  if (!can('users')) {
    return '<div class="empty"><div class="empty-icon">' + icon('shield', 32) + '</div><h3>' + t('noPermission') + '</h3></div>';
  }

  const list = state.users.slice();
  let listHtml = '';
  if (!list.length) {
    listHtml = '<div class="empty"><div class="empty-icon">' + icon('users', 32) + '</div><h3>' + t('noData') + '</h3></div>';
  } else {
    listHtml = '<div class="grid" style="gap:10px">' +
      list.map(function(u) {
        const initials = (u.fullName || '?').split(' ').map(function(w) { return w[0]; }).slice(0, 2).join('');
        const roleColor = u.role === 'admin' ? 'primary' : u.role === 'seller' ? 'success' : 'cyan';
        return '<div class="card" style="padding:14px">' +
          '<div style="display:flex;align-items:center;gap:12px">' +
          '<div class="stat-icon ' + roleColor + '" style="width:48px;height:48px;font-size:16px;font-weight:800">' + initials + '</div>' +
          '<div style="flex:1;min-width:0">' +
          '<strong style="display:block;color:var(--text);font-size:14px;font-weight:700">' + u.fullName + '</strong>' +
          '<small style="display:block;color:var(--text-muted);font-size:11px;margin-top:3px;direction:ltr">@' + u.username + '</small>' +
          '</div>' +
          '<div style="text-align:end;flex-shrink:0">' +
          '<span style="display:inline-block;padding:3px 8px;border-radius:6px;background:var(--' + roleColor + '-soft);color:var(--' + roleColor + ');font-size:10px;font-weight:700">' +
          t('role' + u.role.charAt(0).toUpperCase() + u.role.slice(1)) + '</span>' +
          '<small style="display:block;color:var(--' + (u.active ? 'success' : 'danger') + ');font-size:10px;margin-top:4px">' +
          (u.active ? '● ' + t('userActive') : '○ ' + t('userInactive')) + '</small>' +
          '</div>' +
          '</div>' +
          (can('editUser') ?
            '<div style="display:flex;gap:6px;margin-top:12px;padding-top:12px;border-top:1px solid var(--border)">' +
            '<button class="btn btn-sm btn-secondary" style="flex:1" data-action="edit-user" data-id="' + u.id + '">' + icon('edit', 14) + ' ' + t('edit') + '</button>' +
            (u.id !== state.currentUser.id && can('deleteUser') ? '<button class="btn btn-sm btn-secondary" style="color:var(--danger)" data-action="delete-user" data-id="' + u.id + '">' + icon('trash', 14) + '</button>' : '') +
            '</div>' : '') +
          '</div>';
      }).join('') +
      '</div>';
  }

  return '<div>' +
    '<div class="page-head">' +
    '<div><h1>' + icon('shield', 24) + ' ' + t('usersTitle') + '</h1>' +
    '<p>' + t('usersSub') + ' · ' + state.users.length + '</p></div>' +
    (can('addUser') ? '<button class="btn btn-primary" data-action="add-user">' + icon('userPlus', 18) + ' ' + t('addUser') + '</button>' : '') +
    '</div>' +
    listHtml +
    '</div>';
}

/* =========================================================================
   SETTINGS
   ========================================================================= */
function renderSettings() {
  const store = state.store;
  const colors = ['#2f6bff', '#22c55e', '#a855f7', '#06b6d4', '#f59e0b', '#ef4444', '#ec4899', '#0f172a'];

  const generalSection =
    '<div class="card mb-4" style="padding:20px">' +
    '<h3 style="font-size:15px;font-weight:800;margin-bottom:16px">' + icon('settings', 18) + ' ' + t('generalSettings') + '</h3>' +
    '<div class="grid" style="gap:14px">' +
    '<div class="field"><label>' + t('language') + '</label>' +
    '<div class="grid grid-3">' +
    ['ar', 'en', 'fr'].map(function(l) {
      return '<button class="btn ' + (state.language === l ? 'btn-primary' : 'btn-secondary') + '" data-action="set-lang" data-lang="' + l + '">' +
        (l === 'ar' ? 'العربية' : l === 'en' ? 'English' : 'Français') + '</button>';
    }).join('') +
    '</div></div>' +
    '<div class="field"><label>' + t('theme') + '</label>' +
    '<div class="grid grid-2">' +
    '<button class="btn ' + (state.theme === 'dark' ? 'btn-primary' : 'btn-secondary') + '" data-action="set-theme" data-theme="dark">' +
    icon('moon', 16) + ' ' + t('darkMode') + '</button>' +
    '<button class="btn ' + (state.theme === 'light' ? 'btn-primary' : 'btn-secondary') + '" data-action="set-theme" data-theme="light">' +
    icon('sun', 16) + ' ' + t('lightMode') + '</button>' +
    '</div></div>' +
    '</div>' +
    '</div>';

  const storeSection =
    '<div class="card mb-4" style="padding:20px">' +
    '<h3 style="font-size:15px;font-weight:800;margin-bottom:16px">' + icon('store', 18) + ' ' + t('storeSettings') + '</h3>' +
    '<div class="grid" style="gap:14px">' +
    '<div style="display:flex;align-items:center;gap:16px">' +
    '<div style="width:70px;height:70px;border-radius:16px;background:var(--primary);color:#fff;display:grid;place-items:center;font-size:28px;font-weight:800;overflow:hidden;flex-shrink:0">' +
    (store.logo ? '<img src="' + store.logo + '" style="width:100%;height:100%;object-fit:cover" />' : (store.name || 'M').charAt(0)) +
    '</div>' +
    '<div style="flex:1">' +
    '<strong style="display:block;font-size:12px;margin-bottom:6px">' + t('storeLogo') + '</strong>' +
    '<div style="display:flex;gap:6px;flex-wrap:wrap">' +
    '<button class="btn btn-sm btn-secondary" data-action="upload-logo">' + icon('upload', 14) + ' ' + t('uploadLogo') + '</button>' +
    (store.logo ? '<button class="btn btn-sm btn-secondary" style="color:var(--danger)" data-action="remove-logo">' + icon('trash', 14) + '</button>' : '') +
    '</div>' +
    '</div>' +
    '</div>' +
    '<input type="file" id="logoInput" accept="image/*" style="display:none" />' +
    '<div class="field"><label>' + t('storeName') + '</label>' +
    '<input type="text" id="settingStoreName" value="' + (store.name || '') + '" /></div>' +
    '<div class="field"><label>' + t('storeTagline') + '</label>' +
    '<input type="text" id="settingStoreTagline" value="' + (store.tagline || '') + '" /></div>' +
    '<div class="grid grid-2">' +
    '<div class="field"><label>' + t('storePhone') + '</label>' +
    '<input type="text" id="settingStorePhone" value="' + (store.phone || '') + '" /></div>' +
    '<div class="field"><label>' + t('storeEmail') + '</label>' +
    '<input type="email" id="settingStoreEmail" value="' + (store.email || '') + '" /></div>' +
    '</div>' +
    '<div class="field"><label>' + t('storeAddress') + '</label>' +
    '<input type="text" id="settingStoreAddress" value="' + (store.address || '') + '" /></div>' +
    '<div class="grid grid-2">' +
    '<div class="field"><label>' + t('storeRC') + '</label>' +
    '<input type="text" id="settingStoreRC" value="' + (store.rc || '') + '" /></div>' +
    '<div class="field"><label>' + t('storeNIF') + '</label>' +
    '<input type="text" id="settingStoreNIF" value="' + (store.nif || '') + '" /></div>' +
    '</div>' +
    '<div class="grid grid-2">' +
    '<div class="field"><label>' + t('storeCurrency') + '</label>' +
    '<input type="text" id="settingStoreCurrency" value="' + (store.currency || 'دج') + '" /></div>' +
    '<div class="field"><label>' + t('taxRate') + ' (%)</label>' +
    '<input type="number" id="settingStoreTax" min="0" max="100" step="0.5" value="' + (store.taxRate || 0) + '" /></div>' +
    '</div>' +
    '<div class="field"><label>' + t('primaryColor') + '</label>' +
    '<div style="display:flex;gap:10px;flex-wrap:wrap">' +
    colors.map(function(c) {
      return '<div style="width:38px;height:38px;border-radius:50%;background:' + c + ';cursor:pointer;border:3px solid ' + (store.primaryColor === c ? 'var(--text)' : 'transparent') + ';position:relative" data-action="change-color" data-color="' + c + '">' +
        (store.primaryColor === c ? '<span style="position:absolute;inset:0;display:grid;place-items:center;color:#fff;font-weight:800;font-size:16px;text-shadow:0 1px 2px rgba(0,0,0,.5)">✓</span>' : '') +
        '</div>';
    }).join('') +
    '</div></div>' +
    '<button class="btn btn-primary btn-lg" data-action="save-settings">' + icon('save', 18) + ' ' + t('save') + '</button>' +
    '</div>' +
    '</div>';

  const backupSection =
    '<div class="card mb-4" style="padding:20px">' +
    '<h3 style="font-size:15px;font-weight:800;margin-bottom:16px">' + icon('database', 18) + ' ' + t('backupSettings') + '</h3>' +
    '<div class="grid" style="gap:10px">' +
    '<button class="btn btn-success" data-action="export-backup">' + icon('download', 18) + ' ' + t('exportBackup') + '</button>' +
    '<button class="btn btn-secondary" data-action="import-backup">' + icon('upload', 18) + ' ' + t('importBackup') + '</button>' +
    '<input type="file" id="backupInput" accept=".json" style="display:none" />' +
    '</div>' +
    '<div style="margin-top:16px;padding:14px;background:var(--danger-soft);border:1px solid var(--danger);border-radius:12px">' +
    '<strong style="display:block;color:var(--danger);font-size:13px;font-weight:800;margin-bottom:6px">⚠️ ' + t('resetData') + '</strong>' +
    '<small style="display:block;color:var(--text-soft);font-size:11px;margin-bottom:12px">' + t('resetDataConfirm') + '</small>' +
    '<button class="btn btn-danger btn-block" data-action="reset-data">' + icon('trash', 16) + ' ' + t('resetData') + '</button>' +
    '</div>' +
    '</div>';

  return '<div>' +
    '<div class="page-head">' +
    '<div><h1>' + icon('settings', 24) + ' ' + t('settingsTitle') + '</h1>' +
    '<p>' + t('settingsSub') + '</p></div>' +
    '</div>' +
    generalSection +
    storeSection +
    backupSection +
    '</div>';
}

function setLanguage(lang) {
  state.language = lang;
  applyLanguage();
  saveState();
  render();
}

function setTheme(theme) {
  state.theme = theme;
  applyTheme();
  saveState();
  render();
}

function setPrimaryColor(color) {
  state.store.primaryColor = color;
  applyStoreColor();
  saveState();
  render();
}

function removeLogo() {
  state.store.logo = '';
  saveState();
  render();
  toast(t('updatedSuccessfully'));
}

function saveSettings() {
  state.store.name = (document.getElementById('settingStoreName') || {}).value || '';
  state.store.tagline = (document.getElementById('settingStoreTagline') || {}).value || '';
  state.store.phone = (document.getElementById('settingStorePhone') || {}).value || '';
  state.store.email = (document.getElementById('settingStoreEmail') || {}).value || '';
  state.store.address = (document.getElementById('settingStoreAddress') || {}).value || '';
  state.store.rc = (document.getElementById('settingStoreRC') || {}).value || '';
  state.store.nif = (document.getElementById('settingStoreNIF') || {}).value || '';
  state.store.currency = (document.getElementById('settingStoreCurrency') || {}).value || 'دج';
  state.store.taxRate = Number((document.getElementById('settingStoreTax') || {}).value) || 0;

  saveState();
  updateAppTitle();
  render();
  toast(t('settingsSaved'));
}

/* =========================================================================
   BACKUP
   ========================================================================= */
function renderBackup() {
  const stats = [
    { label: t('navProducts'), value: state.products.length, icon: 'package' },
    { label: t('navCustomers'), value: state.customers.length, icon: 'users' },
    { label: t('navSuppliers'), value: state.suppliers.length, icon: 'truck' },
    { label: t('salesCount'), value: state.sales.length, icon: 'receipt' },
    { label: t('navExpenses'), value: state.expenses.length, icon: 'trendingDown' },
    { label: t('cashMovements'), value: state.cashMovements.length, icon: 'wallet' },
  ];

  return '<div>' +
    '<div class="page-head">' +
    '<div><h1>' + icon('database', 24) + ' ' + t('backupTitle') + '</h1>' +
    '<p>' + t('backupSub') + '</p></div>' +
    '</div>' +
    '<div class="grid grid-3 mb-4">' +
    stats.map(function(s) {
      return '<div class="stat">' +
        '<div class="stat-label">' + icon(s.icon, 14) + ' ' + s.label + '</div>' +
        '<div class="stat-value">' + s.value + '</div>' +
        '</div>';
    }).join('') +
    '</div>' +
    '<div class="card mb-4" style="padding:20px">' +
    '<h3 style="font-size:15px;font-weight:800;margin-bottom:16px">' + icon('download', 18) + ' ' + t('exportBackup') + '</h3>' +
    '<button class="btn btn-success btn-lg btn-block" data-action="export-backup">' + icon('download', 18) + ' ' + t('exportBackup') + '</button>' +
    '</div>' +
    '<div class="card mb-4" style="padding:20px">' +
    '<h3 style="font-size:15px;font-weight:800;margin-bottom:16px">' + icon('upload', 18) + ' ' + t('importBackup') + '</h3>' +
    '<button class="btn btn-primary btn-lg btn-block" data-action="import-backup">' + icon('upload', 18) + ' ' + t('importBackup') + '</button>' +
    '</div>' +
    '<div class="card" style="padding:20px;border-color:var(--danger)">' +
    '<h3 style="font-size:15px;font-weight:800;margin-bottom:16px;color:var(--danger)">' + icon('alertCircle', 18) + ' ' + t('resetData') + '</h3>' +
    '<button class="btn btn-danger btn-lg btn-block" data-action="reset-data">' + icon('trash', 18) + ' ' + t('resetData') + '</button>' +
    '</div>' +
    '</div>';
}

/* =========================================================================
   LOG
   ========================================================================= */
function renderLog() {
  if (!can('log')) {
    return '<div class="empty"><div class="empty-icon">' + icon('shield', 32) + '</div><h3>' + t('noPermission') + '</h3></div>';
  }

  const log = state.activity.slice();
  let listHtml = '';

  if (!log.length) {
    listHtml = '<div class="empty"><div class="empty-icon">' + icon('activity', 32) + '</div><h3>' + t('noData') + '</h3></div>';
  } else {
    listHtml = '<div class="grid" style="gap:8px">' +
      log.map(function(a) {
        const typeIcon = a.type === 'sale' ? 'shoppingBag' :
                        a.type === 'product_add' ? 'plus' :
                        a.type === 'product_edit' ? 'edit' :
                        a.type === 'product_delete' ? 'trash' :
                        a.type === 'customer_add' ? 'userPlus' :
                        a.type === 'supplier_add' ? 'truck' :
                        a.type === 'cash_in' ? 'trendingUp' :
                        a.type === 'cash_out' ? 'trendingDown' :
                        a.type === 'expense' ? 'trendingDown' : 'activity';

        const tone = a.type === 'sale' || a.type === 'cash_in' ? 'success' :
                     (a.type === 'expense' || a.type === 'cash_out' || a.type === 'product_delete') ? 'danger' :
                     (a.type === 'product_add' || a.type === 'customer_add' || a.type === 'supplier_add') ? 'primary' : 'cyan';

        return '<div class="card" style="display:flex;align-items:center;gap:12px;padding:12px">' +
          '<div class="stat-icon ' + tone + '" style="width:40px;height:40px">' + icon(typeIcon, 18) + '</div>' +
          '<div style="flex:1;min-width:0">' +
          '<strong style="display:block;color:var(--text);font-size:13px;font-weight:700">' + a.title + '</strong>' +
          (a.detail ? '<small style="display:block;color:var(--text-muted);font-size:11px;margin-top:3px">' + a.detail + '</small>' : '') +
          '</div>' +
          '<small style="color:var(--text-muted);font-size:10px;flex-shrink:0">' + timeAgo(a.date) + '</small>' +
          '</div>';
      }).join('') +
      '</div>';
  }

  return '<div>' +
    '<div class="page-head">' +
    '<div><h1>' + icon('activity', 24) + ' ' + t('logTitle') + '</h1>' +
    '<p>' + t('logSub') + ' · ' + log.length + '</p></div>' +
    (log.length ? '<button class="btn btn-secondary" data-action="clear-log">' + icon('trash', 16) + ' ' + t('logClear') + '</button>' : '') +
    '</div>' +
    listHtml +
    '</div>';
}

function confirmClearLog() {
  confirmAction(
    t('areYouSure') + '؟',
    function() {
      state.activity = [];
      saveState();
      render();
      toast(t('logCleared'));
    },
    'تفريغ السجل',
    'btn-danger'
  );
}

/* =========================================================================
   SEARCH LISTENERS
   ========================================================================= */
function setupSearchListeners() {
  const posInput = document.getElementById('posSearchInput');
  if (posInput) {
    posInput.oninput = function() { renderSearchResults(this.value); };
    posInput.onkeydown = function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        const results = searchProducts(this.value);
        if (results.length === 1) addToCartFromSearch(results[0].id);
        else if (results.length > 1) {
          const first = document.querySelector('.search-item');
          if (first) first.click();
        }
      }
    };
    setTimeout(function() { posInput.focus(); }, 100);
  }

  const custSelect = document.getElementById('posCustomerSelect');
  if (custSelect) {
    custSelect.onchange = function() {
      state.posCustomerId = this.value;
      saveState();
    };
  }

  const prodInput = document.getElementById('productSearchInput');
  if (prodInput) {
    prodInput.oninput = function() {
      state.searchQuery = this.value;
      const p = this.selectionStart;
      render();
      const ni = document.getElementById('productSearchInput');
      if (ni) { ni.focus(); ni.setSelectionRange(p, p); }
    };
  }

  const custInput = document.getElementById('customerSearchInput');
  if (custInput) {
    custInput.oninput = function() {
      state.searchQuery = this.value;
      const p = this.selectionStart;
      render();
      const ni = document.getElementById('customerSearchInput');
      if (ni) { ni.focus(); ni.setSelectionRange(p, p); }
    };
  }

  const suppInput = document.getElementById('supplierSearchInput');
  if (suppInput) {
    suppInput.oninput = function() {
      state.searchQuery = this.value;
      const p = this.selectionStart;
      render();
      const ni = document.getElementById('supplierSearchInput');
      if (ni) { ni.focus(); ni.setSelectionRange(p, p); }
    };
  }

  const barcodeBtn = document.getElementById('barcodeScanBtn');
  if (barcodeBtn) {
    barcodeBtn.onclick = function(e) {
      e.preventDefault();
      startBarcodeScanner();
    };
  }
}

/* =========================================================================
   BARCODE SCANNER
   ========================================================================= */
let html5QrCode = null;

function startBarcodeScanner() {
  if (typeof Html5Qrcode === 'undefined') {
    toast('مكتبة مسح الباركود غير محملة', 'error');
    return;
  }

  const content =
    '<div class="modal-head">' +
    '<div><h2>' + icon('camera', 22) + ' مسح الباركود</h2>' +
    '<p>وجه الكاميرا نحو الباركود</p></div>' +
    '<button class="modal-close" id="closeScannerBtn">' + icon('x', 18) + '</button>' +
    '</div>' +
    '<div class="modal-body" style="padding:0">' +
    '<div id="barcodeReader" style="width:100%;border-radius:12px;overflow:hidden"></div>' +
    '</div>';

  openModal(content);

  document.getElementById('closeScannerBtn').onclick = function() {
    stopBarcodeScanner();
  };

  setTimeout(function() {
    html5QrCode = new Html5Qrcode('barcodeReader');

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 150 },
      aspectRatio: 1.0,
    };

    html5QrCode.start(
      { facingMode: 'environment' },
      config,
      function(decodedText) {
        handleBarcodeScanned(decodedText);
        stopBarcodeScanner();
      },
      function(errorMessage) {}
    ).catch(function(err) {
      console.error('Camera error:', err);
      toast('تعذر فتح الكاميرا: ' + err, 'error');
      stopBarcodeScanner();
    });
  }, 100);
}

function stopBarcodeScanner() {
  if (html5QrCode) {
    html5QrCode.stop().then(function() {
      html5QrCode.clear();
      html5QrCode = null;
      closeModal();
    }).catch(function(err) {
      console.error('Stop error:', err);
      html5QrCode = null;
      closeModal();
    });
  } else {
    closeModal();
  }
}

function handleBarcodeScanned(barcode) {
  if (!barcode) return;

  const product = state.products.find(function(p) {
    return (p.barcode && p.barcode === barcode) ||
           (p.sku && p.sku === barcode);
  });

  if (product) {
    if (product.stock <= 0) {
      toast(t('outOfStock') + ': ' + product.name, 'error');
      return;
    }
    addToCartFromSearch(product.id);
    toast('✅ ' + product.name + ' - تمت الإضافة', 'success');
  } else {
    toast('لم يتم العثور على منتج بالباركود: ' + barcode, 'error');
  }
}

/* =========================================================================
   SIDEBAR
   ========================================================================= */
function updateSidebarActive() {
  const links = document.querySelectorAll('.sidebar-link');
  links.forEach(function(link) {
    if (link.dataset.view === state.activeView) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

function buildSidebar() {
  const sidebar = document.getElementById('sidebarNav');
  if (!sidebar) return;

  const items = [
    { view: 'home',      icon: '🏠', label: t('navHome') },
    { view: 'pos',       icon: '🛒', label: t('navPOS') },
    { view: 'products',  icon: '📦', label: t('navProducts') },
    { view: 'customers', icon: '👥', label: t('navCustomers') },
    { view: 'suppliers', icon: '🚚', label: t('navSuppliers') },
    { view: 'cash',      icon: '💰', label: t('navCash') },
    { view: 'expenses',  icon: '📉', label: t('navExpenses') },
    { view: 'reports',   icon: '📊', label: t('navReports') },
  ];

  if (can('users')) items.push({ view: 'users', icon: '🛡️', label: t('navUsers') });
  items.push({ view: 'backup', icon: '💾', label: t('navBackup') });
  if (can('log')) items.push({ view: 'log', icon: '📋', label: t('navLog') });
  items.push({ view: 'settings', icon: '⚙️', label: t('navSettings') });

  sidebar.innerHTML = items.map(function(item) {
    const active = state.activeView === item.view;
    return '<a class="sidebar-link' + (active ? ' active' : '') + '" data-action="nav" data-view="' + item.view + '">' +
      '<span class="sidebar-icon">' + item.icon + '</span>' +
      '<span>' + item.label + '</span>' +
      '</a>';
  }).join('');
}