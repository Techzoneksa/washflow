import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client';
import type { OrderHistoryItem, OrderCancelData, OrderRefundData } from '@/types/orders';
import type { CartItem, TodayOrderSummary } from '@/types/pos';

export interface OrdersSummaryData {
  total: number;
  completed: number;
  cancelled: number;
  refunded: number;
  totalRevenue: number;
}

function mapOrderRow(
  row: Record<string, unknown>,
  items: CartItem[],
  cashierName: string,
  cashierRole: string,
): OrderHistoryItem {
  const cancelledData: OrderCancelData | undefined = row.cancelled_data
    ? {
        reason: (row.cancelled_data as Record<string, unknown>).reason as string,
        cancelledBy: (row.cancelled_data as Record<string, unknown>).cancelled_by as string,
        cancelledAt: (row.cancelled_data as Record<string, unknown>).cancelled_at as string,
      }
    : undefined;

  const refundedData: OrderRefundData | undefined = row.refunded_data
    ? {
        reason: (row.refunded_data as Record<string, unknown>).reason as string,
        refundAmount: Number((row.refunded_data as Record<string, unknown>).refund_amount),
        refundedBy: (row.refunded_data as Record<string, unknown>).refunded_by as string,
        refundedAt: (row.refunded_data as Record<string, unknown>).refunded_at as string,
      }
    : undefined;

  return {
    id: row.id as string,
    orderNumber: row.order_number as string,
    invoiceNumber: '',  // filled by getInvoiceNumberForOrder
    items,
    customer: row.customer_name
      ? {
          customerId: row.customer_id as string | undefined,
          name: row.customer_name as string,
          phone: row.customer_phone as string | undefined,
        }
      : undefined,
    subtotal: Number(row.subtotal),
    vatAmount: Number(row.vat_amount),
    vatRate: 0,
    total: Number(row.total),
    paymentMethod: (row.payment_method as 'cash' | 'network' | 'mixed'),
    cashAmount: Number(row.cash_amount),
    networkAmount: Number(row.network_amount),
    status: row.status as 'completed' | 'cancelled' | 'refunded',
    cashierName,
    cashierRole,
    createdAt: row.created_at as string,
    cancelledData,
    refundedData,
  };
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

async function getInvoiceNumbersForOrders(orderIds: string[]): Promise<Record<string, string>> {
  if (orderIds.length === 0) return {};
  const client = getSupabase();
  if (!client) return {};
  const { data } = await client
    .from('invoices')
    .select('order_id, invoice_number')
    .in('order_id', orderIds);
  if (!data) return {};
  const map: Record<string, string> = {};
  for (const inv of data) {
    map[inv.order_id] = inv.invoice_number;
  }
  return map;
}

export async function getOrders(): Promise<OrderHistoryItem[]> {
  if (!isSupabaseConfigured()) return [];
  const client = getSupabase();
  if (!client) return [];

  const { data: orders, error } = await client
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Orders] Fetch error:', error);
    return [];
  }
  if (!orders || orders.length === 0) return [];

  const orderIds = orders.map((o: Record<string, unknown>) => o.id as string);

  const [itemsResult, invoiceMap, cashierMap] = await Promise.all([
    client.from('order_items').select('*').in('order_id', orderIds),
    getInvoiceNumbersForOrders(orderIds),
    getCashierMap(),
  ]);

  const itemsByOrder: Record<string, CartItem[]> = {};
  if (itemsResult.data) {
    for (const row of itemsResult.data) {
      const oid = row.order_id as string;
      if (!itemsByOrder[oid]) itemsByOrder[oid] = [];
      itemsByOrder[oid].push({
        serviceId: row.service_id as string,
        nameAr: row.service_name as string,
        price: Number(row.unit_price),
        quantity: Number(row.quantity),
        total: Number(row.total),
      });
    }
  }

  return orders.map((row: Record<string, unknown>) => {
    const oid = row.id as string;
    const cashierId = row.created_by as string | undefined;
    const cashier = cashierId ? cashierMap[cashierId] : undefined;
    const order = mapOrderRow(
      row,
      itemsByOrder[oid] || [],
      cashier?.name || 'كاشير',
      cashier?.role || 'cashier',
    );
    order.invoiceNumber = invoiceMap[oid] || '';
    return order;
  });
}

export async function getOrderById(id: string): Promise<OrderHistoryItem | null> {
  if (!isSupabaseConfigured()) return null;
  const client = getSupabase();
  if (!client) return null;

  const { data: order, error } = await client
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !order) return null;

  const { data: itemsData } = await client
    .from('order_items')
    .select('*')
    .eq('order_id', id);

  const items: CartItem[] = (itemsData || []).map((row: Record<string, unknown>) => ({
    serviceId: row.service_id as string,
    nameAr: row.service_name as string,
    price: Number(row.unit_price),
    quantity: Number(row.quantity),
    total: Number(row.total),
  }));

  const invoiceMap = await getInvoiceNumbersForOrders([id]);
  const cashierMap = await getCashierMap();
  const cashierId = order.created_by as string | undefined;
  const cashier = cashierId ? cashierMap[cashierId] : undefined;

  const result = mapOrderRow(
    order,
    items,
    cashier?.name || 'كاشير',
    cashier?.role || 'cashier',
  );
  result.invoiceNumber = invoiceMap[id] || '';
  return result;
}

export async function createPOSOrder(
  items: CartItem[],
  customerId: string | null,
  customerName: string | null,
  customerPhone: string | null,
  paymentMethod: string,
  cashAmount: number,
  networkAmount: number,
  total: number,
  subtotal: number,
): Promise<{ orderId: string; orderNumber: string; invoiceId: string; invoiceNumber: string; cashierName: string; cashierRole: string } | null> {
  if (!isSupabaseConfigured()) return null;
  const client = getSupabase();
  if (!client) return null;

  const { data, error } = await client.rpc('create_pos_order', {
    p_items: JSON.stringify(items),
    p_customer_id: customerId,
    p_customer_name: customerName,
    p_customer_phone: customerPhone,
    p_payment_method: paymentMethod,
    p_cash_amount: cashAmount,
    p_network_amount: networkAmount,
    p_total: total,
    p_subtotal: subtotal,
  });

  if (error) {
    console.error('[Orders] createPOSOrder error:', error);
    return null;
  }

  return data;
}

export async function cancelOrder(orderId: string, reason: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const client = getSupabase();
  if (!client) return false;

  const { error } = await client.rpc('cancel_order', {
    p_order_id: orderId,
    p_reason: reason,
  });

  if (error) {
    console.error('[Orders] cancelOrder error:', error);
    return false;
  }

  return true;
}

export async function refundOrder(orderId: string, reason: string, amount: number): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const client = getSupabase();
  if (!client) return false;

  const { error } = await client.rpc('refund_order', {
    p_order_id: orderId,
    p_reason: reason,
    p_amount: amount,
  });

  if (error) {
    console.error('[Orders] refundOrder error:', error);
    return false;
  }

  return true;
}

export function getOrdersSummary(orders: OrderHistoryItem[]): OrdersSummaryData {
  return {
    total: orders.length,
    completed: orders.filter((o) => o.status === 'completed').length,
    cancelled: orders.filter((o) => o.status === 'cancelled').length,
    refunded: orders.filter((o) => o.status === 'refunded').length,
    totalRevenue: orders.filter((o) => o.status === 'completed').reduce((s, o) => s + o.total, 0),
  };
}

export function filterOrders(
  orders: OrderHistoryItem[],
  filters: { search: string; status: string; paymentMethod: string },
): OrderHistoryItem[] {
  return orders.filter((order) => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const matchSearch =
        order.orderNumber.toLowerCase().includes(q) ||
        order.invoiceNumber.toLowerCase().includes(q) ||
        order.customer?.name?.toLowerCase().includes(q) ||
        order.customer?.phone?.toLowerCase().includes(q) ||
        order.cashierName.toLowerCase().includes(q);
      if (!matchSearch) return false;
    }
    if (filters.status !== 'all' && order.status !== filters.status) return false;
    if (filters.paymentMethod !== 'all' && order.paymentMethod !== filters.paymentMethod) return false;
    return true;
  });
}

export async function getTodayOrders(): Promise<TodayOrderSummary[]> {
  if (!isSupabaseConfigured()) return [];
  const client = getSupabase();
  if (!client) return [];

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { data: orders, error } = await client
    .from('orders')
    .select('id, order_number, total, payment_method, status, created_at')
    .gte('created_at', todayStart.toISOString())
    .order('created_at', { ascending: false })
    .limit(5);

  if (error || !orders) {
    console.error('[Orders] getTodayOrders error:', error);
    return [];
  }

  const orderIds = orders.map((o: Record<string, unknown>) => o.id as string);

  const { data: items } = await client
    .from('order_items')
    .select('order_id')
    .in('order_id', orderIds);

  const countMap: Record<string, number> = {};
  if (items) {
    for (const row of items) {
      const oid = row.order_id as string;
      countMap[oid] = (countMap[oid] || 0) + 1;
    }
  }

  return orders.map((o: Record<string, unknown>) => ({
    id: o.id as string,
    orderNumber: o.order_number as string,
    time: new Date(o.created_at as string).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
    total: Number(o.total),
    paymentMethod: (o.payment_method as 'cash' | 'network' | 'mixed'),
    status: o.status as string,
    itemsCount: countMap[o.id as string] || 0,
  }));
}

export function paginateOrders<T>(items: T[], page: number, pageSize: number) {
  const start = (page - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    totalPages: Math.ceil(items.length / pageSize),
    total: items.length,
  };
}
