'use client';
import { cn } from '@/lib/utils';
import { InputSize, InputStatus } from '@/types';
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  inputSize?: InputSize;
  inputStatus?: InputStatus;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const sizeStyles: Record<InputSize, string> = {
  sm: 'px-3 py-1.5 text-sm h-9',
  md: 'px-4 py-2 text-sm h-10',
  lg: 'px-4 py-3 text-base h-12',
};

export default function Input({
  label,
  error,
  helperText,
  inputSize = 'md',
  inputStatus = 'default',
  icon,
  iconPosition = 'right',
  fullWidth = false,
  className,
  type: initialType,
  id,
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = initialType === 'password';
  const type = isPassword ? (showPassword ? 'text' : 'password') : initialType;
  const inputId = id || label?.replace(/\s+/g, '-').toLowerCase();

  const borderColor = error
    ? 'border-danger-500 focus:ring-danger-500'
    : inputStatus === 'success'
    ? 'border-success-500 focus:ring-success-500'
    : 'border-border-default focus:ring-primary-500';

  return (
    <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-text-primary">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && iconPosition === 'right' && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-disabled pointer-events-none">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          type={type}
          className={cn(
            'w-full rounded-md border bg-bg-surface text-text-primary placeholder:text-text-disabled transition-all duration-150',
            'focus:outline-none focus:ring-2 focus:border-transparent',
            'disabled:bg-bg-disabled disabled:cursor-not-allowed',
            borderColor,
            sizeStyles[inputSize],
            !!icon && iconPosition === 'right' && 'pr-10',
            !!icon && iconPosition === 'left' && 'pl-10',
            isPassword && 'pl-10',
            className
          )}
          {...props}
        />
        {inputStatus === 'error' && !isPassword && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-danger-500">
            <AlertCircle className="h-4 w-4" />
          </span>
        )}
        {inputStatus === 'success' && !isPassword && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-success-500">
            <CheckCircle2 className="h-4 w-4" />
          </span>
        )}
        {icon && iconPosition === 'left' && !isPassword && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-disabled pointer-events-none">
            {icon}
          </span>
        )}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-disabled hover:text-text-secondary"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-danger-500">{error}</p>}
      {helperText && !error && <p className="text-xs text-text-secondary">{helperText}</p>}
    </div>
  );
}
