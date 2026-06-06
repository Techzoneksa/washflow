'use client';
import { Suspense } from 'react';
import AppShell from '@/components/layout/AppShell';
import CustomersPageShell from '@/components/customers/CustomersPageShell';
import { useAuthGuard } from '@/lib/route-guards';

function CustomersContent() {
  return <CustomersPageShell />;
}

export default function CustomersPage() {
  const { authorized, checking } = useAuthGuard(['owner', 'manager', 'accountant', 'cashier']);

  if (checking || !authorized) return null;

  return (
    <AppShell title="العملاء" activePath="/customers">
      <Suspense fallback={null}>
        <CustomersContent />
      </Suspense>
    </AppShell>
  );
}