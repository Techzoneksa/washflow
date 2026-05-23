'use client';
import type { CartItem as CartItemType } from '@/types/pos';
import { formatCurrency } from '@/lib/utils';
import { Minus, Plus, Trash2 } from 'lucide-react';

interface CartItemProps {
  item: CartItemType;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
}

export default function CartItem({ item, onIncrease, onDecrease, onRemove }: CartItemProps) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-border-default last:border-b-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary truncate">{item.nameAr}</p>
        <p className="text-xs text-text-secondary">{formatCurrency(item.price)}</p>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={onDecrease}
          className="w-7 h-7 rounded-full border border-border-default flex items-center justify-center text-text-secondary hover:bg-bg-hover hover:text-text-primary transition-colors touch-target"
        >
          <Minus className="h-3 w-3" />
        </button>
        <span className="w-8 text-center text-sm font-semibold text-text-primary tabular-nums">
          {item.quantity}
        </span>
        <button
          onClick={onIncrease}
          className="w-7 h-7 rounded-full border border-border-default flex items-center justify-center text-text-secondary hover:bg-bg-hover hover:text-text-primary transition-colors touch-target"
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>

      <div className="text-left min-w-[60px]">
        <p className="text-sm font-bold text-text-primary tabular-nums">{formatCurrency(item.total)}</p>
      </div>

      <button
        onClick={onRemove}
        className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-danger-400 hover:bg-danger-50 hover:text-danger-600 transition-colors touch-target"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
