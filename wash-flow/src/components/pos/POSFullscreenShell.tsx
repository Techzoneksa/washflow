'use client';
import POSHeader from './POSHeader';

interface POSFullscreenShellProps {
  children: React.ReactNode;
}

export default function POSFullscreenShell({ children }: POSFullscreenShellProps) {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#F8F9FA]">
      <POSHeader />
      <main className="flex-1 min-h-0 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
