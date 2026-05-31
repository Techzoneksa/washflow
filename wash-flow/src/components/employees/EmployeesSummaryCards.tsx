'use client';
import Card, { CardTitle } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';
import { Users, UserCheck, Wallet, AlertCircle, Coins } from 'lucide-react';

interface EmployeesSummaryData {
  total: number;
  activeCount: number;
  totalSalaries: number;
  openAdvancesTotal: number;
  netSalariesThisMonth: number;
}

export default function EmployeesSummaryCards({ data }: { data: EmployeesSummaryData }) {
  const cards = [
    {
      label: 'إجمالي العمال',
      value: data.total,
      icon: Users,
      color: 'text-primary-500',
      bg: 'bg-primary-50',
    },
    {
      label: 'العمال النشطون',
      value: data.activeCount,
      icon: UserCheck,
      color: 'text-success-500',
      bg: 'bg-success-50',
    },
    {
      label: 'إجمالي الرواتب',
      value: formatCurrency(data.totalSalaries),
      icon: Wallet,
      color: 'text-info-500',
      bg: 'bg-info-50',
    },
    {
      label: 'السلف المفتوحة',
      value: formatCurrency(data.openAdvancesTotal),
      icon: AlertCircle,
      color: 'text-warning-500',
      bg: 'bg-warning-50',
    },
    {
      label: 'صافي الرواتب',
      value: formatCurrency(data.netSalariesThisMonth),
      icon: Coins,
      color: 'text-success-500',
      bg: 'bg-success-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-3">
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
