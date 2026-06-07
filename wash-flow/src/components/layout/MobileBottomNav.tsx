'use client';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { mobileNavItems } from '@/lib/navigation';
import * as Icons from 'lucide-react';

interface MobileBottomNavProps {
  activePath?: string;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard: Icons.LayoutDashboard,
  ShoppingCart: Icons.ShoppingCart,
  ClipboardList: Icons.ClipboardList,
  BarChart3: Icons.BarChart3,
  FileText: Icons.FileText,
  MoreHorizontal: Icons.MoreHorizontal,
};

export default function MobileBottomNav({ activePath = '/' }: MobileBottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-bg-surface border-t border-border-default safe-area-bottom">
      <div className="grid grid-cols-5 h-16">
        {mobileNavItems.map((item) => {
          const IconComp = iconMap[item.icon] || Icons.Circle;
          const isActive = activePath === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 transition-colors',
                isActive ? 'text-primary-500' : 'text-text-secondary hover:text-text-primary'
              )}
            >
              <IconComp className={cn('h-5 w-5', isActive && 'fill-primary-500/20')} />
              <span className={cn('text-[10px] font-medium', isActive && 'font-semibold')}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
