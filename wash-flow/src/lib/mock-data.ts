import type { DashboardStats, Service, Order, Expense, Supplier, Employee, User, NavItem } from '../types';

export const mockUser: User = {
  id: '1',
  name: 'أحمد الحربي',
  role: 'manager',
};

export const mockStats: DashboardStats = {
  todaySales: 1250,
  ordersCount: 38,
  expenses: 320,
  netToday: 930,
  cash: 750,
  card: 500,
};

export const mockServices: Service[] = [
  { id: 's1', name: 'سيارة صغيرة', price: 25, category: 'غسيل', active: true },
  { id: 's2', name: 'سيارة كبيرة', price: 35, category: 'غسيل', active: true },
  { id: 's3', name: 'دينا', price: 60, category: 'غسيل', active: true },
  { id: 's4', name: 'غسيل داخلي', price: 20, category: 'غسيل داخلي', active: true },
  { id: 's5', name: 'غسيل خارجي', price: 25, category: 'غسيل خارجي', active: true },
  { id: 's6', name: 'داخلي/خارجي', price: 45, category: 'غسيل شامل', active: true },
  { id: 's7', name: 'تلميع إطارات', price: 10, category: 'إضافات', active: true },
  { id: 's8', name: 'تعطير السيارة', price: 15, category: 'إضافات', active: true },
];

export const mockOrders: Order[] = [
  { id: 'ORD-001', services: ['سيارة صغيرة', 'غسيل داخلي'], total: 45, status: 'completed', paymentStatus: 'paid', paymentMethod: 'cash', createdAt: '2026-05-23T09:15:00' },
  { id: 'ORD-002', services: ['سيارة كبيرة'], total: 35, status: 'in-progress', paymentStatus: 'paid', paymentMethod: 'card', createdAt: '2026-05-23T10:30:00' },
  { id: 'ORD-003', services: ['دينا', 'تلميع إطارات'], total: 70, status: 'new', paymentStatus: 'unpaid', paymentMethod: undefined, createdAt: '2026-05-23T11:00:00' },
  { id: 'ORD-004', services: ['داخلي/خارجي'], total: 45, status: 'completed', paymentStatus: 'paid', paymentMethod: 'cash', createdAt: '2026-05-23T08:45:00' },
  { id: 'ORD-005', services: ['سيارة كبيرة', 'تعطير السيارة'], total: 50, status: 'cancelled', paymentStatus: 'unpaid', paymentMethod: undefined, createdAt: '2026-05-23T07:30:00' },
  { id: 'ORD-006', services: ['سيارة صغيرة'], total: 25, status: 'completed', paymentStatus: 'paid', paymentMethod: 'cash', createdAt: '2026-05-22T16:20:00' },
  { id: 'ORD-007', services: ['غسيل خارجي', 'تلميع إطارات'], total: 35, status: 'completed', paymentStatus: 'partial', paymentMethod: 'card', createdAt: '2026-05-22T14:10:00' },
  { id: 'ORD-008', services: ['سيارة صغيرة', 'داخلي/خارجي'], total: 70, status: 'completed', paymentStatus: 'paid', paymentMethod: 'transfer', createdAt: '2026-05-22T11:25:00' },
];

export const mockExpenses: Expense[] = [
  { id: 'e1', description: 'شراء مواد تنظيف', amount: 150, category: 'مستلزمات', date: '2026-05-23', paidBy: 'أحمد' },
  { id: 'e2', description: 'فواتير كهرباء', amount: 80, category: 'خدمات', date: '2026-05-23', paidBy: 'أحمد' },
  { id: 'e3', description: 'صيانة معدات', amount: 90, category: 'صيانة', date: '2026-05-22', paidBy: 'خالد' },
  { id: 'e4', description: 'مياه', amount: 50, category: 'خدمات', date: '2026-05-22', paidBy: 'أحمد' },
];

export const mockSuppliers: Supplier[] = [
  { id: 'sp1', name: 'مؤسسة النظافة المتكاملة', phone: '0551234567', balance: 1200, status: 'active' },
  { id: 'sp2', name: 'شركة الكيماويات الحديثة', phone: '0557654321', balance: 0, status: 'active' },
  { id: 'sp3', name: 'مورد قطع الغيار', phone: '0561112233', balance: 450, status: 'inactive' },
];

export const mockEmployees: Employee[] = [
  { id: 'emp1', name: 'خالد السلمي', role: 'فني غسيل', salary: 2500, status: 'active', advances: 200 },
  { id: 'emp2', name: 'نايف الحربي', role: 'فني غسيل', salary: 2500, status: 'active', advances: 0 },
  { id: 'emp3', name: 'سعد القحطاني', role: 'كاشير', salary: 3000, status: 'active', advances: 0 },
  { id: 'emp4', name: 'فيصل الدوسري', role: 'مشرف', salary: 3500, status: 'inactive', advances: 0 },
];

export const navigationItems: NavItem[] = [
  { label: 'لوحة التحكم', icon: 'LayoutDashboard', href: '/dashboard', roles: ['owner', 'manager', 'accountant'] },
  { label: 'نقطة البيع', icon: 'ShoppingCart', href: '/pos', roles: ['owner', 'manager', 'cashier'] },
  { label: 'الطلبات', icon: 'ClipboardList', href: '/orders', roles: ['owner', 'manager', 'cashier'] },
  { label: 'الخدمات', icon: 'Wrench', href: '/services', roles: ['owner', 'manager'] },
  { label: 'المصاريف', icon: 'Wallet', href: '/expenses', roles: ['owner', 'manager', 'accountant'] },
  { label: 'الموردين', icon: 'Truck', href: '/suppliers', roles: ['owner', 'manager', 'accountant'] },
  { label: 'المشتريات', icon: 'Package', href: '/purchases', roles: ['owner', 'manager', 'accountant'] },
  { label: 'العمالة', icon: 'Users', href: '/employees', roles: ['owner', 'manager'] },
  { label: 'الرواتب والسلف', icon: 'Banknote', href: '/salaries', roles: ['owner', 'accountant'] },
  { label: 'التقارير', icon: 'BarChart3', href: '/reports', roles: ['owner', 'manager', 'accountant'] },
  { label: 'الإعدادات', icon: 'Settings', href: '/settings', roles: ['owner'] },
  { label: 'زاتكا', icon: 'Receipt', href: '/zatca', roles: ['owner', 'accountant'] },
];

export const cashierNavItems: NavItem[] = [
  { label: 'الرئيسية', icon: 'LayoutDashboard', href: '/dashboard', roles: ['cashier'] },
  { label: 'نقطة البيع', icon: 'ShoppingCart', href: '/pos', roles: ['cashier'] },
  { label: 'الطلبات', icon: 'ClipboardList', href: '/orders', roles: ['cashier'] },
  { label: 'الفواتير', icon: 'FileText', href: '/invoices', roles: ['cashier'] },
  { label: 'المزيد', icon: 'MoreHorizontal', href: '#', roles: ['cashier'] },
];

export const mobileNavItems = [
  { label: 'الرئيسية', icon: 'LayoutDashboard', href: '/dashboard' },
  { label: 'POS', icon: 'ShoppingCart', href: '/pos' },
  { label: 'الطلبات', icon: 'ClipboardList', href: '/orders' },
  { label: 'التقارير', icon: 'BarChart3', href: '/reports' },
  { label: 'المزيد', icon: 'MoreHorizontal', href: '/more' },
];
