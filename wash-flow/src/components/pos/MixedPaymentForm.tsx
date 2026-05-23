'use client';
import type { MixedPayment } from '@/types/pos';
import { formatCurrency } from '@/lib/utils';
import { Banknote, CreditCard, Landmark, AlertCircle, CheckCircle2 } from 'lucide-react';

interface MixedPaymentFormProps {
  total: number;
  value: MixedPayment;
  onChange: (payment: MixedPayment) => void;
}

export default function MixedPaymentForm({ total, value, onChange }: MixedPaymentFormProps) {
  const totalPaid = (value.cash || 0) + (value.card || 0) + (value.transfer || 0);
  const remaining = total - totalPaid;
  const isMatching = Math.abs(remaining) < 0.01;

  const updateField = (field: keyof MixedPayment, val: string) => {
    const num = parseFloat(val) || 0;
    onChange({ ...value, [field]: Math.max(0, num) });
  };

  return (
    <div className="space-y-3 border-t border-border-default pt-3">
      <p className="text-xs font-semibold text-text-secondary">توزيع الدفع المختلط</p>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Banknote className="h-4 w-4 text-success-600 shrink-0" />
          <span className="text-xs text-text-secondary w-12">نقدي</span>
          <input
            type="number"
            min="0"
            step="0.5"
            value={value.cash || ''}
            onChange={(e) => updateField('cash', e.target.value)}
            placeholder="0"
            className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-border-default bg-bg-surface text-text-primary placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-primary-500 tabular-nums"
          />
          <span className="text-xs text-text-secondary">ر.س</span>
        </div>

        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-info-600 shrink-0" />
          <span className="text-xs text-text-secondary w-12">بطاقة</span>
          <input
            type="number"
            min="0"
            step="0.5"
            value={value.card || ''}
            onChange={(e) => updateField('card', e.target.value)}
            placeholder="0"
            className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-border-default bg-bg-surface text-text-primary placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-primary-500 tabular-nums"
          />
          <span className="text-xs text-text-secondary">ر.س</span>
        </div>

        <div className="flex items-center gap-2">
          <Landmark className="h-4 w-4 text-warning-600 shrink-0" />
          <span className="text-xs text-text-secondary w-12">تحويل</span>
          <input
            type="number"
            min="0"
            step="0.5"
            value={value.transfer || ''}
            onChange={(e) => updateField('transfer', e.target.value)}
            placeholder="0"
            className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-border-default bg-bg-surface text-text-primary placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-primary-500 tabular-nums"
          />
          <span className="text-xs text-text-secondary">ر.س</span>
        </div>
      </div>

      <div className={`flex items-center gap-2 p-2.5 rounded-lg text-sm ${
        isMatching ? 'bg-success-50 text-success-700' : 'bg-danger-50 text-danger-700'
      }`}>
        {isMatching ? (
          <CheckCircle2 className="h-4 w-4 shrink-0" />
        ) : (
          <AlertCircle className="h-4 w-4 shrink-0" />
        )}
        <span className="text-xs">
          {isMatching
            ? `المبلغ مدفوع بالكامل`
            : `المتبقي: ${formatCurrency(remaining)}`}
        </span>
      </div>
    </div>
  );
}
