'use client';
import { useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  side?: 'left' | 'right';
}

export default function Drawer({
  open,
  onClose,
  title,
  children,
  side = 'right',
}: DrawerProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [open, handleEscape]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-overlay animate-fade-in"
        onClick={onClose}
      />
      <div
        className={cn(
          'absolute top-0 bottom-0 w-[85vw] max-w-sm bg-bg-surface shadow-modal animate-slide-in-right',
          side === 'left' ? 'left-0' : 'right-0'
        )}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-border-default">
          {title && <h2 className="text-lg font-semibold text-text-primary">{title}</h2>}
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-bg-hover text-text-secondary mr-auto"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4 overflow-y-auto h-[calc(100%-60px)]">{children}</div>
      </div>
    </div>
  );
}
