'use client';
import { useState, useMemo } from 'react';
import AppShell from '@/components/layout/AppShell';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import EmptyState from '@/components/ui/EmptyState';
import { useAuthGuard } from '@/lib/route-guards';
import { getWasteEntries } from '@/lib/mock-inventory';
import { Trash2, Search } from 'lucide-react';

export default function WastePage() {
  const { authorized, checking } = useAuthGuard(['owner', 'manager', 'accountant']);
  const [search, setSearch] = useState('');

  const entries = useMemo(() => getWasteEntries(), []);

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

        {filtered.length === 0 ? (
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
