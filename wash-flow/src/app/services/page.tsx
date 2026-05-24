'use client';
import AppShell from '@/components/layout/AppShell';
import ServicesPageShell from '@/components/services/ServicesPageShell';
import { useAuthGuard } from '@/lib/route-guards';

export default function ServicesPage() {
  const { authorized, checking } = useAuthGuard(['owner', 'manager']);

  if (checking || !authorized) return null;

  return (
    <AppShell title="الخدمات والأسعار" activePath="/services">
      <ServicesPageShell />
    </AppShell>
  );
}
