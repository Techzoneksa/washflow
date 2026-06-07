import type { NavItem } from '../types';

export const navigationItems: NavItem[] = [
  { label: 'لوحة التحكم', icon: 'LayoutDashboard', href: '/dashboard', roles: ['owner', 'manager', 'accountant'] },
  { label: 'نقطة البيع', icon: 'ShoppingCart', href: '/pos', roles: ['owner', 'manager', 'cashier'] },
  { label: 'الطلبات', icon: 'ClipboardList', href: '/orders', roles: ['owner', 'manager', 'cashier'] },
  { label: 'الفواتير', icon: 'FileText', href: '/invoices', roles: ['owner', 'manager', 'accountant', 'cashier'] },
  { label: 'العملاء', icon: 'UserRound', href: '/customers', roles: ['owner', 'manager', 'accountant', 'cashier'] },
  { label: 'الخدمات', icon: 'Wrench', href: '/services', roles: ['owner', 'manager'] },
  { label: 'المصاريف', icon: 'Wallet', href: '/expenses', roles: ['owner', 'manager', 'accountant'] },
  { label: 'فواتير الخدمات', icon: 'FileText', href: '/utility-bills', roles: ['owner', 'manager', 'accountant'] },
  { label: 'الموردين', icon: 'Truck', href: '/suppliers', roles: ['owner', 'manager', 'accountant'] },
  { label: 'المشتريات', icon: 'Package', href: '/purchases', roles: ['owner', 'manager', 'accountant'] },
  { label: 'المخزون', icon: 'Boxes', href: '/inventory', roles: ['owner', 'manager', 'accountant'] },
  { label: 'العمالة', icon: 'Users', href: '/employees', roles: ['owner', 'manager'] },
  { label: 'الرواتب والسلف', icon: 'Banknote', href: '/salaries', roles: ['owner', 'accountant'] },
  { label: 'التقارير', icon: 'BarChart3', href: '/reports', roles: ['owner', 'manager', 'accountant'] },
  { label: 'الإعدادات', icon: 'Settings', href: '/settings', roles: ['owner', 'manager'] },
  { label: 'المستخدمين والصلاحيات', icon: 'Users', href: '/settings/users', roles: ['owner'] },
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
  { label: 'الفواتير', icon: 'FileText', href: '/invoices' },
  { label: 'المزيد', icon: 'MoreHorizontal', href: '/more' },
];
