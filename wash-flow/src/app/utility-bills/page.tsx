'use client';
import { Suspense } from 'react';
import AppShell from '@/components/layout/AppShell';
import UtilityBillsPageShell from '@/components/utility-bills/UtilityBillsPageShell';
import { useAuthGuard } from '@/lib/route-guards';

function UtilityBillsContent() {
  return <UtilityBillsPageShell />;
}

export default function UtilityBillsPage() {
  const { authorized, checking } = useAuthGuard(['owner', 'manager', 'accountant']);

  if (checking || !authorized) return null;

  return (
    <AppShell title="فواتير الخدمات" activePath="/utility-bills">
      <Suspense fallback={null}>
        <UtilityBillsContent />
      </Suspense>
    </AppShell>
  );
}
