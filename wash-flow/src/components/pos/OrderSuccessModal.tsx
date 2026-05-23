'use client';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import { getPaymentMethodLabel } from '@/lib/mock-pos';
import type { PosOrder } from '@/types/pos';
import { CheckCircle2, Printer, Eye, Plus } from 'lucide-react';

interface OrderSuccessModalProps {
  open: boolean;
  order: PosOrder | null;
  onPrint: () => void;
  onViewInvoice: () => void;
  onNewOrder: () => void;
}

export default function OrderSuccessModal({
  open, order, onPrint, onViewInvoice, onNewOrder,
}: OrderSuccessModalProps) {
  if (!order) return null;

  return (
    <Modal open={open} onClose={onNewOrder} size="sm" showClose={false}>
      <div className="flex flex-col items-center text-center py-4">
        <div className="w-16 h-16 rounded-full bg-success-50 flex items-center justify-center mb-4">
          <CheckCircle2 className="h-8 w-8 text-success-500" />
        </div>

        <h2 className="text-lg font-bold text-text-primary mb-1">تم إنشاء الطلب بنجاح</h2>
        <p className="text-sm text-text-secondary mb-6">تم حفظ الطلب في النظام</p>

        <div className="w-full bg-neutral-50 rounded-xl p-4 space-y-2 text-sm mb-6">
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">رقم الطلب</span>
            <span className="font-bold text-text-primary tabular-nums">{order.orderNumber}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">رقم الفاتورة</span>
            <span className="font-bold text-text-primary tabular-nums">{order.invoiceNumber}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">الإجمالي</span>
            <span className="font-bold text-primary-600 tabular-nums">{formatCurrency(order.total)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">طريقة الدفع</span>
            <span className="font-medium text-text-primary">{getPaymentMethodLabel(order.paymentMethod)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">الخدمات</span>
            <span className="font-medium text-text-primary">{order.items.length}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 w-full">
          <Button fullWidth variant="outline" icon={<Printer className="h-4 w-4" />} onClick={onPrint}>
            طباعة الفاتورة
          </Button>
          <Button fullWidth variant="outline" icon={<Eye className="h-4 w-4" />} onClick={onViewInvoice}>
            عرض الفاتورة
          </Button>
          <Button fullWidth variant="primary" icon={<Plus className="h-4 w-4" />} onClick={onNewOrder}>
            طلب جديد
          </Button>
        </div>
      </div>
    </Modal>
  );
}
