'use client';
import { useState } from 'react';
import Card, { CardTitle, CardHeader } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';
import { getTodayOrders, getPaymentMethodLabel } from '@/lib/mock-pos';
import type { TodayOrderSummary } from '@/types/pos';
import { Clock, RefreshCw, Eye, Printer } from 'lucide-react';

const statusBadge: Record<string, 'success' | 'warning' | 'info'> = {
  completed: 'success',
  cancelled: 'warning',
  refunded: 'info',
};

const statusLabel: Record<string, string> = {
  completed: 'مكتمل',
  cancelled: 'ملغي',
  refunded: 'مسترد',
};

export default function TodayOrdersPanel() {
  const [orders, setOrders] = useState<TodayOrderSummary[]>(getTodayOrders());

  return (
    <Card padding="md">
      <CardHeader>
        <CardTitle>آخر الطلبات</CardTitle>
        <button
          onClick={() => setOrders(getTodayOrders())}
          className="p-1.5 rounded-md hover:bg-bg-hover text-text-secondary"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </CardHeader>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <Clock className="h-8 w-8 text-text-disabled mb-1" />
          <p className="text-sm text-text-secondary">لا توجد طلبات اليوم</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[240px] overflow-y-auto">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex items-center gap-2 p-2.5 rounded-lg bg-neutral-50 hover:bg-neutral-100 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-text-primary tabular-nums">{order.orderNumber}</span>
                  <Badge variant={statusBadge[order.status] || 'neutral'} size="sm">
                    {statusLabel[order.status] || order.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-text-secondary mt-0.5">
                  <span>{order.time}</span>
                  <span>{order.itemsCount} خدمة</span>
                  <span>{getPaymentMethodLabel(order.paymentMethod)}</span>
                </div>
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-text-primary tabular-nums">{formatCurrency(order.total)}</p>
              </div>
              <div className="flex gap-1">
                <button className="p-1.5 rounded-md hover:bg-bg-surface text-text-secondary" title="عرض">
                  <Eye className="h-3.5 w-3.5" />
                </button>
                <button className="p-1.5 rounded-md hover:bg-bg-surface text-text-secondary" title="طباعة">
                  <Printer className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
