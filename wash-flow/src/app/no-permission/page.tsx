'use client';
import { useRouter } from 'next/navigation';
import { ShieldOff, ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function NoPermissionPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-bg-main flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 rounded-full bg-danger-50 flex items-center justify-center mx-auto mb-4">
          <ShieldOff className="h-10 w-10 text-danger-500" />
        </div>
        <h1 className="text-xl font-bold text-text-primary mb-2">لا توجد صلاحية</h1>
        <p className="text-sm text-text-secondary mb-6">
          ليس لديك صلاحية للوصول إلى هذه الصفحة. يرجى التواصل مع مدير النظام.
        </p>
        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={() => router.back()} icon={<ArrowLeft className="h-4 w-4" />}>
            العودة
          </Button>
          <Button onClick={() => router.push('/login')}>
            تسجيل الدخول
          </Button>
        </div>
      </div>
    </div>
  );
}
