'use client';
import { cn } from '@/lib/utils';
import { Money } from '@/lib/format';
import { getServiceIcon } from '@/lib/mock-pos';
import type { WashService } from '@/types/pos';
import { Clock, Check } from 'lucide-react';

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
        'relative flex flex-col items-center justify-center gap-1 p-2.5 rounded-xl border-2 transition-all duration-150 text-center touch-target',
        'hover:border-primary-300 hover:bg-primary-50/50 active:scale-[0.97]',
        added
          ? 'border-primary-400 bg-primary-50 shadow-sm'
          : 'border-border-default bg-bg-surface hover:shadow-sm',
      )}
    >
      <span className="text-2xl sm:text-3xl leading-none">{getServiceIcon(service.icon)}</span>
      <span className="text-xs sm:text-sm font-semibold text-text-primary leading-tight px-1">{service.nameAr}</span>
      {service.price > 0 ? (
        <span className="text-sm sm:text-base font-bold text-primary-600"><Money value={service.price} /></span>
      ) : (
        <span className="text-[10px] text-text-secondary">متغير</span>
      )}
      <span className="flex items-center gap-0.5 text-[10px] sm:text-xs text-text-disabled">
        <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
        {service.duration}
      </span>
      {added && (
        <div className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-primary-500 text-text-inverse flex items-center justify-center shadow-sm">
          <Check className="h-3 w-3" />
        </div>
      )}
    </button>
  );
}