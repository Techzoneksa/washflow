'use client';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import MobileBottomNav from './MobileBottomNav';
import type { UserRole } from '@/types';

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  userRole?: UserRole;
  activePath?: string;
  showSearch?: boolean;
}

export default function AppShell({
  children,
  title,
  userRole: propRole = 'manager',
  activePath = '/',
  showSearch = false,
}: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCompact, setSidebarCompact] = useState(false);

  const userRole = propRole;

  return (
    <div className="h-screen flex overflow-hidden bg-bg-main">
      <div className="hidden lg:flex h-full shrink-0">
        <Sidebar userRole={userRole} activePath={activePath} compact={sidebarCompact} />
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-overlay animate-fade-in" onClick={() => setSidebarOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-72 animate-slide-in-right">
            <Sidebar userRole={userRole} activePath={activePath} onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title={title} onMenuClick={() => setSidebarOpen(true)} showSearch={showSearch} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      <div className="lg:hidden">
        <MobileBottomNav activePath={activePath} />
      </div>

      <button
        onClick={() => setSidebarCompact(!sidebarCompact)}
        className="hidden lg:flex fixed right-64 bottom-4 w-8 h-8 rounded-full bg-bg-surface border border-border-default shadow-md items-center justify-center text-text-secondary hover:text-text-primary transition-all z-30"
        style={{ right: sidebarCompact ? '4rem' : '16rem' }}
      >
        <svg className={cn('h-4 w-4 transition-transform', sidebarCompact && 'rotate-180')} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    </div>
  );
}
