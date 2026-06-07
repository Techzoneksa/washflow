'use client';
import AppShell from '@/components/layout/AppShell';
import { useAuthGuard } from '@/lib/route-guards';

export default function TestShellPage() {
  const { authorized, checking } = useAuthGuard(['owner']);

  if (checking || !authorized) return null;

  return (
    <AppShell title="Test" activePath="/test-shell">
      <div className="p-4">
        <p>Test content</p>
      </div>
    </AppShell>
  );
}
