'use client';
import { Suspense } from 'react';
import AppShell from '@/components/layout/AppShell';
import InventoryPageShell from '@/components/inventory/InventoryPageShell';
import { useAuthGuard } from '@/lib/route-guards';

function InventoryContent() {
  return <InventoryPageShell />;
}

export default function InventoryPage() {
  const { authorized, checking } = useAuthGuard(['owner', 'manager', 'accountant']);

  if (checking || !authorized) return null;

  return (
    <AppShell title="المخزون" activePath="/inventory">
      <Suspense fallback={null}>
        <InventoryContent />
      </Suspense>
    </AppShell>
  );
}
