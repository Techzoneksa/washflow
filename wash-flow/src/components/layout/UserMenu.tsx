'use client';
import { cn } from '@/lib/utils';
import { User, ChevronDown, LogOut, Settings, UserCircle } from 'lucide-react';
import { useState } from 'react';
import type { UserRole } from '@/types';

interface UserMenuProps {
  userName: string;
  userRole: UserRole;
  compact?: boolean;
}

const roleLabels: Record<UserRole, string> = {
  owner: 'مالك',
  manager: 'مدير',
  accountant: 'محاسب',
  cashier: 'كاشير',
};

const roleColors: Record<UserRole, string> = {
  owner: 'bg-warning-100 text-warning-700',
  manager: 'bg-primary-100 text-primary-700',
  accountant: 'bg-info-100 text-info-700',
  cashier: 'bg-success-100 text-success-700',
};

export default function UserMenu({ userName, userRole, compact = false }: UserMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        className={cn(
          'flex items-center gap-2 p-1.5 rounded-lg hover:bg-bg-hover transition-colors',
          compact && 'justify-center'
        )}
      >
        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
          <User className="h-4 w-4 text-primary-600" />
        </div>
        {!compact && (
          <div className="text-right">
            <p className="text-sm font-medium text-text-primary leading-tight">{userName}</p>
            <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full font-medium', roleColors[userRole])}>
              {roleLabels[userRole]}
            </span>
          </div>
        )}
        {!compact && <ChevronDown className="h-4 w-4 text-text-secondary" />}
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-bg-surface border border-border-default rounded-lg shadow-lg animate-slide-down z-50">
          <div className="p-3 border-b border-border-default">
            <p className="text-sm font-medium text-text-primary">{userName}</p>
            <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium inline-block mt-1', roleColors[userRole])}>
              {roleLabels[userRole]}
            </span>
          </div>
          <div className="p-1">
            <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-text-primary hover:bg-bg-hover rounded-md">
              <UserCircle className="h-4 w-4" />
              الملف الشخصي
            </button>
            <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-text-primary hover:bg-bg-hover rounded-md">
              <Settings className="h-4 w-4" />
              الإعدادات
            </button>
          </div>
          <div className="border-t border-border-default p-1">
            <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-danger-600 hover:bg-danger-50 rounded-md">
              <LogOut className="h-4 w-4" />
              تسجيل الخروج
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
