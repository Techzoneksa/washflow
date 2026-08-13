'use client';
import { useState, useMemo, useEffect, useCallback } from 'react';
import AppShell from '@/components/layout/AppShell';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import EmptyState from '@/components/ui/EmptyState';
import LoadingState from '@/components/ui/LoadingState';
import Button from '@/components/ui/Button';
import { InlineAlert } from '@/components/ui/Toast';
import { useAuthGuard } from '@/lib/route-guards';
import { getStockMovements } from '@/lib/data/inventory';
import type { StockMovement } from '@/types/inventory';
import { STOCK_MOVEMENT_TYPE_LABELS } from '@/types/inventory';
import { History, Search, RefreshCw } from 'lucide-react';

export default function StockMovementsPage() {
  const { authorized, checking } = useAuthGuard(['owner', 'manager', 'accountant']);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const data = await getStockMovements();
      setMovements(data);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : 'حدث خطأ في تحميل الحركات');
      setMovements([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

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

        {loading ? (
          <LoadingState message="جاري تحميل الحركات..." />
        ) : fetchError ? (
          <div className="p-4">
            <InlineAlert type="error" title="فشل تحميل الحركات" description={fetchError} />
            <div className="flex justify-center mt-4">
              <Button variant="outline" icon={<RefreshCw className="h-4 w-4" />} onClick={refresh}>إعادة المحاولة</Button>
            </div>
          </div>
        ) : filtered.length === 0 ? (
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
