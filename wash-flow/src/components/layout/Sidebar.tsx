'use client';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { navigationItems } from '@/lib/mock-data';
import { signOutUser } from '@/lib/supabase/auth';
import type { UserRole } from '@/types';
import * as Icons from 'lucide-react';

interface SidebarProps {
  userRole: UserRole;
  activePath?: string;
  compact?: boolean;
  onClose?: () => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard: Icons.LayoutDashboard,
  ShoppingCart: Icons.ShoppingCart,
  ClipboardList: Icons.ClipboardList,
  Wrench: Icons.Wrench,
  Wallet: Icons.Wallet,
  Truck: Icons.Truck,
  Package: Icons.Package,
  Boxes: Icons.Boxes,
  Users: Icons.Users,
  UserRound: Icons.UserRound,
  Banknote: Icons.Banknote,
  BarChart3: Icons.BarChart3,
  Settings: Icons.Settings,
  Receipt: Icons.Receipt,
  FileText: Icons.FileText,
  LogOut: Icons.LogOut,
};

export default function Sidebar({ userRole, activePath = '/', compact = false, onClose }: SidebarProps) {
  const filteredItems = navigationItems.filter((item) => item.roles.includes(userRole));

  const handleLogout = async () => {
    await signOutUser();
    window.location.href = '/login';
  };

  return (
    <aside
      dir="rtl"
      className={cn(
        'h-full bg-bg-sidebar text-white flex flex-col overflow-hidden transition-all duration-300',
        compact ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className={cn('flex items-center gap-2.5 px-4 h-16 border-b border-white/10 shrink-0', compact && 'justify-center px-0')}>
        <div className="w-9 h-9 rounded-lg bg-primary-500 flex items-center justify-center shrink-0">
          <Icons.Droplets className="h-5 w-5 text-white" />
        </div>
        {!compact && (
          <div>
            <h1 className="text-sm font-bold text-white leading-tight">Wash Flow</h1>
            <p className="text-[10px] text-white/60">إدارة غسيل السيارات</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {filteredItems.map((item) => {
          const IconComp = iconMap[item.icon] || Icons.Circle;
          const isActive = activePath === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => onClose?.()}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all',
                isActive
                  ? 'bg-primary-500/15 text-primary-300 font-medium border-r-2 border-primary-400'
                  : 'text-white/60 hover:text-white hover:bg-white/5',
                compact && 'justify-center px-0'
              )}
              title={compact ? item.label : undefined}
            >
              <IconComp className={cn('shrink-0', compact ? 'h-5 w-5' : 'h-5 w-5')} />
              {!compact && (
                <>
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className="mr-auto bg-danger-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-2 border-t border-white/10">
        <button
          onClick={handleLogout}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/40 hover:text-white hover:bg-white/5 transition-all w-full',
            compact && 'justify-center px-0'
          )}
        >
          <Icons.LogOut className="h-5 w-5 shrink-0" />
          {!compact && <span>تسجيل الخروج</span>}
        </button>
      </div>
    </aside>
  );
}
