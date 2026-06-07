'use client';
import AppShell from '@/components/layout/AppShell';
import Card from '@/components/ui/Card';
import { useAuthGuard } from '@/lib/route-guards';
import { Money } from '@/lib/format';
import {
  TrendingUp, ClipboardList, ShoppingCart, DollarSign,
  AlertTriangle, Clock, BarChart3, Wallet, Users,
  Inbox
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

function EmptyStateWidget({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card padding="lg" className="flex flex-col items-center justify-center text-center py-12">
      <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center mb-3">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-text-primary mb-1">{title}</h3>
      <p className="text-xs text-text-secondary">{description}</p>
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

export default function DashboardPage() {
  const { authorized, checking } = useAuthGuard();

  if (checking || !authorized) return null;

  return (
    <AppShell title="لوحة التحكم" activePath="/dashboard" showSearch>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <StatCard
          label="مبيعات اليوم"
          value={<Money value={0} />}
          icon={<TrendingUp className="h-4 w-4" />}
          colorClass="bg-primary-50"
        />
        <StatCard
          label="الطلبات"
          value="0"
          icon={<ClipboardList className="h-4 w-4" />}
          colorClass="bg-info-50"
        />
        <StatCard
          label="المصاريف"
          value={<Money value={0} />}
          icon={<Wallet className="h-4 w-4" />}
          colorClass="bg-warning-50"
        />
        <StatCard
          label="صافي اليوم"
          value={<Money value={0} />}
          icon={<DollarSign className="h-4 w-4" />}
          colorClass="bg-success-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <EmptyStateWidget
            icon={<Inbox className="h-6 w-6 text-text-disabled" />}
            title="لا توجد طلبات بعد"
            description="عند إضافة طلب جديد من نقطة البيع سيظهر هنا"
          />
        </div>

        <div className="flex flex-col gap-4">
          <EmptyStateWidget
            icon={<AlertTriangle className="h-6 w-6 text-text-disabled" />}
            title="لا توجد تنبيهات"
            description="كل شيء يعمل بشكل طبيعي"
          />
          <QuickActionsWidget />
        </div>
      </div>
    </AppShell>
  );
}
