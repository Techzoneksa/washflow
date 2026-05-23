'use client';
import { CheckCircle2, Settings, LogOut } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { clearSession } from '@/lib/mock-auth';

interface SetupSuccessCardProps {
  onDashboard: () => void;
  onReview: () => void;
}

export default function SetupSuccessCard({ onDashboard, onReview }: SetupSuccessCardProps) {
  return (
    <Card className="text-center max-w-md mx-auto" padding="lg" variant="elevated">
      <div className="w-20 h-20 rounded-full bg-success-50 flex items-center justify-center mx-auto mb-4">
        <CheckCircle2 className="h-10 w-10 text-success-500" />
      </div>
      <h2 className="text-xl font-bold text-text-primary mb-2">تم إعداد Wash Flow بنجاح</h2>
      <p className="text-sm text-text-secondary mb-6">
        يمكنك الآن البدء في تجهيز شاشة نقاط البيع والخدمات.
      </p>
      <div className="space-y-3">
        <Button fullWidth size="lg" onClick={onDashboard}>
          الذهاب للوحة التحكم
        </Button>
        <Button fullWidth size="md" variant="outline" onClick={onReview} icon={<Settings className="h-4 w-4" />}>
          مراجعة الإعدادات
        </Button>
        <Button fullWidth size="sm" variant="ghost" onClick={() => { clearSession(); window.location.href = '/login'; }} icon={<LogOut className="h-4 w-4" />}>
          تسجيل الخروج
        </Button>
      </div>
    </Card>
  );
}
