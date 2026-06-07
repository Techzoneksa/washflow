import type { CartItem, PaymentMethod, MixedPayment } from './pos';
import type { OrderCancelData, OrderRefundData } from './orders';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  orderNumber: string;
  orderId: string;
  items: CartItem[];
  customer?: {
    customerId?: string;
    name?: string;
    phone?: string;
    plateNumber?: string;
  };
  subtotal: number;
  vatAmount: number;
  vatRate: number;
  total: number;
  paymentMethod: PaymentMethod;
  mixedPayment?: MixedPayment;
  cashAmount: number;
  networkAmount: number;
  status: 'completed' | 'cancelled' | 'refunded';
  cashierName: string;
  cashierRole: string;
  createdAt: string;
  cancelledData?: OrderCancelData;
  refundedData?: OrderRefundData;
}
