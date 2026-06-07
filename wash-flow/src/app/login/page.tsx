'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import LoginForm from '@/components/auth/LoginForm';
import CashierLoginForm from '@/components/auth/CashierLoginForm';
import { getCurrentProfile, getCurrentUser } from '@/lib/supabase/auth';
import { getStoredCashierSession } from '@/lib/data/cashier-session';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import type { UserRole } from '@/types';
import { Droplets, Monitor } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);
  const [tab, setTab] = useState<'admin' | 'cashier'>('admin');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const checkSession = async () => {
      // Check existing admin session
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
      // Check existing cashier session
      const cashierSession = getStoredCashierSession();
      if (cashierSession && new Date(cashierSession.expiresAt) > new Date()) {
        router.replace('/pos');
        return;
      }
      setCheckingSession(false);
    };
    checkSession();
  }, [router]);

  const handleAdminSuccess = async (role: UserRole) => {
    if (role === 'cashier') router.push('/pos');
    else router.push('/dashboard');
  };

  const handleCashierSuccess = () => {
    router.push('/pos');
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
          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-neutral-100 rounded-xl p-1">
            <button
              onClick={() => setTab('admin')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === 'admin' ? 'bg-white text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Droplets className="h-4 w-4" />
              دخول الإدارة
            </button>
            <button
              onClick={() => setTab('cashier')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === 'cashier' ? 'bg-white text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Monitor className="h-4 w-4" />
              دخول الكاشير
            </button>
          </div>

          {tab === 'admin' ? (
            <>
              <h2 className="text-lg font-semibold text-text-primary mb-1">تسجيل الدخول</h2>
              <p className="text-sm text-text-secondary mb-6">أدخل بيانات الدخول للوصول للنظام</p>
              <LoginForm onSuccess={handleAdminSuccess} />
            </>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-text-primary mb-1">دخول الكاشير</h2>
              <p className="text-sm text-text-secondary mb-6">أدخل بيانات جهاز POS للدخول</p>
              <CashierLoginForm onSuccess={handleCashierSuccess} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
