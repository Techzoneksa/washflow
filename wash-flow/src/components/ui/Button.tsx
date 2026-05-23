'use client';
import { cn } from '@/lib/utils';
import { ButtonVariant, ButtonSize } from '@/types';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-primary-500 text-text-inverse hover:bg-primary-600 active:bg-primary-700 disabled:bg-primary-200',
  secondary: 'bg-neutral-100 text-text-primary hover:bg-neutral-200 active:bg-neutral-300 disabled:bg-neutral-100 disabled:text-text-disabled',
  outline: 'border-2 border-primary-500 text-primary-500 hover:bg-primary-50 active:bg-primary-100 disabled:border-neutral-300 disabled:text-text-disabled',
  ghost: 'text-text-primary hover:bg-bg-hover active:bg-neutral-200 disabled:text-text-disabled',
  danger: 'bg-danger-500 text-text-inverse hover:bg-danger-600 active:bg-danger-700 disabled:bg-danger-200',
  success: 'bg-success-500 text-text-inverse hover:bg-success-600 active:bg-success-700 disabled:bg-success-200',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm gap-1.5 h-9',
  md: 'px-4 py-2 text-sm gap-2 h-10',
  lg: 'px-6 py-3 text-base gap-2.5 h-12',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  icon,
  iconPosition = 'right',
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-semibold rounded-button transition-all duration-150 touch-target',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin shrink-0" />}
      {!loading && icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
      {children && <span className="truncate">{children}</span>}
      {!loading && icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
    </button>
  );
}
