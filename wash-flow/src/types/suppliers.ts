export type SupplierStatus = 'active' | 'inactive';

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  representativeName?: string;
  vatNumber?: string;
  crNumber?: string;
  email?: string;
  address?: string;
  balance: number;
  totalPurchases: number;
  totalPaid: number;
  invoicesCount: number;
  status: SupplierStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
