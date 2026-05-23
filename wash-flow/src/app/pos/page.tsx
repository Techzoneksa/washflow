'use client';
import AppShell from '@/components/layout/AppShell';
import PosShell from '@/components/pos/PosShell';
import LoadingState from '@/components/ui/LoadingState';
import { useAuthGuard } from '@/lib/route-guards';

export default function POSPage() {
  const { authorized, checking } = useAuthGuard(['owner', 'manager', 'cashier']);

  if (checking) return <LoadingState fullScreen message="جاري التحقق من الصلاحية..." />;
  if (!authorized) return null;

  return (
    <AppShell title="نقطة البيع" activePath="/pos" showSearch={false}>
      <PosShell />
    </AppShell>
  );
}
