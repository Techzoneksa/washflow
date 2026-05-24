import type { CartItem, PosOrder, TodayOrderSummary, PosCustomerInfo, PaymentMethod, MixedPayment } from '@/types/pos';
import type { AuthSession } from '@/types/auth';
import { getSession } from '@/lib/mock-auth';
import { getCompanySetup } from '@/lib/mock-company-settings';
import { getPOSWashServices, serviceCategories as svcCategories } from '@/lib/mock-services';

export const washServices = getPOSWashServices();

export const serviceCategories = ['الكل', ...svcCategories];

const usedOrderNumbers = new Set<number>();
const usedInvoiceNumbers = new Set<number>();

function generateOrderNumber(): string {
  const num = 1000 + usedOrderNumbers.size + Math.floor(Math.random() * 9000);
  const finalNum = usedOrderNumbers.has(num) ? num + usedOrderNumbers.size + 1 : num;
  usedOrderNumbers.add(finalNum);
  return `ORD-${finalNum}`;
}

function generateInvoiceNumber(): string {
  const setup = getCompanySetup();
  const prefix = setup?.invoice.invoicePrefix || 'WF-';
  const num = 2000 + usedInvoiceNumbers.size + Math.floor(Math.random() * 8000);
  const finalNum = usedInvoiceNumbers.has(num) ? num + usedInvoiceNumbers.size + 1 : num;
  usedInvoiceNumbers.add(finalNum);
  return `${prefix}${finalNum}`;
}

export interface TaxCalculation {
  subtotal: number;
  vatAmount: number;
  vatRate: number;
  total: number;
  priceIncludesTax: boolean;
}

export function calculateTax(subtotal: number): TaxCalculation {
  const setup = getCompanySetup();
  const vatRate = setup?.tax.taxRate ?? 15;
  const priceIncludesTax = setup?.tax.priceIncludesTax ?? true;

  if (priceIncludesTax) {
    const total = subtotal;
    const vatAmount = total - (total / (1 + vatRate / 100));
    return { subtotal: total - vatAmount, vatAmount, vatRate, total, priceIncludesTax };
  } else {
    const vatAmount = subtotal * (vatRate / 100);
    const total = subtotal + vatAmount;
    return { subtotal, vatAmount, vatRate, total, priceIncludesTax };
  }
}

export function calculateCartTotals(items: CartItem[]): TaxCalculation {
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  return calculateTax(subtotal);
}

export function createMockOrder(
  items: CartItem[],
  paymentMethod: PaymentMethod,
  customer?: PosCustomerInfo,
  mixedPayment?: MixedPayment,
): PosOrder {
  const session: AuthSession | null = getSession();
  const tax = calculateCartTotals(items);

  const order: PosOrder = {
    id: crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    orderNumber: generateOrderNumber(),
    invoiceNumber: generateInvoiceNumber(),
    items: items.map(i => ({ ...i })),
    customer: customer ? { ...customer } : undefined,
    subtotal: tax.subtotal,
    vatAmount: tax.vatAmount,
    vatRate: tax.vatRate,
    total: tax.total,
    paymentMethod,
    mixedPayment: paymentMethod === 'mixed' && mixedPayment ? { ...mixedPayment } : undefined,
    status: 'completed',
    cashierName: session?.user.name || 'كاشير',
    cashierRole: session?.selectedRole || 'cashier',
    createdAt: new Date().toISOString(),
  };

  return order;
}

export function addToCart(cart: CartItem[], service: { id: string; nameAr: string; price: number }): CartItem[] {
  const existing = cart.find(item => item.serviceId === service.id);
  if (existing) {
    return cart.map(item =>
      item.serviceId === service.id
        ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
        : item,
    );
  }
  return [...cart, { serviceId: service.id, nameAr: service.nameAr, price: service.price, quantity: 1, total: service.price }];
}

export function updateCartQuantity(cart: CartItem[], serviceId: string, quantity: number): CartItem[] {
  if (quantity <= 0) return cart.filter(item => item.serviceId !== serviceId);
  return cart.map(item =>
    item.serviceId === serviceId
      ? { ...item, quantity, total: quantity * item.price }
      : item,
  );
}

export function removeFromCart(cart: CartItem[], serviceId: string): CartItem[] {
  return cart.filter(item => item.serviceId !== serviceId);
}

function getPaymentMethodLabel(method: PaymentMethod): string {
  const labels: Record<PaymentMethod, string> = {
    cash: 'نقدي', mada: 'شبكة / مدى', card: 'بطاقة', transfer: 'تحويل', mixed: 'دفع مختلط',
  };
  return labels[method];
}

export { getPaymentMethodLabel };

const mockTodayOrdersCache: TodayOrderSummary[] = [
  { id: 't1', orderNumber: 'ORD-1001', time: '09:15', total: 80, paymentMethod: 'cash', status: 'completed', itemsCount: 3 },
  { id: 't2', orderNumber: 'ORD-1002', time: '09:45', total: 110, paymentMethod: 'mada', status: 'completed', itemsCount: 4 },
  { id: 't3', orderNumber: 'ORD-1003', time: '10:20', total: 25, paymentMethod: 'cash', status: 'completed', itemsCount: 1 },
  { id: 't4', orderNumber: 'ORD-1004', time: '10:55', total: 175, paymentMethod: 'transfer', status: 'completed', itemsCount: 5 },
  { id: 't5', orderNumber: 'ORD-1005', time: '11:30', total: 45, paymentMethod: 'mada', status: 'completed', itemsCount: 2 },
];

export function getTodayOrders(): TodayOrderSummary[] {
  return [...mockTodayOrdersCache];
}

export function getServiceIcon(iconName: string): string {
  const icons: Record<string, string> = {
    car: '🚗', truck: '🚛', sparkles: '✨', droplets: '💧',
    'badge-check': '✅', circle: '⭕', plus: '➕',
  };
  return icons[iconName] || '🔧';
}
