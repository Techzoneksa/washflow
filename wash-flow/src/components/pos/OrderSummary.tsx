'use client';
import type { TaxCalculation } from '@/lib/mock-pos';
import { formatCurrency } from '@/lib/utils';

interface OrderSummaryProps {
  tax: TaxCalculation;
}

export default function OrderSummary({ tax }: OrderSummaryProps) {
  return (
    <div className="space-y-1.5 text-sm">
      <div className="flex items-center justify-between text-text-secondary">
        <span>الإجمالي</span>
        <span className="tabular-nums">{formatCurrency(tax.total)}</span>
      </div>
    </div>
  );
}
