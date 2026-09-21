/* =========================================================================
   DEFAULT DATA — بيانات افتراضية
   ========================================================================= */

/* =========================================================================
   CATEGORIES — الفئات
   ========================================================================= */
const DEFAULT_CATEGORIES = [
  { id: 'cat1', name: "مواد غذائية", icon: "🍎", color: "#22c55e" },
  { id: 'cat2', name: "الكترونيات", icon: "⚡", color: "#3b82f6" },
  { id: 'cat3', name: "منزل", icon: "🏠", color: "#f59e0b" },
  { id: 'cat4', name: "مكتبية", icon: "📚", color: "#a855f7" },
  { id: 'cat5', name: "اكسسوارات", icon: "💎", color: "#06b6d4" },
  { id: 'cat6', name: "مشروبات", icon: "☕", color: "#ef4444" },
];

/* =========================================================================
   PRODUCTS — المنتجات
   ========================================================================= */
const DEFAULT_PRODUCTS = [
  { id: 'p1', name: "قهوة كولومبية", sku: "CF-204", barcode: "1234567890123", categoryId: "cat6", supplierId: "s1", price: 18500, cost: 12000, stock: 142, minStock: 30, unit: "unitPiece", icon: "☕", color: "#8b6f47", expiryDate: null, createdAt: Date.now() - 30 * 864e5 },
  { id: 'p2', name: "سماعات لاسلكية", sku: "EL-882", barcode: "1234567890124", categoryId: "cat2", supplierId: "s2", price: 7900, cost: 5000, stock: 18, minStock: 25, unit: "unitPiece", icon: "🎧", color: "#7c3aed", expiryDate: null, createdAt: Date.now() - 25 * 864e5 },
  { id: 'p3', name: "زيت زيتون بكر", sku: "FD-105", barcode: "1234567890125", categoryId: "cat1", supplierId: "s1", price: 2250, cost: 1500, stock: 64, minStock: 20, unit: "unitLiter", icon: "🫒", color: "#84cc16", expiryDate: Date.now() + 180 * 864e5, createdAt: Date.now() - 20 * 864e5 },
  { id: 'p4', name: "مصباح مكتبي", sku: "HM-317", barcode: "1234567890126", categoryId: "cat3", supplierId: "s2", price: 4600, cost: 3000, stock: 0, minStock: 15, unit: "unitPiece", icon: "💡", color: "#f59e0b", expiryDate: null, createdAt: Date.now() - 18 * 864e5 },
  { id: 'p5', name: "دفتر ملاحظات", sku: "ST-441", barcode: "1234567890127", categoryId: "cat4", supplierId: "s3", price: 1200, cost: 700, stock: 86, minStock: 20, unit: "unitPiece", icon: "📓", color: "#3b82f6", expiryDate: null, createdAt: Date.now() - 15 * 864e5 },
  { id: 'p6', name: "شاحن سريع 65W", sku: "EL-905", barcode: "1234567890128", categoryId: "cat2", supplierId: "s2", price: 3500, cost: 2000, stock: 12, minStock: 20, unit: "unitPiece", icon: "⚡", color: "#6366f1", expiryDate: null, createdAt: Date.now() - 12 * 864e5 },
  { id: 'p7', name: "عسل طبيعي 500غ", sku: "FD-220", barcode: "1234567890129", categoryId: "cat1", supplierId: "s1", price: 2800, cost: 1800, stock: 45, minStock: 15, unit: "unitPiece", icon: "🍯", color: "#f59e0b", expiryDate: Date.now() + 365 * 864e5, createdAt: Date.now() - 10 * 864e5 },
  { id: 'p8', name: "حقيبة ظهر", sku: "AC-118", barcode: "1234567890130", categoryId: "cat5", supplierId: "s3", price: 8900, cost: 5500, stock: 7, minStock: 10, unit: "unitPiece", icon: "🎒", color: "#8b5cf6", expiryDate: null, createdAt: Date.now() - 8 * 864e5 },
  { id: 'p9', name: "حليب مجفف", sku: "FD-301", barcode: "1234567890131", categoryId: "cat1", supplierId: "s1", price: 1900, cost: 1200, stock: 55, minStock: 20, unit: "unitBox", icon: "🥛", color: "#0ea5e9", expiryDate: Date.now() + 90 * 864e5, createdAt: Date.now() - 5 * 864e5 },
  { id: 'p10', name: "شوكولاتة فاخرة", sku: "FD-405", barcode: "1234567890132", categoryId: "cat1", supplierId: "s1", price: 3200, cost: 2000, stock: 3, minStock: 15, unit: "unitPiece", icon: "🍫", color: "#78350f", expiryDate: Date.now() + 60 * 864e5, createdAt: Date.now() - 3 * 864e5 },
];

/* =========================================================================
   CUSTOMERS — العملاء
   ========================================================================= */
const DEFAULT_CUSTOMERS = [
  { id: 'c1', name: "محمد العيد", phone: "0550 12 34 56", email: "mohamed@email.dz", address: "الجزائر", debt: 0, totalPurchases: 45000, points: 450, createdAt: Date.now() - 60 * 864e5 },
  { id: 'c2', name: "سارة بن عمر", phone: "0661 23 45 67", email: "sara@email.dz", address: "وهران", debt: 2500, totalPurchases: 32000, points: 320, createdAt: Date.now() - 45 * 864e5 },
  { id: 'c3', name: "يوسف مراد", phone: "0770 34 56 78", email: "youssef@email.dz", address: "قسنطينة", debt: 4500, totalPurchases: 18000, points: 180, createdAt: Date.now() - 30 * 864e5 },
  { id: 'c4', name: "نادية كريم", phone: "0555 45 67 89", email: "nadia@email.dz", address: "عنابة", debt: 6000, totalPurchases: 12000, points: 120, createdAt: Date.now() - 15 * 864e5 },
];

/* =========================================================================
   SUPPLIERS — الموردون
   ========================================================================= */
const DEFAULT_SUPPLIERS = [
  { id: 's1', name: "شركة الاغذية المتحدة", company: "FoodCo", phone: "021 45 67 89", email: "contact@foodco.dz", owed: 0, createdAt: Date.now() - 90 * 864e5 },
  { id: 's2', name: "مؤسسة الالكترونيات", company: "ElectroDZ", phone: "023 78 90 12", email: "info@electrodz.dz", owed: 15000, createdAt: Date.now() - 60 * 864e5 },
  { id: 's3', name: "مورد المواد المكتبية", company: "OfficePro", phone: "025 34 56 78", email: "sales@officepro.dz", owed: 0, createdAt: Date.now() - 45 * 864e5 },
];

/* =========================================================================
   USERS — المستخدمون
   ========================================================================= */
const DEFAULT_USERS = [
  { id: 'u1', username: "admin", password: "admin123", fullName: "ياسين بن علي", role: "admin", active: true, createdAt: Date.now() - 90 * 864e5, lastLogin: null },
  { id: 'u2', username: "seller", password: "seller123", fullName: "امين قدور", role: "seller", active: true, createdAt: Date.now() - 45 * 864e5, lastLogin: null },
];

/* =========================================================================
   SALES — المبيعات
   ========================================================================= */
const DEFAULT_SALES = [
  { id: "S-1001", invoiceNo: "INV-1001", customerId: "c1", items: [{ productId: "p1", name: "قهوة كولومبية", qty: 2, price: 18500, cost: 12000 }], subtotal: 37000, discount: 0, tax: 0, total: 37000, profit: 13000, payment: "cash", paid: true, paidAmount: 37000, date: Date.now() - 8 * 60 * 1000, soldBy: "u1" },
  { id: "S-1002", invoiceNo: "INV-1002", customerId: "c2", items: [{ productId: "p2", name: "سماعات لاسلكية", qty: 1, price: 7900, cost: 5000 }], subtotal: 7900, discount: 0, tax: 0, total: 7900, profit: 2900, payment: "cash", paid: true, paidAmount: 7900, date: Date.now() - 24 * 60 * 1000, soldBy: "u2" },
  { id: "S-1003", invoiceNo: "INV-1003", customerId: "c3", items: [{ productId: "p3", name: "زيت زيتون بكر", qty: 2, price: 2250, cost: 1500 }], subtotal: 4500, discount: 0, tax: 0, total: 4500, profit: 1500, payment: "credit", paid: false, paidAmount: 0, date: Date.now() - 42 * 60 * 1000, soldBy: "u2" },
  { id: "S-1004", invoiceNo: "INV-1004", customerId: "c4", items: [{ productId: "p5", name: "دفتر ملاحظات", qty: 5, price: 1200, cost: 700 }], subtotal: 6000, discount: 500, tax: 0, total: 5500, profit: 2000, payment: "cash", paid: true, paidAmount: 5500, date: Date.now() - 60 * 60 * 1000, soldBy: "u1" },
  { id: "S-1005", invoiceNo: "INV-1005", customerId: "c1", items: [{ productId: "p7", name: "عسل طبيعي 500غ", qty: 3, price: 2800, cost: 1800 }], subtotal: 8400, discount: 0, tax: 0, total: 8400, profit: 3000, payment: "cash", paid: true, paidAmount: 8400, date: Date.now() - 2 * 3600 * 1000, soldBy: "u1" },
  { id: "S-1006", invoiceNo: "INV-1006", customerId: "c2", items: [{ productId: "p9", name: "حليب مجفف", qty: 4, price: 1900, cost: 1200 }], subtotal: 7600, discount: 0, tax: 0, total: 7600, profit: 2800, payment: "cash", paid: true, paidAmount: 7600, date: Date.now() - 26 * 3600 * 1000, soldBy: "u1" },
  { id: "S-1007", invoiceNo: "INV-1007", customerId: "c3", items: [{ productId: "p10", name: "شوكولاتة فاخرة", qty: 2, price: 3200, cost: 2000 }, { productId: "p6", name: "شاحن سريع 65W", qty: 1, price: 3500, cost: 2000 }], subtotal: 9900, discount: 400, tax: 0, total: 9500, profit: 3300, payment: "cash", paid: true, paidAmount: 9500, date: Date.now() - 3 * 864e5, soldBy: "u1" },
  { id: "S-1008", invoiceNo: "INV-1008", customerId: "c4", items: [{ productId: "p5", name: "دفتر ملاحظات", qty: 10, price: 1200, cost: 700 }], subtotal: 12000, discount: 1000, tax: 0, total: 11000, profit: 4000, payment: "credit", paid: false, paidAmount: 5000, date: Date.now() - 5 * 864e5, soldBy: "u1" },
];

/* =========================================================================
   EXPENSES — المصاريف
   ========================================================================= */
const DEFAULT_EXPENSES = [
  { id: "e1", name: "ايجار المحل", amount: 25000, category: "categoryRent", date: Date.now() - 2 * 864e5, notes: "", createdAt: Date.now() - 2 * 864e5 },
  { id: "e2", name: "فاتورة كهرباء", amount: 4500, category: "categoryUtilities", date: Date.now() - 5 * 864e5, notes: "شهر سابق", createdAt: Date.now() - 5 * 864e5 },
  { id: "e3", name: "توصيل بضاعة", amount: 2000, category: "categoryTransport", date: Date.now() - 1 * 864e5, notes: "", createdAt: Date.now() - 1 * 864e5 },
];

/* =========================================================================
   CASH MOVEMENTS — حركات الخزينة
   ========================================================================= */
const DEFAULT_CASH_MOVEMENTS = [
  { id: "m1", type: "opening", amount: 50000, balance: 50000, reason: "رصيد افتتاحي", refId: null, date: Date.now() - 30 * 864e5 },
  { id: "m2", type: "sale", amount: 37000, balance: 87000, reason: "بيع INV-1001", refId: "S-1001", date: Date.now() - 8 * 60 * 1000 },
  { id: "m3", type: "sale", amount: 7900, balance: 94900, reason: "بيع INV-1002", refId: "S-1002", date: Date.now() - 24 * 60 * 1000 },
  { id: "m4", type: "expense", amount: -25000, balance: 69900, reason: "ايجار المحل", refId: "e1", date: Date.now() - 2 * 864e5 },
  { id: "m5", type: "sale", amount: 5500, balance: 75400, reason: "بيع INV-1004", refId: "S-1004", date: Date.now() - 60 * 60 * 1000 },
  { id: "m6", type: "sale", amount: 8400, balance: 83800, reason: "بيع INV-1005", refId: "S-1005", date: Date.now() - 2 * 3600 * 1000 },
];

/* =========================================================================
   ACTIVITY LOG — سجل النشاط
   ========================================================================= */
const DEFAULT_ACTIVITY = [
  { id: "a1", type: "sale", title: "عملية بيع INV-1005", detail: "8400 دج", date: Date.now() - 2 * 3600 * 1000 },
  { id: "a2", type: "expense", title: "ايجار المحل", detail: "25000 دج", date: Date.now() - 2 * 864e5 },
  { id: "a3", type: "product_add", title: "اضافة حقيبة ظهر", detail: "7 وحدة", date: Date.now() - 8 * 864e5 },
  { id: "a4", type: "customer_add", title: "اضافة عميل نادية كريم", detail: "0555 45 67 89", date: Date.now() - 15 * 864e5 },
];

/* =========================================================================
   PAYMENTS — مدفوعات العملاء
   ========================================================================= */
const DEFAULT_PAYMENTS = [
  { id: "pay1", customerId: "c4", saleId: "S-1008", amount: 5000, method: "cash", date: Date.now() - 2 * 864e5, notes: "دفعة جزئية" },
  { id: "pay2", customerId: "c1", saleId: null, amount: 8000, method: "cash", date: Date.now() - 6 * 864e5, notes: "سداد دين قديم" },
];

/* =========================================================================
   STORE — إعدادات المتجر
   ========================================================================= */
const DEFAULT_STORE = {
  name: "مَتْجَرِي POS",
  tagline: "نظام نقطة البيع الاحترافي",
  phone: "0550 00 00 00",
  email: "contact@matjari.dz",
  address: "الجزائر العاصمة",
  rc: "RC-123456",
  nif: "NIF-987654321",
  logo: "",
  primaryColor: "#2f6bff",
  currency: "دج",
  taxRate: 0,
  openingBalance: 50000,
};

/* =========================================================================
   LOYALTY — إعدادات نقاط الولاء
   ========================================================================= */
const DEFAULT_LOYALTY = {
  enabled: true,
  pointsPerCurrency: 0.01, // 1 نقطة لكل 100 دج
  pointValue: 1, // 1 نقطة = 1 دج
  minRedeemPoints: 100,
};

/* =========================================================================
   BRANCH — الفرع
   ========================================================================= */
const DEFAULT_BRANCH = {
  id: 'main',
  name: 'الفرع الرئيسي',
};