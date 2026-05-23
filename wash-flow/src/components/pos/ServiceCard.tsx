'use client';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';
import { getServiceIcon } from '@/lib/mock-pos';
import type { WashService } from '@/types/pos';
import { Clock, Plus } from 'lucide-react';

interface ServiceCardProps {
  service: WashService;
  onAdd: () => void;
  added?: boolean;
}

export default function ServiceCard({ service, onAdd, added }: ServiceCardProps) {
  return (
    <button
      onClick={onAdd}
      className={cn(
        'flex flex-col items-center justify-center gap-1.5 p-3 sm:p-4 rounded-xl border-2 transition-all duration-150 text-center min-h-[100px] sm:min-h-[120px] touch-target',
        'hover:border-primary-300 hover:bg-primary-50/50 active:scale-[0.97]',
        added
          ? 'border-primary-400 bg-primary-50 shadow-sm'
          : 'border-border-default bg-bg-surface hover:shadow-sm',
      )}
    >
      <span className="text-2xl sm:text-3xl leading-none">{getServiceIcon(service.icon)}</span>
      <span className="text-xs sm:text-sm font-semibold text-text-primary leading-tight">{service.nameAr}</span>
      {service.price > 0 ? (
        <span className="text-sm sm:text-base font-bold text-primary-600">{formatCurrency(service.price)}</span>
      ) : (
        <span className="text-xs text-text-secondary">متغير</span>
      )}
      <span className="flex items-center gap-1 text-[10px] sm:text-xs text-text-disabled">
        <Clock className="h-3 w-3" />
        {service.duration}
      </span>
      {added && (
        <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-primary-500 text-text-inverse text-[10px] flex items-center justify-center font-bold shadow-sm">
          <Plus className="h-3 w-3" />
        </span>
      )}
    </button>
  );
}
