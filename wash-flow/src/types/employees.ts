export type EmployeeStatus = 'active' | 'inactive';

export type AdvanceStatus = 'open' | 'deducted' | 'paid';

export type PaymentMethod = 'cash' | 'bank' | 'transfer';

export interface Employee {
  id: string;
  fullName: string;
  nationalId: string;
  nationality: string;
  birthDate: string;
  joinDate: string;
  jobTitle: string;
  monthlySalary: number;
  phone: string;
  status: EmployeeStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeAdvance {
  id: string;
  employeeId: string;
  employeeName: string;
  amount: number;
  date: string;
  reason: string;
  paymentMethod: PaymentMethod;
  deductFromSalary: boolean;
  status: AdvanceStatus;
  notes: string;
  createdAt: string;
}

export interface SalaryPayment {
  id: string;
  employeeId: string;
  employeeName: string;
  month: string;
  baseSalary: number;
  advancesDeducted: number;
  otherDeductions: number;
  netSalary: number;
  paymentMethod: PaymentMethod;
  paidAt: string;
  notes: string;
  createdAt: string;
}

export type EmployeeFilter = {
  search: string;
  status: EmployeeStatus | 'all';
  nationality: string;
  jobTitle: string;
};
