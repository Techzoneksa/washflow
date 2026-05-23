'use client';
import AppShell from '@/components/layout/AppShell';
import OrdersPageShell from '@/components/orders/OrdersPageShell';
import { useAuthGuard } from '@/lib/route-guards';
import { getSession } from '@/lib/mock-auth';
import type { UserRole } from '@/types';

export default function OrdersPage() {
  const { authorized, checking } = useAuthGuard();
  const session = typeof window !== 'undefined' ? getSession() : null;
  const role = (session?.selectedRole || 'manager') as UserRole;

  if (checking || !authorized) return null;

  return (
    <AppShell title="الطلبات" activePath="/orders">
      <OrdersPageShell userRole={role} />
    </AppShell>
  );
}
