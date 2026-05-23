'use client';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  showBack?: boolean;
  onBack?: () => void;
  className?: string;
}

export default function PageHeader({
  title,
  description,
  actions,
  showBack = false,
  onBack,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6', className)}>
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            onClick={onBack}
            className="p-2 rounded-md hover:bg-bg-hover text-text-secondary"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        )}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary">{title}</h1>
          {description && (
            <p className="text-sm text-text-secondary mt-0.5">{description}</p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-2">{actions}</div>
      )}
    </div>
  );
}
