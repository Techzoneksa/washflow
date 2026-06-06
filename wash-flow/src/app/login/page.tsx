'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import LoginForm from '@/components/auth/LoginForm';
import { createSession, getSession } from '@/lib/mock-auth';
import { getCurrentProfile, getCurrentUser } from '@/lib/supabase/auth';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import type { UserRole } from '@/types';
import { Droplets } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Check existing Supabase session on mount
    const checkSession = async () => {
      const mockSession = getSession();
      if (mockSession) {
        if (mockSession.selectedRole === 'cashier') router.replace('/pos');
        else router.replace('/dashboard');
        return;
      }
      if (isSupabaseConfigured()) {
        const user = await getCurrentUser();
        if (user) {
          const profile = await getCurrentProfile();
          if (profile) {
            if (profile.role === 'cashier') router.replace('/pos');
            else router.replace('/dashboard');
            return;
          }
        }
      }
      setCheckingSession(false);
    };
    checkSession();
  }, [router]);

  const handleSuccess = async (roles: UserRole[], authSource: 'supabase' | 'mock') => {
    if (authSource === 'supabase') {
      const profile = await getCurrentProfile();
      const role = profile?.role || roles[0];
      if (role === 'cashier') router.push('/pos');
      else router.push('/dashboard');
    } else if (roles.length > 1) {
      sessionStorage.setItem('wf_pending_user', JSON.stringify({
        email: (document.querySelector('input[type="email"]') as HTMLInputElement)?.value,
      }));
      router.push('/select-role');
    } else {
      const email = (document.querySelector('input[type="email"]') as HTMLInputElement)?.value || '';
      createSession({ email, password: '', name: 'مستخدم', roles }, roles[0]);
      if (roles[0] === 'cashier') router.push('/pos');
      else router.push('/dashboard');
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500/5 via-bg-main to-primary-500/5 flex items-center justify-center p-4">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500/5 via-bg-main to-primary-500/5 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-primary-500/25">
            <Droplets className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">واش فلو</h1>
          <p className="text-sm text-text-secondary mt-1">نظام إدارة غسيل السيارات</p>
        </div>
        <div className="bg-bg-surface border border-border-default rounded-2xl shadow-card p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-1">تسجيل الدخول</h2>
          <p className="text-sm text-text-secondary mb-6">أدخل بيانات الدخول للوصول للنظام</p>
          <LoginForm onSuccess={handleSuccess} />
        </div>
      </div>
    </div>
  );
}
