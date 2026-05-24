'use client';
import AppShell from '@/components/layout/AppShell';
import SuppliersPageShell from '@/components/suppliers/SuppliersPageShell';
import { useAuthGuard } from '@/lib/route-guards';

export default function SuppliersPage() {
  const { authorized, checking } = useAuthGuard(['owner', 'manager', 'accountant']);

  if (checking || !authorized) return null;

  return (
    <AppShell title="الموردين" activePath="/suppliers">
      <SuppliersPageShell />
    </AppShell>
  );
}
