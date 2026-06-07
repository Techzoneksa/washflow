'use client';
import { cn } from '@/lib/utils';
import type { PaymentMethod } from '@/types/pos';
import { Banknote, CreditCard, ArrowLeftRight } from 'lucide-react';

interface PaymentMethodSelectorProps {
  value: PaymentMethod | null;
  onChange: (method: PaymentMethod) => void;
}

const methods: { id: PaymentMethod; label: string; icon: React.ReactNode }[] = [
  { id: 'cash', label: 'كاش', icon: <Banknote className="h-5 w-5" /> },
  { id: 'network', label: 'شبكة', icon: <CreditCard className="h-5 w-5" /> },
  { id: 'mixed', label: 'تخصيص', icon: <ArrowLeftRight className="h-5 w-5" /> },
];

export default function PaymentMethodSelector({ value, onChange }: PaymentMethodSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {methods.map((method) => (
        <button
          key={method.id}
          onClick={() => onChange(method.id)}
          className={cn(
            'flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition-all text-center touch-target',
            value === method.id
              ? 'border-primary-500 bg-primary-50 text-primary-700'
              : 'border-border-default bg-bg-surface text-text-secondary hover:border-primary-200 hover:text-text-primary',
          )}
        >
          <span className={cn('shrink-0', value === method.id ? 'text-primary-500' : 'text-text-disabled')}>
            {method.icon}
          </span>
          <span className="text-[10px] sm:text-xs font-medium leading-tight">{method.label}</span>
        </button>
      ))}
    </div>
  );
}
