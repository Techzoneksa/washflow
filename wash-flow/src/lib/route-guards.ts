'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, getCurrentProfile } from '@/lib/supabase/auth';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { getStoredCashierSession } from '@/lib/data/cashier-session';
import type { UserRole } from '@/types';

interface AuthGuardResult {
  authorized: boolean;
  checking: boolean;
}

function checkCashierSession(): boolean {
  const session = getStoredCashierSession();
  return !!session && new Date(session.expiresAt) > new Date();
}

async function checkAuth(requiredRoles?: UserRole[]): Promise<{ authorized: boolean; redirect: string | null }> {
  // Cashier session exists but trying to access admin page → redirect to /pos
  if (checkCashierSession()) {
    if (!requiredRoles || requiredRoles.includes('cashier' as UserRole)) {
      return { authorized: true, redirect: null };
    }
    return { authorized: false, redirect: '/pos' };
  }

  if (!isSupabaseConfigured()) {
    return { authorized: false, redirect: '/login' };
  }

  const user = await getCurrentUser();
  if (!user) {
    return { authorized: false, redirect: '/login' };
  }

  const profile = await getCurrentProfile();
  if (!profile) {
    return { authorized: false, redirect: '/no-permission' };
  }

  if (requiredRoles && !requiredRoles.includes(profile.role)) {
    return { authorized: false, redirect: '/no-permission' };
  }

  return { authorized: true, redirect: null };
}

export function useAuthGuard(requiredRoles?: UserRole[]): AuthGuardResult {
  const router = useRouter();
  const [state, setState] = useState<AuthGuardResult>({ authorized: false, checking: true });

  useEffect(() => {
    let cancelled = false;
    checkAuth(requiredRoles).then((result) => {
      if (cancelled) return;
      if (result.redirect) {
        router.replace(result.redirect);
        setState({ authorized: false, checking: false });
      } else {
        setState({ authorized: true, checking: false });
      }
    });
    return () => { cancelled = true; };
  }, [router, requiredRoles]);

  return state;
}

export function useRedirectByRole() {
  const router = useRouter();

  useEffect(() => {
    const doRedirect = async () => {
      // Check cashier session first
      if (checkCashierSession()) {
        router.replace('/pos');
        return;
      }

      if (!isSupabaseConfigured()) {
        router.replace('/login');
        return;
      }

      const profile = await getCurrentProfile();
      if (profile) {
        if (profile.role === 'cashier') router.replace('/pos');
        else router.replace('/dashboard');
        return;
      }

      router.replace('/login');
    };
    doRedirect();
  }, [router]);

  return { redirecting: false };
}
