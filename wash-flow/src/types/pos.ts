export type PaymentMethod = 'cash' | 'mada' | 'card' | 'transfer' | 'mixed';

export interface WashService {
  id: string;
  nameAr: string;
  price: number;
  category: string;
  duration: string;
  icon: string;
  isActive: boolean;
}

export interface CartItem {
  serviceId: string;
  nameAr: string;
  price: number;
  quantity: number;
  total: number;
}

export interface PosCustomerInfo {
  name?: string;
  phone?: string;
  plateNumber?: string;
  notes?: string;
}

export interface MixedPayment {
  cash: number;
  card: number;
  transfer: number;
}

export interface PosOrder {
  id: string;
  orderNumber: string;
  invoiceNumber: string;
  items: CartItem[];
  customer?: PosCustomerInfo;
  subtotal: number;
  vatAmount: number;
  vatRate: number;
  total: number;
  paymentMethod: PaymentMethod;
  mixedPayment?: MixedPayment;
  status: 'completed' | 'cancelled' | 'refunded';
  cashierName: string;
  cashierRole: string;
  createdAt: string;
}

export interface TodayOrderSummary {
  id: string;
  orderNumber: string;
  time: string;
  total: number;
  paymentMethod: PaymentMethod;
  status: string;
  itemsCount: number;
}
