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
        <span>المجموع الفرعي</span>
        <span className="tabular-nums">{formatCurrency(tax.subtotal)}</span>
      </div>
      <div className="flex items-center justify-between text-text-secondary">
        <span>الضريبة ({tax.vatRate}%)</span>
        <span className="tabular-nums">{formatCurrency(tax.vatAmount)}</span>
      </div>
      <div className="flex items-center justify-between pt-1.5 border-t border-border-default text-base font-bold text-text-primary">
        <span>الإجمالي</span>
        <span className="tabular-nums">{formatCurrency(tax.total)}</span>
      </div>
      {tax.priceIncludesTax && (
        <p className="text-[10px] text-text-disabled text-left">الأسعار شاملة الضريبة</p>
      )}
    </div>
  );
}
