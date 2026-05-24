'use client';
import Drawer from '@/components/ui/Drawer';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { PurchaseInvoice } from '@/types/purchases';
import { CalendarDays, History, User, FileText, Paperclip, MessageSquare } from 'lucide-react';

interface PurchaseDetailsDrawerProps {
  open: boolean;
  onClose: () => void;
  purchase: PurchaseInvoice | null;
  onRecordPayment?: (p: PurchaseInvoice) => void;
}

function getPaymentBadge(status: string) {
  switch (status) {
    case 'paid': return <Badge variant="success">مدفوعة</Badge>;
    case 'partial': return <Badge variant="warning">مدفوعة جزئيًا</Badge>;
    default: return <Badge variant="danger">غير مدفوعة</Badge>;
  }
}

function getPaymentMethodLabel(method?: string) {
  const labels: Record<string, string> = {
    cash: 'نقدي', bank: 'بنك', transfer: 'تحويل', credit: 'آجل',
  };
  return method ? labels[method] || method : '—';
}

export default function PurchaseDetailsDrawer({ open, onClose, purchase, onRecordPayment }: PurchaseDetailsDrawerProps) {
  if (!purchase) return null;

  return (
    <Drawer open={open} onClose={onClose} title={`فاتورة ${purchase.purchaseNumber}`}>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-secondary">حالة السداد</span>
          {getPaymentBadge(purchase.paymentStatus)}
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm bg-neutral-50 rounded-xl p-3">
          <div>
            <p className="text-text-secondary text-xs">رقم الشراء</p>
            <p className="font-semibold tabular-nums">{purchase.purchaseNumber}</p>
          </div>
          {purchase.supplierInvoiceNumber && (
            <div>
              <p className="text-text-secondary text-xs">رقم فاتورة المورد</p>
              <p className="font-semibold tabular-nums">{purchase.supplierInvoiceNumber}</p>
            </div>
          )}
          <div>
            <p className="text-text-secondary text-xs">المورد</p>
            <p className="font-semibold">{purchase.supplierName}</p>
          </div>
          <div>
            <p className="text-text-secondary text-xs">التاريخ</p>
            <p className="font-semibold">{formatDate(purchase.date)}</p>
          </div>
        </div>

        {purchase.items.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-2">البنود</h4>
            <div className="divide-y divide-border-default border border-border-default rounded-xl overflow-hidden">
              <div className="grid grid-cols-5 gap-2 px-3 py-2 bg-neutral-50 text-xs font-semibold text-text-secondary">
                <span className="col-span-2">الصنف</span>
                <span>الكمية</span>
                <span>الوحدة</span>
                <span>السعر</span>
                <span className="text-left">الإجمالي</span>
              </div>
              {purchase.items.map((item) => (
                <div key={item.id} className="grid grid-cols-5 gap-2 px-3 py-2 text-sm items-center">
                  <span className="col-span-2 font-medium">{item.name}</span>
                  <span className="tabular-nums">{item.quantity}</span>
                  <span className="text-text-secondary">{item.unit}</span>
                  <span className="tabular-nums">{formatCurrency(item.unitPrice)}</span>
                  <span className="tabular-nums text-left font-semibold">{formatCurrency(item.total)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-1 text-sm border-t border-border-default pt-3">
          <div className="flex justify-between text-text-secondary">
            <span>المجموع الفرعي</span>
            <span className="tabular-nums">{formatCurrency(purchase.subtotal)}</span>
          </div>
          <div className="flex justify-between text-text-secondary">
            <span>ضريبة القيمة المضافة (15%)</span>
            <span className="tabular-nums">{formatCurrency(purchase.vatAmount)}</span>
          </div>
          <div className="flex justify-between text-base font-bold text-text-primary pt-1">
            <span>الإجمالي النهائي</span>
            <span className="tabular-nums">{formatCurrency(purchase.total)}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 bg-neutral-50 rounded-xl p-3 text-sm">
          <div>
            <p className="text-xs text-text-secondary">المدفوع</p>
            <p className="font-bold text-success-600 tabular-nums">{formatCurrency(purchase.paidAmount)}</p>
          </div>
          <div>
            <p className="text-xs text-text-secondary">المتبقي</p>
            <p className={`font-bold tabular-nums ${purchase.remainingAmount > 0 ? 'text-danger-600' : 'text-text-secondary'}`}>
              {formatCurrency(purchase.remainingAmount)}
            </p>
          </div>
          <div>
            <p className="text-xs text-text-secondary">طريقة الدفع</p>
            <p className="font-semibold">{getPaymentMethodLabel(purchase.paymentMethod)}</p>
          </div>
        </div>

        {purchase.attachmentUrl && (
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-1">المرفق</h4>
            <div className="flex items-center gap-2 bg-neutral-50 rounded-xl p-3">
              <Paperclip className="h-4 w-4 text-text-secondary" />
              <span className="text-sm text-primary-600">مرفق الفاتورة</span>
            </div>
          </div>
        )}

        {purchase.notes && (
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-1">الملاحظات</h4>
            <div className="flex items-start gap-2 bg-neutral-50 rounded-xl p-3">
              <MessageSquare className="h-4 w-4 text-text-secondary mt-0.5" />
              <p className="text-sm text-text-secondary">{purchase.notes}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 text-xs text-text-secondary bg-neutral-50 rounded-xl p-3">
          <div className="flex items-center gap-1">
            <User className="h-3.5 w-3.5" />
            <span>بواسطة: {purchase.createdBy}</span>
          </div>
          <div className="flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" />
            <span>{formatDate(purchase.createdAt)}</span>
          </div>
          <div className="flex items-center gap-1">
            <History className="h-3.5 w-3.5" />
            <span>آخر تحديث: {formatDate(purchase.updatedAt)}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          {purchase.paymentStatus !== 'paid' && onRecordPayment && (
            <Button fullWidth variant="success" icon={<FileText className="h-4 w-4" />} onClick={() => { onRecordPayment(purchase); onClose(); }}>
              تسجيل سداد
            </Button>
          )}
        </div>
      </div>
    </Drawer>
  );
}
