import type { PurchaseInvoice, PurchaseItem } from '@/types/purchases';

function makePurchaseItem(overrides: Partial<PurchaseItem> = {}): PurchaseItem {
  return {
    id: '',
    name: '',
    quantity: 1,
    unit: 'حبة',
    unitPrice: 0,
    total: 0,
    ...overrides,
  };
}

function makePurchaseInvoice(overrides: Partial<PurchaseInvoice> = {}): PurchaseInvoice {
  return {
    id: '',
    purchaseNumber: '',
    supplierId: '',
    supplierName: '',
    supplierInvoiceNumber: undefined,
    date: new Date().toISOString().split('T')[0],
    items: [],
    subtotal: 0,
    vatAmount: 0,
    total: 0,
    paymentStatus: 'unpaid',
    paymentMethod: undefined,
    paidAmount: 0,
    remainingAmount: 0,
    attachmentUrl: undefined,
    notes: undefined,
    createdBy: 'مالك النظام',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

const d = (daysAgo: number) => new Date(Date.now() - daysAgo * 86400000).toISOString().split('T')[0];

function buildDefaultPurchases(): PurchaseInvoice[] {
  return [
    // Supplier 1: مؤسسة مواد التنظيف الحديثة
    makePurchaseInvoice({
      id: 'purch-1', purchaseNumber: 'PUR-001', supplierId: 'sup-1', supplierName: 'مؤسسة مواد التنظيف الحديثة',
      supplierInvoiceNumber: 'INV-MC-001', date: d(30),
      items: [
        makePurchaseItem({ id: 'pi-1', name: 'شامبو سيارات', quantity: 20, unit: 'جالون', unitPrice: 45, total: 900 }),
        makePurchaseItem({ id: 'pi-2', name: 'ملمع إطارات', quantity: 10, unit: 'علبة', unitPrice: 30, total: 300 }),
        makePurchaseItem({ id: 'pi-3', name: 'مناشف مايكروفايبر', quantity: 50, unit: 'حبة', unitPrice: 8, total: 400 }),
      ],
      subtotal: 1600, vatAmount: 240, total: 1840,
      paymentStatus: 'paid', paymentMethod: 'transfer', paidAmount: 1840, remainingAmount: 0,
      createdBy: 'مالك النظام', createdAt: d(30), updatedAt: d(28),
    }),
    makePurchaseInvoice({
      id: 'purch-2', purchaseNumber: 'PUR-002', supplierId: 'sup-1', supplierName: 'مؤسسة مواد التنظيف الحديثة',
      supplierInvoiceNumber: 'INV-MC-002', date: d(15),
      items: [
        makePurchaseItem({ id: 'pi-4', name: 'شامبو سيارات', quantity: 15, unit: 'جالون', unitPrice: 45, total: 675 }),
        makePurchaseItem({ id: 'pi-5', name: 'أدوات تنظيف', quantity: 5, unit: 'طقم', unitPrice: 120, total: 600 }),
      ],
      subtotal: 1275, vatAmount: 191.25, total: 1466.25,
      paymentStatus: 'paid', paymentMethod: 'cash', paidAmount: 1466.25, remainingAmount: 0,
      createdBy: 'المحاسب', createdAt: d(15), updatedAt: d(14),
    }),
    makePurchaseInvoice({
      id: 'purch-3', purchaseNumber: 'PUR-003', supplierId: 'sup-1', supplierName: 'مؤسسة مواد التنظيف الحديثة',
      supplierInvoiceNumber: 'INV-MC-003', date: d(5),
      items: [
        makePurchaseItem({ id: 'pi-6', name: 'مواد تعقيم', quantity: 10, unit: 'جالون', unitPrice: 55, total: 550 }),
        makePurchaseItem({ id: 'pi-7', name: 'أكياس نفايات', quantity: 100, unit: 'حبة', unitPrice: 1.5, total: 150 }),
      ],
      subtotal: 700, vatAmount: 105, total: 805,
      paymentStatus: 'paid', paymentMethod: 'transfer', paidAmount: 805, remainingAmount: 0,
      createdBy: 'مالك النظام', createdAt: d(5), updatedAt: d(4),
    }),
    // Supplier 2: شركة التوريد السريع
    makePurchaseInvoice({
      id: 'purch-4', purchaseNumber: 'PUR-004', supplierId: 'sup-2', supplierName: 'شركة التوريد السريع',
      date: d(25),
      items: [
        makePurchaseItem({ id: 'pi-8', name: 'مناشف مايكروفايبر', quantity: 100, unit: 'حبة', unitPrice: 7, total: 700 }),
        makePurchaseItem({ id: 'pi-9', name: 'إسفنج غسيل', quantity: 50, unit: 'حبة', unitPrice: 5, total: 250 }),
      ],
      subtotal: 950, vatAmount: 142.5, total: 1092.5,
      paymentStatus: 'paid', paymentMethod: 'cash', paidAmount: 1092.5, remainingAmount: 0,
      createdBy: 'المحاسب', createdAt: d(25), updatedAt: d(23),
    }),
    makePurchaseInvoice({
      id: 'purch-5', purchaseNumber: 'PUR-005', supplierId: 'sup-2', supplierName: 'شركة التوريد السريع',
      supplierInvoiceNumber: 'SPD-2026-05', date: d(10),
      items: [
        makePurchaseItem({ id: 'pi-10', name: 'فوط تنشيف', quantity: 30, unit: 'حبة', unitPrice: 15, total: 450 }),
        makePurchaseItem({ id: 'pi-11', name: 'قفازات', quantity: 20, unit: 'حبة', unitPrice: 8, total: 160 }),
        makePurchaseItem({ id: 'pi-12', name: 'فرش تنظيف', quantity: 10, unit: 'حبة', unitPrice: 25, total: 250 }),
      ],
      subtotal: 860, vatAmount: 129, total: 989,
      paymentStatus: 'partial', paymentMethod: 'bank', paidAmount: 500, remainingAmount: 489,
      createdBy: 'مالك النظام', createdAt: d(10), updatedAt: d(8),
    }),
    makePurchaseInvoice({
      id: 'purch-6', purchaseNumber: 'PUR-006', supplierId: 'sup-2', supplierName: 'شركة التوريد السريع',
      date: d(3),
      items: [
        makePurchaseItem({ id: 'pi-13', name: 'دلو بلاستيك', quantity: 10, unit: 'حبة', unitPrice: 12, total: 120 }),
        makePurchaseItem({ id: 'pi-14', name: 'ممسحة أرضيات', quantity: 5, unit: 'حبة', unitPrice: 18, total: 90 }),
      ],
      subtotal: 210, vatAmount: 31.5, total: 241.5,
      paymentStatus: 'unpaid', paymentMethod: undefined, paidAmount: 0, remainingAmount: 241.5,
      createdBy: 'المحاسب', createdAt: d(3), updatedAt: d(3),
    }),
    // Supplier 3: مؤسسة مياه وخدمات
    makePurchaseInvoice({
      id: 'purch-7', purchaseNumber: 'PUR-007', supplierId: 'sup-3', supplierName: 'مؤسسة مياه وخدمات',
      date: d(28),
      items: [
        makePurchaseItem({ id: 'pi-15', name: 'مياه شرب', quantity: 30, unit: 'كرتون', unitPrice: 10, total: 300 }),
      ],
      subtotal: 300, vatAmount: 45, total: 345,
      paymentStatus: 'paid', paymentMethod: 'cash', paidAmount: 345, remainingAmount: 0,
      createdBy: 'مالك النظام', createdAt: d(28), updatedAt: d(27),
    }),
    makePurchaseInvoice({
      id: 'purch-8', purchaseNumber: 'PUR-008', supplierId: 'sup-3', supplierName: 'مؤسسة مياه وخدمات',
      date: d(12),
      items: [
        makePurchaseItem({ id: 'pi-16', name: 'مياه شرب', quantity: 50, unit: 'كرتون', unitPrice: 10, total: 500 }),
        makePurchaseItem({ id: 'pi-17', name: 'فلاتر مياه', quantity: 5, unit: 'حبة', unitPrice: 85, total: 425 }),
      ],
      subtotal: 925, vatAmount: 138.75, total: 1063.75,
      paymentStatus: 'paid', paymentMethod: 'transfer', paidAmount: 1063.75, remainingAmount: 0,
      createdBy: 'المحاسب', createdAt: d(12), updatedAt: d(11),
    }),
    // Supplier 4: مورد مناشف وأدوات
    makePurchaseInvoice({
      id: 'purch-9', purchaseNumber: 'PUR-009', supplierId: 'sup-4', supplierName: 'مورد مناشف وأدوات',
      date: d(20),
      items: [
        makePurchaseItem({ id: 'pi-18', name: 'مناشف كبيرة', quantity: 40, unit: 'حبة', unitPrice: 20, total: 800 }),
        makePurchaseItem({ id: 'pi-19', name: 'مناشف صغيرة', quantity: 60, unit: 'حبة', unitPrice: 10, total: 600 }),
      ],
      subtotal: 1400, vatAmount: 210, total: 1610,
      paymentStatus: 'paid', paymentMethod: 'cash', paidAmount: 1610, remainingAmount: 0,
      createdBy: 'مالك النظام', createdAt: d(20), updatedAt: d(19),
    }),
    makePurchaseInvoice({
      id: 'purch-10', purchaseNumber: 'PUR-010', supplierId: 'sup-4', supplierName: 'مورد مناشف وأدوات',
      date: d(7),
      items: [
        makePurchaseItem({ id: 'pi-20', name: 'مناشف كبيرة', quantity: 25, unit: 'حبة', unitPrice: 20, total: 500 }),
        makePurchaseItem({ id: 'pi-21', name: 'أغطية مقاعد', quantity: 10, unit: 'حبة', unitPrice: 35, total: 350 }),
      ],
      subtotal: 850, vatAmount: 127.5, total: 977.5,
      paymentStatus: 'partial', paymentMethod: 'bank', paidAmount: 400, remainingAmount: 577.5,
      createdBy: 'المحاسب', createdAt: d(7), updatedAt: d(6),
    }),
    // Supplier 5: شركة زيوت وتشحيم
    makePurchaseInvoice({
      id: 'purch-11', purchaseNumber: 'PUR-011', supplierId: 'sup-5', supplierName: 'شركة زيوت وتشحيم',
      supplierInvoiceNumber: 'OIL-2026-001', date: d(35),
      items: [
        makePurchaseItem({ id: 'pi-22', name: 'زيت محرك 10W-40', quantity: 20, unit: 'علبة', unitPrice: 25, total: 500 }),
        makePurchaseItem({ id: 'pi-23', name: 'زيت محرك 20W-50', quantity: 15, unit: 'علبة', unitPrice: 22, total: 330 }),
      ],
      subtotal: 830, vatAmount: 124.5, total: 954.5,
      paymentStatus: 'paid', paymentMethod: 'transfer', paidAmount: 954.5, remainingAmount: 0,
      createdBy: 'مالك النظام', createdAt: d(35), updatedAt: d(33),
    }),
    makePurchaseInvoice({
      id: 'purch-12', purchaseNumber: 'PUR-012', supplierId: 'sup-5', supplierName: 'شركة زيوت وتشحيم',
      date: d(18),
      items: [
        makePurchaseItem({ id: 'pi-24', name: 'زيت فرامل', quantity: 10, unit: 'علبة', unitPrice: 30, total: 300 }),
        makePurchaseItem({ id: 'pi-25', name: 'زيت دبرياج', quantity: 8, unit: 'علبة', unitPrice: 28, total: 224 }),
        makePurchaseItem({ id: 'pi-26', name: 'شحم', quantity: 5, unit: 'علبة', unitPrice: 15, total: 75 }),
      ],
      subtotal: 599, vatAmount: 89.85, total: 688.85,
      paymentStatus: 'paid', paymentMethod: 'cash', paidAmount: 688.85, remainingAmount: 0,
      createdBy: 'المحاسب', createdAt: d(18), updatedAt: d(17),
    }),
    makePurchaseInvoice({
      id: 'purch-13', purchaseNumber: 'PUR-013', supplierId: 'sup-5', supplierName: 'شركة زيوت وتشحيم',
      date: d(4),
      items: [
        makePurchaseItem({ id: 'pi-27', name: 'زيت محرك 10W-40', quantity: 30, unit: 'علبة', unitPrice: 25, total: 750 }),
        makePurchaseItem({ id: 'pi-28', name: 'فلاتر زيت', quantity: 20, unit: 'حبة', unitPrice: 12, total: 240 }),
      ],
      subtotal: 990, vatAmount: 148.5, total: 1138.5,
      paymentStatus: 'unpaid', paymentMethod: undefined, paidAmount: 0, remainingAmount: 1138.5,
      createdBy: 'مالك النظام', createdAt: d(4), updatedAt: d(4),
    }),
    // Supplier 6: مؤسسة صيانة المعدات
    makePurchaseInvoice({
      id: 'purch-14', purchaseNumber: 'PUR-014', supplierId: 'sup-6', supplierName: 'مؤسسة صيانة المعدات',
      date: d(45),
      items: [
        makePurchaseItem({ id: 'pi-29', name: 'صيانة ماكينة غسيل', quantity: 1, unit: 'خدمة', unitPrice: 500, total: 500 }),
      ],
      subtotal: 500, vatAmount: 75, total: 575,
      paymentStatus: 'paid', paymentMethod: 'cash', paidAmount: 575, remainingAmount: 0,
      createdBy: 'مالك النظام', createdAt: d(45), updatedAt: d(44),
    }),
    makePurchaseInvoice({
      id: 'purch-15', purchaseNumber: 'PUR-015', supplierId: 'sup-6', supplierName: 'مؤسسة صيانة المعدات',
      date: d(20),
      items: [
        makePurchaseItem({ id: 'pi-30', name: 'صيانة ضاغط هواء', quantity: 1, unit: 'خدمة', unitPrice: 350, total: 350 }),
        makePurchaseItem({ id: 'pi-31', name: 'قطع غيار', quantity: 3, unit: 'حبة', unitPrice: 45, total: 135 }),
      ],
      subtotal: 485, vatAmount: 72.75, total: 557.75,
      paymentStatus: 'paid', paymentMethod: 'cash', paidAmount: 557.75, remainingAmount: 0,
      createdBy: 'المحاسب', createdAt: d(20), updatedAt: d(19),
    }),
    // Supplier 7: مؤسسة التعبئة والتغليف
    makePurchaseInvoice({
      id: 'purch-16', purchaseNumber: 'PUR-016', supplierId: 'sup-7', supplierName: 'مؤسسة التعبئة والتغليف',
      date: d(22),
      items: [
        makePurchaseItem({ id: 'pi-32', name: 'أكياس نفايات كبيرة', quantity: 200, unit: 'حبة', unitPrice: 1.5, total: 300 }),
        makePurchaseItem({ id: 'pi-33', name: 'أكياس شفافة', quantity: 100, unit: 'حبة', unitPrice: 1, total: 100 }),
        makePurchaseItem({ id: 'pi-34', name: 'كرتون تخزين', quantity: 20, unit: 'حبة', unitPrice: 8, total: 160 }),
      ],
      subtotal: 560, vatAmount: 84, total: 644,
      paymentStatus: 'paid', paymentMethod: 'cash', paidAmount: 644, remainingAmount: 0,
      createdBy: 'مالك النظام', createdAt: d(22), updatedAt: d(21),
    }),
    makePurchaseInvoice({
      id: 'purch-17', purchaseNumber: 'PUR-017', supplierId: 'sup-7', supplierName: 'مؤسسة التعبئة والتغليف',
      date: d(8),
      items: [
        makePurchaseItem({ id: 'pi-35', name: 'أكياس نفايات كبيرة', quantity: 150, unit: 'حبة', unitPrice: 1.5, total: 225 }),
        makePurchaseItem({ id: 'pi-36', name: 'رول بلاستيك تغليف', quantity: 5, unit: 'رول', unitPrice: 25, total: 125 }),
      ],
      subtotal: 350, vatAmount: 52.5, total: 402.5,
      paymentStatus: 'partial', paymentMethod: 'bank', paidAmount: 200, remainingAmount: 202.5,
      createdBy: 'المحاسب', createdAt: d(8), updatedAt: d(7),
    }),
    makePurchaseInvoice({
      id: 'purch-18', purchaseNumber: 'PUR-018', supplierId: 'sup-7', supplierName: 'مؤسسة التعبئة والتغليف',
      date: d(1),
      items: [
        makePurchaseItem({ id: 'pi-37', name: 'أكياس شفافة', quantity: 200, unit: 'حبة', unitPrice: 1, total: 200 }),
      ],
      subtotal: 200, vatAmount: 30, total: 230,
      paymentStatus: 'unpaid', paymentMethod: undefined, paidAmount: 0, remainingAmount: 230,
      createdBy: 'مالك النظام', createdAt: d(1), updatedAt: d(1),
    }),
    // Supplier 8: شركة مواد التعقيم
    makePurchaseInvoice({
      id: 'purch-19', purchaseNumber: 'PUR-019', supplierId: 'sup-8', supplierName: 'شركة مواد التعقيم',
      date: d(40),
      items: [
        makePurchaseItem({ id: 'pi-38', name: 'معقم أسطح', quantity: 10, unit: 'لتر', unitPrice: 35, total: 350 }),
        makePurchaseItem({ id: 'pi-39', name: 'معقم أيادي', quantity: 15, unit: 'لتر', unitPrice: 25, total: 375 }),
      ],
      subtotal: 725, vatAmount: 108.75, total: 833.75,
      paymentStatus: 'paid', paymentMethod: 'transfer', paidAmount: 833.75, remainingAmount: 0,
      createdBy: 'مالك النظام', createdAt: d(40), updatedAt: d(38),
    }),
    makePurchaseInvoice({
      id: 'purch-20', purchaseNumber: 'PUR-020', supplierId: 'sup-8', supplierName: 'شركة مواد التعقيم',
      date: d(25),
      items: [
        makePurchaseItem({ id: 'pi-40', name: 'مطهر أرضيات', quantity: 20, unit: 'لتر', unitPrice: 20, total: 400 }),
      ],
      subtotal: 400, vatAmount: 60, total: 460,
      paymentStatus: 'paid', paymentMethod: 'cash', paidAmount: 460, remainingAmount: 0,
      createdBy: 'المحاسب', createdAt: d(25), updatedAt: d(24),
    }),
  ];
}

let purchasesState: PurchaseInvoice[] = buildDefaultPurchases();
let nextPurchId = 100;

export function getPurchases(): PurchaseInvoice[] {
  return purchasesState;
}

export function getPurchaseById(id: string): PurchaseInvoice | undefined {
  return purchasesState.find((p) => p.id === id);
}

export function getPurchasesBySupplier(supplierId: string): PurchaseInvoice[] {
  return purchasesState.filter((p) => p.supplierId === supplierId);
}

let nextPurchaseNumber = 21;
export function addPurchase(data: Omit<PurchaseInvoice, 'id' | 'purchaseNumber' | 'createdAt' | 'updatedAt'>): PurchaseInvoice {
  const nowISO = new Date().toISOString();
  const invoice: PurchaseInvoice = {
    ...data,
    id: `purch-${nextPurchId++}`,
    purchaseNumber: `PUR-${String(nextPurchaseNumber++).padStart(3, '0')}`,
    createdAt: nowISO,
    updatedAt: nowISO,
  };
  purchasesState = [...purchasesState, invoice];
  return invoice;
}

export function updatePurchase(id: string, updates: Partial<Omit<PurchaseInvoice, 'id' | 'purchaseNumber' | 'createdAt'>>): PurchaseInvoice | undefined {
  const idx = purchasesState.findIndex((p) => p.id === id);
  if (idx === -1) return undefined;
  const updated = { ...purchasesState[idx], ...updates, updatedAt: new Date().toISOString() };
  const newState = [...purchasesState];
  newState[idx] = updated;
  purchasesState = newState;
  return updated;
}
