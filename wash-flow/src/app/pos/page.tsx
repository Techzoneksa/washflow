'use client';
import AppShell from '@/components/layout/AppShell';
import Card, { CardTitle } from '@/components/ui/Card';
import { useAuthGuard } from '@/lib/route-guards';
import { ShoppingCart, Construction } from 'lucide-react';

export default function POSPage() {
  const { authorized, checking } = useAuthGuard(['owner', 'manager', 'cashier']);

  if (checking || !authorized) return null;

  return (
    <AppShell title="نقطة البيع" activePath="/pos">
      <Card>
        <div className="flex flex-col items-center py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-primary-50 flex items-center justify-center mb-4">
            <ShoppingCart className="h-10 w-10 text-primary-500" />
          </div>
          <CardTitle className="text-xl">شاشة نقاط البيع</CardTitle>
          <p className="text-sm text-text-secondary mt-2 max-w-sm">
            سيتم تنفيذ شاشة نقاط البيع المتكاملة مع السلة والخدمات والدفع في المرحلة الثالثة.
          </p>
          <div className="flex items-center gap-2 mt-4 text-xs text-text-disabled">
            <Construction className="h-4 w-4" />
            المرحلة الثالثة
          </div>
        </div>
      </Card>
    </AppShell>
  );
}
