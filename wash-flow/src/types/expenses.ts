export type ExpenseType =
  | 'electricity' | 'water' | 'internet' | 'telecom' | 'rent'
  | 'salaries' | 'cleaning' | 'maintenance' | 'fuel' | 'marketing'
  | 'government' | 'other';

export interface Expense {
  id: string;
  expenseNumber: string;
  type: ExpenseType;
  title: string;
  description?: string;
  amount: number;
  vatAmount: number;
  total: number;
  paymentMethod: 'cash' | 'bank' | 'transfer' | 'card';
  accountName?: string;
  date: string;
  attachmentUrl?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
