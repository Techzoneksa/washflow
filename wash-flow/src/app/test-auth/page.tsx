'use client';
import AppShell from '@/components/layout/AppShell';
import ServicesPageShell from '@/components/services/ServicesPageShell';

export default function TestServicesPage() {
  return (
    <AppShell title="الخدمات والأسعار" activePath="/services">
      <ServicesPageShell />
    </AppShell>
  );
}
