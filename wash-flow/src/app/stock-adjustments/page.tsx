'use client';
import { useState, useMemo, useEffect, useCallback } from 'react';
import AppShell from '@/components/layout/AppShell';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import EmptyState from '@/components/ui/EmptyState';
import LoadingState from '@/components/ui/LoadingState';
import Button from '@/components/ui/Button';
import { InlineAlert } from '@/components/ui/Toast';
import { useAuthGuard } from '@/lib/route-guards';
import { getStockAdjustments } from '@/lib/data/inventory';
import type { StockAdjustment } from '@/types/inventory';
import { Scale, Search, RefreshCw } from 'lucide-react';

export default function StockAdjustmentsPage() {
  const { authorized, checking } = useAuthGuard(['owner', 'manager', 'accountant']);
  const [search, setSearch] = useState('');
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const data = await getStockAdjustments();
      setAdjustments(data);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : 'حدث خطأ في تحميل التسويات');
      setAdjustments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  const filtered = useMemo(() => {
    return adjustments.filter(a => {
      if (search && !a.itemName.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [adjustments, search]);

  if (checking || !authorized) return null;

  return (
    <AppShell title="جرد وتسوية المخزون" activePath="/inventory">
      <PageHeader title="جرد وتسوية المخزون" description="سجل عمليات الجرد والتسوية" />

      <Card>
        <div className="p-4 pb-0">
          <div className="max-w-xs">
            <Input
              placeholder="بحث باسم المادة..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full"
              icon={<Search className="h-4 w-4 text-text-tertiary" />}
            />
          </div>
        </div>

        {loading ? (
          <LoadingState message="جاري تحميل التسويات..." />
        ) : fetchError ? (
          <div className="p-4">
            <InlineAlert type="error" title="فشل تحميل التسويات" description={fetchError} />
            <div className="flex justify-center mt-4">
              <Button variant="outline" icon={<RefreshCw className="h-4 w-4" />} onClick={refresh}>إعادة المحاولة</Button>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={<Scale className="h-16 w-16" />} title="لا توجد تسويات" description="لا توجد سجلات تسوية" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-default">
                  <th className="text-right px-4 py-3 font-semibold text-text-primary">المادة</th>
                  <th className="text-right px-4 py-3 font-semibold text-text-primary">النظام</th>
                  <th className="text-right px-4 py-3 font-semibold text-text-primary">الفعلي</th>
                  <th className="text-right px-4 py-3 font-semibold text-text-primary">الفرق</th>
                  <th className="text-right px-4 py-3 font-semibold text-text-primary">السبب</th>
                  <th className="text-right px-4 py-3 font-semibold text-text-primary">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id} className="border-b border-border-subtle hover:bg-bg-hover">
                    <td className="px-4 py-3 font-medium text-text-primary">{a.itemName}</td>
                    <td className="px-4 py-3 text-text-secondary">{a.systemQuantity}</td>
                    <td className="px-4 py-3 text-text-secondary">{a.actualQuantity}</td>
                    <td className="px-4 py-3">
                      <span className={`font-semibold ${a.difference > 0 ? 'text-success-500' : 'text-danger-500'}`}>
                        {a.difference > 0 ? '+' : ''}{a.difference}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{a.reason}</td>
                    <td className="px-4 py-3 text-text-secondary">{new Date(a.createdAt).toLocaleDateString('ar-SA')}</td>
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
