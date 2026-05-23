'use client';
import AppShell from '@/components/layout/AppShell';
import Card, { CardTitle } from '@/components/ui/Card';
import { useAuthGuard } from '@/lib/route-guards';
import { ClipboardList, Construction } from 'lucide-react';

export default function OrdersPage() {
  const { authorized, checking } = useAuthGuard();

  if (checking || !authorized) return null;

  return (
    <AppShell title="الطلبات" activePath="/orders">
      <Card>
        <div className="flex flex-col items-center py-16 text-center">
          <ClipboardList className="h-16 w-16 text-text-disabled mb-4" />
          <CardTitle className="text-xl">شاشة الطلبات</CardTitle>
          <p className="text-sm text-text-secondary mt-2 max-w-sm">
            سيتم تنفيذ شاشة إدارة الطلبات والمتابعة في المراحل القادمة.
          </p>
          <div className="flex items-center gap-2 mt-4 text-xs text-text-disabled">
            <Construction className="h-4 w-4" />
            المرحلة القادمة
          </div>
        </div>
      </Card>
    </AppShell>
  );
}
