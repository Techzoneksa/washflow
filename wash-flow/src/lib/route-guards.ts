'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSession, isAuthenticated } from '@/lib/mock-auth';
import type { UserRole } from '@/types';

export function useAuthGuard(requiredRoles?: UserRole[]) {
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login');
      return;
    }
    if (requiredRoles) {
      const session = getSession();
      if (!session || !requiredRoles.includes(session.selectedRole)) {
        router.replace('/no-permission');
        return;
      }
    }
  }, [router, requiredRoles]);

  return { authorized: true, checking: false };
}

export function useRedirectByRole() {
  const router = useRouter();

  useEffect(() => {
    const session = getSession();
    if (!session) { router.replace('/login'); return; }
    const role = session.selectedRole;
    if (role === 'cashier') router.replace('/pos');
    else router.replace('/dashboard');
  }, [router]);

  return { redirecting: false };
}
