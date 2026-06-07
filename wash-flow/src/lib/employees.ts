import type { Employee, EmployeeAdvance, SalaryPayment } from '@/types/employees';

const employees: Employee[] = [];
const advances: EmployeeAdvance[] = [];
const salaryPayments: SalaryPayment[] = [];

export function getEmployees(): Employee[] {
  return employees;
}

export function getEmployeeById(id: string): Employee | undefined {
  return employees.find(e => e.id === id);
}

export function getAdvances(): EmployeeAdvance[] {
  return advances;
}

export function getAdvancesByEmployeeId(employeeId: string): EmployeeAdvance[] {
  return advances.filter(a => a.employeeId === employeeId);
}

export function getSalaryPayments(): SalaryPayment[] {
  return salaryPayments;
}

export function getSalaryPaymentsByEmployeeId(employeeId: string): SalaryPayment[] {
  return salaryPayments.filter(s => s.employeeId === employeeId);
}

export function addEmployee(data: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>): Employee {
  const newEmp: Employee = {
    ...data,
    id: `emp-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  employees.push(newEmp);
  return newEmp;
}

export function updateEmployee(id: string, updates: Partial<Employee>): Employee | undefined {
  const index = employees.findIndex(e => e.id === id);
  if (index === -1) return undefined;
  employees[index] = { ...employees[index], ...updates, updatedAt: new Date().toISOString() };
  return employees[index];
}

export function addAdvance(data: Omit<EmployeeAdvance, 'id' | 'createdAt'>): EmployeeAdvance {
  const newAdv: EmployeeAdvance = {
    ...data,
    id: `adv-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  advances.unshift(newAdv);
  return newAdv;
}

export function addSalaryPayment(data: Omit<SalaryPayment, 'id' | 'createdAt'>): SalaryPayment {
  const newPay: SalaryPayment = {
    ...data,
    id: `sal-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  salaryPayments.unshift(newPay);
  return newPay;
}

export function getOpenAdvancesByEmployeeId(employeeId: string): EmployeeAdvance[] {
  return advances.filter(a => a.employeeId === employeeId && a.status === 'open' && a.deductFromSalary);
}

export function getEmployeeLedger(employeeId: string) {
  const emp = employees.find(e => e.id === employeeId);
  if (!emp) return null;

  const empAdvances = advances.filter(a => a.employeeId === employeeId);
  const empSalaries = salaryPayments.filter(s => s.employeeId === employeeId);

  const totalAdvances = empAdvances.reduce((sum, a) => sum + a.amount, 0);
  const openAdvances = empAdvances.filter(a => a.status === 'open').reduce((sum, a) => sum + a.amount, 0);
  const deductedAdvances = empAdvances.filter(a => a.status === 'deducted').reduce((sum, a) => sum + a.amount, 0);
  const paidAdvances = empAdvances.filter(a => a.status === 'paid').reduce((sum, a) => sum + a.amount, 0);

  const totalPaidSalaries = empSalaries.reduce((sum, s) => sum + s.netSalary, 0);
  const totalSalaryAdvancesDeducted = empSalaries.reduce((sum, s) => sum + s.advancesDeducted, 0);

  return {
    employee: emp,
    totalAdvances,
    openAdvances,
    deductedAdvances,
    paidAdvances,
    totalPaidSalaries,
    totalSalaryAdvancesDeducted,
    salaryCount: empSalaries.length,
    lastTransaction: empAdvances[0]?.createdAt || empSalaries[0]?.createdAt || null,
  };
}

export function getEmployeesSummary() {
  const total = employees.length;
  const activeCount = employees.filter(e => e.status === 'active').length;
  const totalSalaries = employees.reduce((sum, e) => sum + e.monthlySalary, 0);
  const openAdvancesTotal = advances.filter(a => a.status === 'open').reduce((sum, a) => sum + a.amount, 0);
  const netSalariesThisMonth = totalSalaries - openAdvancesTotal;

  return { total, activeCount, totalSalaries, openAdvancesTotal, netSalariesThisMonth };
}

export function filterEmployees(
  items: Employee[],
  filters: { search: string; status: string; nationality: string; jobTitle: string }
): Employee[] {
  return items.filter(emp => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!emp.fullName.toLowerCase().includes(q) &&
          !emp.nationalId.includes(q) &&
          !emp.nationality.toLowerCase().includes(q) &&
          !emp.jobTitle.toLowerCase().includes(q) &&
          !emp.phone.includes(q)) return false;
    }
    if (filters.status !== 'all' && emp.status !== filters.status) return false;
    if (filters.nationality && emp.nationality !== filters.nationality) return false;
    if (filters.jobTitle && emp.jobTitle !== filters.jobTitle) return false;
    return true;
  });
}

export const JOB_TITLES = ['مشرف مغسلة', 'عامل غسيل', 'عامل تلميع', 'كاشير', 'عامل تنظيف داخلي'];
export const NATIONALITIES = ['سعودي', 'يمني', 'مصري', 'سوداني', 'بنغالي', 'هندي', 'باكستاني'];
