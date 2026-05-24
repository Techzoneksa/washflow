'use client';
import { Suspense } from 'react';
import AppShell from '@/components/layout/AppShell';
import PurchasesPageShell from '@/components/purchases/PurchasesPageShell';
import { useAuthGuard } from '@/lib/route-guards';

function PurchasesContent() {
  return <PurchasesPageShell />;
}

export default function PurchasesPage() {
  const { authorized, checking } = useAuthGuard(['owner', 'manager', 'accountant']);

  if (checking || !authorized) return null;

  return (
    <AppShell title="المشتريات" activePath="/purchases">
      <Suspense fallback={null}>
        <PurchasesContent />
      </Suspense>
    </AppShell>
  );
}
