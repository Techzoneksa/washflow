'use client';
import { Minus, Plus, X } from 'lucide-react';
import type { CartItem as CartItemType } from '@/types/pos';
import { Money } from '@/lib/format';

interface CartItemProps {
  item: CartItemType;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
}

export default function CartItem({ item, onIncrease, onDecrease, onRemove }: CartItemProps) {
  return (
    <div className="flex items-center gap-3 p-2.5 rounded-lg bg-bg-hover">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary truncate">{item.nameAr}</p>
        <p className="text-xs text-primary-500 font-semibold"><Money value={item.total} /></p>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          onClick={onDecrease}
          className="w-7 h-7 rounded-md bg-bg-surface border border-border-default flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-primary-300 transition-colors"
        >
          <Minus className="h-3 w-3" />
        </button>
        <span className="text-sm font-semibold text-text-primary w-6 text-center tabular-nums">
          {item.quantity}
        </span>
        <button
          onClick={onIncrease}
          className="w-7 h-7 rounded-md bg-primary-500 text-text-inverse flex items-center justify-center hover:bg-primary-600 transition-colors"
        >
          <Plus className="h-3 w-3" />
        </button>
        <button
          onClick={onRemove}
          className="w-7 h-7 rounded-md flex items-center justify-center text-danger-400 hover:text-danger-600 hover:bg-danger-50 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}