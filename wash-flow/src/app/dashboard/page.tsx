'use client';
import { useState, useEffect } from 'react';
import AppShell from '@/components/layout/AppShell';
import Card, { CardTitle } from '@/components/ui/Card';
import { useAuthGuard } from '@/lib/route-guards';
import { Money } from '@/lib/format';
import { getDashboardData, type ConsumptionDashboardData } from '@/lib/data/dashboard';
import {
  TrendingUp, ClipboardList, ShoppingCart, DollarSign,
  AlertTriangle, Clock, BarChart3, Wallet, Users,
  Package
} from 'lucide-react';
import Link from 'next/link';

function StatCard({ label, value, icon, colorClass }: {
  label: string; value: React.ReactNode; icon: React.ReactNode; colorClass: string;
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
      </div>
    </div>
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

export default function DashboardPage() {
  const { authorized, checking } = useAuthGuard();
  const [data, setData] = useState<ConsumptionDashboardData | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!authorized || checking) return;
    getDashboardData().then((d) => {
      setData(d);
      setLoadingData(false);
    });
  }, [authorized, checking]);

  if (checking || !authorized) return null;

  const netToday = data ? data.todayRevenue - data.todayExpenses : 0;

  return (
    <AppShell title="لوحة التحكم" activePath="/dashboard" showSearch>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <StatCard
          label="مبيعات اليوم"
          value={loadingData ? '—' : <Money value={data?.todayRevenue || 0} />}
          icon={<TrendingUp className="h-4 w-4" />}
          colorClass="bg-primary-50"
        />
        <StatCard
          label="الطلبات"
          value={loadingData ? '—' : String(data?.todayOrders || 0)}
          icon={<ClipboardList className="h-4 w-4" />}
          colorClass="bg-info-50"
        />
        <StatCard
          label="المصاريف"
          value={loadingData ? '—' : <Money value={data?.todayExpenses || 0} />}
          icon={<Wallet className="h-4 w-4" />}
          colorClass="bg-warning-50"
        />
        <StatCard
          label="صافي اليوم"
          value={loadingData ? '—' : <Money value={netToday} />}
          icon={<DollarSign className="h-4 w-4" />}
          colorClass="bg-success-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Package className="h-4 w-4 text-text-secondary" />
            <CardTitle>استهلاك المواد اليوم</CardTitle>
          </div>
          {loadingData ? (
            <div className="animate-pulse h-8 bg-neutral-100 rounded" />
          ) : (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">إجمالي المستهلك:</span>
                <span className="font-semibold tabular-nums">{data?.todayConsumptionQty || 0} وحدة</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">تكلفة المواد:</span>
                <span className="font-semibold tabular-nums"><Money value={data?.todayConsumptionCost || 0} /></span>
              </div>
              {data?.topConsumedMaterial && (
                <div className="flex justify-between">
                  <span className="text-text-secondary">أكثر مادة استهلاكًا:</span>
                  <span className="font-semibold">{data.topConsumedMaterial.name}</span>
                </div>
              )}
            </div>
          )}
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-text-secondary" />
            <CardTitle>تنبيهات</CardTitle>
          </div>
          {loadingData ? (
            <div className="animate-pulse space-y-2">
              <div className="h-5 bg-neutral-100 rounded" />
              <div className="h-5 bg-neutral-100 rounded" />
            </div>
          ) : (
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">خدمات بلا بطاقة استهلاك:</span>
                <span className={`font-semibold ${(data?.servicesWithoutRecipe || 0) > 0 ? 'text-warning-600' : 'text-success-600'}`}>
                  {data?.servicesWithoutRecipe || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">مواد وصلت للحد الأدنى:</span>
                <span className={`font-semibold ${(data?.lowStockMaterials || 0) > 0 ? 'text-danger-600' : 'text-success-600'}`}>
                  {data?.lowStockMaterials || 0}
                </span>
              </div>
            </div>
          )}
        </Card>

        <div className="flex flex-col gap-4">
          <QuickActionsWidget />
        </div>
      </div>
    </AppShell>
  );
}
