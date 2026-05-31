'use client';
import { useState, useMemo } from 'react';
import AppShell from '@/components/layout/AppShell';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import EmptyState from '@/components/ui/EmptyState';
import { useAuthGuard } from '@/lib/route-guards';
import { getStockAdjustments } from '@/lib/mock-inventory';
import { Scale, Search } from 'lucide-react';

export default function StockAdjustmentsPage() {
  const { authorized, checking } = useAuthGuard(['owner', 'manager', 'accountant']);
  const [search, setSearch] = useState('');

  const adjustments = useMemo(() => getStockAdjustments(), []);

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

        {filtered.length === 0 ? (
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
