'use client';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  fullScreen?: boolean;
  message?: string;
  className?: string;
}

export default function LoadingState({
  fullScreen = false,
  message = 'جاري التحميل...',
  className,
}: LoadingStateProps) {
  const content = (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
      <p className="text-sm text-text-secondary">{message}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-main">
        {content}
      </div>
    );
  }

  return <div className="flex items-center justify-center py-16">{content}</div>;
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse rounded-md bg-neutral-200', className)} />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-bg-surface border border-border-default rounded-card p-4 space-y-3">
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}
