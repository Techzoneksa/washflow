'use client';
import AppShell from '@/components/layout/AppShell';

export default function TestShellPage() {
  return (
    <AppShell title="Test" activePath="/test-shell">
      <div className="p-4">
        <p>Test content</p>
      </div>
    </AppShell>
  );
}
