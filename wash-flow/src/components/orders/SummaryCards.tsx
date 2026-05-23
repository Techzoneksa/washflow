'use client';
import Card, { CardTitle } from '@/components/ui/Card';
import { ClipboardList, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';

interface OrdersSummaryData {
  total: number;
  completed: number;
  cancelled: number;
  refunded: number;
  totalRevenue: number;
}

export default function OrdersSummaryCards({ data }: { data: OrdersSummaryData }) {
  const cards = [
    {
      label: 'إجمالي الطلبات',
      value: data.total,
      icon: ClipboardList,
      color: 'text-primary-500',
      bg: 'bg-primary-50',
    },
    {
      label: 'مكتملة',
      value: data.completed,
      icon: CheckCircle2,
      color: 'text-success-500',
      bg: 'bg-success-50',
    },
    {
      label: 'ملغية',
      value: data.cancelled,
      icon: XCircle,
      color: 'text-danger-500',
      bg: 'bg-danger-50',
    },
    {
      label: 'مستردة',
      value: data.refunded,
      icon: RotateCcw,
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
                <p className={`text-lg font-bold ${card.color} tabular-nums`}>
                  {typeof card.value === 'number' && card.label !== 'إجمالي الطلبات' && card.value === 0
                    ? '0'
                    : card.value}
                </p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
