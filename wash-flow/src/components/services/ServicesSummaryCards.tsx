'use client';
import Card, { CardTitle } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';
import { Package, CheckCircle2, EyeOff, TrendingUp } from 'lucide-react';

interface ServicesSummaryData {
  total: number;
  active: number;
  hiddenFromPOS: number;
  avgPrice: number;
}

export default function ServicesSummaryCards({ data }: { data: ServicesSummaryData }) {
  const cards = [
    {
      label: 'إجمالي الخدمات',
      value: data.total,
      icon: Package,
      color: 'text-primary-500',
      bg: 'bg-primary-50',
    },
    {
      label: 'الخدمات النشطة',
      value: data.active,
      icon: CheckCircle2,
      color: 'text-success-500',
      bg: 'bg-success-50',
    },
    {
      label: 'مخفي من POS',
      value: data.hiddenFromPOS,
      icon: EyeOff,
      color: 'text-warning-500',
      bg: 'bg-warning-50',
    },
    {
      label: 'متوسط السعر',
      value: formatCurrency(data.avgPrice),
      icon: TrendingUp,
      color: 'text-info-500',
      bg: 'bg-info-50',
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
