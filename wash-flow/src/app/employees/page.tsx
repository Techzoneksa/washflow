'use client';
import AppShell from '@/components/layout/AppShell';
import Card, { CardTitle } from '@/components/ui/Card';
import { useAuthGuard } from '@/lib/route-guards';
import { Users } from 'lucide-react';

export default function EmployeesPage() {
  const { authorized, checking } = useAuthGuard(['owner', 'manager']);

  if (checking || !authorized) return null;

  return (
    <AppShell title="العمالة والرواتب" activePath="/employees">
      <Card>
        <div className="flex flex-col items-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-text-disabled" />
          </div>
          <CardTitle>صفحة العمالة والرواتب</CardTitle>
          <p className="text-text-secondary mt-2">سيتم تنفيذ هذه الصفحة في مرحلة لاحقة</p>
        </div>
      </Card>
    </AppShell>
  );
}