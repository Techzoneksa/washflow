'use client';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { formatMoneyAmount } from '@/lib/format';
import type { PurchaseItemForm } from './PurchaseItemsTable';

interface PurchaseSummaryProps {
  items: PurchaseItemForm[];
  paidAmount: number;
  total: number;
  className?: string;
}

export default function PurchaseSummary({ items, paidAmount, total, className }: PurchaseSummaryProps) {
  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    [items]
  );

  const discountTotal = useMemo(
    () => items.reduce((sum, item) => sum + item.discount, 0),
    [items]
  );

  const remaining = Math.max(0, total - paidAmount);

  const rows = [
    { label: 'المجموع قبل الخصم', value: subtotal, highlight: false },
    { label: 'الخصم', value: -discountTotal, highlight: false, isNegative: true },
    { label: 'المجموع النهائي', value: total, highlight: true },
    { label: 'المدفوع', value: paidAmount, highlight: false },
    { label: 'المتبقي', value: remaining, highlight: remaining > 0, isDanger: remaining > 0 },
  ];

  return (
    <div className={cn('bg-bg-surface border border-border-default rounded-lg p-4', className)}>
      <h3 className="text-sm font-semibold text-text-primary mb-3">ملخص المبالغ</h3>
      <div className="space-y-2">
        {rows.map((row) => (
          <div
            key={row.label}
            className={cn(
              'flex items-center justify-between py-1.5',
              row.highlight && 'border-t border-border-default pt-3 mt-1'
            )}
          >
            <span className={cn(
              'text-sm',
              row.isDanger ? 'text-danger-600 font-medium' : row.highlight ? 'text-text-primary font-semibold' : 'text-text-secondary'
            )}>
              {row.label}
            </span>
            <span className={cn(
              'text-sm tabular-nums',
              row.isDanger ? 'text-danger-600 font-bold' : row.highlight ? 'text-text-primary font-bold' : 'text-text-secondary',
              row.isNegative && 'text-danger-500'
            )}>
              {row.isNegative && row.value !== 0 ? '- ' : ''}{formatMoneyAmount(Math.abs(row.value))} <img src="/SR.svg" alt="SR" className="inline-block h-3 w-3" />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
