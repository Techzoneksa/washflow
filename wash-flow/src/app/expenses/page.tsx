'use client';
import { Suspense } from 'react';
import AppShell from '@/components/layout/AppShell';
import ExpensesPageShell from '@/components/expenses/ExpensesPageShell';
import { useAuthGuard } from '@/lib/route-guards';

function ExpensesContent() {
  return <ExpensesPageShell />;
}

export default function ExpensesPage() {
  const { authorized, checking } = useAuthGuard(['owner', 'manager', 'accountant']);

  if (checking || !authorized) return null;

  return (
    <AppShell title="المصاريف" activePath="/expenses">
      <Suspense fallback={null}>
        <ExpensesContent />
      </Suspense>
    </AppShell>
  );
}
