import type { Employee, EmployeeAdvance, SalaryPayment } from '@/types/employees';

function makeEmployee(overrides: Partial<Employee> = {}): Employee {
  return {
    id: '',
    fullName: '',
    nationalId: '',
    nationality: '',
    birthDate: '',
    joinDate: '',
    jobTitle: '',
    monthlySalary: 0,
    phone: '',
    status: 'active',
    notes: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

function d(daysAgo: number): string {
  return new Date(Date.now() - daysAgo * 86400000).toISOString();
}

export const mockEmployees: Employee[] = [
  makeEmployee({
    id: 'emp-1', fullName: 'خالد محمد السلمي', nationalId: '1023456789', nationality: 'سعودي',
    birthDate: '1990-05-15', joinDate: '2023-01-10', jobTitle: 'مشرف مغسلة',
    monthlySalary: 5000, phone: '0551234567', status: 'active',
    createdAt: d(500), updatedAt: d(30),
  }),
  makeEmployee({
    id: 'emp-2', fullName: 'أحمد عبدالله الحربي', nationalId: '1034567890', nationality: 'سعودي',
    birthDate: '1995-08-22', joinDate: '2023-03-15', jobTitle: 'عامل غسيل',
    monthlySalary: 3500, phone: '0552345678', status: 'active',
    createdAt: d(450), updatedAt: d(45),
  }),
  makeEmployee({
    id: 'emp-3', fullName: 'محمد علي أحمد', nationalId: '1045678901', nationality: 'يمني',
    birthDate: '1988-03-10', joinDate: '2022-06-01', jobTitle: 'عامل تلميع',
    monthlySalary: 3000, phone: '0553456789', status: 'active',
    createdAt: d(700), updatedAt: d(60),
  }),
  makeEmployee({
    id: 'emp-4', fullName: 'عبدالله سعد القحطاني', nationalId: '1056789012', nationality: 'سعودي',
    birthDate: '1992-11-20', joinDate: '2023-08-01', jobTitle: 'كاشير',
    monthlySalary: 3800, phone: '0554567890', status: 'active',
    createdAt: d(300), updatedAt: d(15),
  }),
  makeEmployee({
    id: 'emp-5', fullName: 'فهد ناصر الدوسري', nationalId: '1067890123', nationality: 'سعودي',
    birthDate: '1985-07-08', joinDate: '2022-02-14', jobTitle: 'عامل تنظيف داخلي',
    monthlySalary: 3200, phone: '0555678901', status: 'active',
    createdAt: d(800), updatedAt: d(90),
  }),
  makeEmployee({
    id: 'emp-6', fullName: 'منصور حمود الشمري', nationalId: '1078901234', nationality: 'مصري',
    birthDate: '1991-01-25', joinDate: '2023-05-20', jobTitle: 'عامل غسيل',
    monthlySalary: 2800, phone: '0556789012', status: 'active',
    createdAt: d(400), updatedAt: d(20),
  }),
  makeEmployee({
    id: 'emp-7', fullName: 'سلطان فيصل الغامدي', nationalId: '1089012345', nationality: 'سوداني',
    birthDate: '1987-09-12', joinDate: '2022-09-10', jobTitle: 'عامل تلميع',
    monthlySalary: 2900, phone: '0557890123', status: 'inactive',
    notes: 'إجازة خاصة',
    createdAt: d(650), updatedAt: d(120),
  }),
  makeEmployee({
    id: 'emp-8', fullName: 'طارق علي الشهراني', nationalId: '1090123456', nationality: 'بنغالي',
    birthDate: '1993-04-18', joinDate: '2023-02-01', jobTitle: 'عامل تنظيف داخلي',
    monthlySalary: 2600, phone: '0558901234', status: 'active',
    createdAt: d(480), updatedAt: d(10),
  }),
];

function makeAdvance(overrides: Partial<EmployeeAdvance> = {}): EmployeeAdvance {
  return {
    id: '',
    employeeId: '',
    employeeName: '',
    amount: 0,
    date: '',
    reason: '',
    paymentMethod: 'cash',
    deductFromSalary: true,
    status: 'open',
    notes: '',
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

export const mockAdvances: EmployeeAdvance[] = [
  makeAdvance({ id: 'adv-1', employeeId: 'emp-2', employeeName: 'أحمد عبدالله الحربي', amount: 1000, date: d(45), reason: 'ظرف خاص', paymentMethod: 'cash', deductFromSalary: true, status: 'open', createdAt: d(45) }),
  makeAdvance({ id: 'adv-2', employeeId: 'emp-3', employeeName: 'محمد علي أحمد', amount: 500, date: d(30), reason: 'إيجار', paymentMethod: 'bank', deductFromSalary: true, status: 'open', createdAt: d(30) }),
  makeAdvance({ id: 'adv-3', employeeId: 'emp-4', employeeName: 'عبدالله سعد القحطاني', amount: 1500, date: d(60), reason: 'زواج', paymentMethod: 'transfer', deductFromSalary: true, status: 'deducted', createdAt: d(60) }),
  makeAdvance({ id: 'adv-4', employeeId: 'emp-5', employeeName: 'فهد ناصر الدوسري', amount: 800, date: d(20), reason: 'علاج', paymentMethod: 'cash', deductFromSalary: true, status: 'open', createdAt: d(20) }),
  makeAdvance({ id: 'adv-5', employeeId: 'emp-6', employeeName: 'منصور حمود الشمري', amount: 600, date: d(15), reason: 'عدة', paymentMethod: 'cash', deductFromSalary: true, status: 'open', createdAt: d(15) }),
  makeAdvance({ id: 'adv-6', employeeId: 'emp-1', employeeName: 'خالد محمد السلمي', amount: 2000, date: d(90), reason: 'سفر', paymentMethod: 'bank', deductFromSalary: true, status: 'paid', createdAt: d(90) }),
  makeAdvance({ id: 'adv-7', employeeId: 'emp-8', employeeName: 'طارق علي الشهراني', amount: 400, date: d(10), reason: 'طارق', paymentMethod: 'cash', deductFromSalary: true, status: 'open', createdAt: d(10) }),
  makeAdvance({ id: 'adv-8', employeeId: 'emp-3', employeeName: 'محمد علي أحمد', amount: 300, date: d(75), reason: 'طوارئ', paymentMethod: 'cash', deductFromSalary: true, status: 'deducted', createdAt: d(75) }),
  makeAdvance({ id: 'adv-9', employeeId: 'emp-2', employeeName: 'أحمد عبدالله الحربي', amount: 700, date: d(120), reason: 'تجديد إقامة', paymentMethod: 'bank', deductFromSalary: true, status: 'paid', createdAt: d(120) }),
  makeAdvance({ id: 'adv-10', employeeId: 'emp-5', employeeName: 'فهد ناصر الدوسري', amount: 500, date: d(50), reason: 'إصلاح سيارة', paymentMethod: 'transfer', deductFromSalary: false, status: 'open', createdAt: d(50) }),
];

function makeSalaryPayment(overrides: Partial<SalaryPayment> = {}): SalaryPayment {
  return {
    id: '',
    employeeId: '',
    employeeName: '',
    month: '',
    baseSalary: 0,
    advancesDeducted: 0,
    otherDeductions: 0,
    netSalary: 0,
    paymentMethod: 'cash',
    paidAt: '',
    notes: '',
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

export const mockSalaryPayments: SalaryPayment[] = [
  makeSalaryPayment({ id: 'sal-1', employeeId: 'emp-1', employeeName: 'خالد محمد السلمي', month: '2026-04', baseSalary: 5000, advancesDeducted: 0, otherDeductions: 0, netSalary: 5000, paymentMethod: 'bank', paidAt: d(5), createdAt: d(5) }),
  makeSalaryPayment({ id: 'sal-2', employeeId: 'emp-2', employeeName: 'أحمد عبدالله الحربي', month: '2026-04', baseSalary: 3500, advancesDeducted: 0, otherDeductions: 0, netSalary: 3500, paymentMethod: 'cash', paidAt: d(5), createdAt: d(5) }),
  makeSalaryPayment({ id: 'sal-3', employeeId: 'emp-3', employeeName: 'محمد علي أحمد', month: '2026-04', baseSalary: 3000, advancesDeducted: 300, otherDeductions: 0, netSalary: 2700, paymentMethod: 'bank', paidAt: d(5), createdAt: d(5) }),
  makeSalaryPayment({ id: 'sal-4', employeeId: 'emp-4', employeeName: 'عبدالله سعد القحطاني', month: '2026-04', baseSalary: 3800, advancesDeducted: 1500, otherDeductions: 0, netSalary: 2300, paymentMethod: 'transfer', paidAt: d(5), createdAt: d(5) }),
  makeSalaryPayment({ id: 'sal-5', employeeId: 'emp-5', employeeName: 'فهد ناصر الدوسري', month: '2026-04', baseSalary: 3200, advancesDeducted: 0, otherDeductions: 0, netSalary: 3200, paymentMethod: 'cash', paidAt: d(5), createdAt: d(5) }),
  makeSalaryPayment({ id: 'sal-6', employeeId: 'emp-6', employeeName: 'منصور حمود الشمري', month: '2026-04', baseSalary: 2800, advancesDeducted: 0, otherDeductions: 0, netSalary: 2800, paymentMethod: 'cash', paidAt: d(5), createdAt: d(5) }),
  makeSalaryPayment({ id: 'sal-7', employeeId: 'emp-8', employeeName: 'طارق علي الشهراني', month: '2026-04', baseSalary: 2600, advancesDeducted: 0, otherDeductions: 0, netSalary: 2600, paymentMethod: 'bank', paidAt: d(5), createdAt: d(5) }),
  makeSalaryPayment({ id: 'sal-8', employeeId: 'emp-1', employeeName: 'خالد محمد السلمي', month: '2026-03', baseSalary: 5000, advancesDeducted: 2000, otherDeductions: 0, netSalary: 3000, paymentMethod: 'bank', paidAt: d(35), createdAt: d(35) }),
];

const employees: Employee[] = [...mockEmployees];
const advances: EmployeeAdvance[] = [...mockAdvances];
const salaryPayments: SalaryPayment[] = [...mockSalaryPayments];

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
