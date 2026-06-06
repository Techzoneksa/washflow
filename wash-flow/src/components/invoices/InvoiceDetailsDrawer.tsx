'use client';
import { useState } from 'react';
import Drawer from '@/components/ui/Drawer';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import InvoicePreviewModal from '@/components/pos/InvoicePreviewModal';
import { formatDate, formatTime } from '@/lib/utils';
import { Money } from '@/lib/format';
import { getPaymentMethodLabel } from '@/lib/mock-pos';
import type { PosOrder } from '@/types/pos';
import { Eye, Printer } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface InvoiceDetailsDrawerProps {
  open: boolean;
  onClose: () => void;
  invoice: PosOrder | null;
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'completed': return <Badge variant="success">مدفوعة</Badge>;
    case 'refunded': return <Badge variant="warning">مستردة</Badge>;
    default: return <Badge variant="neutral">{status}</Badge>;
  }
}

export default function InvoiceDetailsDrawer({ open, onClose, invoice }: InvoiceDetailsDrawerProps) {
  const { toast } = useToast();
  const [showPreview, setShowPreview] = useState(false);

  if (!invoice) return null;

  const handlePrint = () => {
    toast('success', 'تم إرسال أمر الطباعة تجريبيًا');
  };

  return (
    <>
      <Drawer open={open} onClose={onClose} title={`الفاتورة ${invoice.invoiceNumber}`}>
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">الحالة</span>
            {getStatusBadge(invoice.status)}
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm bg-neutral-50 rounded-xl p-3">
            <div>
              <p className="text-text-secondary text-xs">رقم الفاتورة</p>
              <p className="font-semibold tabular-nums">{invoice.invoiceNumber}</p>
            </div>
            <div>
              <p className="text-text-secondary text-xs">رقم الطلب</p>
              <p className="font-semibold tabular-nums">{invoice.orderNumber}</p>
            </div>
            <div>
              <p className="text-text-secondary text-xs">التاريخ</p>
              <p className="font-semibold">{formatDate(invoice.createdAt)}</p>
            </div>
            <div>
              <p className="text-text-secondary text-xs">الوقت</p>
              <p className="font-semibold">{formatTime(invoice.createdAt)}</p>
            </div>
          </div>

          {invoice.customer && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-text-primary">معلومات العميل</h4>
              <div className="bg-neutral-50 rounded-xl p-3 space-y-1 text-sm">
                {invoice.customer.name && <p>الاسم: {invoice.customer.name}</p>}
                {invoice.customer.phone && <p>الجوال: {invoice.customer.phone}</p>}
                {invoice.customer.plateNumber && <p>رقم اللوحة: {invoice.customer.plateNumber}</p>}
              </div>
            </div>
          )}

          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-2">الخدمات</h4>
            <div className="divide-y divide-border-default">
              {invoice.items.map((item) => (
                <div key={item.serviceId} className="flex items-center justify-between py-2 text-sm">
                  <span>{item.nameAr}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-text-secondary">x{item.quantity}</span>
                    <Money value={item.total} className="font-semibold tabular-nums" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1 text-sm border-t border-border-default pt-3">
            <div className="flex justify-between text-base font-bold text-text-primary">
              <span>الإجمالي</span>
              <Money value={invoice.total} className="tabular-nums" />
            </div>
            <div className="flex justify-between text-xs text-text-secondary pt-1">
              <span>طريقة الدفع</span>
              <span>{getPaymentMethodLabel(invoice.paymentMethod)}</span>
            </div>
            {invoice.paymentMethod === 'mixed' && invoice.mixedPayment && (
              <>
                <div className="flex justify-between text-xs text-text-secondary pl-4">
                  <span>كاش</span>
                  <Money value={invoice.mixedPayment.cash || 0} className="tabular-nums" />
                </div>
                <div className="flex justify-between text-xs text-text-secondary pl-4">
                  <span>شبكة</span>
                  <Money value={invoice.mixedPayment.network || 0} className="tabular-nums" />
                </div>
              </>
            )}
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Button fullWidth variant="outline" icon={<Eye className="h-4 w-4" />} onClick={() => setShowPreview(true)}>
              معاينة الفاتورة
            </Button>
            <Button fullWidth variant="primary" icon={<Printer className="h-4 w-4" />} onClick={handlePrint}>
              طباعة الفاتورة
            </Button>
          </div>
        </div>
      </Drawer>

      <InvoicePreviewModal
        open={showPreview}
        onClose={() => setShowPreview(false)}
        order={invoice}
        onPrint={handlePrint}
      />
    </>
  );
}
