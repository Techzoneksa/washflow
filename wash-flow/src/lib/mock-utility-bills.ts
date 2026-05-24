import type { UtilityBill } from '@/types/utility-bills';

function makeUtilityBill(overrides: Partial<UtilityBill> = {}): UtilityBill {
  return {
    id: '',
    billNumber: '',
    type: 'other',
    provider: '',
    providerAccountNumber: undefined,
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date().toISOString().split('T')[0],
    amount: 0,
    vatAmount: 0,
    total: 0,
    status: 'unpaid',
    paymentMethod: undefined,
    paidAt: undefined,
    attachmentUrl: undefined,
    notes: undefined,
    createdBy: 'مالك النظام',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

const d = (daysAgo: number) => new Date(Date.now() - daysAgo * 86400000).toISOString().split('T')[0];

function buildDefaultBills(): UtilityBill[] {
  const today = new Date();
  const future = (daysLater: number) => new Date(today.getTime() + daysLater * 86400000).toISOString().split('T')[0];

  return [
    makeUtilityBill({
      id: 'ub-1', billNumber: 'UB-001', type: 'electricity', provider: 'الشركة السعودية للكهرباء',
      providerAccountNumber: '1002003004', issueDate: d(30), dueDate: d(5),
      amount: 1500, vatAmount: 225, total: 1725, status: 'paid', paymentMethod: 'bank', paidAt: d(3),
      createdBy: 'المحاسب', createdAt: d(30), updatedAt: d(3),
    }),
    makeUtilityBill({
      id: 'ub-2', billNumber: 'UB-002', type: 'water', provider: 'شركة المياه الوطنية',
      providerAccountNumber: '4003002001', issueDate: d(28), dueDate: d(3),
      amount: 600, vatAmount: 0, total: 600, status: 'paid', paymentMethod: 'bank', paidAt: d(2),
      createdBy: 'المحاسب', createdAt: d(28), updatedAt: d(2),
    }),
    makeUtilityBill({
      id: 'ub-3', billNumber: 'UB-003', type: 'internet', provider: 'STC',
      providerAccountNumber: '5012345678', issueDate: d(15), dueDate: d(10),
      amount: 300, vatAmount: 45, total: 345, status: 'paid', paymentMethod: 'transfer', paidAt: d(8),
      createdBy: 'مالك النظام', createdAt: d(15), updatedAt: d(8),
    }),
    makeUtilityBill({
      id: 'ub-4', billNumber: 'UB-004', type: 'telecom', provider: 'Zain',
      providerAccountNumber: '5512345678', issueDate: d(20), dueDate: d(5),
      amount: 250, vatAmount: 37.5, total: 287.5, status: 'paid', paymentMethod: 'bank', paidAt: d(4),
      createdBy: 'المحاسب', createdAt: d(20), updatedAt: d(4),
    }),
    makeUtilityBill({
      id: 'ub-5', billNumber: 'UB-005', type: 'rent', provider: 'مالك العقار - عبدالله السلمي',
      issueDate: d(1), dueDate: d(1),
      amount: 8000, vatAmount: 0, total: 8000, status: 'paid', paymentMethod: 'transfer', paidAt: d(1),
      createdBy: 'مالك النظام', createdAt: d(1), updatedAt: d(1),
    }),
    makeUtilityBill({
      id: 'ub-6', billNumber: 'UB-006', type: 'software', provider: 'منصة ووردبريس',
      providerAccountNumber: 'WP-12345', issueDate: d(25), dueDate: future(5),
      amount: 150, vatAmount: 22.5, total: 172.5, status: 'unpaid',
      createdBy: 'مالك النظام', createdAt: d(25), updatedAt: d(25),
    }),
    makeUtilityBill({
      id: 'ub-7', billNumber: 'UB-007', type: 'electricity', provider: 'الشركة السعودية للكهرباء',
      providerAccountNumber: '1002003004', issueDate: d(2), dueDate: future(10),
      amount: 1600, vatAmount: 240, total: 1840, status: 'unpaid',
      createdBy: 'المحاسب', createdAt: d(2), updatedAt: d(2),
    }),
    makeUtilityBill({
      id: 'ub-8', billNumber: 'UB-008', type: 'water', provider: 'شركة المياه الوطنية',
      providerAccountNumber: '4003002001', issueDate: d(2), dueDate: future(7),
      amount: 550, vatAmount: 0, total: 550, status: 'unpaid',
      createdBy: 'المحاسب', createdAt: d(2), updatedAt: d(2),
    }),
    makeUtilityBill({
      id: 'ub-9', billNumber: 'UB-009', type: 'internet', provider: 'STC',
      providerAccountNumber: '5012345678', issueDate: d(0), dueDate: future(14),
      amount: 300, vatAmount: 45, total: 345, status: 'unpaid',
      createdBy: 'مالك النظام', createdAt: d(0), updatedAt: d(0),
    }),
    makeUtilityBill({
      id: 'ub-10', billNumber: 'UB-010', type: 'telecom', provider: 'Mobily',
      providerAccountNumber: '5612345678', issueDate: d(10), dueDate: d(2),
      amount: 200, vatAmount: 30, total: 230, status: 'overdue',
      createdBy: 'المحاسب', createdAt: d(10), updatedAt: d(2),
    }),
    makeUtilityBill({
      id: 'ub-11', billNumber: 'UB-011', type: 'rent', provider: 'مالك العقار - عبدالله السلمي',
      issueDate: d(0), dueDate: future(5),
      amount: 8000, vatAmount: 0, total: 8000, status: 'unpaid',
      createdBy: 'مالك النظام', createdAt: d(0), updatedAt: d(0),
    }),
    makeUtilityBill({
      id: 'ub-12', billNumber: 'UB-012', type: 'municipality', provider: 'أمانة المنطقة',
      providerAccountNumber: 'AM-98765', issueDate: d(40), dueDate: d(25),
      amount: 1000, vatAmount: 0, total: 1000, status: 'overdue',
      createdBy: 'مالك النظام', createdAt: d(40), updatedAt: d(25),
    }),
    makeUtilityBill({
      id: 'ub-13', billNumber: 'UB-013', type: 'government', provider: 'وزارة التجارة',
      issueDate: d(45), dueDate: d(30),
      amount: 2000, vatAmount: 0, total: 2000, status: 'overdue',
      createdBy: 'المحاسب', createdAt: d(45), updatedAt: d(30),
    }),
    makeUtilityBill({
      id: 'ub-14', billNumber: 'UB-014', type: 'software', provider: 'Google Workspace',
      providerAccountNumber: 'GW-67890', issueDate: d(20), dueDate: d(0),
      amount: 100, vatAmount: 15, total: 115, status: 'overdue',
      createdBy: 'مالك النظام', createdAt: d(20), updatedAt: d(0),
    }),
    makeUtilityBill({
      id: 'ub-15', billNumber: 'UB-015', type: 'electricity', provider: 'الشركة السعودية للكهرباء',
      providerAccountNumber: '1002003004', issueDate: d(60), dueDate: d(45),
      amount: 1400, vatAmount: 210, total: 1610, status: 'overdue',
      createdBy: 'المحاسب', createdAt: d(60), updatedAt: d(45),
    }),
  ];
}

let billsState: UtilityBill[] = buildDefaultBills();
let nextBillId = 16;
let nextBillNumber = 16;

export function getUtilityBills(): UtilityBill[] {
  return billsState;
}

export function getUtilityBillById(id: string): UtilityBill | undefined {
  return billsState.find((b) => b.id === id);
}

export function addUtilityBill(data: Omit<UtilityBill, 'id' | 'billNumber' | 'createdAt' | 'updatedAt'>): UtilityBill {
  const nowISO = new Date().toISOString();
  const bill: UtilityBill = {
    ...data,
    id: `ub-${nextBillId++}`,
    billNumber: `UB-${String(nextBillNumber++).padStart(3, '0')}`,
    createdAt: nowISO,
    updatedAt: nowISO,
  };
  billsState = [...billsState, bill];
  return bill;
}

export function updateUtilityBill(id: string, updates: Partial<Omit<UtilityBill, 'id' | 'billNumber' | 'createdAt'>>): UtilityBill | undefined {
  const idx = billsState.findIndex((b) => b.id === id);
  if (idx === -1) return undefined;
  const updated = { ...billsState[idx], ...updates, updatedAt: new Date().toISOString() };
  const newState = [...billsState];
  newState[idx] = updated;
  billsState = newState;
  return updated;
}

export function getUtilityBillsDueThisWeek(): UtilityBill[] {
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 86400000);
  return billsState.filter((b) => {
    if (b.status === 'paid') return false;
    const due = new Date(b.dueDate);
    return due >= now && due <= nextWeek;
  });
}
