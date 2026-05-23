import type { PosOrder } from '@/types/pos';
import { mockOrderHistory } from './mock-orders';

export type Invoice = PosOrder;

export const mockInvoices: Invoice[] = mockOrderHistory
  .filter((o) => o.status === 'completed' || o.status === 'refunded')
  .map((o) => ({
    ...o,
    status: o.status as 'completed' | 'refunded',
  }));

export function getInvoicesSummary(invoices: Invoice[]) {
  return {
    total: invoices.length,
    totalAmount: invoices.reduce((s, i) => s + i.total, 0),
    totalVat: invoices.reduce((s, i) => s + i.vatAmount, 0),
    cancelled: invoices.filter((i) => i.status === 'refunded').length,
    paidCount: invoices.filter((i) => i.status === 'completed').length,
  };
}

export function filterInvoices(
  invoices: Invoice[],
  filters: {
    search: string;
    status: string;
    paymentMethod: string;
  },
): Invoice[] {
  return invoices.filter((inv) => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const matchSearch =
        inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.orderNumber.toLowerCase().includes(q) ||
        inv.customer?.name?.toLowerCase().includes(q) ||
        inv.customer?.plateNumber?.toLowerCase().includes(q);
      if (!matchSearch) return false;
    }
    if (filters.status !== 'all') {
      if (filters.status === 'paid' && inv.status !== 'completed') return false;
      if (filters.status === 'refunded' && inv.status !== 'refunded') return false;
    }
    if (filters.paymentMethod !== 'all' && inv.paymentMethod !== filters.paymentMethod) return false;
    return true;
  });
}

export function paginateInvoices(invoices: Invoice[], page: number, pageSize: number) {
  const start = (page - 1) * pageSize;
  return {
    items: invoices.slice(start, start + pageSize),
    totalPages: Math.ceil(invoices.length / pageSize),
    total: invoices.length,
  };
}
