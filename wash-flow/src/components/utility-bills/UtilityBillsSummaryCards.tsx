'use client';
import Card, { CardTitle } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';
import { FileText, AlertCircle, Clock, CalendarDays, DollarSign } from 'lucide-react';

interface UtilityBillsSummaryData {
  totalCount: number;
  unpaidCount: number;
  overdueCount: number;
  dueThisWeek: number;
  monthPaid: number;
}

export default function UtilityBillsSummaryCards({ data }: { data: UtilityBillsSummaryData }) {
  const cards = [
    {
      label: 'إجمالي الفواتير',
      value: data.totalCount,
      icon: FileText,
      color: 'text-primary-500',
      bg: 'bg-primary-50',
    },
    {
      label: 'غير المسددة',
      value: data.unpaidCount,
      icon: Clock,
      color: 'text-warning-500',
      bg: 'bg-warning-50',
    },
    {
      label: 'المتأخرة',
      value: data.overdueCount,
      icon: AlertCircle,
      color: 'text-danger-500',
      bg: 'bg-danger-50',
    },
    {
      label: 'المستحق هذا الأسبوع',
      value: data.dueThisWeek,
      icon: CalendarDays,
      color: 'text-info-500',
      bg: 'bg-info-50',
    },
    {
      label: 'المدفوع هذا الشهر',
      value: formatCurrency(data.monthPaid),
      icon: DollarSign,
      color: 'text-success-500',
      bg: 'bg-success-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
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
