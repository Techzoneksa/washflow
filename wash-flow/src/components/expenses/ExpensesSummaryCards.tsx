'use client';
import Card, { CardTitle } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';
import { Wallet, CalendarDays, Receipt, TrendingUp, Calculator } from 'lucide-react';

interface ExpensesSummaryData {
  todayTotal: number;
  monthTotal: number;
  count: number;
  topType: string;
  totalVat: number;
}

export default function ExpensesSummaryCards({ data }: { data: ExpensesSummaryData }) {
  const cards = [
    {
      label: 'مصاريف اليوم',
      value: formatCurrency(data.todayTotal),
      icon: CalendarDays,
      color: 'text-primary-500',
      bg: 'bg-primary-50',
    },
    {
      label: 'مصاريف الشهر',
      value: formatCurrency(data.monthTotal),
      icon: Wallet,
      color: 'text-warning-500',
      bg: 'bg-warning-50',
    },
    {
      label: 'عدد المصاريف',
      value: data.count,
      icon: Receipt,
      color: 'text-info-500',
      bg: 'bg-info-50',
    },
    {
      label: 'إجمالي الضريبة',
      value: formatCurrency(data.totalVat),
      icon: Calculator,
      color: 'text-danger-500',
      bg: 'bg-danger-50',
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
      {data.topType && (
        <div className="flex items-center gap-2 text-sm text-text-secondary mb-3 px-1">
          <TrendingUp className="h-4 w-4 text-primary-500" />
          <span>أعلى نوع مصروف: <span className="font-semibold text-text-primary">{data.topType}</span></span>
        </div>
      )}
    </div>
  );
}
