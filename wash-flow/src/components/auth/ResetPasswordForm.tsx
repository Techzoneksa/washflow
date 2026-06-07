'use client';
import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Key, CheckCircle2, ArrowRight } from 'lucide-react';
import { getSupabase } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/client';

export default function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const client = getSupabase();
    if (!client) return;
    client.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true);
      }
    });
    client.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password) { setError('كلمة المرور الجديدة مطلوبة'); return; }
    if (password.length < 6) { setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل'); return; }
    if (password !== confirmPassword) { setError('كلمتا المرور غير متطابقتين'); return; }

    setLoading(true);
    const client = getSupabase();
    if (!client) {
      setLoading(false);
      setError('Supabase غير مهيأ');
      return;
    }

    const { error: updateError } = await client.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message || 'حدث خطأ أثناء تحديث كلمة المرور');
      return;
    }

    setSuccess(true);
  };

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-success-50 flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-8 w-8 text-success-500" />
        </div>
        <h2 className="text-lg font-semibold text-text-primary">تم تحديث كلمة المرور</h2>
        <p className="text-sm text-text-secondary">
          تم تحديث كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول بالكلمة الجديدة.
        </p>
        <a
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          <ArrowRight className="h-4 w-4" />
          العودة لتسجيل الدخول
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full">
      {!ready && isSupabaseConfigured() && (
        <p className="text-sm text-text-secondary text-center">
          جاري التحقق من رابط الاستعادة...
        </p>
      )}

      {error && (
        <div className="bg-danger-50 border border-danger-200 text-danger-700 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <Input
        label="كلمة المرور الجديدة"
        type="password"
        placeholder="••••••"
        value={password}
        onChange={(e) => { setPassword(e.target.value); setError(''); }}
        icon={<Key className="h-4 w-4" />}
        fullWidth
      />

      <Input
        label="تأكيد كلمة المرور"
        type="password"
        placeholder="••••••"
        value={confirmPassword}
        onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
        icon={<Key className="h-4 w-4" />}
        fullWidth
      />

      <Button type="submit" fullWidth size="lg" loading={loading} disabled={!ready && isSupabaseConfigured()}>
        تحديث كلمة المرور
      </Button>

      <div className="text-center">
        <a
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          <ArrowRight className="h-4 w-4" />
          العودة لتسجيل الدخول
        </a>
      </div>
    </form>
  );
}
