'use client';
import Drawer from '@/components/ui/Drawer';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils';
import { getPaymentMethodLabel } from '@/lib/mock-pos';
import type { OrderHistoryItem } from '@/types/orders';
import type { UserRole } from '@/types';
import { XCircle, RotateCcw, User, Phone, CreditCard } from 'lucide-react';

interface OrderDetailsDrawerProps {
  open: boolean;
  onClose: () => void;
  order: OrderHistoryItem | null;
  userRole: UserRole;
  onCancel: (order: OrderHistoryItem) => void;
  onRefund: (order: OrderHistoryItem) => void;
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'completed': return <Badge variant="success">مكتمل</Badge>;
    case 'cancelled': return <Badge variant="danger">ملغي</Badge>;
    case 'refunded': return <Badge variant="warning">مسترد</Badge>;
    default: return <Badge variant="neutral">{status}</Badge>;
  }
}

export default function OrderDetailsDrawer({
  open, onClose, order, userRole, onCancel, onRefund,
}: OrderDetailsDrawerProps) {
  if (!order) return null;

  const canAct = userRole === 'owner' || userRole === 'manager';
  const isActive = order.status === 'completed';

  return (
    <Drawer open={open} onClose={onClose} title={`تفاصيل الطلب ${order.orderNumber}`}>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-secondary">الحالة</span>
          {getStatusBadge(order.status)}
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm bg-neutral-50 rounded-xl p-3">
          <div>
            <p className="text-text-secondary text-xs">رقم الطلب</p>
            <p className="font-semibold tabular-nums">{order.orderNumber}</p>
          </div>
          <div>
            <p className="text-text-secondary text-xs">رقم الفاتورة</p>
            <p className="font-semibold tabular-nums">{order.invoiceNumber}</p>
          </div>
          <div>
            <p className="text-text-secondary text-xs">التاريخ</p>
            <p className="font-semibold">{formatDate(order.createdAt)}</p>
          </div>
          <div>
            <p className="text-text-secondary text-xs">الوقت</p>
            <p className="font-semibold">{formatTime(order.createdAt)}</p>
          </div>
        </div>

        {order.customer && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-text-primary">معلومات العميل</h4>
            <div className="bg-neutral-50 rounded-xl p-3 space-y-2">
              {order.customer.name && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-text-secondary" />
                  <span>{order.customer.name}</span>
                </div>
              )}
              {order.customer.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-text-secondary" />
                  <span dir="ltr">{order.customer.phone}</span>
                </div>
              )}
              {order.customer.plateNumber && (
                <div className="flex items-center gap-2 text-sm">
                  <CreditCard className="h-4 w-4 text-text-secondary" />
                  <span>{order.customer.plateNumber}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div>
          <h4 className="text-sm font-semibold text-text-primary mb-2">الخدمات</h4>
          <div className="divide-y divide-border-default">
            {order.items.map((item) => (
              <div key={item.serviceId} className="flex items-center justify-between py-2 text-sm">
                <span>{item.nameAr}</span>
                <div className="flex items-center gap-3">
                  <span className="text-text-secondary">x{item.quantity}</span>
                  <span className="font-semibold tabular-nums">{formatCurrency(item.total)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-1 text-sm border-t border-border-default pt-3">
          <div className="flex justify-between text-text-secondary">
            <span>المجموع الفرعي</span>
            <span className="tabular-nums">{formatCurrency(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-text-secondary">
            <span>ضريبة القيمة المضافة ({order.vatRate}%)</span>
            <span className="tabular-nums">{formatCurrency(order.vatAmount)}</span>
          </div>
          <div className="flex justify-between text-base font-bold text-text-primary pt-1">
            <span>الإجمالي</span>
            <span className="tabular-nums">{formatCurrency(order.total)}</span>
          </div>
          <div className="flex justify-between text-xs text-text-secondary pt-1">
            <span>طريقة الدفع</span>
            <span>{getPaymentMethodLabel(order.paymentMethod)}</span>
          </div>
        </div>

        <div className="text-sm">
          <p className="text-text-secondary text-xs">الكاشير</p>
          <p className="font-medium">{order.cashierName}</p>
        </div>

        {order.cancelledData && (
          <div className="bg-danger-50 rounded-xl p-3 space-y-1 text-sm">
            <p className="font-semibold text-danger-700 text-xs">معلومات الإلغاء</p>
            <p className="text-danger-600 text-xs">السبب: {order.cancelledData.reason}</p>
            <p className="text-danger-600 text-xs">بواسطة: {order.cancelledData.cancelledBy}</p>
            <p className="text-danger-600 text-xs">التاريخ: {formatDate(order.cancelledData.cancelledAt)}</p>
          </div>
        )}

        {order.refundedData && (
          <div className="bg-warning-50 rounded-xl p-3 space-y-1 text-sm">
            <p className="font-semibold text-warning-700 text-xs">معلومات الاسترداد</p>
            <p className="text-warning-600 text-xs">السبب: {order.refundedData.reason}</p>
            <p className="text-warning-600 text-xs">المبلغ: {formatCurrency(order.refundedData.refundAmount)}</p>
            <p className="text-warning-600 text-xs">بواسطة: {order.refundedData.refundedBy}</p>
            <p className="text-warning-600 text-xs">التاريخ: {formatDate(order.refundedData.refundedAt)}</p>
          </div>
        )}

        {canAct && isActive && (
          <div className="flex flex-col gap-2 pt-2">
            <Button
              variant="danger"
              fullWidth
              icon={<XCircle className="h-4 w-4" />}
              onClick={() => onCancel(order)}
            >
              إلغاء الطلب
            </Button>
            <Button
              variant="outline"
              fullWidth
              icon={<RotateCcw className="h-4 w-4" />}
              onClick={() => onRefund(order)}
            >
              استرداد الطلب
            </Button>
          </div>
        )}
      </div>
    </Drawer>
  );
}
