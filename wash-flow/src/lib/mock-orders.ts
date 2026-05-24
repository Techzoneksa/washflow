import type { OrderHistoryItem } from '@/types/orders';
import type { PaymentMethod } from '@/types/pos';

const services = [
  { id: 'small-car', nameAr: 'سيارة صغيرة', price: 25 },
  { id: 'large-car', nameAr: 'سيارة كبيرة', price: 35 },
  { id: 'dina', nameAr: 'دينا', price: 60 },
  { id: 'interior', nameAr: 'غسيل داخلي', price: 20 },
  { id: 'exterior', nameAr: 'غسيل خارجي', price: 25 },
  { id: 'full-wash', nameAr: 'داخلي/خارجي', price: 45 },
  { id: 'tires-polish', nameAr: 'تلميع إطارات', price: 10 },
  { id: 'fragrance', nameAr: 'تعطير السيارة', price: 15 },
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatDate(date: Date): string {
  return date.toISOString();
}

function buildMockOrders(): OrderHistoryItem[] {
  const cashiers = [
    { name: 'أحمد الحربي', role: 'cashier' },
    { name: 'سعد القحطاني', role: 'cashier' },
    { name: 'نايف الزهراني', role: 'cashier' },
    { name: 'خالد السلمي', role: 'manager' },
  ];

  const customers = [
    { name: 'محمد العلي', phone: '0551234567', plateNumber: 'أ ب 1234' },
    { name: 'فهد الدوسري', phone: '0557654321', plateNumber: 'ج د 5678' },
    { name: 'سعود القحطاني', phone: '0561112233' },
    { name: 'عبدالله الحربي', phone: '0573334444', plateNumber: 'ه و 9012' },
    { name: 'نواف الشمري', phone: '0585556666' },
    undefined,
    undefined,
  ];

  const paymentMethods: PaymentMethod[] = ['cash', 'mada', 'card', 'transfer', 'mixed'];

  const orders: OrderHistoryItem[] = [];
  let orderNum = 1001;
  let invoiceNum = 2001;

  const now = new Date('2026-05-23T18:00:00');

  for (let i = 0; i < 25; i++) {
    const date = new Date(now);
    date.setMinutes(date.getMinutes() - randomInt(0, 3 * 24 * 60));
    date.setSeconds(0, 0);

    const numItems = randomInt(1, 4);
    const selectedServices = pickN(services, numItems);
    const items = selectedServices.map((s) => ({
      serviceId: s.id,
      nameAr: s.nameAr,
      price: s.price,
      quantity: randomInt(1, 2),
      total: 0,
    }));
    items.forEach((item) => { item.total = item.price * item.quantity; });

    const subtotal = items.reduce((s, item) => s + item.total, 0);
    const vatRate = 15;
    const isCancelled = i >= 18 && i < 22;
    const isRefunded = i >= 22;

    let status: 'completed' | 'cancelled' | 'refunded' = 'completed';
    if (isCancelled) status = 'cancelled';
    else if (isRefunded) status = 'refunded';

    const cashier = pick(cashiers);
    const customer = pick(customers);
    const paymentMethod = status === 'completed' ? pick(paymentMethods) : 'cash';

    const priceIncludesTax = true;
    let vatAmount: number;
    let total: number;

    if (priceIncludesTax) {
      total = subtotal;
      vatAmount = Math.round((total - (total / (1 + vatRate / 100))) * 100) / 100;
    } else {
      vatAmount = Math.round(subtotal * (vatRate / 100) * 100) / 100;
      total = subtotal + vatAmount;
    }

    const order: OrderHistoryItem = {
      id: `ord-${1000 + i}`,
      orderNumber: `ORD-${orderNum++}`,
      invoiceNumber: `WF-${invoiceNum++}`,
      items: items.map((i) => ({ ...i })),
      customer: customer ? { ...customer } : undefined,
      subtotal: Math.round(subtotal * 100) / 100,
      vatAmount,
      vatRate,
      total,
      paymentMethod,
      status,
      cashierName: cashier.name,
      cashierRole: cashier.role,
      createdAt: formatDate(date),
    };

    if (status === 'cancelled') {
      order.cancelledData = {
        reason: pick(['العميل ألغى الطلب', 'خطأ في إدخال الخدمات', 'تأخر العميل', 'نفاد الخدمة']),
        cancelledBy: pick(['خالد السلمي', 'أحمد الحربي']),
        cancelledAt: formatDate(new Date(date.getTime() + randomInt(5, 60) * 60000)),
      };
    }

    if (status === 'refunded') {
      order.refundedData = {
        reason: pick(['العميل غير راضٍ عن الخدمة', 'خطأ في الخدمة المقدمة', 'تضرر السيارة', 'طلب استرداد']),
        refundAmount: total,
        refundedBy: pick(['خالد السلمي', 'أحمد الحربي']),
        refundedAt: formatDate(new Date(date.getTime() + randomInt(60, 180) * 60000)),
      };
    }

    orders.push(order);
  }

  return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export const mockOrderHistory = buildMockOrders();

export function getOrdersSummary(orders: OrderHistoryItem[]) {
  return {
    total: orders.length,
    completed: orders.filter((o) => o.status === 'completed').length,
    cancelled: orders.filter((o) => o.status === 'cancelled').length,
    refunded: orders.filter((o) => o.status === 'refunded').length,
    totalRevenue: orders.filter((o) => o.status === 'completed').reduce((s, o) => s + o.total, 0),
    totalVat: orders.filter((o) => o.status === 'completed').reduce((s, o) => s + o.vatAmount, 0),
  };
}

export function filterOrders(
  orders: OrderHistoryItem[],
  filters: {
    search: string;
    status: string;
    paymentMethod: string;
  },
): OrderHistoryItem[] {
  return orders.filter((order) => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const matchSearch =
        order.orderNumber.toLowerCase().includes(q) ||
        order.invoiceNumber.toLowerCase().includes(q) ||
        order.customer?.name?.toLowerCase().includes(q) ||
        order.customer?.plateNumber?.toLowerCase().includes(q) ||
        order.customer?.phone?.toLowerCase().includes(q) ||
        order.cashierName.toLowerCase().includes(q);
      if (!matchSearch) return false;
    }
    if (filters.status !== 'all' && order.status !== filters.status) return false;
    if (filters.paymentMethod !== 'all' && order.paymentMethod !== filters.paymentMethod) return false;
    return true;
  });
}

export function paginateOrders(orders: OrderHistoryItem[], page: number, pageSize: number) {
  const start = (page - 1) * pageSize;
  return {
    items: orders.slice(start, start + pageSize),
    totalPages: Math.ceil(orders.length / pageSize),
    total: orders.length,
  };
}
