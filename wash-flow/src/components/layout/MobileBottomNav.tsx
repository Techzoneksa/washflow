'use client';
import { cn } from '@/lib/utils';
import { mobileNavItems } from '@/lib/mock-data';
import * as Icons from 'lucide-react';

interface MobileBottomNavProps {
  activePath?: string;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard: Icons.LayoutDashboard,
  ShoppingCart: Icons.ShoppingCart,
  ClipboardList: Icons.ClipboardList,
  BarChart3: Icons.BarChart3,
  MoreHorizontal: Icons.MoreHorizontal,
};

export default function MobileBottomNav({ activePath = '/' }: MobileBottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-bg-surface border-t border-border-default safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {mobileNavItems.map((item) => {
          const IconComp = iconMap[item.icon] || Icons.Circle;
          const isActive = activePath === item.href;

          return (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => e.preventDefault()}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 min-w-[60px]',
                isActive ? 'text-primary-500' : 'text-text-secondary'
              )}
            >
              <IconComp className={cn('h-5 w-5', isActive && 'fill-primary-500/20')} />
              <span className={cn('text-[10px] font-medium', isActive && 'font-semibold')}>
                {item.label}
              </span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
