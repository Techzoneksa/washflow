'use client';
import Card, { CardTitle } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';
import { Truck, CheckCircle2, ShoppingCart, Wallet, TrendingUp } from 'lucide-react';

interface SuppliersSummaryData {
  total: number;
  active: number;
  totalPurchases: number;
  totalBalance: number;
  topSupplier: string;
}

export default function SuppliersSummaryCards({ data }: { data: SuppliersSummaryData }) {
  const cards = [
    {
      label: 'إجمالي الموردين',
      value: data.total,
      icon: Truck,
      color: 'text-primary-500',
      bg: 'bg-primary-50',
    },
    {
      label: 'الموردون النشطون',
      value: data.active,
      icon: CheckCircle2,
      color: 'text-success-500',
      bg: 'bg-success-50',
    },
    {
      label: 'إجمالي المشتريات',
      value: formatCurrency(data.totalPurchases),
      icon: ShoppingCart,
      color: 'text-info-500',
      bg: 'bg-info-50',
    },
    {
      label: 'إجمالي الأرصدة',
      value: formatCurrency(data.totalBalance),
      icon: Wallet,
      color: 'text-warning-500',
      bg: 'bg-warning-50',
    },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} padding="md">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`h-5 w-5 ${card.color}`} />
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-sm font-semibold text-text-primary truncate">{card.label}</CardTitle>
                  <p className={`text-lg font-bold ${card.color} tabular-nums truncate`}>{card.value}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      {data.topSupplier && (
        <div className="flex items-center gap-2 text-sm text-text-secondary mb-3 px-1">
          <TrendingUp className="h-4 w-4 text-primary-500" />
          <span>المورد الأعلى مشتريات: <span className="font-semibold text-text-primary">{data.topSupplier}</span></span>
        </div>
      )}
    </div>
  );
}
