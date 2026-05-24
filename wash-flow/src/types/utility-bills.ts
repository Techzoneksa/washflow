export type UtilityBillType =
  | 'electricity' | 'water' | 'internet' | 'telecom' | 'rent'
  | 'software' | 'municipality' | 'government' | 'other';

export type UtilityBillStatus = 'paid' | 'unpaid' | 'overdue';

export type PaymentMethod = 'cash' | 'bank' | 'transfer' | 'card';

export interface UtilityBill {
  id: string;
  billNumber: string;
  type: UtilityBillType;
  provider: string;
  providerAccountNumber?: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  vatAmount: number;
  total: number;
  status: UtilityBillStatus;
  paymentMethod?: PaymentMethod;
  paidAt?: string;
  attachmentUrl?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
