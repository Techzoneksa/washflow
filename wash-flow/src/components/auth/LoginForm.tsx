'use client';
import { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { LogIn } from 'lucide-react';
import { signIn, signOutUser, getCurrentProfile } from '@/lib/supabase/auth';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import type { LoginFormData } from '@/types/auth';
import type { UserRole } from '@/types';

interface LoginFormProps {
  onSuccess: (role: UserRole) => void;
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

    if (!isSupabaseConfigured()) {
      setLoading(false);
      setLoginError('النظام غير مهيأ بعد، تواصل مع المدير');
      return;
    }

    const result = await signIn(form.email, form.password);
    if (result.error) {
      setLoading(false);
      setLoginError(result.error?.message || 'بيانات الدخول غير صحيحة');
      return;
    }

    const profile = await getCurrentProfile();
    if (!profile) {
      await signOutUser();
      setLoading(false);
      setLoginError('لا توجد صلاحية لهذا المستخدم، تواصل مع المدير');
      return;
    }

    setLoading(false);
    onSuccess(profile.role);
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
        placeholder="your@email.com"
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
    </form>
  );
}
