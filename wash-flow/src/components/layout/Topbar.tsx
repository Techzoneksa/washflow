'use client';
import { cn } from '@/lib/utils';
import { Bell, Menu, Search } from 'lucide-react';
import { useState } from 'react';

interface TopbarProps {
  title?: string;
  onMenuClick?: () => void;
  showSearch?: boolean;
  className?: string;
}

export default function Topbar({ title, onMenuClick, showSearch = false, className }: TopbarProps) {
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  return (
    <header className={cn(
      'h-16 bg-bg-topbar border-b border-border-default flex items-center gap-3 px-4 sticky top-0 z-30',
      className
    )}>
      {onMenuClick && (
        <button
          onClick={onMenuClick}
          className="p-2 rounded-md hover:bg-bg-hover text-text-secondary lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
      )}

      {title && (
        <h1 className="text-lg font-semibold text-text-primary truncate">{title}</h1>
      )}

      <div className="flex items-center gap-2 mr-auto">
        {showSearch && (
          <>
            <div className="hidden sm:flex items-center gap-2 bg-neutral-100 rounded-md px-3 py-1.5 text-sm text-text-secondary w-48 lg:w-64">
              <Search className="h-4 w-4 shrink-0" />
              <span>بحث...</span>
            </div>
            <button
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              className="sm:hidden p-2 rounded-md hover:bg-bg-hover text-text-secondary"
            >
              <Search className="h-5 w-5" />
            </button>
          </>
        )}

        <button className="relative p-2 rounded-md hover:bg-bg-hover text-text-secondary">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-danger-500 rounded-full" />
        </button>
      </div>

      {/* Mobile Search Bar */}
      {showMobileSearch && showSearch && (
        <div className="absolute top-16 left-0 right-0 bg-bg-surface border-b border-border-default p-3 animate-slide-down sm:hidden">
          <div className="flex items-center gap-2 bg-neutral-100 rounded-md px-3 py-2">
            <Search className="h-4 w-4 text-text-secondary shrink-0" />
            <input
              type="text"
              placeholder="بحث..."
              className="bg-transparent text-sm text-text-primary outline-none w-full"
              autoFocus
            />
          </div>
        </div>
      )}
    </header>
  );
}
