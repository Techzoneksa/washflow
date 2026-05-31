'use client';
import { useState, useMemo } from 'react';
import AppShell from '@/components/layout/AppShell';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import EmptyState from '@/components/ui/EmptyState';
import { useAuthGuard } from '@/lib/route-guards';
import { getStockMovements } from '@/lib/mock-inventory';
import { STOCK_MOVEMENT_TYPE_LABELS } from '@/types/inventory';
import { History, Search } from 'lucide-react';

export default function StockMovementsPage() {
  const { authorized, checking } = useAuthGuard(['owner', 'manager', 'accountant']);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const movements = useMemo(() => getStockMovements(), []);

  const filtered = useMemo(() => {
    return movements.filter(m => {
      if (search && !m.itemName.toLowerCase().includes(search.toLowerCase())) return false;
      if (typeFilter !== 'all' && m.type !== typeFilter) return false;
      return true;
    });
  }, [movements, search, typeFilter]);

  if (checking || !authorized) return null;

  return (
    <AppShell title="حركات المخزون" activePath="/inventory">
      <PageHeader title="حركات المخزون" description="سجل جميع حركات المواد في المخزون" />

      <Card>
        <div className="p-4 pb-0">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="بحث باسم المادة..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full"
                icon={<Search className="h-4 w-4 text-text-tertiary" />}
              />
            </div>
            <div className="w-40">
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'الكل' },
                  { value: 'purchase', label: 'دخول من مشتريات' },
                  { value: 'consumption', label: 'استهلاك تشغيلي' },
                  { value: 'waste', label: 'هدر / تالف' },
                  { value: 'adjustment', label: 'جرد / تسوية' },
                ]}
              />
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={<History className="h-16 w-16" />} title="لا توجد حركات" description="لا توجد حركات مخزون" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-default">
                  <th className="text-right px-4 py-3 font-semibold text-text-primary">المادة</th>
                  <th className="text-right px-4 py-3 font-semibold text-text-primary">نوع الحركة</th>
                  <th className="text-right px-4 py-3 font-semibold text-text-primary">الكمية</th>
                  <th className="text-right px-4 py-3 font-semibold text-text-primary">السبب</th>
                  <th className="text-right px-4 py-3 font-semibold text-text-primary">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => (
                  <tr key={m.id} className="border-b border-border-subtle hover:bg-bg-hover">
                    <td className="px-4 py-3 font-medium text-text-primary">{m.itemName}</td>
                    <td className="px-4 py-3 text-text-secondary">{STOCK_MOVEMENT_TYPE_LABELS[m.type]}</td>
                    <td className="px-4 py-3">
                      <span className={`font-semibold ${m.type === 'purchase' ? 'text-success-500' : 'text-danger-500'}`}>
                        {m.type === 'purchase' ? '+' : '-'}{m.quantity} {m.unit}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{m.reason}</td>
                    <td className="px-4 py-3 text-text-secondary">{new Date(m.createdAt).toLocaleDateString('ar-SA')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </AppShell>
  );
}
