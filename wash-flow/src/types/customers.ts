export interface Customer {
  id: string;
  name?: string;
  phone?: string;
  carPlate?: string;
  carType?: string;
  notes?: string;
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
  carPlate?: string;
  carType?: string;
  notes?: string;
  status: 'active' | 'inactive';
}