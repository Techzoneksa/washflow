export interface Customer {
  id: string;
  name?: string;
  phone?: string;
  ordersCount: number;
  totalSpent: number;
  lastVisitAt?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface CustomerFormData {
  name?: string;
  phone?: string;
  status: 'active' | 'inactive';
}