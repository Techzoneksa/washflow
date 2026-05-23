'use client';
import { useRouter } from 'next/navigation';
import LoginForm from '@/components/auth/LoginForm';
import { createSession } from '@/lib/mock-auth';
import type { UserRole } from '@/types';
import { Droplets } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();

  const handleSuccess = (roles: UserRole[]) => {
    if (roles.length > 1) {
      // Store user in session temporarily (will select role next)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500/5 via-bg-main to-primary-500/5 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-primary-500/25">
            <Droplets className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">واش فلو</h1>
          <p className="text-sm text-text-secondary mt-1">نظام إدارة غسيل السيارات</p>
        </div>

        {/* Login Card */}
        <div className="bg-bg-surface border border-border-default rounded-2xl shadow-card p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-1">تسجيل الدخول</h2>
          <p className="text-sm text-text-secondary mb-6">أدخل بيانات الدخول للوصول للنظام</p>
          <LoginForm onSuccess={handleSuccess} />
        </div>
      </div>
    </div>
  );
}
