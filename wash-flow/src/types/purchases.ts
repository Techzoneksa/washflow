export type PaymentStatus = 'paid' | 'unpaid' | 'partial';
export type PaymentMethod = 'cash' | 'bank' | 'credit' | 'transfer' | 'partial';
export type PurchaseInvoiceStatus = 'draft' | 'approved';

export interface PurchaseItem {
  id: string;
  purchaseId?: string;
  inventoryItemId?: string;
  /** Display name — either from inventory link or free-text */
  name: string;
  inventoryItemName?: string;
  description?: string;
  /** Display unit — either purchase unit or free-text unit */
  unit: string;
  purchaseUnit?: string;
  quantity: number;
  conversionFactor?: number;
  quantityInBaseUnit?: number;
  baseUnit?: string;
  unitPrice: number;
  discount?: number;
  total: number;
}

export interface PurchaseInvoice {
  id: string;
  purchaseNumber: string;
  supplierId: string;
  supplierName: string;
  supplierInvoiceNumber?: string;
  description?: string;
  date: string;
  dueDate?: string;
  items: PurchaseItem[];
  subtotal: number;
  discountTotal: number;
  total: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  partialPaymentMethod?: 'cash' | 'bank';
  remainingDueDate?: string;
  paidAmount: number;
  remainingAmount: number;
  accountId?: string;
  attachmentUrl?: string;
  notes?: string;
  status: PurchaseInvoiceStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
