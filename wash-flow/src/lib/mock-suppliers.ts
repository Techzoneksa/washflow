import type { Supplier } from '@/types/suppliers';

const now = new Date('2026-05-24T10:00:00').toISOString();

function makeSupplier(overrides: Partial<Supplier> = {}): Supplier {
  return {
    id: '',
    name: '',
    phone: '',
    representativeName: undefined,
    vatNumber: undefined,
    crNumber: undefined,
    email: undefined,
    address: undefined,
    balance: 0,
    totalPurchases: 0,
    totalPaid: 0,
    invoicesCount: 0,
    status: 'active',
    notes: undefined,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function buildDefaultSuppliers(): Supplier[] {
  return [
    makeSupplier({ id: 'sup-1', name: 'مؤسسة مواد التنظيف الحديثة', phone: '0501234567', representativeName: 'أحمد السلمي', vatNumber: '310123456700003', crNumber: '1234567890', email: 'info@modernclean.com', address: 'الرياض - حي الصناعية', balance: 0, totalPurchases: 45000, totalPaid: 45000, invoicesCount: 12, status: 'active', createdAt: '2026-01-15T08:00:00Z', updatedAt: '2026-05-20T10:00:00Z' }),
    makeSupplier({ id: 'sup-2', name: 'شركة التوريد السريع', phone: '0557654321', representativeName: 'خالد الحربي', vatNumber: '310987654300001', crNumber: '9876543210', email: 'info@speed-supply.com', address: 'جدة - شارع الملك', balance: 8500, totalPurchases: 32000, totalPaid: 23500, invoicesCount: 8, status: 'active', createdAt: '2026-02-10T09:00:00Z', updatedAt: '2026-05-22T14:30:00Z' }),
    makeSupplier({ id: 'sup-3', name: 'مؤسسة مياه وخدمات', phone: '0561112233', representativeName: 'نايف القحطاني', vatNumber: '310555666700004', balance: 0, totalPurchases: 18500, totalPaid: 18500, invoicesCount: 6, status: 'active', createdAt: '2026-02-20T10:00:00Z', updatedAt: '2026-05-15T11:00:00Z' }),
    makeSupplier({ id: 'sup-4', name: 'مورد مناشف وأدوات', phone: '0583334444', representativeName: 'فيصل الدوسري', balance: 3200, totalPurchases: 15000, totalPaid: 11800, invoicesCount: 5, status: 'active', createdAt: '2026-03-01T08:30:00Z', updatedAt: '2026-05-23T09:00:00Z' }),
    makeSupplier({ id: 'sup-5', name: 'شركة زيوت وتشحيم', phone: '0595556666', representativeName: 'سعد المطيري', vatNumber: '310777888900005', crNumber: '5553331111', email: 'info@oils.com', address: 'الدمام - المنطقة الصناعية', balance: 15000, totalPurchases: 42000, totalPaid: 27000, invoicesCount: 10, status: 'active', createdAt: '2026-01-05T07:00:00Z', updatedAt: '2026-05-21T16:00:00Z' }),
    makeSupplier({ id: 'sup-6', name: 'مؤسسة صيانة المعدات', phone: '0577778888', representativeName: 'عبدالله الزهراني', balance: 0, totalPurchases: 12000, totalPaid: 12000, invoicesCount: 4, status: 'inactive', notes: 'تم إيقاف التعامل بسبب التأخير', createdAt: '2026-03-15T09:00:00Z', updatedAt: '2026-04-30T10:00:00Z' }),
    makeSupplier({ id: 'sup-7', name: 'مؤسسة التعبئة والتغليف', phone: '0533332222', representativeName: 'ماجد العتيبي', vatNumber: '310222333400006', balance: 5800, totalPurchases: 22000, totalPaid: 16200, invoicesCount: 7, status: 'active', createdAt: '2026-02-05T08:00:00Z', updatedAt: '2026-05-19T13:00:00Z' }),
    makeSupplier({ id: 'sup-8', name: 'شركة مواد التعقيم', phone: '0544441111', representativeName: 'راشد الشمري', balance: 0, totalPurchases: 8000, totalPaid: 8000, invoicesCount: 3, status: 'inactive', createdAt: '2026-04-01T10:00:00Z', updatedAt: '2026-05-10T11:00:00Z' }),
  ];
}

let suppliersState: Supplier[] = buildDefaultSuppliers();
let nextId = 100;

export function getSuppliers(): Supplier[] {
  return suppliersState;
}

export function getSupplierById(id: string): Supplier | undefined {
  return suppliersState.find((s) => s.id === id);
}

export function addSupplier(data: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>): Supplier {
  const nowISO = new Date().toISOString();
  const supplier: Supplier = {
    ...data,
    id: `sup-${nextId++}`,
    createdAt: nowISO,
    updatedAt: nowISO,
  };
  suppliersState = [...suppliersState, supplier];
  return supplier;
}

export function updateSupplier(id: string, updates: Partial<Omit<Supplier, 'id' | 'createdAt'>>): Supplier | undefined {
  const idx = suppliersState.findIndex((s) => s.id === id);
  if (idx === -1) return undefined;
  const updated = { ...suppliersState[idx], ...updates, updatedAt: new Date().toISOString() };
  const newState = [...suppliersState];
  newState[idx] = updated;
  suppliersState = newState;
  return updated;
}

export function isDuplicateSupplierName(name: string, excludeId?: string): boolean {
  return suppliersState.some((s) => s.name === name && s.id !== excludeId);
}
