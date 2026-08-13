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
import { getWasteEntries } from '@/lib/data/inventory';
import type { WasteEntry } from '@/types/inventory';
import { Trash2, Search, RefreshCw } from 'lucide-react';

export default function WastePage() {
  const { authorized, checking } = useAuthGuard(['owner', 'manager', 'accountant']);
  const [search, setSearch] = useState('');
  const [entries, setEntries] = useState<WasteEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const data = await getWasteEntries();
      setEntries(data);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : 'حدث خطأ في تحميل سجلات الهدر');
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  const filtered = useMemo(() => {
    return entries.filter(e => {
      if (search && !e.itemName.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [entries, search]);

  if (checking || !authorized) return null;

  return (
    <AppShell title="الهدر والتالف" activePath="/inventory">
      <PageHeader title="الهدر والتالف" description="سجل المواد التالفة والمهدرة" />

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
          <LoadingState message="جاري تحميل سجلات الهدر..." />
        ) : fetchError ? (
          <div className="p-4">
            <InlineAlert type="error" title="فشل تحميل السجلات" description={fetchError} />
            <div className="flex justify-center mt-4">
              <Button variant="outline" icon={<RefreshCw className="h-4 w-4" />} onClick={refresh}>إعادة المحاولة</Button>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={<Trash2 className="h-16 w-16" />} title="لا توجد سجلات" description="لا توجد سجلات هدر" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-default">
                  <th className="text-right px-4 py-3 font-semibold text-text-primary">المادة</th>
                  <th className="text-right px-4 py-3 font-semibold text-text-primary">الكمية</th>
                  <th className="text-right px-4 py-3 font-semibold text-text-primary">السبب</th>
                  <th className="text-right px-4 py-3 font-semibold text-text-primary">التاريخ</th>
                  <th className="text-right px-4 py-3 font-semibold text-text-primary">ملاحظات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr key={e.id} className="border-b border-border-subtle hover:bg-bg-hover">
                    <td className="px-4 py-3 font-medium text-text-primary">{e.itemName}</td>
                    <td className="px-4 py-3 text-danger-500 font-semibold">{e.quantity} {e.unit}</td>
                    <td className="px-4 py-3 text-text-secondary">{e.reason}</td>
                    <td className="px-4 py-3 text-text-secondary">{new Date(e.createdAt).toLocaleDateString('ar-SA')}</td>
                    <td className="px-4 py-3 text-text-secondary">{e.notes || '-'}</td>
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
