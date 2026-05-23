'use client';
import { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { LogIn } from 'lucide-react';
import { loginMockUser } from '@/lib/mock-auth';
import type { LoginFormData } from '@/types/auth';
import type { UserRole } from '@/types';

interface LoginFormProps {
  onSuccess: (roles: UserRole[]) => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const [form, setForm] = useState<LoginFormData>({ email: '', password: '', remember: false });
  const [errors, setErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({});
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const validate = (): boolean => {
    const errs: typeof errors = {};
    if (!form.email.trim()) errs.email = 'البريد الإلكتروني مطلوب';
    if (!form.password) errs.password = 'كلمة المرور مطلوبة';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!validate()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    const result = loginMockUser(form);
    setLoading(false);
    if (!result.success || !result.user) {
      setLoginError(result.error || 'بيانات الدخول غير صحيحة');
      return;
    }
    onSuccess(result.user.roles);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full">
      {loginError && (
        <div className="bg-danger-50 border border-danger-200 text-danger-700 text-sm px-4 py-3 rounded-lg">
          {loginError}
        </div>
      )}

      <Input
        label="البريد الإلكتروني"
        type="email"
        placeholder="owner@washflow.sa"
        value={form.email}
        onChange={(e) => { setForm({ ...form, email: e.target.value }); setLoginError(''); }}
        error={errors.email}
        fullWidth
      />

      <Input
        label="كلمة المرور"
        type="password"
        placeholder="••••••"
        value={form.password}
        onChange={(e) => { setForm({ ...form, password: e.target.value }); setLoginError(''); }}
        error={errors.password}
        fullWidth
      />

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.remember}
            onChange={(e) => setForm({ ...form, remember: e.target.checked })}
            className="w-4 h-4 rounded border-border-default text-primary-500 focus:ring-primary-500"
          />
          <span className="text-sm text-text-secondary">تذكرني</span>
        </label>
        <a href="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
          نسيت كلمة المرور؟
        </a>
      </div>

      <Button type="submit" fullWidth size="lg" loading={loading} icon={<LogIn className="h-5 w-5" />}>
        تسجيل الدخول
      </Button>

      <div className="bg-neutral-50 border border-border-default rounded-lg p-3 text-xs text-text-secondary space-y-1">
        <p className="font-medium text-text-primary mb-1">بيانات تجريبية:</p>
        <p>مالك: owner@washflow.sa</p>
        <p>مدير: manager@washflow.sa</p>
        <p>محاسب: accountant@washflow.sa</p>
        <p>كاشير: cashier@washflow.sa</p>
        <p>متعدد: multi@washflow.sa</p>
        <p className="text-[10px] text-text-disabled">كلمة المرور: 123456 للجميع</p>
      </div>
    </form>
  );
}
