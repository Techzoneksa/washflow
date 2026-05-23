'use client';
import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  description?: string;
}

interface ToastContextType {
  toast: (type: ToastType, message: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const styles: Record<ToastType, string> = {
  success: 'bg-success-50 border-success-200 text-success-800',
  error: 'bg-danger-50 border-danger-200 text-danger-800',
  warning: 'bg-warning-50 border-warning-200 text-warning-800',
  info: 'bg-info-50 border-info-200 text-info-800',
};

const iconColors: Record<ToastType, string> = {
  success: 'text-success-600',
  error: 'text-danger-600',
  warning: 'text-warning-600',
  info: 'text-info-600',
};

function ToastItem({ toast: t, onRemove }: { toast: ToastMessage; onRemove: (id: string) => void }) {
  const Icon = icons[t.type];

  useEffect(() => {
    const timer = setTimeout(() => onRemove(t.id), 4000);
    return () => clearTimeout(timer);
  }, [t.id, onRemove]);

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg border shadow-md animate-slide-down',
        styles[t.type]
      )}
    >
      <Icon className={cn('h-5 w-5 shrink-0 mt-0.5', iconColors[t.type])} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">{t.message}</p>
        {t.description && <p className="text-xs mt-0.5 opacity-80">{t.description}</p>}
      </div>
      <button onClick={() => onRemove(t.id)} className="shrink-0 opacity-60 hover:opacity-100">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: ToastType, message: string, description?: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message, description }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-[90vw] max-w-sm">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

interface InlineAlertProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  className?: string;
}

export function InlineAlert({ type = 'info', title, description, className }: InlineAlertProps) {
  const Icon = icons[type];

  return (
    <div className={cn(
      'flex items-start gap-3 p-4 rounded-lg border',
      styles[type],
      className
    )}>
      <Icon className={cn('h-5 w-5 shrink-0 mt-0.5', iconColors[type])} />
      <div>
        <p className="text-sm font-semibold">{title}</p>
        {description && <p className="text-xs mt-0.5 opacity-80">{description}</p>}
      </div>
    </div>
  );
}
