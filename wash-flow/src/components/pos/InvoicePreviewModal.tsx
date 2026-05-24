'use client';
import Image from 'next/image';
import Modal from '@/components/ui/Modal';
import { formatCurrency, formatDate } from '@/lib/utils';
import { getPaymentMethodLabel } from '@/lib/mock-pos';
import { getCompanySetup } from '@/lib/mock-company-settings';
import type { PosOrder } from '@/types/pos';
import { Printer } from 'lucide-react';

interface InvoicePreviewModalProps {
  open: boolean;
  onClose: () => void;
  order: PosOrder | null;
  onPrint: () => void;
}

export default function InvoicePreviewModal({ open, onClose, order, onPrint }: InvoicePreviewModalProps) {
  if (!order) return null;
  const setup = getCompanySetup();

  return (
    <Modal open={open} onClose={onClose} size="lg" title="الفاتورة">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            {setup?.company.logo ? (
              <Image src={setup.company.logo} alt="logo" width={40} height={40} className="h-10 w-10 rounded-lg object-cover" unoptimized />
            ) : (
              <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-sm">
                {setup?.company.nameAr?.charAt(0) || 'W'}
              </div>
            )}
          </div>
        </div>

        <div className="text-center">
          <h3 className="text-lg font-bold text-text-primary">{setup?.company.nameAr || 'شركة غسيل سيارات'}</h3>
          {setup?.tax.taxNumber && (
            <p className="text-xs text-text-secondary mt-0.5">الرقم الضريبي: {setup.tax.taxNumber}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs bg-neutral-50 rounded-xl p-4">
          <div>
            <p className="text-text-secondary">رقم الطلب</p>
            <p className="font-semibold text-text-primary tabular-nums">{order.orderNumber}</p>
          </div>
          <div>
            <p className="text-text-secondary">رقم الفاتورة</p>
            <p className="font-semibold text-text-primary tabular-nums">{order.invoiceNumber}</p>
          </div>
          <div>
            <p className="text-text-secondary">التاريخ</p>
            <p className="font-semibold text-text-primary">{formatDate(order.createdAt)}</p>
          </div>
          <div>
            <p className="text-text-secondary">الكاشير</p>
            <p className="font-semibold text-text-primary">{order.cashierName}</p>
          </div>
        </div>

        {order.customer?.plateNumber && (
          <div className="flex items-center gap-2 text-xs bg-info-50 text-info-700 p-2.5 rounded-lg">
            <span>رقم اللوحة:</span>
            <span className="font-bold">{order.customer.plateNumber}</span>
          </div>
        )}

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-default text-text-secondary text-xs">
              <th className="text-right py-2 font-medium">الخدمة</th>
              <th className="text-center py-2 font-medium">الكمية</th>
              <th className="text-left py-2 font-medium">السعر</th>
              <th className="text-left py-2 font-medium">المجموع</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.serviceId} className="border-b border-border-default">
                <td className="py-2 text-text-primary">{item.nameAr}</td>
                <td className="py-2 text-center tabular-nums">{item.quantity}</td>
                <td className="py-2 text-left tabular-nums">{formatCurrency(item.price)}</td>
                <td className="py-2 text-left tabular-nums font-semibold">{formatCurrency(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

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

        {setup?.invoice.showQr && (
          <div className="flex justify-center py-2">
            <div className="w-16 h-16 bg-neutral-100 rounded-lg flex items-center justify-center border-2 border-dashed border-neutral-300">
              <span className="text-[8px] text-text-disabled text-center leading-tight">QR<br />Mock</span>
            </div>
          </div>
        )}

        {setup?.invoice.footerText && (
          <p className="text-center text-xs text-text-secondary border-t border-border-default pt-3">
            {setup.invoice.footerText}
          </p>
        )}

        <button
          onClick={onPrint}
          className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-semibold text-primary-600 hover:bg-primary-50 rounded-lg transition-colors border border-primary-200"
        >
          <Printer className="h-4 w-4" />
          طباعة الفاتورة
        </button>
      </div>
    </Modal>
  );
}
