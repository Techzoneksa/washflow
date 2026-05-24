'use client';
import AppShell from '@/components/layout/AppShell';
import OrdersPageShell from '@/components/orders/OrdersPageShell';
import { useAuthGuard } from '@/lib/route-guards';

export default function OrdersPage() {
  const { authorized, checking } = useAuthGuard();

  if (checking || !authorized) return null;

  return (
    <AppShell title="الطلبات" activePath="/orders">
      <OrdersPageShell />
    </AppShell>
  );
}
