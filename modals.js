/* =========================================================================
   MODALS — النوافذ المنبثقة
   ========================================================================= */

/* =========================================================================
   MODAL HELPERS
   ========================================================================= */
function openModal(content, size) {
  const sizeClass = size === 'lg' ? ' modal-lg' : size === 'full' ? ' modal-full' : '';
  document.getElementById('modalRoot').innerHTML =
    '<div class="modal-backdrop">' +
    '<div class="modal' + sizeClass + '">' + content + '</div>' +
    '</div>';
  bindModalEvents();
}

function closeModal() {
  document.getElementById('modalRoot').innerHTML = '';
}

function bindModalEvents() {
  document.querySelectorAll('[data-close-modal]').forEach(function(b) {
    b.onclick = closeModal;
  });

  const backdrop = document.querySelector('.modal-backdrop');
  if (backdrop) {
    backdrop.onclick = function(e) {
      if (e.target === backdrop) closeModal();
    };
  }

  document.querySelectorAll('#modalRoot [data-action]').forEach(function(el) {
    el.onclick = function(e) {
      e.preventDefault();
      handleAction(el.dataset.action, el.dataset);
    };
  });
}

/* =========================================================================
   CONFIRM ACTION
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
   PRODUCT MODAL
   ========================================================================= */
function openProductModal(productId) {
  if (!can(productId ? 'editProduct' : 'addProduct')) {
    toast(t('noPermission'), 'error');
    return;
  }

  const p = productId ? findProduct(productId) : null;
  const editing = !!p;

  const catOptions = state.categories.map(function(c) {
    return '<option value="' + c.id + '"' + (p && p.categoryId === c.id ? ' selected' : '') + '>' +
      (c.icon || '') + ' ' + c.name + '</option>';
  }).join('');

  const supplierOptions = '<option value="">— بدون مورد —</option>' +
    state.suppliers.map(function(s) {
      return '<option value="' + s.id + '"' + (p && p.supplierId === s.id ? ' selected' : '') + '>' +
        s.name + '</option>';
    }).join('');

  const unitOptions = ['unitPiece', 'unitKg', 'unitLiter', 'unitBox', 'unitPack', 'unitMeter'].map(function(u) {
    return '<option value="' + u + '"' + (p && p.unit === u ? ' selected' : (!p && u === 'unitPiece' ? ' selected' : '')) + '>' +
      t(u) + '</option>';
  }).join('');

  const expiryValue = p && p.expiryDate ? new Date(p.expiryDate).toISOString().split('T')[0] : '';

  const content =
    '<div class="modal-head">' +
    '<div><h2>' + icon('package', 22) + ' ' + (editing ? t('editProduct') : t('addProduct')) + '</h2>' +
    '<p>' + t('productsSub') + '</p></div>' +
    '<button class="modal-close" data-close-modal>' + icon('x', 18) + '</button>' +
    '</div>' +

    '<div class="modal-body">' +
    '<div class="field"><label>' + t('productName') + ' *</label>' +
    '<input type="text" id="prodName" value="' + (p ? p.name : '') + '" placeholder="' + t('productName') + '" /></div>' +

    '<div class="grid grid-2">' +
    '<div class="field"><label>' + t('productSKU') + '</label>' +
    '<input type="text" id="prodSku" value="' + (p ? p.sku : '') + '" placeholder="PR-001" /></div>' +
    '<div class="field"><label>' + t('productBarcode') + '</label>' +
    '<input type="text" id="prodBarcode" value="' + (p ? (p.barcode || '') : '') + '" placeholder="1234567890" /></div>' +
    '</div>' +

    '<div class="grid grid-2">' +
    '<div class="field"><label>' + t('productCategory') + '</label>' +
    '<select id="prodCategory">' + catOptions + '</select></div>' +
    '<div class="field"><label>🏭 المورد</label>' +
    '<select id="prodSupplier">' + supplierOptions + '</select></div>' +
    '</div>' +

    '<div class="grid grid-2">' +
    '<div class="field"><label>' + t('productPrice') + ' *</label>' +
    '<input type="number" id="prodPrice" min="0" step="1" value="' + (p ? p.price : '') + '" placeholder="0" /></div>' +
    '<div class="field"><label>' + t('productCost') + '</label>' +
    '<input type="number" id="prodCost" min="0" step="1" value="' + (p ? (p.cost || '') : '') + '" placeholder="0" /></div>' +
    '</div>' +

    '<div class="grid grid-3">' +
    '<div class="field"><label>' + t('productStock') + ' *</label>' +
    '<input type="number" id="prodStock" min="0" step="1" value="' + (p ? p.stock : '') + '" placeholder="0" /></div>' +
    '<div class="field"><label>' + t('productMinStock') + '</label>' +
    '<input type="number" id="prodMinStock" min="0" step="1" value="' + (p ? (p.minStock || 5) : 5) + '" placeholder="5" /></div>' +
    '<div class="field"><label>' + t('productUnit') + '</label>' +
    '<select id="prodUnit">' + unitOptions + '</select></div>' +
    '</div>' +

    '<div class="field"><label>📅 تاريخ الصلاحية (اختياري)</label>' +
    '<input type="date" id="prodExpiry" value="' + expiryValue + '" /></div>' +

    '<div class="grid grid-2">' +
    '<div class="field"><label>أيقونة (إيموجي)</label>' +
    '<input type="text" id="prodIcon" maxlength="4" value="' + (p ? (p.icon || '') : '') + '" placeholder="📦" style="font-size:20px;text-align:center" /></div>' +
    '<div class="field"><label>اللون</label>' +
    '<input type="color" id="prodColor" value="' + (p ? (p.color || '#3b82f6') : '#3b82f6') + '" style="width:100%;height:44px;padding:4px;border-radius:12px;border:1.5px solid var(--border);background:var(--surface-2)" /></div>' +
    '</div>' +

    '</div>' +

    '<div class="modal-actions">' +
    '<button class="btn btn-secondary" data-close-modal>' + t('cancel') + '</button>' +
    '<button class="btn btn-primary" id="saveProductBtn">' + icon('check', 16) + ' ' + t('save') + '</button>' +
    '</div>';

  openModal(content);

  document.getElementById('saveProductBtn').onclick = function() {
    const name = document.getElementById('prodName').value.trim();
    const sku = document.getElementById('prodSku').value.trim();
    const barcode = document.getElementById('prodBarcode').value.trim();
    const categoryId = document.getElementById('prodCategory').value;
    const supplierId = document.getElementById('prodSupplier').value;
    const price = Number(document.getElementById('prodPrice').value) || 0;
    const cost = Number(document.getElementById('prodCost').value) || 0;
    const stock = Number(document.getElementById('prodStock').value) || 0;
    const minStock = Number(document.getElementById('prodMinStock').value) || 5;
    const unit = document.getElementById('prodUnit').value;
    const expiryStr = document.getElementById('prodExpiry').value;
    const iconChar = document.getElementById('prodIcon').value.trim() || '📦';
    const color = document.getElementById('prodColor').value;

    if (!name) { toast(t('fillRequired'), 'error'); return; }
    if (price <= 0) { toast(t('invalidValue'), 'error'); return; }

    if (sku) {
      const dup = state.products.find(function(x) {
        return x.sku === sku && x.id !== (p ? p.id : null);
      });
      if (dup) { toast('SKU: ' + sku + ' موجود', 'error'); return; }
    }

    const expiryDate = expiryStr ? new Date(expiryStr).getTime() : null;

    if (editing) {
      p.name = name;
      p.sku = sku || p.sku;
      p.barcode = barcode;
      p.categoryId = categoryId;
      p.supplierId = supplierId;
      p.price = price;
      p.cost = cost;
      p.stock = stock;
      p.minStock = minStock;
      p.unit = unit;
      p.expiryDate = expiryDate;
      p.icon = iconChar;
      p.color = color;
      logActivity('product_edit', t('logProductEdit') + ': ' + name, formatMoney(price));
    } else {
      state.products.push({
        id: uid('prod'),
        name: name,
        sku: sku || ('PR-' + Date.now().toString().slice(-6)),
        barcode: barcode,
        categoryId: categoryId,
        supplierId: supplierId,
        price: price,
        cost: cost,
        stock: stock,
        minStock: minStock,
        unit: unit,
        expiryDate: expiryDate,
        icon: iconChar,
        color: color,
        createdAt: Date.now(),
      });
      logActivity('product_add', t('logProductAdd') + ': ' + name, stock + ' ' + t(unit));
    }

    saveState();
    closeModal();
    render();
    toast(t('productSaved'));
  };
}

/* =========================================================================
   PRODUCT DETAILS
   ========================================================================= */
function openProductDetails(productId) {
  const p = findProduct(productId);
  if (!p) return;

  const sales = state.sales.filter(function(s) {
    return (s.items || []).some(function(i) { return i.productId === productId; });
  });
  const totalSold = sales.reduce(function(sum, s) {
    const item = s.items.find(function(i) { return i.productId === productId; });
    return sum + (item ? item.qty : 0);
  }, 0);
  const totalRevenue = sales.reduce(function(sum, s) {
    const item = s.items.find(function(i) { return i.productId === productId; });
    return sum + (item ? item.qty * item.price : 0);
  }, 0);

  const supplier = getProductSupplier(p);
  const st = getProductStatus(p);
  const stLabel = st === 'in' ? t('inStock') : st === 'low' ? t('lowStock') : t('outStock');
  const stTone = st === 'in' ? 'success' : st === 'low' ? 'warning' : 'danger';
  const profit = (p.price - (p.cost || 0));
  const profitMargin = p.price > 0 ? Math.round(profit / p.price * 100) : 0;

  let expiryHtml = '';
  if (p.expiryDate) {
    const days = daysUntilExpiry(p);
    const expired = days < 0;
    const expiring = days >= 0 && days <= 30;
    const tone = expired ? 'danger' : expiring ? 'warning' : 'success';
    const label = expired ? 'منتهي الصلاحية' : 'باقي ' + days + ' يوم';

    expiryHtml =
      '<div class="card" style="padding:12px;border-color:var(--' + tone + ')">' +
      '<small style="color:var(--text-muted);font-size:10px;display:block">📅 تاريخ الصلاحية</small>' +
      '<strong style="color:var(--' + tone + ');font-size:14px;font-weight:800;margin-top:4px;display:block">' + formatDate(p.expiryDate) + '</strong>' +
      '<small style="color:var(--' + tone + ');font-size:11px;display:block;margin-top:4px">' + label + '</small>' +
      '</div>';
  }

  const content =
    '<div class="modal-head">' +
    '<div><h2>' + icon('package', 22) + ' ' + t('product') + '</h2></div>' +
    '<button class="modal-close" data-close-modal>' + icon('x', 18) + '</button>' +
    '</div>' +

    '<div class="modal-body">' +
    '<div style="display:flex;align-items:center;gap:14px;padding:14px;background:var(--surface-2);border-radius:16px">' +
    '<div style="width:64px;height:64px;border-radius:16px;background:' + hexToRgba(p.color, .15) + ';color:' + p.color + ';display:grid;place-items:center;font-size:32px;flex-shrink:0">' + (p.icon || '📦') + '</div>' +
    '<div style="flex:1;min-width:0">' +
    '<strong style="display:block;color:var(--text);font-size:16px;font-weight:800">' + p.name + '</strong>' +
    '<small style="display:block;color:var(--text-muted);font-size:11px;margin-top:4px">' + p.sku + ' · ' + getCategoryName(p.categoryId) + '</small>' +
    (supplier ? '<small style="display:block;color:var(--cyan);font-size:11px;margin-top:4px">🏭 ' + supplier.name + '</small>' : '') +
    '<span style="display:inline-block;margin-top:6px;padding:3px 10px;border-radius:8px;background:var(--' + stTone + '-soft);color:var(--' + stTone + ');font-size:10px;font-weight:700">' + stLabel + '</span>' +
    '</div></div>' +

    (expiryHtml ? '<div style="margin-top:12px">' + expiryHtml + '</div>' : '') +

    '<div class="grid grid-2" style="gap:10px;margin-top:12px">' +
    '<div class="card" style="padding:12px"><small style="color:var(--text-muted);font-size:10px;display:block">' + t('productPrice') + '</small>' +
    '<strong style="color:var(--success);font-size:16px;font-weight:800;direction:ltr;margin-top:4px;display:block">' + formatMoney(p.price) + '</strong></div>' +
    '<div class="card" style="padding:12px"><small style="color:var(--text-muted);font-size:10px;display:block">' + t('productCost') + '</small>' +
    '<strong style="color:var(--text-soft);font-size:16px;font-weight:800;direction:ltr;margin-top:4px;display:block">' + formatMoney(p.cost || 0) + '</strong></div>' +
    '<div class="card" style="padding:12px"><small style="color:var(--text-muted);font-size:10px;display:block">الربح للوحدة</small>' +
    '<strong style="color:var(--primary);font-size:16px;font-weight:800;direction:ltr;margin-top:4px;display:block">' + formatMoney(profit) + ' (' + profitMargin + '%)</strong></div>' +
    '<div class="card" style="padding:12px"><small style="color:var(--text-muted);font-size:10px;display:block">' + t('productStock') + '</small>' +
    '<strong style="color:var(--text);font-size:16px;font-weight:800;direction:ltr;margin-top:4px;display:block">' + p.stock + ' ' + t(p.unit || 'unitPiece') + '</strong></div>' +
    '<div class="card" style="padding:12px"><small style="color:var(--text-muted);font-size:10px;display:block">' + t('salesCount') + '</small>' +
    '<strong style="color:var(--primary);font-size:16px;font-weight:800;direction:ltr;margin-top:4px;display:block">' + sales.length + '</strong></div>' +
    '<div class="card" style="padding:12px"><small style="color:var(--text-muted);font-size:10px;display:block">' + t('totalSales') + '</small>' +
    '<strong style="color:var(--success);font-size:16px;font-weight:800;direction:ltr;margin-top:4px;display:block">' + formatMoney(totalRevenue) + '</strong></div>' +
    '</div>' +
    '</div>' +

    '<div class="modal-actions">' +
    (can('editProduct') ? '<button class="btn btn-primary" data-action="edit-product" data-id="' + p.id + '">' + icon('edit', 16) + ' ' + t('edit') + '</button>' : '') +
    (can('deleteProduct') ? '<button class="btn btn-danger" data-action="delete-product" data-id="' + p.id + '">' + icon('trash', 16) + ' ' + t('delete') + '</button>' : '') +
    '<button class="btn btn-secondary" data-close-modal>' + t('close') + '</button>' +
    '</div>';

  openModal(content);
}

function confirmDeleteProduct(id) {
  const p = findProduct(id);
  if (!p) return;
  
  confirmAction(
    'هل أنت متأكد من حذف المنتج "' + p.name + '"؟',
    function() {
      state.products = state.products.filter(function(x) { return x.id !== id; });
      logActivity('product_delete', t('logProductDelete') + ': ' + p.name, '');
      saveState();
      closeModal();
      render();
      toast(t('productDeleted'), 'error');
    },
    'حذف',
    'btn-danger'
  );
}

/* =========================================================================
   CUSTOMER MODAL
   ========================================================================= */
function openCustomerModal(customerId) {
  if (!can(customerId ? 'editCustomer' : 'addCustomer')) {
    toast(t('noPermission'), 'error');
    return;
  }

  const c = customerId ? findCustomer(customerId) : null;
  const editing = !!c;

  const content =
    '<div class="modal-head">' +
    '<div><h2>' + icon('user', 22) + ' ' + (editing ? t('editCustomer') : t('addCustomer')) + '</h2></div>' +
    '<button class="modal-close" data-close-modal>' + icon('x', 18) + '</button>' +
    '</div>' +

    '<div class="modal-body">' +
    '<div class="field"><label>' + t('customerName') + ' *</label>' +
    '<input type="text" id="custName" value="' + (c ? c.name : '') + '" /></div>' +

    '<div class="field"><label>' + t('customerPhone') + '</label>' +
    '<input type="tel" id="custPhone" value="' + (c ? (c.phone || '') : '') + '" placeholder="05xx xx xx xx" /></div>' +

    '<div class="field"><label>' + t('customerEmail') + '</label>' +
    '<input type="email" id="custEmail" value="' + (c ? (c.email || '') : '') + '" /></div>' +

    '<div class="field"><label>' + t('customerAddress') + '</label>' +
    '<input type="text" id="custAddress" value="' + (c ? (c.address || '') : '') + '" /></div>' +

    (editing && c.debt > 0 ?
      '<div class="card" style="padding:12px;background:var(--danger-soft);border-color:var(--danger)">' +
      '<small style="display:block;color:var(--danger);font-size:11px;font-weight:700">' + t('customerDebt') + '</small>' +
      '<strong style="display:block;color:var(--danger);font-size:18px;direction:ltr;margin-top:4px">' + formatMoney(c.debt) + '</strong>' +
      '</div>' : '') +

    '</div>' +

    '<div class="modal-actions">' +
    '<button class="btn btn-secondary" data-close-modal>' + t('cancel') + '</button>' +
    '<button class="btn btn-primary" id="saveCustomerBtn">' + icon('check', 16) + ' ' + t('save') + '</button>' +
    '</div>';

  openModal(content);

  document.getElementById('saveCustomerBtn').onclick = function() {
    const name = document.getElementById('custName').value.trim();
    const phone = document.getElementById('custPhone').value.trim();
    const email = document.getElementById('custEmail').value.trim();
    const address = document.getElementById('custAddress').value.trim();

    if (!name) { toast(t('fillRequired'), 'error'); return; }

    if (editing) {
      c.name = name;
      c.phone = phone;
      c.email = email;
      c.address = address;
    } else {
      state.customers.push({
        id: uid('cust'),
        name: name,
        phone: phone,
        email: email,
        address: address,
        debt: 0,
        totalPurchases: 0,
        points: 0,
        createdAt: Date.now(),
      });
      logActivity('customer_add', t('logCustomerAdd') + ': ' + name, phone);
    }

    saveState();
    closeModal();
    render();
    toast(t('customerSaved'));
  };
}

function openCustomerDetails(customerId) {
  const c = findCustomer(customerId);
  if (!c) return;

  const sales = state.sales.filter(function(s) { return s.customerId === customerId; })
    .sort(function(a, b) { return b.date - a.date; });
  const totalSpent = sales.reduce(function(sum, s) { return sum + s.total; }, 0);

  const content =
    '<div class="modal-head">' +
    '<div><h2>' + icon('user', 22) + ' ' + c.name + '</h2>' +
    '<p>' + t('customerDetails') + '</p></div>' +
    '<button class="modal-close" data-close-modal>' + icon('x', 18) + '</button>' +
    '</div>' +

    '<div class="modal-body">' +
    '<div style="text-align:center;padding:16px 0">' +
    '<div style="width:80px;height:80px;margin:0 auto;border-radius:50%;background:var(--primary-soft);color:var(--primary);display:grid;place-items:center;font-size:28px;font-weight:800">' +
    (c.name || '?').split(' ').map(function(w) { return w[0]; }).slice(0, 2).join('') +
    '</div>' +
    '<strong style="display:block;color:var(--text);font-size:18px;font-weight:800;margin-top:12px">' + c.name + '</strong>' +
    '<small style="display:block;color:var(--text-muted);font-size:12px;margin-top:4px;direction:ltr">' + (c.phone || '-') + '</small>' +
    (c.points ? '<small style="display:block;color:var(--warning);font-size:12px;margin-top:6px;font-weight:700">🎁 ' + c.points + ' نقطة ولاء</small>' : '') +
    '</div>' +

    '<div class="grid grid-3" style="gap:10px;margin-top:12px">' +
    '<div class="card" style="padding:12px;text-align:center">' +
    '<small style="color:var(--text-muted);font-size:10px;display:block">' + t('salesCount') + '</small>' +
    '<strong style="color:var(--primary);font-size:18px;font-weight:800;direction:ltr;display:block;margin-top:4px">' + sales.length + '</strong></div>' +
    '<div class="card" style="padding:12px;text-align:center">' +
    '<small style="color:var(--text-muted);font-size:10px;display:block">' + t('totalPurchases') + '</small>' +
    '<strong style="color:var(--success);font-size:14px;font-weight:800;direction:ltr;display:block;margin-top:4px">' + formatNumber(totalSpent) + '</strong></div>' +
    '<div class="card" style="padding:12px;text-align:center;' + (c.debt > 0 ? 'border-color:var(--danger)' : '') + '">' +
    '<small style="color:var(--text-muted);font-size:10px;display:block">' + t('customerDebt') + '</small>' +
    '<strong style="color:' + (c.debt > 0 ? 'var(--danger)' : 'var(--text-muted)') + ';font-size:14px;font-weight:800;direction:ltr;display:block;margin-top:4px">' + formatNumber(c.debt || 0) + '</strong></div>' +
    '</div>' +

    (sales.length ?
      '<h3 style="font-size:14px;font-weight:800;margin:20px 0 10px">' + t('salesLog') + '</h3>' +
      '<div class="grid" style="gap:8px">' +
      sales.slice(0, 10).map(function(s) {
        return '<div class="card" style="padding:10px;display:flex;align-items:center;gap:10px">' +
          '<div class="stat-icon success" style="width:36px;height:36px">' + icon('receipt', 16) + '</div>' +
          '<div style="flex:1;min-width:0">' +
          '<strong style="color:var(--text);font-size:12px;font-weight:700;display:block">' + s.invoiceNo + '</strong>' +
          '<small style="color:var(--text-muted);font-size:10px;margin-top:2px;display:block">' + formatDate(s.date, true) + '</small></div>' +
          '<strong style="color:var(--success);font-size:13px;direction:ltr">' + formatNumber(s.total) + '</strong>' +
          '</div>';
      }).join('') +
      '</div>' : '') +

    '</div>' +

    '<div class="modal-actions">' +
    (c.debt > 0 && can('addCash') ?
      '<button class="btn btn-success" data-action="pay-customer-debt" data-id="' + c.id + '">' + icon('wallet', 16) + ' ' + t('payDebt') + '</button>' : '') +
    (can('editCustomer') ?
      '<button class="btn btn-primary" data-action="edit-customer" data-id="' + c.id + '">' + icon('edit', 16) + ' ' + t('edit') + '</button>' : '') +
    (can('deleteCustomer') ?
      '<button class="btn btn-danger" data-action="delete-customer" data-id="' + c.id + '">' + icon('trash', 16) + '</button>' : '') +
    '<button class="btn btn-secondary" data-close-modal>' + t('close') + '</button>' +
    '</div>';

  openModal(content);
}

function confirmDeleteCustomer(id) {
  const c = findCustomer(id);
  if (!c) return;
  if (c.debt > 0) { toast(t('customerHasDebt'), 'error'); return; }
  
  confirmAction(
    'هل أنت متأكد من حذف العميل "' + c.name + '"؟',
    function() {
      state.customers = state.customers.filter(function(x) { return x.id !== id; });
      logActivity('customer_delete', 'حذف عميل: ' + c.name, '');
      saveState();
      closeModal();
      render();
      toast(t('customerDeleted'), 'error');
    },
    'حذف',
    'btn-danger'
  );
}

/* =========================================================================
   PAY DEBT MODAL
   ========================================================================= */
function openPayDebtModal(customerId) {
  const c = findCustomer(customerId);
  if (!c || c.debt <= 0) return;

  const content =
    '<div class="modal-head">' +
    '<div><h2>' + icon('wallet', 22) + ' ' + t('payDebt') + '</h2>' +
    '<p>' + c.name + '</p></div>' +
    '<button class="modal-close" data-close-modal>' + icon('x', 18) + '</button>' +
    '</div>' +

    '<div class="modal-body">' +
    '<div class="card" style="padding:16px;background:var(--danger-soft);border-color:var(--danger);text-align:center">' +
    '<small style="color:var(--danger);font-size:11px;font-weight:700">' + t('customerDebt') + '</small>' +
    '<strong style="display:block;color:var(--danger);font-size:24px;font-weight:800;direction:ltr;margin-top:6px">' + formatMoney(c.debt) + '</strong>' +
    '</div>' +

    '<div class="field"><label>' + t('amount') + '</label>' +
    '<input type="number" id="payAmount" min="0" max="' + c.debt + '" step="1" value="' + c.debt + '" /></div>' +
    '</div>' +

    '<div class="modal-actions">' +
    '<button class="btn btn-secondary" data-close-modal>' + t('cancel') + '</button>' +
    '<button class="btn btn-success" id="confirmPayBtn">' + icon('check', 16) + ' ' + t('confirm') + '</button>' +
    '</div>';

  openModal(content);

  document.getElementById('confirmPayBtn').onclick = function() {
    const amount = Number(document.getElementById('payAmount').value) || 0;

    if (amount <= 0) { toast(t('invalidValue'), 'error'); return; }
    if (amount > c.debt) { toast(t('invalidValue'), 'error'); return; }

    c.debt = Math.max(0, c.debt - amount);

    const balance = getCashBalance();
    state.cashMovements.push({
      id: uid('cash'),
      type: 'customer_payment',
      amount: amount,
      balance: balance + amount,
      reason: t('customerPayment') + ': ' + c.name,
      refId: c.id,
      date: Date.now(),
    });

    state.payments.push({
      id: uid('pay'),
      customerId: c.id,
      saleId: null,
      amount: amount,
      method: 'cash',
      date: Date.now(),
      notes: t('payDebt'),
    });

    logActivity('cash_in', t('customerPayment') + ': ' + c.name, formatMoney(amount));

    saveState();
    closeModal();
    render();
    toast(t('debtPaid'));
  };
}

/* =========================================================================
   SUPPLIER MODAL
   ========================================================================= */
function openSupplierModal(supplierId) {
  if (!can(supplierId ? 'editSupplier' : 'addSupplier')) {
    toast(t('noPermission'), 'error');
    return;
  }

  const s = supplierId ? findSupplier(supplierId) : null;
  const editing = !!s;

  const content =
    '<div class="modal-head">' +
    '<div><h2>' + icon('truck', 22) + ' ' + (editing ? t('editSupplier') : t('addSupplier')) + '</h2></div>' +
    '<button class="modal-close" data-close-modal>' + icon('x', 18) + '</button>' +
    '</div>' +

    '<div class="modal-body">' +
    '<div class="field"><label>' + t('supplierName') + ' *</label>' +
    '<input type="text" id="suppName" value="' + (s ? s.name : '') + '" /></div>' +

    '<div class="field"><label>' + t('supplierCompany') + '</label>' +
    '<input type="text" id="suppCompany" value="' + (s ? (s.company || '') : '') + '" /></div>' +

    '<div class="field"><label>' + t('supplierPhone') + '</label>' +
    '<input type="tel" id="suppPhone" value="' + (s ? (s.phone || '') : '') + '" /></div>' +

    '<div class="field"><label>' + t('supplierEmail') + '</label>' +
    '<input type="email" id="suppEmail" value="' + (s ? (s.email || '') : '') + '" /></div>' +
    '</div>' +

    '<div class="modal-actions">' +
    '<button class="btn btn-secondary" data-close-modal>' + t('cancel') + '</button>' +
    '<button class="btn btn-primary" id="saveSupplierBtn">' + icon('check', 16) + ' ' + t('save') + '</button>' +
    '</div>';

  openModal(content);

  document.getElementById('saveSupplierBtn').onclick = function() {
    const name = document.getElementById('suppName').value.trim();
    const company = document.getElementById('suppCompany').value.trim();
    const phone = document.getElementById('suppPhone').value.trim();
    const email = document.getElementById('suppEmail').value.trim();

    if (!name) { toast(t('fillRequired'), 'error'); return; }

    if (editing) {
      s.name = name;
      s.company = company;
      s.phone = phone;
      s.email = email;
    } else {
      state.suppliers.push({
        id: uid('supp'),
        name: name,
        company: company,
        phone: phone,
        email: email,
        owed: 0,
        createdAt: Date.now(),
      });
      logActivity('supplier_add', t('logSupplierAdd') + ': ' + name, company);
    }

    saveState();
    closeModal();
    render();
    toast(t('supplierSaved'));
  };
}

function confirmDeleteSupplier(id) {
  const s = findSupplier(id);
  if (!s) return;
  if (s.owed > 0) { toast(t('supplierOwed'), 'error'); return; }
  
  confirmAction(
    'هل أنت متأكد من حذف المورد "' + s.name + '"؟',
    function() {
      state.suppliers = state.suppliers.filter(function(x) { return x.id !== id; });
      saveState();
      render();
      toast(t('supplierDeleted'), 'error');
    },
    'حذف',
    'btn-danger'
  );
}

/* =========================================================================
   PAY SUPPLIER MODAL
   ========================================================================= */
function openPaySupplierModal(supplierId) {
  const s = findSupplier(supplierId);
  if (!s || s.owed <= 0) return;

  const content =
    '<div class="modal-head">' +
    '<div><h2>' + icon('wallet', 22) + ' ' + t('paySupplier') + '</h2>' +
    '<p>' + s.name + '</p></div>' +
    '<button class="modal-close" data-close-modal>' + icon('x', 18) + '</button>' +
    '</div>' +

    '<div class="modal-body">' +
    '<div class="card" style="padding:16px;background:var(--warning-soft);border-color:var(--warning);text-align:center">' +
    '<small style="color:var(--warning);font-size:11px;font-weight:700">' + t('supplierOwed') + '</small>' +
    '<strong style="display:block;color:var(--warning);font-size:24px;font-weight:800;direction:ltr;margin-top:6px">' + formatMoney(s.owed) + '</strong>' +
    '</div>' +

    '<div class="field"><label>' + t('amount') + '</label>' +
    '<input type="number" id="paySuppAmount" min="0" max="' + s.owed + '" step="1" value="' + s.owed + '" /></div>' +
    '</div>' +

    '<div class="modal-actions">' +
    '<button class="btn btn-secondary" data-close-modal>' + t('cancel') + '</button>' +
    '<button class="btn btn-success" id="confirmPaySuppBtn">' + icon('check', 16) + ' ' + t('confirm') + '</button>' +
    '</div>';

  openModal(content);

  document.getElementById('confirmPaySuppBtn').onclick = function() {
    const amount = Number(document.getElementById('paySuppAmount').value) || 0;

    if (amount <= 0) { toast(t('invalidValue'), 'error'); return; }
    if (amount > s.owed) { toast(t('invalidValue'), 'error'); return; }

    const balance = getCashBalance();
    if (amount > balance) { toast(t('insufficientCash'), 'error'); return; }

    s.owed = Math.max(0, s.owed - amount);

    state.cashMovements.push({
      id: uid('cash'),
      type: 'supplier_payment',
      amount: -amount,
      balance: balance - amount,
      reason: t('supplierPayment') + ': ' + s.name,
      refId: s.id,
      date: Date.now(),
    });

    logActivity('cash_out', t('supplierPayment') + ': ' + s.name, formatMoney(amount));

    saveState();
    closeModal();
    render();
    toast(t('updatedSuccessfully'));
  };
}

/* =========================================================================
   CASH MODAL
   ========================================================================= */
function openCashModal(type) {
  const isIn = type === 'in';
  const title = isIn ? t('addCash') : t('withdrawCash');
  const iconName = isIn ? 'trendingUp' : 'trendingDown';
  const tone = isIn ? 'success' : 'danger';

  const content =
    '<div class="modal-head">' +
    '<div><h2>' + icon(iconName, 22) + ' ' + title + '</h2></div>' +
    '<button class="modal-close" data-close-modal>' + icon('x', 18) + '</button>' +
    '</div>' +

    '<div class="modal-body">' +
    '<div class="card" style="padding:16px;background:var(--' + tone + '-soft);border-color:var(--' + tone + ');text-align:center">' +
    '<small style="color:var(--' + tone + ');font-size:11px;font-weight:700">' + t('currentBalance') + '</small>' +
    '<strong style="display:block;color:var(--' + tone + ');font-size:24px;font-weight:800;direction:ltr;margin-top:6px">' + formatMoney(getCashBalance()) + '</strong>' +
    '</div>' +

    '<div class="field"><label>' + t('amount') + ' *</label>' +
    '<input type="number" id="cashAmount" min="0" step="1" placeholder="0" /></div>' +

    '<div class="field"><label>' + t('movementReason') + '</label>' +
    '<input type="text" id="cashReason" placeholder="' + t('movementReason') + '" /></div>' +
    '</div>' +

    '<div class="modal-actions">' +
    '<button class="btn btn-secondary" data-close-modal>' + t('cancel') + '</button>' +
    '<button class="btn btn-' + tone + '" id="confirmCashBtn">' + icon('check', 16) + ' ' + t('confirm') + '</button>' +
    '</div>';

  openModal(content);

  document.getElementById('confirmCashBtn').onclick = function() {
    const amount = Number(document.getElementById('cashAmount').value) || 0;
    const reason = document.getElementById('cashReason').value.trim() || (isIn ? t('cashIn') : t('cashOut'));

    if (amount <= 0) { toast(t('invalidValue'), 'error'); return; }

    const balance = getCashBalance();
    if (!isIn && amount > balance) { toast(t('insufficientCash'), 'error'); return; }

    const delta = isIn ? amount : -amount;
    state.cashMovements.push({
      id: uid('cash'),
      type: isIn ? 'manual_in' : 'manual_out',
      amount: delta,
      balance: balance + delta,
      reason: reason,
      refId: null,
      date: Date.now(),
    });

    logActivity(isIn ? 'cash_in' : 'cash_out', isIn ? t('logCashIn') : t('logCashOut'), formatMoney(amount));

    saveState();
    closeModal();
    render();
    toast(isIn ? t('cashAdded') : t('cashWithdrawn'));
  };
}

/* =========================================================================
   EXPENSE MODAL
   ========================================================================= */
function openExpenseModal(expenseId) {
  if (!can(expenseId ? 'editExpense' : 'addExpense')) {
    toast(t('noPermission'), 'error');
    return;
  }

  const e = expenseId ? state.expenses.find(function(x) { return x.id === expenseId; }) : null;
  const editing = !!e;

  const categories = [
    'categoryRent', 'categorySalaries', 'categoryUtilities', 'categoryTransport',
    'categoryMarketing', 'categorySupplies', 'categoryMaintenance', 'categoryOther'
  ];
  const catOptions = categories.map(function(c) {
    return '<option value="' + c + '"' + (e && e.category === c ? ' selected' : '') + '>' + t(c) + '</option>';
  }).join('');

  const today = new Date().toISOString().split('T')[0];
  const dateValue = e ? new Date(e.date).toISOString().split('T')[0] : today;

  const content =
    '<div class="modal-head">' +
    '<div><h2>' + icon('trendingDown', 22) + ' ' + (editing ? t('editExpense') : t('addExpense')) + '</h2></div>' +
    '<button class="modal-close" data-close-modal>' + icon('x', 18) + '</button>' +
    '</div>' +

    '<div class="modal-body">' +
    '<div class="field"><label>' + t('expenseName') + ' *</label>' +
    '<input type="text" id="expName" value="' + (e ? e.name : '') + '" /></div>' +

    '<div class="grid grid-2">' +
    '<div class="field"><label>' + t('expenseAmount') + ' *</label>' +
    '<input type="number" id="expAmount" min="0" step="1" value="' + (e ? e.amount : '') + '" /></div>' +
    '<div class="field"><label>' + t('expenseDate') + '</label>' +
    '<input type="date" id="expDate" value="' + dateValue + '" /></div>' +
    '</div>' +

    '<div class="field"><label>' + t('expenseCategory') + '</label>' +
    '<select id="expCategory">' + catOptions + '</select></div>' +

    '<div class="field"><label>' + t('expenseNotes') + '</label>' +
    '<textarea id="expNotes">' + (e ? (e.notes || '') : '') + '</textarea></div>' +
    '</div>' +

    '<div class="modal-actions">' +
    '<button class="btn btn-secondary" data-close-modal>' + t('cancel') + '</button>' +
    '<button class="btn btn-primary" id="saveExpenseBtn">' + icon('check', 16) + ' ' + t('save') + '</button>' +
    '</div>';

  openModal(content);

  document.getElementById('saveExpenseBtn').onclick = function() {
    const name = document.getElementById('expName').value.trim();
    const amount = Number(document.getElementById('expAmount').value) || 0;
    const dateStr = document.getElementById('expDate').value;
    const category = document.getElementById('expCategory').value;
    const notes = document.getElementById('expNotes').value.trim();

    if (!name) { toast(t('fillRequired'), 'error'); return; }
    if (amount <= 0) { toast(t('invalidValue'), 'error'); return; }

    const date = dateStr ? new Date(dateStr).getTime() : Date.now();

    if (editing) {
      e.name = name;
      e.amount = amount;
      e.date = date;
      e.category = category;
      e.notes = notes;
    } else {
      const expense = {
        id: uid('exp'),
        name: name,
        amount: amount,
        category: category,
        date: date,
        notes: notes,
        createdAt: Date.now(),
      };
      state.expenses.push(expense);

      const balance = getCashBalance();
      state.cashMovements.push({
        id: uid('cash'),
        type: 'expense',
        amount: -amount,
        balance: balance - amount,
        reason: name,
        refId: expense.id,
        date: date,
      });

      logActivity('expense', t('logExpense') + ': ' + name, formatMoney(amount));
    }

    saveState();
    closeModal();
    render();
    toast(editing ? t('savedSuccessfully') : t('expenseAdded'));
  };
}

function confirmDeleteExpense(id) {
  const e = state.expenses.find(function(x) { return x.id === id; });
  if (!e) return;
  
  confirmAction(
    'هل أنت متأكد من حذف المصروف "' + e.name + '"؟',
    function() {
      const balance = getCashBalance();
      state.cashMovements.push({
        id: uid('cash'),
        type: 'expense_refund',
        amount: e.amount,
        balance: balance + e.amount,
        reason: 'إلغاء مصروف: ' + e.name,
        refId: e.id,
        date: Date.now(),
      });

      state.expenses = state.expenses.filter(function(x) { return x.id !== id; });
      saveState();
      render();
      toast(t('expenseDeleted'), 'error');
    },
    'حذف',
    'btn-danger'
  );
}

/* =========================================================================
   USER MODAL
   ========================================================================= */
function openUserModal(userId) {
  if (!can('users')) { toast(t('noPermission'), 'error'); return; }

  const u = userId ? state.users.find(function(x) { return x.id === userId; }) : null;
  const editing = !!u;

  const content =
    '<div class="modal-head">' +
    '<div><h2>' + icon('shield', 22) + ' ' + (editing ? t('editUser') : t('addUser')) + '</h2></div>' +
    '<button class="modal-close" data-close-modal>' + icon('x', 18) + '</button>' +
    '</div>' +

    '<div class="modal-body">' +
    '<div class="field"><label>' + t('userName') + ' *</label>' +
    '<input type="text" id="userName" value="' + (u ? u.fullName : '') + '" /></div>' +

    '<div class="field"><label>' + t('userUsername') + ' *</label>' +
    '<input type="text" id="userUsername" value="' + (u ? u.username : '') + '" ' + (editing ? 'readonly' : '') + ' /></div>' +

    '<div class="field"><label>' + t('userPassword') + (editing ? '' : ' *') + '</label>' +
    '<input type="text" id="userPassword" value="' + (u ? u.password : '') + '" /></div>' +

    '<div class="field"><label>' + t('userRole') + '</label>' +
    '<select id="userRole">' +
    '<option value="admin"' + (u && u.role === 'admin' ? ' selected' : '') + '>' + t('roleAdmin') + '</option>' +
    '<option value="seller"' + (u && u.role === 'seller' ? ' selected' : '') + '>' + t('roleSeller') + '</option>' +
    '<option value="viewer"' + (u && u.role === 'viewer' ? ' selected' : '') + '>' + t('roleViewer') + '</option>' +
    '</select></div>' +

    '<div class="field"><label>الحالة</label>' +
    '<select id="userActive">' +
    '<option value="true"' + (!u || u.active ? ' selected' : '') + '>' + t('userActive') + '</option>' +
    '<option value="false"' + (u && !u.active ? ' selected' : '') + '>' + t('userInactive') + '</option>' +
    '</select></div>' +
    '</div>' +

    '<div class="modal-actions">' +
    '<button class="btn btn-secondary" data-close-modal>' + t('cancel') + '</button>' +
    '<button class="btn btn-primary" id="saveUserBtn">' + icon('check', 16) + ' ' + t('save') + '</button>' +
    '</div>';

  openModal(content);

  document.getElementById('saveUserBtn').onclick = function() {
    const fullName = document.getElementById('userName').value.trim();
    const username = document.getElementById('userUsername').value.trim().toLowerCase();
    const password = document.getElementById('userPassword').value.trim();
    const role = document.getElementById('userRole').value;
    const active = document.getElementById('userActive').value === 'true';

    if (!fullName || !username) { toast(t('fillRequired'), 'error'); return; }
    if (!editing && !password) { toast(t('fillRequired'), 'error'); return; }

    const dup = state.users.find(function(x) {
      return x.username === username && (!u || x.id !== u.id);
    });
    if (dup) { toast('Username: ' + username + ' موجود', 'error'); return; }

    if (editing) {
      u.fullName = fullName;
      u.password = password || u.password;
      u.role = role;
      u.active = active;
    } else {
      state.users.push({
        id: uid('user'),
        username: username,
        password: password,
        fullName: fullName,
        role: role,
        active: active,
        createdAt: Date.now(),
        lastLogin: null,
      });
      logActivity('user_add', t('logUserAdd') + ': ' + fullName, role);
    }

    saveState();
    closeModal();
    render();
    toast(t('userSaved'));
  };
}

function confirmDeleteUser(id) {
  if (!can('deleteUser')) { toast(t('noPermission'), 'error'); return; }

  const u = state.users.find(function(x) { return x.id === id; });
  if (!u) return;
  if (u.id === state.currentUser.id) { toast('لا يمكن حذف حسابك', 'error'); return; }

  if (u.role === 'admin') {
    const admins = state.users.filter(function(x) { return x.role === 'admin'; });
    if (admins.length <= 1) { toast('لا يمكن حذف آخر مدير', 'error'); return; }
  }

  confirmAction(
    'هل أنت متأكد من حذف المستخدم "' + u.fullName + '"؟',
    function() {
      state.users = state.users.filter(function(x) { return x.id !== id; });
      saveState();
      render();
      toast(t('userDeleted'), 'error');
    },
    'حذف',
    'btn-danger'
  );
}

/* =========================================================================
   NOTIFICATIONS MODAL
   ========================================================================= */
function openNotificationsModal() {
  const notifs = getNotifications();
  let body = '';

  if (!notifs.length) {
    body = '<div class="empty"><div class="empty-icon">' + icon('checkCircle', 32) + '</div><h3>' + t('noNotifications') + '</h3></div>';
  } else {
    body = '<div class="grid" style="gap:10px">' +
      notifs.map(function(n) {
        const tone = n.type === 'danger' ? 'danger' : n.type === 'warning' ? 'warning' : 'primary';
        return '<div class="card" style="display:flex;gap:12px;align-items:center">' +
          '<div class="stat-icon ' + tone + '" style="width:40px;height:40px">' + icon(n.icon, 20) + '</div>' +
          '<div style="flex:1;min-width:0">' +
          '<strong style="display:block;color:var(--text);font-size:13px;font-weight:700">' + n.title + '</strong>' +
          '<small style="display:block;color:var(--text-muted);font-size:11px;margin-top:3px">' + n.detail + '</small>' +
          '</div>' +
          '</div>';
      }).join('') +
      '</div>';
  }

  document.getElementById('modalRoot').innerHTML =
    '<div class="modal-backdrop"><div class="modal">' +
    '<div class="modal-head">' +
    '<div><h2>' + icon('bell', 22) + ' ' + t('notifications') + '</h2>' +
    '<p>' + notifs.length + ' ' + t('notifications') + '</p></div>' +
    '<button class="modal-close" data-close-modal>' + icon('x', 18) + '</button>' +
    '</div>' +
    '<div class="modal-body">' + body + '</div>' +
    (notifs.length ? '<div class="modal-actions"><button class="btn btn-secondary" id="markAllReadBtn">' + icon('check', 16) + ' ' + t('markAllRead') + '</button></div>' : '') +
    '</div></div>';

  bindModalEvents();

  const markBtn = document.getElementById('markAllReadBtn');
  if (markBtn) {
    markBtn.onclick = function() {
      state.readNotifs = state.readNotifs.concat(notifs.map(function(n) { return n.id; }));
      saveState();
      closeModal();
      render();
    };
  }
}

/* =========================================================================
   MENU MODAL (للهاتف فقط)
   ========================================================================= */
function openMenuModal() {
  const items = [
    { view: 'home', icon: '🏠', label: t('navHome') },
    { view: 'pos', icon: '🛒', label: t('navPOS') },
    { view: 'products', icon: '📦', label: t('navProducts') },
    { view: 'customers', icon: '👥', label: t('navCustomers') },
    { view: 'suppliers', icon: '🚚', label: t('navSuppliers') },
    { view: 'cash', icon: '💰', label: t('navCash') },
    { view: 'expenses', icon: '📉', label: t('navExpenses') },
    { view: 'reports', icon: '📊', label: t('navReports') },
  ];

  if (can('users')) items.push({ view: 'users', icon: '🛡️', label: t('navUsers') });
  items.push({ view: 'backup', icon: '💾', label: t('navBackup') });
  if (can('log')) items.push({ view: 'log', icon: '📋', label: t('navLog') });
  items.push({ view: 'settings', icon: '⚙️', label: t('navSettings') });

  const content =
    '<div class="modal-head">' +
    '<div><h2>' + icon('menu', 22) + ' ' + t('appName') + '</h2>' +
    '<p>' + (state.currentUser ? state.currentUser.fullName : '') + '</p></div>' +
    '<button class="modal-close" data-close-modal>' + icon('x', 18) + '</button>' +
    '</div>' +

    '<div class="modal-body">' +
    '<div class="nav-grid" style="grid-template-columns:repeat(auto-fill,minmax(100px,1fr))">' +
    items.map(function(item) {
      const active = state.activeView === item.view;
      return '<div class="nav-card" style="' + (active ? 'border-color:var(--primary);background:var(--primary-soft)' : '') + '" data-action="nav" data-view="' + item.view + '">' +
        '<div class="nav-card-icon" style="font-size:26px">' + item.icon + '</div>' +
        '<span>' + item.label + '</span>' +
        '</div>';
    }).join('') +
    '</div>' +
    '</div>' +

    '<div class="modal-actions">' +
    (state.currentUser ? '<button class="btn btn-danger" id="logoutBtn">' + icon('logOut', 16) + ' تسجيل الخروج</button>' : '') +
    '<button class="btn btn-secondary" data-close-modal>' + t('close') + '</button>' +
    '</div>';

  openModal(content);

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) logoutBtn.onclick = doLogout;
}

/* =========================================================================
   LOGIN SCREEN
   ========================================================================= */
function showLoginScreen() {
  const app = document.getElementById('app');
  if (app) app.hidden = true;

  document.getElementById('modalRoot').innerHTML =
    '<div class="modal-backdrop"><div class="modal" style="max-width:420px">' +
    '<div style="text-align:center;padding:20px 0 16px">' +
    '<div style="width:70px;height:70px;margin:0 auto;border-radius:20px;background:var(--primary);color:#fff;display:grid;place-items:center;font-size:32px;font-weight:800;box-shadow:var(--primary-glow)">' +
    (state.store.name || 'M').charAt(0) +
    '</div>' +
    '<h1 style="margin-top:16px;font-size:22px;font-weight:800">' + (state.store.name || t('appName')) + '</h1>' +
    '<p style="color:var(--text-muted);font-size:12px;margin-top:6px">' + t('loginTitle') + '</p>' +
    '</div>' +

    '<div class="modal-body">' +
    '<div class="field"><label>' + t('userUsername') + '</label>' +
    '<input type="text" id="loginUser" placeholder="admin" autocomplete="username" /></div>' +

    '<div class="field"><label>' + t('userPassword') + '</label>' +
    '<input type="password" id="loginPass" placeholder="••••••••" autocomplete="current-password" /></div>' +

    '<div id="loginError" style="display:none;padding:10px;background:var(--danger-soft);border-radius:10px;color:var(--danger);font-size:12px;font-weight:700;text-align:center"></div>' +
    '</div>' +

    '<div class="modal-actions" style="border-top:none;padding-top:0">' +
    '<button class="btn btn-primary btn-lg btn-block" id="loginBtn">' + icon('logIn', 18) + ' ' + t('loginBtn') + '</button>' +
    '</div>' +

    '<div style="margin-top:16px;padding:12px;background:var(--surface-2);border-radius:12px;font-size:11px;color:var(--text-muted);text-align:center">' +
    '<strong style="color:var(--text-soft)">حسابات تجريبية:</strong><br/>' +
    'admin / admin123 · seller / seller123' +
    '</div>' +
    '</div></div>';

  setTimeout(function() {
    const u = document.getElementById('loginUser');
    if (u) u.focus();
  }, 200);

  const doLogin = function() {
    const username = (document.getElementById('loginUser').value || '').trim().toLowerCase();
    const password = (document.getElementById('loginPass').value || '').trim();
    const errBox = document.getElementById('loginError');

    const user = state.users.find(function(u) {
      return u.username === username && u.password === password;
    });

    if (!user) {
      errBox.textContent = 'بيانات غير صحيحة';
      errBox.style.display = 'block';
      return;
    }

    if (!user.active) {
      errBox.textContent = 'الحساب معطل';
      errBox.style.display = 'block';
      return;
    }

    user.lastLogin = Date.now();
    state.currentUser = user;
    saveSession();
    saveState();

    closeModal();

    const app = document.getElementById('app');
    if (app) app.hidden = false;

    navigate('home');
    toast(t('loggedIn') + ', ' + user.fullName);
  };

  document.getElementById('loginBtn').onclick = doLogin;
  document.getElementById('loginPass').onkeydown = function(e) { if (e.key === 'Enter') doLogin(); };
  document.getElementById('loginUser').onkeydown = function(e) { if (e.key === 'Enter') document.getElementById('loginPass').focus(); };

  ['loginUser', 'loginPass'].forEach(function(id) {
    const el = document.getElementById(id);
    if (el) {
      el.oninput = function() {
        const err = document.getElementById('loginError');
        if (err) err.style.display = 'none';
      };
    }
  });
}

/* =========================================================================
   LOGOUT
   ========================================================================= */
function doLogout() {
  confirmAction(
    'هل تريد تسجيل الخروج؟',
    function() {
      state.currentUser = null;
      saveSession();
      closeModal();
      showLoginScreen();
      toast(t('loggedOut'));
    },
    'تسجيل الخروج',
    'btn-danger'
  );
}

/* =========================================================================
   PRINT INVOICE
   ========================================================================= */
function printInvoice(saleId) {
  const sale = state.sales.find(function(s) { return s.id === saleId; });
  if (!sale) { toast(t('noResults'), 'error'); return; }

  const customer = sale.customerId === 'walkin' ? null : findCustomer(sale.customerId);
  const seller = state.users.find(function(u) { return u.id === sale.soldBy; });
  const store = state.store;
  const isRtl = state.language === 'ar';

  const itemsHtml = (sale.items || []).map(function(item, i) {
    return '<tr>' +
      '<td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:center">' + (i + 1) + '</td>' +
      '<td style="padding:10px;border-bottom:1px solid #e5e7eb">' + item.name + '</td>' +
      '<td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:center;direction:ltr">' + item.qty + '</td>' +
      '<td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:end;direction:ltr">' + formatNumber(item.price) + '</td>' +
      '<td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:end;direction:ltr">' + formatNumber(item.qty * item.price) + '</td>' +
      '</tr>';
  }).join('');

  const logoHtml = store.logo ?
    '<img src="' + store.logo + '" style="width:60px;height:60px;border-radius:12px;object-fit:cover" />' :
    '<div style="width:60px;height:60px;border-radius:12px;background:' + store.primaryColor + ';color:#fff;display:grid;place-items:center;font-size:28px;font-weight:800">' + (store.name || 'M').charAt(0) + '</div>';

  const win = window.open('', '_blank', 'width=600,height=800');
  win.document.write(
    '<!DOCTYPE html><html dir="' + (isRtl ? 'rtl' : 'ltr') + '" lang="' + state.language + '">' +
    '<head><meta charset="UTF-8" />' +
    '<title>' + sale.invoiceNo + '</title>' +
    '<style>' +
    '* { box-sizing: border-box; margin: 0; padding: 0; }' +
    'body { font-family: "IBM Plex Sans Arabic", Tahoma, Arial, sans-serif; padding: 30px; color: #111827; background: #fff; font-size: 13px; }' +
    '.head { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 20px; border-bottom: 3px solid ' + store.primaryColor + '; margin-bottom: 24px; }' +
    '.brand { display: flex; align-items: center; gap: 14px; }' +
    '.brand-info h1 { font-size: 22px; font-weight: 800; color: #111827; }' +
    '.brand-info p { color: #6b7280; font-size: 11px; margin-top: 3px; }' +
    '.invoice-info { text-align: ' + (isRtl ? 'left' : 'right') + '; font-size: 12px; line-height: 1.8; }' +
    '.invoice-info strong { color: #111827; }' +
    '.invoice-info span { color: #6b7280; }' +
    '.badge { display: inline-block; padding: 4px 12px; border-radius: 8px; font-size: 11px; font-weight: 700; margin-top: 6px; }' +
    '.badge.paid { background: #d1fae5; color: #065f46; }' +
    '.badge.pending { background: #fef3c7; color: #92400e; }' +
    'h2 { font-size: 14px; font-weight: 800; color: #111827; margin: 20px 0 12px; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb; }' +
    'table { width: 100%; border-collapse: collapse; }' +
    'th { background: #f3f4f6; color: #374151; font-size: 11px; font-weight: 700; padding: 12px 10px; text-align: ' + (isRtl ? 'right' : 'left') + '; }' +
    '.totals { margin-top: 24px; padding: 20px; background: #f9fafb; border-radius: 12px; }' +
    '.totals-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; }' +
    '.totals-row.grand { border-top: 2px solid #e5e7eb; margin-top: 8px; padding-top: 14px; font-size: 18px; font-weight: 800; color: ' + store.primaryColor + '; }' +
    '.footer { margin-top: 30px; text-align: center; color: #9ca3af; font-size: 11px; padding-top: 20px; border-top: 1px solid #e5e7eb; }' +
    '@media print { body { padding: 15px; } }' +
    '</style></head><body>' +

    '<div class="head"><div class="brand">' + logoHtml +
    '<div class="brand-info"><h1>' + (store.name || 'SICPOS') + '</h1>' +
    '<p>' + (store.tagline || '') + '</p>' +
    (store.phone ? '<p>' + store.phone + (store.address ? ' · ' + store.address : '') + '</p>' : '') +
    '</div></div>' +

    '<div class="invoice-info">' +
    '<div><span>' + t('invoiceNo') + ':</span> <strong>' + sale.invoiceNo + '</strong></div>' +
    '<div><span>' + t('invoiceDate') + ':</span> <strong>' + formatDate(sale.date, true) + '</strong></div>' +
    (seller ? '<div><span>' + t('invoiceSeller') + ':</span> <strong>' + seller.fullName + '</strong></div>' : '') +
    '<div><span class="badge ' + (sale.paid ? 'paid' : 'pending') + '">' + (sale.paid ? t('invoicePaid') : t('invoicePending')) + '</span></div>' +
    '</div></div>' +

    '<h2>' + t('invoiceCustomer') + '</h2>' +
    '<table><tr><td style="padding:6px 0"><strong>' + t('customerName') + ':</strong></td><td>' + (customer ? customer.name : t('walkInCustomer')) + '</td></tr>' +
    (customer && customer.phone ? '<tr><td style="padding:6px 0"><strong>' + t('customerPhone') + ':</strong></td><td style="direction:ltr">' + customer.phone + '</td></tr>' : '') +
    '</table>' +

    '<h2>' + t('navProducts') + '</h2>' +
    '<table><thead><tr>' +
    '<th style="width:40px;text-align:center">#</th>' +
    '<th>' + t('invoiceProduct') + '</th>' +
    '<th style="width:60px;text-align:center">' + t('invoiceQty') + '</th>' +
    '<th style="width:90px;text-align:' + (isRtl ? 'left' : 'right') + '">' + t('invoicePrice') + '</th>' +
    '<th style="width:100px;text-align:' + (isRtl ? 'left' : 'right') + '">' + t('invoiceTotal') + '</th>' +
    '</tr></thead><tbody>' + itemsHtml + '</tbody></table>' +

    '<div class="totals">' +
    '<div class="totals-row"><span>' + t('subtotal') + '</span><strong style="direction:ltr">' + formatNumber(sale.subtotal) + ' ' + store.currency + '</strong></div>' +
    (sale.discount > 0 ? '<div class="totals-row" style="color:#ef4444"><span>' + t('discount') + '</span><strong style="direction:ltr">- ' + formatNumber(sale.discount) + ' ' + store.currency + '</strong></div>' : '') +
    (sale.tax > 0 ? '<div class="totals-row" style="color:#3b82f6"><span>' + t('tax') + '</span><strong style="direction:ltr">' + formatNumber(sale.tax) + ' ' + store.currency + '</strong></div>' : '') +
    '<div class="totals-row grand"><span>' + t('grandTotal') + '</span><strong style="direction:ltr">' + formatNumber(sale.total) + ' ' + store.currency + '</strong></div>' +
    '</div>' +

    '<div class="footer">' +
    '<strong style="color:#111827">' + t('invoiceThanks') + '</strong><br/>' +
    (store.email ? store.email : '') + (store.phone ? ' · ' + store.phone : '') +
    (store.rc ? '<br/>RC: ' + store.rc : '') + (store.nif ? ' · NIF: ' + store.nif : '') +
    '</div>' +

    '<script>window.onload = function() { setTimeout(function() { window.print(); }, 300); };<\/script>' +
    '</body></html>'
  );
  win.document.close();
}

/* =========================================================================
   EXPORT / IMPORT BACKUP
   ========================================================================= */
function exportBackup() {
  const data = {
    version: 'v1',
    exportedAt: new Date().toISOString(),
    products: state.products,
    categories: state.categories,
    customers: state.customers,
    suppliers: state.suppliers,
    users: state.users,
    sales: state.sales,
    expenses: state.expenses,
    cashMovements: state.cashMovements,
    activity: state.activity,
    payments: state.payments,
    loyaltySettings: state.loyaltySettings,
    store: state.store,
    branch: state.branch,
  };

  const content = JSON.stringify(data, null, 2);
  const blob = new Blob(['\uFEFF' + content], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'pos-backup-' + new Date().toISOString().slice(0, 10) + '.json';
  a.click();
  URL.revokeObjectURL(a.href);

  toast(t('backupExported'));
}

function importBackup(file) {
  const reader = new FileReader();

  reader.onload = function(ev) {
    try {
      const data = JSON.parse(ev.target.result);

      if (!data.products || !data.customers) {
        toast(t('backupInvalid'), 'error');
        return;
      }

      if (!confirm(t('backupConfirm') + '؟')) return;

      state.products = data.products || [];
      state.categories = data.categories || DEFAULT_CATEGORIES.slice();
      state.customers = data.customers || [];
      state.suppliers = data.suppliers || [];
      state.users = data.users || DEFAULT_USERS.slice();
      state.sales = data.sales || [];
      state.expenses = data.expenses || [];
      state.cashMovements = data.cashMovements || [];
      state.activity = data.activity || [];
      state.payments = data.payments || [];
      state.loyaltySettings = Object.assign({}, DEFAULT_LOYALTY, data.loyaltySettings || {});
      state.store = Object.assign({}, DEFAULT_STORE, data.store || {});
      state.branch = Object.assign({}, DEFAULT_BRANCH, data.branch || {});

      if (!state.users.some(function(u) { return u.username === 'admin'; })) {
        state.users.unshift(Object.assign({}, DEFAULT_USERS[0]));
      }

      saveState();
      render();
      toast(t('backupImported'));

    } catch (err) {
      console.error(err);
      toast(t('backupInvalid'), 'error');
    }
  };

  reader.readAsText(file);
}

/* =========================================================================
   CONFIRM RESET DATA — مع كلمة سر المدير
   ========================================================================= */
function confirmResetData() {
  const content =
    '<div class="modal-head">' +
    '<div><h2>' + icon('alertCircle', 22) + ' تحذير: مسح جميع البيانات</h2></div>' +
    '<button class="modal-close" data-close-modal>' + icon('x', 18) + '</button>' +
    '</div>' +

    '<div class="modal-body">' +
    '<div style="padding:16px;background:var(--danger-soft);border:1px solid var(--danger);border-radius:12px;text-align:center">' +
    '<strong style="display:block;color:var(--danger);font-size:14px;font-weight:800;margin-bottom:8px">⚠️ تحذير</strong>' +
    '<small style="color:var(--text-soft);font-size:12px;line-height:1.7;display:block">' +
    'سيتم مسح جميع البيانات نهائياً:<br/>' +
    'المنتجات، العملاء، الموردين، المبيعات، المصاريف، حركات الخزينة.<br/>' +
    '<strong style="color:var(--danger)">لا يمكن التراجع عن هذه العملية!</strong>' +
    '</small>' +
    '</div>' +

    '<div class="field mt-4"><label>🔐 كلمة سر المدير</label>' +
    '<input type="password" id="resetPassword" placeholder="أدخل كلمة سر المدير" /></div>' +
    '</div>' +

    '<div class="modal-actions">' +
    '<button class="btn btn-secondary" data-close-modal>إلغاء</button>' +
    '<button class="btn btn-danger" id="confirmResetBtn">' + icon('trash', 16) + ' مسح جميع البيانات</button>' +
    '</div>';

  openModal(content);

  const passInput = document.getElementById('resetPassword');
  if (passInput) passInput.focus();

  document.getElementById('confirmResetBtn').onclick = function() {
    const password = (document.getElementById('resetPassword').value || '').trim();

    if (!password) { toast('الرجاء إدخال كلمة السر', 'error'); return; }

    // البحث عن مستخدم admin بكلمة السر المدخلة
    const adminUser = state.users.find(function(u) {
      return u.role === 'admin' && u.password === password;
    });

    if (!adminUser) {
      toast('كلمة السر غير صحيحة', 'error');
      return;
    }

    // تنفيذ المسح
    resetAllData();

    if (state.users.length) {
      state.currentUser = state.users[0];
      saveSession();
    }

    closeModal();
    render();
    toast(t('resetDone'));
  };
}

/* =========================================================================
   FILE INPUT LISTENERS
   ========================================================================= */
document.addEventListener('change', function(e) {
  // Logo upload
  if (e.target.id === 'logoInput' && e.target.files[0]) {
    const reader = new FileReader();
    reader.onload = function(ev) {
      state.store.logo = ev.target.result;
      saveState();
      updateTopbar();
      updateAppTitle();
      render();
      toast(t('updatedSuccessfully'));
    };
    reader.readAsDataURL(e.target.files[0]);
  }

  // Backup import
  if (e.target.id === 'backupInput' && e.target.files[0]) {
    importBackup(e.target.files[0]);
    e.target.value = '';
  }
});