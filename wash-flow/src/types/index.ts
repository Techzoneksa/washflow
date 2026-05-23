export type UserRole = 'owner' | 'manager' | 'accountant' | 'cashier';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

export interface Service {
  id: string;
  name: string;
  price: number;
  category: string;
  duration?: string;
  active: boolean;
}

export interface Order {
  id: string;
  customerName?: string;
  services: string[];
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  createdAt: string;
  notes?: string;
}

export type OrderStatus = 'completed' | 'in-progress' | 'cancelled' | 'refunded' | 'new';
export type PaymentStatus = 'paid' | 'unpaid' | 'partial' | 'overdue';
export type PaymentMethod = 'cash' | 'card' | 'transfer';

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  paidBy: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  balance: number;
  status: 'active' | 'inactive';
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  salary: number;
  status: 'active' | 'inactive';
  advances?: number;
}

export interface DashboardStats {
  todaySales: number;
  ordersCount: number;
  expenses: number;
  netToday: number;
  cash: number;
  card: number;
}

export interface NavItem {
  label: string;
  icon: string;
  href: string;
  badge?: number;
  roles: UserRole[];
  children?: NavItem[];
}

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type InputSize = 'sm' | 'md' | 'lg';
export type InputStatus = 'default' | 'error' | 'success';
export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'primary';
export type CardVariant = 'default' | 'outlined' | 'elevated';
