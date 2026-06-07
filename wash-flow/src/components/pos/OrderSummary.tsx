'use client';
import { Money } from '@/lib/format';

interface TaxSummary {
  total: number;
}

interface OrderSummaryProps {
  tax: TaxSummary;
}

export default function OrderSummary({ tax }: OrderSummaryProps) {
  return (
    <div className="space-y-1.5 text-sm">
      <div className="flex items-center justify-between text-text-secondary">
        <span>الإجمالي</span>
        <span className="tabular-nums"><Money value={tax.total} /></span>
      </div>
    </div>
  );
}
