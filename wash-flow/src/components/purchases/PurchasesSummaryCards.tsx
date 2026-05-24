'use client';
import Card, { CardTitle } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';
import { ShoppingCart, FileText, CheckCircle2, Wallet } from 'lucide-react';

interface PurchasesSummaryData {
  monthTotal: number;
  invoicesCount: number;
  paidCount: number;
  unpaidCount: number;
  totalRemaining: number;
}

export default function PurchasesSummaryCards({ data }: { data: PurchasesSummaryData }) {
  const cards = [
    {
      label: 'مشتريات الشهر',
      value: formatCurrency(data.monthTotal),
      icon: ShoppingCart,
      color: 'text-primary-500',
      bg: 'bg-primary-50',
    },
    {
      label: 'فواتير الشراء',
      value: data.invoicesCount,
      icon: FileText,
      color: 'text-info-500',
      bg: 'bg-info-50',
    },
    {
      label: 'المدفوعة',
      value: data.paidCount,
      icon: CheckCircle2,
      color: 'text-success-500',
      bg: 'bg-success-50',
    },
    {
      label: 'المتبقي للموردين',
      value: formatCurrency(data.totalRemaining),
      icon: Wallet,
      color: 'text-warning-500',
      bg: 'bg-warning-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
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
  );
}
