import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client';
import type { Invoice } from '@/types/invoices';
import type { CartItem } from '@/types/pos';

export interface InvoicesSummaryData {
  total: number;
  totalAmount: number;
  cancelled: number;
  paidCount: number;
}

interface InvoiceDbRow {
  id: string;
  invoice_number: string;
  order_id: string | null;
  customer_id: string | null;
  customer_name: string | null;
  subtotal: number;
  vat_amount: number;
  total: number;
  payment_method: string | null;
  cash_amount: number;
  network_amount: number;
  status: string;
  created_at: string;
}

interface OrderDbRow {
  id: string;
  order_number: string;
  created_by: string | null;
}

async function getOrderMap(orderIds: string[]): Promise<Record<string, OrderDbRow>> {
  if (orderIds.length === 0) return {};
  const client = getSupabase();
  if (!client) return {};
  const { data } = await client
    .from('orders')
    .select('id, order_number, created_by')
    .in('id', orderIds);
  if (!data) return {};
  const map: Record<string, OrderDbRow> = {};
  for (const row of data) {
    map[row.id] = row;
  }
  return map;
}

async function getCashierMap(): Promise<Record<string, { name: string; role: string }>> {
  const client = getSupabase();
  if (!client) return {};
  const { data } = await client.from('profiles').select('id, full_name, role');
  if (!data) return {};
  const map: Record<string, { name: string; role: string }> = {};
  for (const p of data) {
    map[p.id] = { name: p.full_name, role: p.role };
  }
  return map;
}

async function getItemsByOrder(orderIds: string[]): Promise<Record<string, CartItem[]>> {
  if (orderIds.length === 0) return {};
  const client = getSupabase();
  if (!client) return {};
  const { data } = await client
    .from('order_items')
    .select('*')
    .in('order_id', orderIds);
  if (!data) return {};
  const map: Record<string, CartItem[]> = {};
  for (const row of data) {
    const oid = row.order_id as string;
    if (!map[oid]) map[oid] = [];
    map[oid].push({
      serviceId: row.service_id as string,
      nameAr: row.service_name as string,
      price: Number(row.unit_price),
      quantity: Number(row.quantity),
      total: Number(row.total),
    });
  }
  return map;
}

export async function getInvoices(): Promise<Invoice[]> {
  if (!isSupabaseConfigured()) return [];
  const client = getSupabase();
  if (!client) return [];

  const { data: invoices, error } = await client
    .from('invoices')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Invoices] Fetch error:', error);
    return [];
  }
  if (!invoices || invoices.length === 0) return [];

  const orderIds = invoices
    .map((inv: InvoiceDbRow) => inv.order_id)
    .filter(Boolean) as string[];

  const [orderMap, cashierMap, itemsByOrder] = await Promise.all([
    getOrderMap(orderIds),
    getCashierMap(),
    getItemsByOrder(orderIds),
  ]);

  return invoices.map((inv: InvoiceDbRow) => {
    const order = inv.order_id ? orderMap[inv.order_id] : undefined;
    const cashierId = order?.created_by;
    const cashier = cashierId ? cashierMap[cashierId] : undefined;
    const items = inv.order_id ? itemsByOrder[inv.order_id] || [] : [];

    const paymentMethod = (inv.payment_method as 'cash' | 'network' | 'mixed') || 'cash';

    return {
      id: inv.id,
      invoiceNumber: inv.invoice_number,
      orderNumber: order?.order_number || '',
      orderId: inv.order_id || '',
      items,
      customer: inv.customer_name
        ? { customerId: inv.customer_id || undefined, name: inv.customer_name }
        : undefined,
      subtotal: Number(inv.subtotal),
      vatAmount: Number(inv.vat_amount),
      vatRate: 0,
      total: Number(inv.total),
      paymentMethod,
      mixedPayment: paymentMethod === 'mixed' ? { cash: Number(inv.cash_amount), network: Number(inv.network_amount) } : undefined,
      cashAmount: Number(inv.cash_amount),
      networkAmount: Number(inv.network_amount),
      status: inv.status as 'completed' | 'cancelled' | 'refunded',
      cashierName: cashier?.name || 'كاشير',
      cashierRole: cashier?.role || 'cashier',
      createdAt: inv.created_at,
    };
  });
}

export function getInvoicesSummary(invoices: Invoice[]): InvoicesSummaryData {
  return {
    total: invoices.length,
    totalAmount: invoices.reduce((s, i) => s + i.total, 0),
    cancelled: invoices.filter((i) => i.status === 'refunded').length,
    paidCount: invoices.filter((i) => i.status === 'completed').length,
  };
}

export function filterInvoices(
  invoices: Invoice[],
  filters: { search: string; status: string; paymentMethod: string },
): Invoice[] {
  return invoices.filter((inv) => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const matchSearch =
        inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.orderNumber.toLowerCase().includes(q) ||
        inv.customer?.name?.toLowerCase().includes(q) ||
        inv.customer?.phone?.toLowerCase().includes(q);
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

export function paginateInvoices<T>(items: T[], page: number, pageSize: number) {
  const start = (page - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    totalPages: Math.ceil(items.length / pageSize),
    total: items.length,
  };
}
