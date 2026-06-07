'use client';
import AppShell from '@/components/layout/AppShell';
import ServicesPageShell from '@/components/services/ServicesPageShell';
import { useAuthGuard } from '@/lib/route-guards';

export default function TestServicesPage() {
  const { authorized, checking } = useAuthGuard(['owner']);

  if (checking || !authorized) return null;

  return (
    <AppShell title="الخدمات والأسعار" activePath="/services">
      <ServicesPageShell />
    </AppShell>
  );
}
