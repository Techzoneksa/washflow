'use client';
import AppShell from '@/components/layout/AppShell';
import Card, { CardTitle } from '@/components/ui/Card';
import { getSession } from '@/lib/mock-auth';
import { useAuthGuard } from '@/lib/route-guards';
import { mockStats } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, ClipboardList, ShoppingCart, DollarSign, Construction } from 'lucide-react';
import { isSetupComplete } from '@/lib/mock-company-settings';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-bg-surface border border-border-default rounded-card p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-text-secondary">مبيعات اليوم</span>
            <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center"><TrendingUp className="h-4 w-4 text-primary-500" /></div>
          </div>
          <p className="text-xl font-bold text-text-primary">{formatCurrency(mockStats.todaySales)}</p>
        </div>
        <div className="bg-bg-surface border border-border-default rounded-card p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-text-secondary">الطلبات</span>
            <div className="w-8 h-8 rounded-lg bg-info-50 flex items-center justify-center"><ClipboardList className="h-4 w-4 text-info-500" /></div>
          </div>
          <p className="text-xl font-bold text-text-primary">{mockStats.ordersCount}</p>
        </div>
        <div className="bg-bg-surface border border-border-default rounded-card p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-text-secondary">المصاريف</span>
            <div className="w-8 h-8 rounded-lg bg-warning-50 flex items-center justify-center"><ShoppingCart className="h-4 w-4 text-warning-500" /></div>
          </div>
          <p className="text-xl font-bold text-text-primary">{formatCurrency(mockStats.expenses)}</p>
        </div>
        <div className="bg-bg-surface border border-border-default rounded-card p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-text-secondary">صافي اليوم</span>
            <div className="w-8 h-8 rounded-lg bg-success-50 flex items-center justify-center"><DollarSign className="h-4 w-4 text-success-500" /></div>
          </div>
          <p className="text-xl font-bold text-success-600">{formatCurrency(mockStats.netToday)}</p>
        </div>
      </div>

      <Card>
        <div className="flex flex-col items-center py-12 text-center">
          <Construction className="h-12 w-12 text-text-disabled mb-3" />
          <CardTitle>لوحة التحكم قيد التطوير</CardTitle>
          <p className="text-sm text-text-secondary mt-1">سيتم تنفيذ لوحة التحكم المتكاملة في المراحل القادمة</p>
        </div>
      </Card>
    </AppShell>
  );
}
