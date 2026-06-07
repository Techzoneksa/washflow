import type { UserRole } from '@/types';

export function clearSession(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('wf_session');
  }
}

export function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    owner: 'مالك', manager: 'مدير', accountant: 'محاسب', cashier: 'كاشير',
  };
  return labels[role];
}
