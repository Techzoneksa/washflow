'use client';
import { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';
import { mockStats, mockServices } from '@/lib/mock-data';
import { ArrowLeft, ClipboardList, ShoppingCart, TrendingUp, DollarSign } from 'lucide-react';
import type { UserRole } from '@/types';

const roles: { label: string; value: UserRole }[] = [
  { label: 'مالك', value: 'owner' },
  { label: 'مدير', value: 'manager' },
  { label: 'محاسب', value: 'accountant' },
  { label: 'كاشير', value: 'cashier' },
];

export default function Home() {
  const [role, setRole] = useState<UserRole>('manager');

  return (
    <AppShell title="واش فلو - المرحلة الأولى" userRole={role} activePath="/">
      {/* Role Switcher */}
      <div className="mb-6">
        <p className="text-sm text-text-secondary mb-2">معاينة حسب الدور:</p>
        <div className="flex flex-wrap gap-2">
          {roles.map((r) => (
            <button
              key={r.value}
              onClick={() => setRole(r.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                role === r.value
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'bg-bg-surface border border-border-default text-text-secondary hover:border-primary-300'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dashboard Preview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card variant="elevated">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-text-secondary">مبيعات اليوم</span>
            <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-primary-500" />
            </div>
          </div>
          <p className="text-xl font-bold text-text-primary">{formatCurrency(mockStats.todaySales)}</p>
        </Card>
        <Card variant="elevated">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-text-secondary">الطلبات</span>
            <div className="w-8 h-8 rounded-lg bg-info-50 flex items-center justify-center">
              <ClipboardList className="h-4 w-4 text-info-500" />
            </div>
          </div>
          <p className="text-xl font-bold text-text-primary">{mockStats.ordersCount}</p>
        </Card>
        <Card variant="elevated">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-text-secondary">المصاريف</span>
            <div className="w-8 h-8 rounded-lg bg-warning-50 flex items-center justify-center">
              <ShoppingCart className="h-4 w-4 text-warning-500" />
            </div>
          </div>
          <p className="text-xl font-bold text-text-primary">{formatCurrency(mockStats.expenses)}</p>
        </Card>
        <Card variant="elevated">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-text-secondary">صافي اليوم</span>
            <div className="w-8 h-8 rounded-lg bg-success-50 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-success-500" />
            </div>
          </div>
          <p className="text-xl font-bold text-success-600">{formatCurrency(mockStats.netToday)}</p>
        </Card>
      </div>

      {/* Services Preview */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>الخدمات</CardTitle>
          <Badge variant="primary">{mockServices.length} خدمة</Badge>
        </CardHeader>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {mockServices.slice(0, 4).map((svc) => (
            <div key={svc.id} className="bg-neutral-50 rounded-lg p-3 text-center">
              <p className="text-sm font-medium text-text-primary">{svc.name}</p>
              <p className="text-sm font-bold text-primary-600">{formatCurrency(svc.price)}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'نقطة البيع', href: '/pos', color: 'bg-primary-500' },
          { label: 'الطلبات', href: '/orders', color: 'bg-info-500' },
          { label: 'التقارير', href: '/reports', color: 'bg-success-500' },
          { label: 'الإعدادات', href: '/settings', color: 'bg-neutral-700' },
        ].map((link) => (
          <a
            key={link.label}
            href={link.href}
            onClick={(e) => e.preventDefault()}
            className={`${link.color} text-white rounded-card p-4 flex items-center justify-between hover:opacity-90 transition-opacity`}
          >
            <span className="text-sm font-semibold">{link.label}</span>
            <ArrowLeft className="h-4 w-4" />
          </a>
        ))}
      </div>

      {/* Preview Pages Links */}
      <Card>
        <CardHeader>
          <CardTitle>صفحات المرحلة الأولى</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'نظام التصميم', href: '/design-system', desc: 'الألوان، الخطوط، المسافات' },
            { label: 'المكونات', href: '/components-preview', desc: 'الأزرار، الحقول، البطاقات' },
            { label: 'التخطيطات', href: '/layout-preview', desc: 'الجوال، التابلت، الويب' },
            { label: 'RTL', href: '/rtl-preview', desc: 'التحقق من الاتجاه' },
          ].map((page) => (
            <a
              key={page.href}
              href={page.href}
              className="bg-neutral-50 rounded-lg p-4 hover:bg-primary-50 hover:border-primary-200 border border-transparent transition-all"
            >
              <p className="text-sm font-semibold text-text-primary">{page.label}</p>
              <p className="text-xs text-text-secondary mt-1">{page.desc}</p>
            </a>
          ))}
        </div>
      </Card>
    </AppShell>
  );
}
