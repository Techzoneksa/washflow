import type { Customer } from '@/types/customers';

export const mockCustomers: Customer[] = [
  {
    id: 'cust-001',
    phone: '0551234567',
    ordersCount: 15,
    totalSpent: 1250,
    lastVisitAt: '2026-06-05',
    status: 'active',
    createdAt: '2025-01-15',
    updatedAt: '2026-06-05',
  },
  {
    id: 'cust-002',
    name: 'عبدالله السعيد',
    phone: '0552345678',
    ordersCount: 8,
    totalSpent: 640,
    lastVisitAt: '2026-06-04',
    status: 'active',
    createdAt: '2025-03-20',
    updatedAt: '2026-06-04',
  },
  {
    id: 'cust-003',
    name: 'فهد المحمد',
    phone: '0553456789',
    ordersCount: 22,
    totalSpent: 1980,
    lastVisitAt: '2026-06-05',
    status: 'active',
    createdAt: '2024-11-10',
    updatedAt: '2026-06-05',
  },
  {
    id: 'cust-004',
    phone: '0554567890',
    ordersCount: 3,
    totalSpent: 135,
    lastVisitAt: '2026-05-28',
    status: 'active',
    createdAt: '2026-05-15',
    updatedAt: '2026-05-28',
  },
  {
    id: 'cust-005',
    name: 'خالد الدوسري',
    phone: '0555678901',
    ordersCount: 12,
    totalSpent: 960,
    lastVisitAt: '2026-06-01',
    status: 'active',
    createdAt: '2025-02-28',
    updatedAt: '2026-06-01',
  },
  {
    id: 'cust-006',
    name: 'سعود القحطاني',
    phone: '0556789012',
    ordersCount: 1,
    totalSpent: 45,
    lastVisitAt: '2026-04-10',
    status: 'inactive',
    createdAt: '2026-04-10',
    updatedAt: '2026-05-15',
  },
  {
    id: 'cust-007',
    phone: '0557890123',
    ordersCount: 6,
    totalSpent: 420,
    lastVisitAt: '2026-05-20',
    status: 'active',
    createdAt: '2025-08-05',
    updatedAt: '2026-05-20',
  },
  {
    id: 'cust-008',
    name: 'ماجد الحربي',
    phone: '0558901234',
    ordersCount: 18,
    totalSpent: 1620,
    lastVisitAt: '2026-06-03',
    status: 'active',
    createdAt: '2024-12-20',
    updatedAt: '2026-06-03',
  },
  {
    id: 'cust-009',
    phone: '0559012345',
    ordersCount: 0,
    totalSpent: 0,
    status: 'active',
    createdAt: '2026-06-01',
    updatedAt: '2026-06-01',
  },
  {
    id: 'cust-010',
    name: 'ناصر العتيبي',
    phone: '0560123456',
    ordersCount: 25,
    totalSpent: 2250,
    lastVisitAt: '2026-06-05',
    status: 'active',
    createdAt: '2024-09-15',
    updatedAt: '2026-06-05',
  },
  {
    id: 'cust-011',
    name: 'تركي الشمري',
    phone: '0561234567',
    ordersCount: 4,
    totalSpent: 320,
    lastVisitAt: '2026-05-25',
    status: 'inactive',
    createdAt: '2025-05-10',
    updatedAt: '2026-05-30',
  },
  {
    id: 'cust-012',
    phone: '0562345678',
    ordersCount: 7,
    totalSpent: 490,
    lastVisitAt: '2026-06-02',
    status: 'active',
    createdAt: '2025-04-12',
    updatedAt: '2026-06-02',
  },
  {
    id: 'cust-013',
    name: 'أحمد الزهراني',
    phone: '0563456789',
    ordersCount: 9,
    totalSpent: 810,
    lastVisitAt: '2026-05-30',
    status: 'active',
    createdAt: '2025-01-25',
    updatedAt: '2026-05-30',
  },
  {
    id: 'cust-014',
    phone: '0564567890',
    ordersCount: 2,
    totalSpent: 90,
    lastVisitAt: '2026-05-18',
    status: 'active',
    createdAt: '2026-05-05',
    updatedAt: '2026-05-18',
  },
];

export function getCustomerByPhone(phone: string): Customer | undefined {
  const normalized = normalizePhone(phone);
  return mockCustomers.find((c) => c.phone && normalizePhone(c.phone) === normalized);
}

export function getCustomerById(id: string): Customer | undefined {
  return mockCustomers.find((c) => c.id === id);
}

export function isPhoneExists(phone: string, excludeId?: string): boolean {
  const normalized = normalizePhone(phone);
  return mockCustomers.some(
    (c) => c.phone && normalizePhone(c.phone) === normalized && c.id !== excludeId
  );
}

export function normalizePhone(phone: string): string {
  let p = phone.replace(/[\s\-\(\)]/g, '');
  if (p.startsWith('+966')) p = p.slice(4);
  if (p.startsWith('966')) p = p.slice(3);
  if (p.startsWith('05')) p = p.slice(1);
  return p;
}

export function formatPhoneForDisplay(phone: string): string {
  const normalized = normalizePhone(phone);
  return `+966${normalized.slice(1)}`;
}

export interface CustomerSummary {
  totalCustomers: number;
  todayCustomers: number;
  activeCustomers: number;
  totalOrdersLinked: number;
  topCustomer: Customer | null;
}

export function getCustomersSummary(customers: Customer[]): CustomerSummary {
  const today = new Date().toISOString().split('T')[0];
  const totalCustomers = customers.length;
  const todayCustomers = customers.filter((c) =>
    c.lastVisitAt && c.lastVisitAt.startsWith(today)
  ).length;
  const activeCustomers = customers.filter((c) => c.status === 'active').length;
  const totalOrdersLinked = customers.reduce((sum, c) => sum + c.ordersCount, 0);

  let topCustomer: Customer | null = null;
  let maxSpent = 0;
  for (const c of customers) {
    if (c.totalSpent > maxSpent) {
      maxSpent = c.totalSpent;
      topCustomer = c;
    }
  }

  return { totalCustomers, todayCustomers, activeCustomers, totalOrdersLinked, topCustomer };
}

export interface CustomerFilter {
  search: string;
  status: 'all' | 'active' | 'inactive';
  hasOrders: 'all' | 'yes' | 'no';
}

export function filterCustomers(customers: Customer[], filters: CustomerFilter): Customer[] {
  let result = [...customers];

  if (filters.search.trim()) {
    const q = filters.search.trim().toLowerCase();
    result = result.filter(
      (c) =>
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.phone && c.phone.includes(q))
    );
  }

  if (filters.status !== 'all') {
    result = result.filter((c) => c.status === filters.status);
  }

  if (filters.hasOrders === 'yes') {
    result = result.filter((c) => c.ordersCount > 0);
  } else if (filters.hasOrders === 'no') {
    result = result.filter((c) => c.ordersCount === 0);
  }

  return result;
}

const customersStore: Customer[] = [...mockCustomers];

export function getCustomers(): Customer[] {
  return [...customersStore];
}

export function addCustomer(data: Omit<Customer, 'id' | 'ordersCount' | 'totalSpent' | 'createdAt' | 'updatedAt'>): Customer | null {
  const newCustomer: Customer = {
    ...data,
    id: `cust-${Date.now()}`,
    ordersCount: 0,
    totalSpent: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  customersStore.push(newCustomer);
  return newCustomer;
}

export function updateCustomer(id: string, data: Partial<Customer>): Customer | null {
  const idx = customersStore.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  customersStore[idx] = { ...customersStore[idx], ...data, updatedAt: new Date().toISOString() };
  return customersStore[idx];
}

export function updateCustomerStats(id: string, orderTotal: number): void {
  const idx = customersStore.findIndex((c) => c.id === id);
  if (idx === -1) return;
  customersStore[idx].ordersCount += 1;
  customersStore[idx].totalSpent += orderTotal;
  customersStore[idx].lastVisitAt = new Date().toISOString().split('T')[0];
  customersStore[idx].updatedAt = new Date().toISOString();
}

export function getCustomerOrders(_customerId: string): Array<{ id: string; date: string; total: number; status: string }> {
  return [
    { id: 'ORD-001', date: '2026-06-05', total: 120, status: 'completed' },
    { id: 'ORD-015', date: '2026-05-28', total: 85, status: 'completed' },
    { id: 'ORD-022', date: '2026-05-10', total: 150, status: 'completed' },
  ];
}