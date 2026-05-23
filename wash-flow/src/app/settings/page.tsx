'use client';
import AppShell from '@/components/layout/AppShell';
import Card, { CardTitle } from '@/components/ui/Card';
import { useAuthGuard } from '@/lib/route-guards';
import { Settings, Construction } from 'lucide-react';

export default function SettingsPage() {
  const { authorized, checking } = useAuthGuard(['owner', 'manager']);

  if (checking || !authorized) return null;

  return (
    <AppShell title="الإعدادات" activePath="/settings">
      <Card>
        <div className="flex flex-col items-center py-16 text-center">
          <Settings className="h-16 w-16 text-text-disabled mb-4" />
          <CardTitle className="text-xl">الإعدادات</CardTitle>
          <p className="text-sm text-text-secondary mt-2 max-w-sm">
            سيتم تنفيذ شاشة إعدادات النظام المتكاملة في المراحل القادمة.
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
