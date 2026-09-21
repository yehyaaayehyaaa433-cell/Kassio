/* =========================================================================
   STATE — الحالة الرئيسية
   ========================================================================= */

const STORAGE_KEY = 'matjari_pos_v1';
const SESSION_KEY = 'matjari_pos_session_v1';

/* =========================================================================
   STATE OBJECT
   ========================================================================= */
const state = {
  language: 'ar',
  theme: 'dark',
  activeView: 'home',
  
  products: [],
  categories: [],
  customers: [],
  suppliers: [],
  users: [],
  sales: [],
  expenses: [],
  cashMovements: [],
  activity: [],
  payments: [],
  
  store: Object.assign({}, DEFAULT_STORE),
  loyaltySettings: Object.assign({}, DEFAULT_LOYALTY),
  branch: Object.assign({}, DEFAULT_BRANCH),
  
  currentUser: null,
  
  cart: [],
  posCustomerId: 'walkin',
  posPayment: 'cash',
  posDiscount: 0,
  posDiscountType: 'none',
  
  searchQuery: '',
  productFilter: 'all',
  productCategory: 'all',
  productSort: 'name',
  
  notificationsOpen: false,
  readNotifs: [],
  
  editingId: null,
};

/* =========================================================================
   LOAD STATE
   ========================================================================= */
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    
    if (raw) {
      const saved = JSON.parse(raw);
      const allowed = [
        'language', 'theme', 'activeView',
        'products', 'categories', 'customers', 'suppliers', 'users',
        'sales', 'expenses', 'cashMovements', 'activity', 'payments',
        'store', 'loyaltySettings', 'branch', 'readNotifs'
      ];
      
      allowed.forEach(function(k) {
        if (saved[k] !== undefined) state[k] = saved[k];
      });
      
      state.products = Array.isArray(state.products) ? state.products : DEFAULT_PRODUCTS.slice();
      state.categories = Array.isArray(state.categories) ? state.categories : DEFAULT_CATEGORIES.slice();
      state.customers = Array.isArray(state.customers) ? state.customers : DEFAULT_CUSTOMERS.slice();
      state.suppliers = Array.isArray(state.suppliers) ? state.suppliers : DEFAULT_SUPPLIERS.slice();
      state.users = Array.isArray(state.users) ? state.users : DEFAULT_USERS.slice();
      state.sales = Array.isArray(state.sales) ? state.sales : DEFAULT_SALES.slice();
      state.expenses = Array.isArray(state.expenses) ? state.expenses : DEFAULT_EXPENSES.slice();
      state.cashMovements = Array.isArray(state.cashMovements) ? state.cashMovements : DEFAULT_CASH_MOVEMENTS.slice();
      state.activity = Array.isArray(state.activity) ? state.activity : DEFAULT_ACTIVITY.slice();
      state.payments = Array.isArray(state.payments) ? state.payments : DEFAULT_PAYMENTS.slice();
      state.readNotifs = Array.isArray(state.readNotifs) ? state.readNotifs : [];
      
      state.store = Object.assign({}, DEFAULT_STORE, state.store || {});
      state.loyaltySettings = Object.assign({}, DEFAULT_LOYALTY, state.loyaltySettings || {});
      state.branch = Object.assign({}, DEFAULT_BRANCH, state.branch || {});
      
    } else {
      seedDefaults();
    }
    
  } catch (err) {
    console.error('❌ Load error:', err);
    seedDefaults();
  }
}

/* =========================================================================
   SEED DEFAULTS
   ========================================================================= */
function seedDefaults() {
  state.products = DEFAULT_PRODUCTS.slice();
  state.categories = DEFAULT_CATEGORIES.slice();
  state.customers = DEFAULT_CUSTOMERS.slice();
  state.suppliers = DEFAULT_SUPPLIERS.slice();
  state.users = DEFAULT_USERS.slice();
  state.sales = DEFAULT_SALES.slice();
  state.expenses = DEFAULT_EXPENSES.slice();
  state.cashMovements = DEFAULT_CASH_MOVEMENTS.slice();
  state.activity = DEFAULT_ACTIVITY.slice();
  state.payments = DEFAULT_PAYMENTS.slice();
  state.readNotifs = [];
  state.store = Object.assign({}, DEFAULT_STORE);
  state.loyaltySettings = Object.assign({}, DEFAULT_LOYALTY);
  state.branch = Object.assign({}, DEFAULT_BRANCH);
  saveState();
}

/* =========================================================================
   SAVE STATE
   ========================================================================= */
function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      language: state.language,
      theme: state.theme,
      activeView: state.activeView,
      products: state.products,
      categories: state.categories,
      customers: state.customers,
      suppliers: state.suppliers,
      users: state.users,
      sales: state.sales,
      expenses: state.expenses,
      cashMovements: state.cashMovements,
      activity: state.activity.slice(0, 100),
      payments: state.payments,
      store: state.store,
      loyaltySettings: state.loyaltySettings,
      branch: state.branch,
      readNotifs: state.readNotifs,
    }));
  } catch (err) {
    console.error('❌ Save error:', err);
  }
}

/* =========================================================================
   SESSION
   ========================================================================= */
function saveSession() {
  try {
    if (state.currentUser) {
      localStorage.setItem(SESSION_KEY, JSON.stringify({
        userId: state.currentUser.id,
      }));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  } catch (err) {
    console.error('❌ Session save error:', err);
  }
}

function restoreSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return false;
    
    const session = JSON.parse(raw);
    const user = state.users.find(function(u) {
      return u.id === session.userId;
    });
    
    if (user && user.active) {
      state.currentUser = user;
      return true;
    }
  } catch (err) {
    console.error('❌ Session restore error:', err);
  }
  return false;
}

function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch (err) {}
}

/* =========================================================================
   RESET ALL DATA — إعادة تعيين كل البيانات
   ========================================================================= */
function resetAllData() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SESSION_KEY);
  } catch (err) {}
  seedDefaults();
}