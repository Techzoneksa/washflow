import type { UserRole } from '@/types';

export function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    owner: 'مالك', manager: 'مدير', accountant: 'محاسب', cashier: 'كاشير',
  };
  return labels[role];
}
