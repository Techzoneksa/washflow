'use client';
import { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { ArrowRight, Mail, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError('البريد الإلكتروني مطلوب'); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setSent(true);
  };

  if (sent) {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-success-50 flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-8 w-8 text-success-500" />
        </div>
        <h2 className="text-lg font-semibold text-text-primary">تم إرسال رابط الاستعادة</h2>
        <p className="text-sm text-text-secondary">
          تم إرسال رابط استعادة كلمة المرور إذا كان البريد مسجلًا لدينا.
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
      <p className="text-sm text-text-secondary text-center">
        أدخل بريدك الإلكتروني وسنرسل لك رابطًا لاستعادة كلمة المرور.
      </p>

      <Input
        label="البريد الإلكتروني"
        type="email"
        placeholder="your@email.com"
        value={email}
        onChange={(e) => { setEmail(e.target.value); setError(''); }}
        icon={<Mail className="h-4 w-4" />}
        error={error}
        fullWidth
      />

      <Button type="submit" fullWidth size="lg" loading={loading}>
        إرسال رابط الاستعادة
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
