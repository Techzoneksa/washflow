'use client';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
  hideOnMobile?: boolean;
  sortable?: boolean;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  loading?: boolean;
  mobileCard?: (item: T) => React.ReactNode;
  className?: string;
}

export default function Table<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  emptyMessage = 'لا توجد بيانات',
  loading = false,
  mobileCard,
  className,
}: TableProps<T>) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 bg-neutral-100 rounded-md animate-pulse" />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table */}
      <div className={cn('hidden md:block overflow-x-auto', className)}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-default">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider',
                    col.hideOnMobile && 'hidden lg:table-cell',
                    col.className
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-default">
            {data.map((item) => (
              <tr
                key={keyExtractor(item)}
                className={cn(
                  'hover:bg-bg-hover transition-colors',
                  onRowClick && 'cursor-pointer'
                )}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      'px-4 py-3 text-sm text-text-primary',
                      col.hideOnMobile && 'hidden lg:table-cell',
                      col.className
                    )}
                  >
                    {col.render ? col.render(item) : (item as Record<string, unknown>)[col.key] as React.ReactNode}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {data.map((item) => (
          <div
            key={keyExtractor(item)}
            className={cn(
              'bg-bg-surface border border-border-default rounded-card p-4',
              onRowClick && 'cursor-pointer'
            )}
            onClick={() => onRowClick?.(item)}
          >
            {mobileCard ? (
              mobileCard(item)
            ) : (
              <div className="space-y-2">
                {columns.map((col) => (
                  <div key={col.key} className="flex items-center justify-between">
                    <span className="text-xs text-text-secondary">{col.header}</span>
                    <span className="text-sm font-medium text-text-primary">
                      {col.render ? col.render(item) : (item as Record<string, unknown>)[col.key] as React.ReactNode}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3 px-1">
      <p className="text-sm text-text-secondary">
        الصفحة {currentPage} من {totalPages}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-2 rounded-md hover:bg-bg-hover disabled:text-text-disabled disabled:cursor-not-allowed"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-2 rounded-md hover:bg-bg-hover disabled:text-text-disabled disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
