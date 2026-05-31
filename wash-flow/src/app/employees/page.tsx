'use client';
import { Suspense } from 'react';
import AppShell from '@/components/layout/AppShell';
import EmployeesPageShell from '@/components/employees/EmployeesPageShell';
import { useAuthGuard } from '@/lib/route-guards';

function EmployeesContent() {
  return <EmployeesPageShell />;
}

export default function EmployeesPage() {
  const { authorized, checking } = useAuthGuard(['owner', 'manager', 'accountant']);

  if (checking || !authorized) return null;

  return (
    <AppShell title="العمالة والرواتب" activePath="/employees">
      <Suspense fallback={null}>
        <EmployeesContent />
      </Suspense>
    </AppShell>
  );
}
