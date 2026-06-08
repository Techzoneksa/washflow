'use client';
import AppShell from '@/components/layout/AppShell';
import PurchaseFormPage from '@/components/purchases/PurchaseFormPage';
import { useAuthGuard } from '@/lib/route-guards';

export default function NewPurchasePage() {
  const { authorized, checking } = useAuthGuard(['owner', 'manager', 'accountant']);
  if (checking || !authorized) return null;

  return (
    <AppShell title="إنشاء فاتورة مشتريات" activePath="/purchases">
      <PurchaseFormPage mode="create" />
    </AppShell>
  );
}
