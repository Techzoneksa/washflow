'use client';
import Card, { CardTitle } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';
import { Package, AlertTriangle, XCircle, Coins, Clock } from 'lucide-react';

interface InventorySummaryData {
  total: number;
  lowStock: number;
  outOfStock: number;
  totalValue: number;
  lastMovement: string | null;
}

export default function InventorySummaryCards({ data }: { data: InventorySummaryData }) {
  const cards = [
    {
      label: 'إجمالي المواد',
      value: data.total,
      icon: Package,
      color: 'text-primary-500',
      bg: 'bg-primary-50',
    },
    {
      label: 'مواد منخفضة المخزون',
      value: data.lowStock,
      icon: AlertTriangle,
      color: 'text-warning-500',
      bg: 'bg-warning-50',
    },
    {
      label: 'مواد نفدت',
      value: data.outOfStock,
      icon: XCircle,
      color: 'text-danger-500',
      bg: 'bg-danger-50',
    },
    {
      label: 'قيمة المخزون',
      value: formatCurrency(data.totalValue),
      icon: Coins,
      color: 'text-success-500',
      bg: 'bg-success-50',
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
      {data.lastMovement && (
        <div className="flex items-center gap-2 text-sm text-text-secondary mb-3 px-1">
          <Clock className="h-4 w-4 text-primary-500" />
          <span>آخر حركة: <span className="font-semibold text-text-primary">{new Date(data.lastMovement).toLocaleDateString('ar-SA')}</span></span>
        </div>
      )}
    </div>
  );
}
