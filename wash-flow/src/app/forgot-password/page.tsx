'use client';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import { Droplets } from 'lucide-react';

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500/5 via-bg-main to-primary-500/5 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-primary-500/25">
            <Droplets className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">استعادة كلمة المرور</h1>
        </div>
        <div className="bg-bg-surface border border-border-default rounded-2xl shadow-card p-6">
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  );
}
