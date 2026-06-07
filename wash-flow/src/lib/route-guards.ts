'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, getCurrentProfile } from '@/lib/supabase/auth';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import type { UserRole } from '@/types';

interface AuthGuardResult {
  authorized: boolean;
  checking: boolean;
}

async function checkAuth(requiredRoles?: UserRole[]): Promise<{ authorized: boolean; redirect: string | null }> {
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
