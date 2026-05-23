'use client';
import Card, { CardTitle } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';
import { FileText, Banknote, Receipt, XCircle } from 'lucide-react';

interface InvoicesSummaryData {
  total: number;
  totalAmount: number;
  totalVat: number;
  cancelled: number;
  paidCount: number;
}

export default function InvoicesSummaryCards({ data }: { data: InvoicesSummaryData }) {
  const cards = [
    {
      label: 'إجمالي الفواتير',
      value: data.total,
      icon: FileText,
      color: 'text-primary-500',
      bg: 'bg-primary-50',
    },
    {
      label: 'إجمالي المبلغ',
      value: formatCurrency(data.totalAmount),
      icon: Banknote,
      color: 'text-success-500',
      bg: 'bg-success-50',
    },
    {
      label: 'إجمالي الضريبة',
      value: formatCurrency(data.totalVat),
      icon: Receipt,
      color: 'text-info-500',
      bg: 'bg-info-50',
    },
    {
      label: 'الفواتير الملغية',
      value: data.cancelled,
      icon: XCircle,
      color: 'text-danger-500',
      bg: 'bg-danger-50',
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
