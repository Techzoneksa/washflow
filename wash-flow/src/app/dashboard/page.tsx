'use client';
import AppShell from '@/components/layout/AppShell';
import Card from '@/components/ui/Card';
import { getSession } from '@/lib/mock-auth';
import { useAuthGuard } from '@/lib/route-guards';
import { mockStats, mockOrders, mockServices } from '@/lib/mock-data';
import { Money, formatMoneyAmount } from '@/lib/format';
import {
  TrendingUp, ClipboardList, ShoppingCart, DollarSign,
  AlertTriangle, Clock, ArrowLeft, Package,
  Receipt, BarChart3, Wallet, Users
} from 'lucide-react';
import { isSetupComplete } from '@/lib/mock-company-settings';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function StatCard({ label, value, icon, colorClass, trend }: {
  label: string; value: string; icon: React.ReactNode; colorClass: string; trend?: string;
}) {
  return (
    <div className="bg-bg-surface border border-border-default rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-text-secondary font-medium">{label}</span>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colorClass}`}>
          {icon}
        </div>
      </div>
      <div className="flex items-end justify-between">
        <p className="text-2xl font-bold text-text-primary tabular-nums">{value}</p>
        {trend && (
          <span className="text-xs text-success-500 flex items-center gap-0.5">
            <TrendingUp className="h-3 w-3" />
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}

function RecentOrdersWidget() {
  const recent = mockOrders.slice(0, 5);
  const statusColors: Record<string, string> = {
    'completed': 'bg-success-50 text-success-600',
    'in-progress': 'bg-info-50 text-info-600',
    'new': 'bg-primary-50 text-primary-600',
    'cancelled': 'bg-danger-50 text-danger-600',
  };
  const statusLabels: Record<string, string> = {
    'completed': 'مكتمل',
    'in-progress': 'قيد العمل',
    'new': 'جديد',
    'cancelled': 'ملغي',
  };

  return (
    <Card padding="none" className="flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-default">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-primary-500" />
          <h3 className="text-sm font-semibold text-text-primary">الطلبات الأخيرة</h3>
        </div>
        <Link href="/orders" className="text-xs text-primary-500 hover:text-primary-600 flex items-center gap-1">
          عرض الكل
          <ArrowLeft className="h-3 w-3" />
        </Link>
      </div>
      <div className="divide-y divide-border-default">
        {recent.map((order) => (
          <div key={order.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-bg-hover transition-colors">
            <div className="flex flex-col gap-0.5 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-text-primary">{order.id}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${statusColors[order.status]}`}>
                  {statusLabels[order.status]}
                </span>
              </div>
              <span className="text-xs text-text-secondary truncate">{order.services.join('، ')}</span>
            </div>
            <div className="flex flex-col items-end gap-0.5 shrink-0">
              <Money value={order.total} className="font-semibold tabular-nums" />
              <span className="text-[10px] text-text-disabled">{order.paymentMethod || '—'}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function AlertsWidget() {
  const lowStock = mockServices.filter(s => s.active && mockServices.indexOf(s) < 3).map(s => s.name);
  const unpaidOrders = mockOrders.filter(o => o.paymentStatus === 'unpaid').length;

  return (
    <Card padding="none" className="flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-default">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-warning-500" />
          <h3 className="text-sm font-semibold text-text-primary">تنبيهات</h3>
        </div>
        <span className="text-xs text-warning-500 font-medium">{lowStock.length + unpaidOrders} تنبيه</span>
      </div>
      <div className="divide-y divide-border-default">
        {unpaidOrders > 0 && (
          <div className="flex items-center gap-3 px-4 py-2.5">
            <div className="w-7 h-7 rounded-lg bg-warning-50 flex items-center justify-center shrink-0">
              <Receipt className="h-4 w-4 text-warning-500" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm text-text-primary">{unpaidOrders} طلب غير مدفوع</span>
              <span className="text-xs text-text-disabled">تحتاج متابعة</span>
            </div>
          </div>
        )}
        {lowStock.slice(0, 2).map((name, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-2.5">
            <div className="w-7 h-7 rounded-lg bg-danger-50 flex items-center justify-center shrink-0">
              <Package className="h-4 w-4 text-danger-500" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm text-text-primary">انخفاض المخزون: {name}</span>
              <span className="text-xs text-text-disabled">أقل من الحد الأدنى</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function QuickActionsWidget() {
  const actions = [
    { label: 'إضافة طلب', href: '/pos', icon: <ShoppingCart className="h-4 w-4" />, color: 'bg-primary-50 text-primary-500' },
    { label: 'عرض التقارير', href: '/reports', icon: <BarChart3 className="h-4 w-4" />, color: 'bg-info-50 text-info-500' },
    { label: 'مصاريف', href: '/expenses', icon: <Wallet className="h-4 w-4" />, color: 'bg-warning-50 text-warning-500' },
    { label: 'العمالة', href: '/employees', icon: <Users className="h-4 w-4" />, color: 'bg-success-50 text-success-500' },
  ];

  return (
    <Card padding="none" className="flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-default">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-text-secondary" />
          <h3 className="text-sm font-semibold text-text-primary">إجراءات سريعة</h3>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 p-3">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="flex items-center gap-2.5 p-2.5 rounded-lg bg-bg-hover hover:bg-neutral-100 transition-colors"
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${action.color}`}>
              {action.icon}
            </div>
            <span className="text-xs font-medium text-text-primary">{action.label}</span>
          </Link>
        ))}
      </div>
    </Card>
  );
}

function SalesOverviewWidget() {
  const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];
  const values = [850, 1200, 950, 1400, 1250];
  const maxVal = Math.max(...values);

  return (
    <Card padding="none" className="flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-default">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary-500" />
          <h3 className="text-sm font-semibold text-text-primary">نظرة عامة المبيعات</h3>
        </div>
        <span className="text-xs text-text-secondary">هذا الأسبوع</span>
      </div>
      <div className="p-4">
        <div className="flex items-end justify-between gap-2 h-24">
          {days.map((day, i) => {
            const height = (values[i] / maxVal) * 100;
            return (
              <div key={day} className="flex flex-col items-center gap-1 flex-1">
                <div className="w-full bg-primary-100 rounded-t-md relative" style={{ height: `${height}%`, minHeight: '8px' }}>
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-primary-400 rounded-t-md transition-all"
                    style={{ height: `${Math.max(height * 0.7, 10)}%` }}
                  />
                </div>
                <span className="text-[10px] text-text-disabled">{day}</span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border-default">
          <span className="text-xs text-text-secondary">المجموع الأسبوعي</span>
          <Money value={values.reduce((a, b) => a + b, 0)} className="tabular-nums" />
        </div>
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { authorized, checking } = useAuthGuard();

  useEffect(() => {
    const session = getSession();
    if (session?.selectedRole === 'owner' && !isSetupComplete()) {
      router.push('/setup/company');
    }
  }, [router]);

  if (checking || !authorized) return null;

  return (
    <AppShell title="لوحة التحكم" activePath="/dashboard" showSearch>
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <StatCard
          label="مبيعات اليوم"
          value={formatMoneyAmount(mockStats.todaySales)}
          icon={<TrendingUp className="h-4 w-4" />}
          colorClass="bg-primary-50"
          trend="+12%"
        />
        <StatCard
          label="الطلبات"
          value={String(mockStats.ordersCount)}
          icon={<ClipboardList className="h-4 w-4" />}
          colorClass="bg-info-50"
        />
        <StatCard
          label="المصاريف"
          value={formatMoneyAmount(mockStats.expenses)}
          icon={<Wallet className="h-4 w-4" />}
          colorClass="bg-warning-50"
        />
        <StatCard
          label="صافي اليوم"
          value={formatMoneyAmount(mockStats.netToday)}
          icon={<DollarSign className="h-4 w-4" />}
          colorClass="bg-success-50"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Recent Orders */}
        <div className="lg:col-span-2">
          <RecentOrdersWidget />
        </div>

        {/* Right: Alerts + Quick Actions */}
        <div className="flex flex-col gap-4">
          <AlertsWidget />
          <QuickActionsWidget />
        </div>
      </div>

      {/* Sales Overview - Full Width */}
      <div className="mt-4">
        <SalesOverviewWidget />
      </div>
    </AppShell>
  );
}
