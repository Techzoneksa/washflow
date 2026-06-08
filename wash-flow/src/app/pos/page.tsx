'use client';
import { useState, useEffect } from 'react';
import POSFullscreenShell from '@/components/pos/POSFullscreenShell';
import PosShell from '@/components/pos/PosShell';
import CashierLoginForm from '@/components/auth/CashierLoginForm';
import { getStoredCashierSession, clearCashierSession, verifyCashierSession } from '@/lib/data/cashier-session';
import { Monitor } from 'lucide-react';

async function checkSession(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  const session = getStoredCashierSession();
  if (!session) return false;
  if (new Date(session.expiresAt) <= new Date()) {
    clearCashierSession();
    return false;
  }
  const verified = await verifyCashierSession(session.token);
  if (!verified) {
    clearCashierSession();
    return false;
  }
  return true;
}

export default function POSPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkSession().then((ok) => { setAuthenticated(ok); setChecking(false); });
  }, []);

  const handleCashierSuccess = () => {
    setAuthenticated(true);
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500/5 via-bg-main to-primary-500/5 flex items-center justify-center p-4">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500/5 via-bg-main to-primary-500/5 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-primary-500/25">
              <Monitor className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary">نقطة البيع</h1>
            <p className="text-sm text-text-secondary mt-1">دخول الكاشير</p>
          </div>
          <div className="bg-bg-surface border border-border-default rounded-2xl shadow-card p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-1">دخول الكاشير</h2>
            <p className="text-sm text-text-secondary mb-6">أدخل بيانات جهاز POS للدخول</p>
            <CashierLoginForm onSuccess={handleCashierSuccess} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <POSFullscreenShell>
      <PosShell />
    </POSFullscreenShell>
  );
}
