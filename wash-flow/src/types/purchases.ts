export type PaymentStatus = 'paid' | 'unpaid' | 'partial';
export type PaymentMethod = 'cash' | 'bank' | 'transfer' | 'credit';

export interface PurchaseItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

export interface PurchaseInvoice {
  id: string;
  purchaseNumber: string;
  supplierId: string;
  supplierName: string;
  supplierInvoiceNumber?: string;
  date: string;
  items: PurchaseItem[];
  subtotal: number;
  vatAmount: number;
  total: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  paidAmount: number;
  remainingAmount: number;
  attachmentUrl?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
