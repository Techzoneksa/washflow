import type { MockUser, AuthSession, LoginFormData } from '@/types/auth';
import type { UserRole } from '@/types';

export const mockUsers: MockUser[] = [
  { email: 'owner@washflow.sa', password: '123456', name: 'مالك النظام', roles: ['owner'] },
  { email: 'manager@washflow.sa', password: '123456', name: 'مدير التشغيل', roles: ['manager'] },
  { email: 'accountant@washflow.sa', password: '123456', name: 'المحاسب', roles: ['accountant'] },
  { email: 'cashier@washflow.sa', password: '123456', name: 'الكاشير', roles: ['cashier'] },
  { email: 'multi@washflow.sa', password: '123456', name: 'مستخدم متعدد', roles: ['manager', 'accountant'] },
];

export function loginMockUser(data: LoginFormData): { success: boolean; user?: MockUser; error?: string } {
  const user = mockUsers.find((u) => u.email === data.email);
  if (!user) return { success: false, error: 'البريد الإلكتروني غير مسجل' };
  if (user.password !== data.password) return { success: false, error: 'كلمة المرور غير صحيحة' };
  return { success: true, user };
}

export function createSession(user: MockUser, role: UserRole): void {
  const session: AuthSession = { user, selectedRole: role, loggedInAt: new Date().toISOString() };
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('wf_session', JSON.stringify(session));
  }
}

export function getSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem('wf_session');
  if (!raw) return null;
  try { return JSON.parse(raw) as AuthSession; } catch { return null; }
}

export function setMockRole(role: UserRole): void {
  const session = getSession();
  if (session) {
    session.selectedRole = role;
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('wf_session', JSON.stringify(session));
    }
  }
}

export function clearSession(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('wf_session');
  }
}

export function isAuthenticated(): boolean {
  return getSession() !== null;
}

export function hasPermission(requiredRoles: UserRole[]): boolean {
  const session = getSession();
  if (!session) return false;
  return requiredRoles.includes(session.selectedRole);
}

export function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    owner: 'مالك', manager: 'مدير', accountant: 'محاسب', cashier: 'كاشير',
  };
  return labels[role];
}
