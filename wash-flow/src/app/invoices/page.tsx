'use client';
import AppShell from '@/components/layout/AppShell';
import InvoicesPageShell from '@/components/invoices/InvoicesPageShell';
import { useAuthGuard } from '@/lib/route-guards';

export default function InvoicesPage() {
  const { authorized, checking } = useAuthGuard(['owner', 'manager', 'accountant']);

  if (checking || !authorized) return null;

  return (
    <AppShell title="الفواتير" activePath="/invoices">
      <InvoicesPageShell />
    </AppShell>
  );
}
