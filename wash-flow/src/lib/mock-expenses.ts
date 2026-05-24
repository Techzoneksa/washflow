import type { Expense } from '@/types/expenses';

function makeExpense(overrides: Partial<Expense> = {}): Expense {
  return {
    id: '',
    expenseNumber: '',
    type: 'other',
    title: '',
    description: undefined,
    amount: 0,
    vatAmount: 0,
    total: 0,
    paymentMethod: 'cash',
    accountName: undefined,
    date: new Date().toISOString().split('T')[0],
    attachmentUrl: undefined,
    notes: undefined,
    createdBy: 'مالك النظام',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

const d = (daysAgo: number) => new Date(Date.now() - daysAgo * 86400000).toISOString().split('T')[0];

function buildDefaultExpenses(): Expense[] {
  return [
    makeExpense({
      id: 'exp-1', expenseNumber: 'EXP-001', type: 'cleaning', title: 'شراء مواد تنظيف', description: 'شامبو سيارات ومناشف مايكروفايبر',
      amount: 850, vatAmount: 127.5, total: 977.5, paymentMethod: 'cash', date: d(1),
      createdBy: 'مالك النظام', createdAt: d(1), updatedAt: d(1),
    }),
    makeExpense({
      id: 'exp-2', expenseNumber: 'EXP-002', type: 'maintenance', title: 'صيانة ماكينة الغسيل', description: 'تغيير أحزمة ومسننات',
      amount: 1200, vatAmount: 180, total: 1380, paymentMethod: 'transfer', date: d(2),
      createdBy: 'المحاسب', createdAt: d(2), updatedAt: d(2),
    }),
    makeExpense({
      id: 'exp-3', expenseNumber: 'EXP-003', type: 'fuel', title: 'وقود للسيارة', description: 'تعبئة بنزين لسيارة الخدمة',
      amount: 200, vatAmount: 30, total: 230, paymentMethod: 'cash', date: d(2),
      createdBy: 'مالك النظام', createdAt: d(2), updatedAt: d(2),
    }),
    makeExpense({
      id: 'exp-4', expenseNumber: 'EXP-004', type: 'electricity', title: 'فاتورة كهرباء', description: 'فاتورة الكهرباء الشهرية',
      amount: 1500, vatAmount: 0, total: 1500, paymentMethod: 'bank', date: d(5),
      createdBy: 'المحاسب', createdAt: d(5), updatedAt: d(5),
    }),
    makeExpense({
      id: 'exp-5', expenseNumber: 'EXP-005', type: 'water', title: 'فاتورة مياه', description: 'فاتورة المياه الشهرية',
      amount: 600, vatAmount: 0, total: 600, paymentMethod: 'bank', date: d(5),
      createdBy: 'المحاسب', createdAt: d(5), updatedAt: d(5),
    }),
    makeExpense({
      id: 'exp-6', expenseNumber: 'EXP-006', type: 'internet', title: 'اشتراك الإنترنت', description: 'باقة الإنترنت الشهرية',
      amount: 300, vatAmount: 45, total: 345, paymentMethod: 'transfer', date: d(7),
      createdBy: 'مالك النظام', createdAt: d(7), updatedAt: d(7),
    }),
    makeExpense({
      id: 'exp-7', expenseNumber: 'EXP-007', type: 'rent', title: 'إيجار المحل', description: 'إيجار الشهر الحالي',
      amount: 8000, vatAmount: 0, total: 8000, paymentMethod: 'transfer', accountName: 'بنك الأهلي',
      date: d(1), createdBy: 'مالك النظام', createdAt: d(1), updatedAt: d(1),
    }),
    makeExpense({
      id: 'exp-8', expenseNumber: 'EXP-008', type: 'telecom', title: 'فاتورة اتصالات', description: 'باقة الشركة للجوالات',
      amount: 250, vatAmount: 37.5, total: 287.5, paymentMethod: 'bank', date: d(10),
      createdBy: 'المحاسب', createdAt: d(10), updatedAt: d(10),
    }),
    makeExpense({
      id: 'exp-9', expenseNumber: 'EXP-009', type: 'government', title: 'رسوم بلدية', description: 'تجديد رخصة المحل',
      amount: 2000, vatAmount: 0, total: 2000, paymentMethod: 'transfer', date: d(12),
      createdBy: 'مالك النظام', createdAt: d(12), updatedAt: d(12),
    }),
    makeExpense({
      id: 'exp-10', expenseNumber: 'EXP-010', type: 'cleaning', title: 'مواد تعقيم وتطهير', description: 'معقمات ومنظفات أرضيات',
      amount: 420, vatAmount: 63, total: 483, paymentMethod: 'cash', date: d(3),
      createdBy: 'المحاسب', createdAt: d(3), updatedAt: d(3),
    }),
    makeExpense({
      id: 'exp-11', expenseNumber: 'EXP-011', type: 'maintenance', title: 'صيانة ضاغط الهواء', description: 'إصلاح ضاغط الهواء الرئيسي',
      amount: 950, vatAmount: 142.5, total: 1092.5, paymentMethod: 'cash', date: d(8),
      createdBy: 'مالك النظام', createdAt: d(8), updatedAt: d(8),
    }),
    makeExpense({
      id: 'exp-12', expenseNumber: 'EXP-012', type: 'marketing', title: 'إعلان ممول', description: 'إعلان فيسبوك لحملة الخصم',
      amount: 500, vatAmount: 75, total: 575, paymentMethod: 'transfer', date: d(9),
      createdBy: 'مالك النظام', createdAt: d(9), updatedAt: d(9),
    }),
    makeExpense({
      id: 'exp-13', expenseNumber: 'EXP-013', type: 'cleaning', title: 'مناشف مايكروفايبر', description: '50 حبة مناشف كبيرة',
      amount: 350, vatAmount: 52.5, total: 402.5, paymentMethod: 'cash', date: d(4),
      createdBy: 'المحاسب', createdAt: d(4), updatedAt: d(4),
    }),
    makeExpense({
      id: 'exp-14', expenseNumber: 'EXP-014', type: 'fuel', title: 'بنزين للسيارة', description: 'تعبئة أسبوعية',
      amount: 180, vatAmount: 27, total: 207, paymentMethod: 'cash', date: d(6),
      createdBy: 'المحاسب', createdAt: d(6), updatedAt: d(6),
    }),
    makeExpense({
      id: 'exp-15', expenseNumber: 'EXP-015', type: 'maintenance', title: 'صيانة الكهرباء', description: 'إصلاح تماس كهربائي في الموقع',
      amount: 700, vatAmount: 105, total: 805, paymentMethod: 'cash', date: d(6),
      createdBy: 'مالك النظام', createdAt: d(6), updatedAt: d(6),
    }),
    makeExpense({
      id: 'exp-16', expenseNumber: 'EXP-016', type: 'cleaning', title: 'أكياس نفايات وقفازات', description: 'مستلزمات نظافة يومية',
      amount: 120, vatAmount: 18, total: 138, paymentMethod: 'cash', date: d(1),
      createdBy: 'المحاسب', createdAt: d(1), updatedAt: d(1),
    }),
    makeExpense({
      id: 'exp-17', expenseNumber: 'EXP-017', type: 'other', title: 'مصروفات نثرية', description: 'مصروفات طارئة ونثرية',
      amount: 90, vatAmount: 0, total: 90, paymentMethod: 'cash', date: d(3),
      createdBy: 'مالك النظام', createdAt: d(3), updatedAt: d(3),
    }),
    makeExpense({
      id: 'exp-18', expenseNumber: 'EXP-018', type: 'maintenance', title: 'صيانة بوابات الدخول', description: 'إصلاح بوابة الدخول الأوتوماتيكية',
      amount: 1100, vatAmount: 165, total: 1265, paymentMethod: 'transfer', date: d(14),
      createdBy: 'المحاسب', createdAt: d(14), updatedAt: d(14),
    }),
    makeExpense({
      id: 'exp-19', expenseNumber: 'EXP-019', type: 'marketing', title: 'مطبوعات وبروشورات', description: 'تصميم وطباعة بروشورات دعائية',
      amount: 350, vatAmount: 52.5, total: 402.5, paymentMethod: 'cash', date: d(11),
      createdBy: 'مالك النظام', createdAt: d(11), updatedAt: d(11),
    }),
    makeExpense({
      id: 'exp-20', expenseNumber: 'EXP-020', type: 'internet', title: 'تجديد باقة الإنترنت', description: 'باقة 6 شهور',
      amount: 1500, vatAmount: 225, total: 1725, paymentMethod: 'transfer', date: d(15),
      createdBy: 'المحاسب', createdAt: d(15), updatedAt: d(15),
    }),
    makeExpense({
      id: 'exp-21', expenseNumber: 'EXP-021', type: 'cleaning', title: 'إسفنج وفرش غسيل', description: 'مستلزمات غسيل السيارات',
      amount: 280, vatAmount: 42, total: 322, paymentMethod: 'cash', date: d(7),
      createdBy: 'مالك النظام', createdAt: d(7), updatedAt: d(7),
    }),
    makeExpense({
      id: 'exp-22', expenseNumber: 'EXP-022', type: 'government', title: 'رسوم تجديد السجل التجاري', description: 'تجديد السجل التجاري السنوي',
      amount: 1200, vatAmount: 0, total: 1200, paymentMethod: 'transfer', date: d(20),
      createdBy: 'مالك النظام', createdAt: d(20), updatedAt: d(20),
    }),
    makeExpense({
      id: 'exp-23', expenseNumber: 'EXP-023', type: 'rent', title: 'إيجار المخزن', description: 'إيجار المخزن المساعد',
      amount: 2500, vatAmount: 0, total: 2500, paymentMethod: 'bank', accountName: 'بنك الراجحي',
      date: d(1), createdBy: 'المحاسب', createdAt: d(1), updatedAt: d(1),
    }),
    makeExpense({
      id: 'exp-24', expenseNumber: 'EXP-024', type: 'maintenance', title: 'دهان وتجديد الواجهة', description: 'دهان واجهة المحل وتجديد الإضاءة',
      amount: 2200, vatAmount: 330, total: 2530, paymentMethod: 'transfer', date: d(18),
      createdBy: 'مالك النظام', createdAt: d(18), updatedAt: d(18),
    }),
    makeExpense({
      id: 'exp-25', expenseNumber: 'EXP-025', type: 'fuel', title: 'ديزل للسيارة', description: 'تعبئة ديزل لسيارة الخدمة',
      amount: 250, vatAmount: 37.5, total: 287.5, paymentMethod: 'cash', date: d(10),
      createdBy: 'المحاسب', createdAt: d(10), updatedAt: d(10),
    }),
    makeExpense({
      id: 'exp-26', expenseNumber: 'EXP-026', type: 'telecom', title: 'خط هاتف أرضي', description: 'فواتير الهاتف الأرضي',
      amount: 120, vatAmount: 18, total: 138, paymentMethod: 'bank', date: d(13),
      createdBy: 'مالك النظام', createdAt: d(13), updatedAt: d(13),
    }),
    makeExpense({
      id: 'exp-27', expenseNumber: 'EXP-027', type: 'water', title: 'فاتورة مياه إضافية', description: 'استهلاك مياه إضافي للشهر',
      amount: 350, vatAmount: 0, total: 350, paymentMethod: 'bank', date: d(16),
      createdBy: 'المحاسب', createdAt: d(16), updatedAt: d(16),
    }),
    makeExpense({
      id: 'exp-28', expenseNumber: 'EXP-028', type: 'cleaning', title: 'ملمع إطارات وزجاج', description: 'منتجات تلميع السيارات',
      amount: 480, vatAmount: 72, total: 552, paymentMethod: 'cash', date: d(9),
      createdBy: 'المحاسب', createdAt: d(9), updatedAt: d(9),
    }),
  ];
}

let expensesState: Expense[] = buildDefaultExpenses();
let nextExpId = 29;
let nextExpNumber = 29;

export function getExpenses(): Expense[] {
  return expensesState;
}

export function getExpenseById(id: string): Expense | undefined {
  return expensesState.find((e) => e.id === id);
}

export function addExpense(data: Omit<Expense, 'id' | 'expenseNumber' | 'createdAt' | 'updatedAt'>): Expense {
  const nowISO = new Date().toISOString();
  const expense: Expense = {
    ...data,
    id: `exp-${nextExpId++}`,
    expenseNumber: `EXP-${String(nextExpNumber++).padStart(3, '0')}`,
    createdAt: nowISO,
    updatedAt: nowISO,
  };
  expensesState = [...expensesState, expense];
  return expense;
}

export function updateExpense(id: string, updates: Partial<Omit<Expense, 'id' | 'expenseNumber' | 'createdAt'>>): Expense | undefined {
  const idx = expensesState.findIndex((e) => e.id === id);
  if (idx === -1) return undefined;
  const updated = { ...expensesState[idx], ...updates, updatedAt: new Date().toISOString() };
  const newState = [...expensesState];
  newState[idx] = updated;
  expensesState = newState;
  return updated;
}
