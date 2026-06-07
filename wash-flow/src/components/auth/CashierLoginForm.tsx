'use client';
import { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Monitor, User, KeyRound, LogIn } from 'lucide-react';
import { authenticateCashier } from '@/lib/data/cashier-session';

interface CashierLoginFormProps {
  onSuccess: () => void;
}

export default function CashierLoginForm({ onSuccess }: CashierLoginFormProps) {
  const [posCode, setPosCode] = useState('');
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!posCode.trim()) { setError('رقم جهاز POS مطلوب'); return; }
    if (!username.trim()) { setError('اسم المستخدم مطلوب'); return; }
    if (!pin) { setError('PIN مطلوب'); return; }

    setLoading(true);
    const result = await authenticateCashier(posCode.trim(), username.trim(), pin);
    setLoading(false);

    if (result.success) {
      onSuccess();
    } else {
      setError(result.error || 'فشل تسجيل الدخول');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full">
      {error && (
        <div className="bg-danger-50 border border-danger-200 text-danger-700 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <Input
        label="رقم جهاز POS"
        placeholder="أدخل رمز الجهاز"
        value={posCode}
        onChange={(e) => { setPosCode(e.target.value); setError(''); }}
        icon={<Monitor className="h-4 w-4" />}
        fullWidth
      />

      <Input
        label="اسم المستخدم"
        placeholder="أدخل اسم المستخدم"
        value={username}
        onChange={(e) => { setUsername(e.target.value); setError(''); }}
        icon={<User className="h-4 w-4" />}
        fullWidth
      />

      <Input
        label="PIN"
        type="password"
        placeholder="••••••"
        value={pin}
        onChange={(e) => { setPin(e.target.value); setError(''); }}
        icon={<KeyRound className="h-4 w-4" />}
        fullWidth
        inputMode="numeric"
      />

      <Button type="submit" fullWidth size="lg" loading={loading} icon={<LogIn className="h-5 w-5" />}>
        دخول
      </Button>
    </form>
  );
}
