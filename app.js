/* =========================================================================
   APP — الإقلاع + Charts + Events (محدث ومصحح)
   ========================================================================= */

/* =========================================================================
   CHART.JS SETUP
   ========================================================================= */
var chartInstances = {};

function destroyCharts() {
  Object.keys(chartInstances).forEach(function(key) {
    if (chartInstances[key]) {
      try { chartInstances[key].destroy(); } catch (e) {}
      chartInstances[key] = null;
    }
  });
  chartInstances = {};
}

function initCharts() {
  if (typeof Chart === 'undefined') {
    console.warn('Chart.js غير محمل');
    return;
  }

  destroyCharts();

  var isDark = state.theme === 'dark';
  var textColor = isDark ? '#a8b3cc' : '#4a5570';
  var gridColor = isDark ? 'rgba(42, 52, 85, .5)' : 'rgba(221, 227, 238, .6)';
  var primaryColor = state.store.primaryColor || '#2f6bff';

  Chart.defaults.font.family = "'IBM Plex Sans Arabic', Tahoma, sans-serif";
  Chart.defaults.font.size = 11;
  Chart.defaults.color = textColor;

  var months = ['ينا', 'فبر', 'مار', 'أبر', 'ماي', 'جون', 'جول', 'أغس', 'سبت', 'أكت', 'نوف', 'ديس'];
  var salesData = new Array(12).fill(0);
  var purchasesData = new Array(12).fill(0);
  var currentYear = new Date().getFullYear();

  state.sales.forEach(function(s) {
    var d = new Date(s.date);
    if (d.getFullYear() === currentYear) salesData[d.getMonth()] += s.total;
  });

  state.expenses.forEach(function(e) {
    var d = new Date(e.date);
    if (d.getFullYear() === currentYear) purchasesData[d.getMonth()] += e.amount;
  });

  // CHART 1
  var ctx1 = document.getElementById('chartSalesVsPurchases');
  if (ctx1) {
    chartInstances.salesVsPurchases = new Chart(ctx1, {
      type: 'bar',
      data: {
        labels: months,
        datasets: [
          { label: 'المبيعات', data: salesData, backgroundColor: primaryColor, borderRadius: 6, borderSkipped: false },
          { label: 'المشتريات', data: purchasesData, backgroundColor: '#ef4444', borderRadius: 6, borderSkipped: false }
        ]
      },                        
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', labels: { color: textColor, padding: 12, font: { weight: 'bold' } } },
          tooltip: {
            callbacks: {
              label: function(c) {
                return c.dataset.label + ': ' + formatNumber(c.parsed.y) + ' ' + state.store.currency;
              }
            }
          }
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: textColor } },
          y: {
            beginAtZero: true,
            grid: { color: gridColor },
            ticks: { color: textColor, callback: function(v) { return formatNumber(v); } }
          }
        }
      }
    });
  }

  // CHART 2 — Period
  function buildPeriodData(period) {
    var labels = [];
    var data = [];

    if (period === '7d') {
      for (var i = 6; i >= 0; i--) {
        var d = new Date();
        d.setDate(d.getDate() - i);
        var start = startOfDay(d.getTime());
        var end = endOfDay(d.getTime());
        var dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
        labels.push(dayNames[d.getDay()]);
        data.push(getTotalRevenue(start, end));
      }
    } else if (period === '30d') {
      for (var j = 29; j >= 0; j--) {
        var d2 = new Date();
        d2.setDate(d2.getDate() - j);
        var s2 = startOfDay(d2.getTime());
        var e2 = endOfDay(d2.getTime());
        labels.push(String(d2.getDate()));
        data.push(getTotalRevenue(s2, e2));
      }
    } else {
      for (var k = 11; k >= 0; k--) {
        var d3 = new Date();
        d3.setMonth(d3.getMonth() - k);
        var s3 = new Date(d3.getFullYear(), d3.getMonth(), 1).getTime();
        var e3 = new Date(d3.getFullYear(), d3.getMonth() + 1, 0, 23, 59, 59).getTime();
        labels.push(months[d3.getMonth()]);
        data.push(getTotalRevenue(s3, e3));
      }
    }
    return { labels: labels, data: data };
  }

  function renderPeriodChart(period) {
    var ctx = document.getElementById('chartPeriodSales');
    if (!ctx) return;
    if (chartInstances.period) chartInstances.period.destroy();

    var periodData = buildPeriodData(period);

    chartInstances.period = new Chart(ctx, {
      type: 'line',
      data: {
        labels: periodData.labels,
        datasets: [{
          label: 'المبيعات',
          data: periodData.data,
          borderColor: primaryColor,
          backgroundColor: hexToRgba(primaryColor, 0.15),
          fill: true,
          tension: 0.4,
          borderWidth: 3,
          pointBackgroundColor: primaryColor,
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(c) {
                return formatNumber(c.parsed.y) + ' ' + state.store.currency;
              }
            }
          }
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: textColor, maxRotation: 0, autoSkip: true, maxTicksLimit: 12 } },
          y: {
            beginAtZero: true,
            grid: { color: gridColor },
            ticks: { color: textColor, callback: function(v) { return formatNumber(v); } }
          }
        }
      }
    });
  }

  renderPeriodChart('7d');

  setTimeout(function() {
    document.querySelectorAll('#periodChartTabs .chart-tab').forEach(function(tab) {
      tab.onclick = function() {
        document.querySelectorAll('#periodChartTabs .chart-tab').forEach(function(t) {
          t.classList.remove('active');
        });
        tab.classList.add('active');
        renderPeriodChart(tab.dataset.period);
      };
    });
  }, 100);

  // CHART 3 — Payment Methods
  var paymentCount = { cash: 0, credit: 0 };
  var mStart = startOfMonth();

  state.sales.filter(function(s) { return s.date >= mStart; }).forEach(function(s) {
    if (s.payment === 'cash') paymentCount.cash += s.total;
    else paymentCount.credit += s.total;
  });

  var ctx3 = document.getElementById('chartPaymentMethods');
  if (ctx3) {
    chartInstances.payments = new Chart(ctx3, {
      type: 'doughnut',
      data: {
        labels: [t('cash'), t('credit')],
        datasets: [{
          data: [paymentCount.cash, paymentCount.credit],
          backgroundColor: ['#22c55e', '#3b82f6'],
          borderWidth: 0,
          hoverOffset: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: { position: 'bottom', labels: { color: textColor, padding: 16, font: { weight: 'bold' }, usePointStyle: true } },
          tooltip: {
            callbacks: {
              label: function(c) {
                var total = c.dataset.data.reduce(function(a, b) { return a + b; }, 0);
                var p = total > 0 ? Math.round(c.parsed / total * 100) : 0;
                return c.label + ': ' + formatNumber(c.parsed) + ' (' + p + '%)';
              }
            }
          }
        }
      }
    });
  }

  // CHART 4 — Top Products
  var topProducts = getTopProducts(5);
  var ctx4 = document.getElementById('chartTopProducts');
  if (ctx4) {
    chartInstances.topProducts = new Chart(ctx4, {
      type: 'bar',
      data: {
        labels: topProducts.map(function(p) {
          return p.name.length > 20 ? p.name.slice(0, 20) + '...' : p.name;
        }),
        datasets: [{
          label: 'الكمية',
          data: topProducts.map(function(p) { return p.qty; }),
          backgroundColor: ['#fbbf24', '#94a3b8', '#cd7f32', '#22c55e', '#3b82f6'],
          borderRadius: 8,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(c) {
                var item = topProducts[c.dataIndex];
                return item.qty + ' وحدة · ' + formatNumber(item.revenue) + ' ' + state.store.currency;
              }
            }
          }
        },
        scales: {
          x: { beginAtZero: true, grid: { color: gridColor }, ticks: { color: textColor } },
          y: { grid: { display: false }, ticks: { color: textColor } }
        }
      }
    });
  }

  // CHART 5 — Profit
  var profitLabels = [];
  var profitData = [];

  for (var pi = 29; pi >= 0; pi--) {
    var pd = new Date();
    pd.setDate(pd.getDate() - pi);
    var ps = startOfDay(pd.getTime());
    var pe = endOfDay(pd.getTime());
    profitLabels.push(String(pd.getDate()));
    profitData.push(getTotalProfit(ps, pe));
  }

  var ctx5 = document.getElementById('chartProfit');
  if (ctx5) {
    chartInstances.profit = new Chart(ctx5, {
      type: 'line',
      data: {
        labels: profitLabels,
        datasets: [{
          label: 'الربح',
          data: profitData,
          borderColor: '#22c55e',
          backgroundColor: 'rgba(34, 197, 94, .15)',
          fill: true,
          tension: 0.4,
          borderWidth: 3,
          pointBackgroundColor: '#22c55e',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(c) {
                return formatNumber(c.parsed.y) + ' ' + state.store.currency;
              }
            }
          }
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: textColor, maxRotation: 0, autoSkip: true, maxTicksLimit: 10 } },
          y: {
            grid: { color: gridColor },
            ticks: { color: textColor, callback: function(v) { return formatNumber(v); } }
          }
        }
      }
    });
  }

  // CHART 6 — Categories Pie
  var categoryTotals = {};
  state.sales.forEach(function(s) {
    (s.items || []).forEach(function(item) {
      var p = findProduct(item.productId);
      if (p && p.categoryId) {
        if (!categoryTotals[p.categoryId]) categoryTotals[p.categoryId] = 0;
        categoryTotals[p.categoryId] += item.qty * item.price;
      }
    });
  });

  var catLabels = [];
  var catData = [];
  var catColors = [];

  Object.entries(categoryTotals).forEach(function(entry) {
    var cat = findCategory(entry[0]);
    if (cat && entry[1] > 0) {
      catLabels.push(cat.name);
      catData.push(entry[1]);
      catColors.push(cat.color || '#3b82f6');
    }
  });

  var ctx6 = document.getElementById('chartCategories');
  if (ctx6) {
    if (catData.length === 0) {
      ctx6.parentElement.innerHTML = '<div style="display:grid;place-items:center;height:100%;color:var(--text-muted);font-size:13px">لا توجد مبيعات بعد</div>';
    } else {
      chartInstances.categories = new Chart(ctx6, {
        type: 'pie',
        data: {
          labels: catLabels,
          datasets: [{
            data: catData,
            backgroundColor: catColors,
            borderWidth: 0,
            hoverOffset: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { color: textColor, padding: 12, font: { weight: 'bold' }, usePointStyle: true, boxWidth: 10 } },
            tooltip: {
              callbacks: {
                label: function(c) {
                  var total = c.dataset.data.reduce(function(a, b) { return a + b; }, 0);
                  var p = total > 0 ? Math.round(c.parsed / total * 100) : 0;
                  return c.label + ': ' + formatNumber(c.parsed) + ' (' + p + '%)';
                }
              }
            }
          }
        }
      });
    }
  }

  // Excel Button
  setTimeout(function() {
    var excelBtn = document.getElementById('exportExcelBtn');
    if (excelBtn) excelBtn.onclick = exportToExcel;
  }, 100);
}

/* =========================================================================
   EXPORT TO EXCEL
   ========================================================================= */
function exportToExcel() {
  try {
    var monthStart = startOfMonth();

    var html = '<html><head><meta charset="UTF-8" />';
    html += '<style>table{border-collapse:collapse;font-family:Tahoma;direction:rtl}';
    html += 'th,td{border:1px solid #ccc;padding:8px;text-align:right}';
    html += 'th{background:#f0f0f0;font-weight:bold}';
    html += 'h2{font-family:Tahoma;direction:rtl}</style></head><body>';

    html += '<h2>📊 التقرير الشامل - ' + formatDate(Date.now()) + '</h2>';
    html += '<table><tr><th>البند</th><th>القيمة</th></tr>';
    html += '<tr><td>مبيعات اليوم</td><td>' + formatMoney(getTodaySalesTotal()) + '</td></tr>';
    html += '<tr><td>مبيعات الشهر</td><td>' + formatMoney(getTotalRevenue(monthStart, Date.now())) + '</td></tr>';
    html += '<tr><td>أرباح الشهر</td><td>' + formatMoney(getTotalProfit(monthStart, Date.now())) + '</td></tr>';
    html += '<tr><td>مصاريف الشهر</td><td>' + formatMoney(getTotalExpenses(monthStart, Date.now())) + '</td></tr>';
    html += '<tr><td>رصيد الخزينة</td><td>' + formatMoney(getCashBalance()) + '</td></tr>';
    html += '<tr><td>ديون العملاء</td><td>' + formatMoney(getTotalCustomerDebt()) + '</td></tr>';
    html += '</table>';

    html += '<h2>📦 المنتجات (' + state.products.length + ')</h2>';
    html += '<table><tr><th>الاسم</th><th>SKU</th><th>الفئة</th><th>الكمية</th><th>سعر البيع</th><th>سعر الشراء</th></tr>';
    state.products.forEach(function(p) {
      html += '<tr><td>' + p.name + '</td><td>' + p.sku + '</td><td>' + getCategoryName(p.categoryId) + '</td><td>' + p.stock + '</td><td>' + formatMoney(p.price) + '</td><td>' + formatMoney(p.cost || 0) + '</td></tr>';
    });
    html += '</table>';

    html += '<h2>💰 المبيعات (' + state.sales.length + ')</h2>';
    html += '<table><tr><th>رقم الفاتورة</th><th>العميل</th><th>الإجمالي</th><th>الربح</th><th>الحالة</th><th>التاريخ</th></tr>';
    state.sales.forEach(function(s) {
      var c = s.customerId === 'walkin' ? null : findCustomer(s.customerId);
      html += '<tr><td>' + s.invoiceNo + '</td><td>' + (c ? c.name : 'عابر') + '</td><td>' + formatMoney(s.total) + '</td><td>' + formatMoney(s.profit || 0) + '</td><td>' + (s.paid ? 'مدفوع' : 'معلق') + '</td><td>' + formatDate(s.date, true) + '</td></tr>';
    });
    html += '</table>';

    html += '<h2>👥 العملاء (' + state.customers.length + ')</h2>';
    html += '<table><tr><th>الاسم</th><th>الهاتف</th><th>إجمالي المشتريات</th><th>الدين</th></tr>';
    state.customers.forEach(function(c) {
      html += '<tr><td>' + c.name + '</td><td>' + (c.phone || '') + '</td><td>' + formatMoney(c.totalPurchases || 0) + '</td><td>' + formatMoney(c.debt || 0) + '</td></tr>';
    });
    html += '</table>';

    html += '</body></html>';

    var blob = new Blob(['\uFEFF' + html], { type: 'application/vnd.ms-excel;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'report-' + new Date().toISOString().slice(0, 10) + '.xls';
    a.click();
    URL.revokeObjectURL(a.href);

    toast('تم تصدير التقرير');
  } catch (err) {
    console.error(err);
    toast('خطأ في التصدير', 'error');
  }
}

/* =========================================================================
   KEYBOARD SHORTCUTS
   ========================================================================= */
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeModal();
    return;
  }

  if (!state.currentUser) return;

  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    var s = document.getElementById('posSearchInput') ||
            document.getElementById('productSearchInput') ||
            document.getElementById('customerSearchInput') ||
            document.getElementById('supplierSearchInput');
    if (s) s.focus();
    return;
  }

  if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
    e.preventDefault();
    navigate('pos');
    return;
  }

  if (state.activeView === 'pos' && e.key === 'Enter') {
    var tag = document.activeElement.tagName;
    if (tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') {
      completeSale();
    }
  }
});

/* =========================================================================
   ERROR HANDLER
   ========================================================================= */
window.addEventListener('error', function(e) {
  console.error('❌ خطأ:', e.message, 'في', e.filename, ':', e.lineno);
});

window.addEventListener('unhandledrejection', function(e) {
  console.error('❌ Promise مرفوض:', e.reason);
});

/* =========================================================================
   NETWORK EVENTS
   ========================================================================= */
window.addEventListener('online', function() {
  toast('تم استعادة الاتصال');
});

window.addEventListener('offline', function() {
  toast('انقطع الاتصال - التطبيق يعمل offline', 'error');
});

/* =========================================================================
   iOS — منع double-tap zoom
   ========================================================================= */
var lastTouchEnd = 0;
document.addEventListener('touchend', function(e) {
  var now = Date.now();
  if (now - lastTouchEnd <= 300) e.preventDefault();
  lastTouchEnd = now;
}, false);

/* =========================================================================
   SPLASH SCREEN
   ========================================================================= */
function hideSplash() {
  var splash = document.getElementById('splash');
  if (splash) {
    splash.classList.add('hide');
    setTimeout(function() { splash.remove(); }, 600);
  }
}

/* =========================================================================
   BOOT APP
   ========================================================================= */
function bootApp() {
  console.log('%c🚀 مَتْجَرِي POS', 'font-size:20px;font-weight:800;color:#2f6bff');
  console.log('%c نظام نقطة البيع الاحترافي v1.0.0 ', 'font-size:12px;color:#6b7280');

  // 1. تحميل الحالة
  loadState();

  // 2. تطبيق الإعدادات
  applyLanguage();
  applyTheme();
  applyStoreColor();

    // 3. تحديث شاشة الإقلاع
  var splashName = document.getElementById('splashName');
  var splashTag = document.getElementById('splashTag');
  var splashLogo = document.getElementById('splashLogo');

  if (splashName) splashName.textContent = state.store.name || t('appName');
  if (splashTag) splashTag.textContent = state.store.tagline || t('appTag');
  if (splashLogo) {
    if (state.store.logo) {
      splashLogo.innerHTML = '<img src="' + state.store.logo + '" style="width:100%;height:100%;object-fit:cover;border-radius:24px" />';
    } else {
      splashLogo.textContent = (state.store.name || 'M').charAt(0);
    }
  }

  // ✅ تحديث عنوان التبويب
  var appTitle = document.getElementById('appTitle');
  if (appTitle) appTitle.textContent = (state.store.name || 'SICPOS') + ' | نظام نقطة البيع';

  // 4. ضمان وجود المستخدمين
  if (!state.users || !state.users.length) {
    state.users = DEFAULT_USERS.slice();
  }
  if (!state.users.some(function(u) { return u.username === 'admin'; })) {
    state.users.unshift(Object.assign({}, DEFAULT_USERS[0]));
    saveState();
  }

  // 5. بعد 1.5 ثانية: إخفاء Splash + فحص الجلسة
  setTimeout(function() {
    hideSplash();

    var restored = restoreSession();
    var app = document.getElementById('app');

    if (restored && state.currentUser) {
      if (app) app.hidden = false;
      navigate('home');
      console.log('%c✅ جلسة مستعادة', 'color:#22c55e;font-weight:700');
    } else {
      if (app) app.hidden = false;
      var root = document.getElementById('viewRoot');
      if (root) root.innerHTML = '';
      showLoginScreen();
      console.log('%c🔐 انتظر تسجيل الدخول', 'color:#f59e0b;font-weight:700');
    }
  }, 1500);
}

/* =========================================================================
   START APP
   ========================================================================= */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootApp);
} else {
  bootApp();
}

console.log('%c✅ التطبيق جاهز', 'color:#22c55e;font-weight:800;font-size:14px');