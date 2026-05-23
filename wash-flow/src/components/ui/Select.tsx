'use client';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
  fullWidth?: boolean;
}

export default function Select({
  label,
  error,
  options,
  placeholder = 'اختر...',
  fullWidth = false,
  className,
  id,
  ...props
}: SelectProps) {
  const selectId = id || label?.replace(/\s+/g, '-').toLowerCase();

  return (
    <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-text-primary">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          className={cn(
            'w-full appearance-none rounded-md border border-border-default bg-bg-surface px-4 py-2 text-sm text-text-primary',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            'disabled:bg-bg-disabled disabled:cursor-not-allowed',
            'pl-10 h-10',
            error && 'border-danger-500 focus:ring-danger-500',
            className
          )}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-disabled pointer-events-none">
          <ChevronDown className="h-4 w-4" />
        </span>
      </div>
      {error && <p className="text-xs text-danger-500">{error}</p>}
    </div>
  );
}
