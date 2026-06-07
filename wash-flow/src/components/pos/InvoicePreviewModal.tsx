'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Modal from '@/components/ui/Modal';
import { formatDate } from '@/lib/utils';
import { Money } from '@/lib/format';
import { getPaymentMethodLabel } from '@/lib/payment-labels';
import { getCompanySettings, FALLBACK_COMPANY_NAME } from '@/lib/data/company-settings';
import type { PosOrder } from '@/types/pos';
import { Printer } from 'lucide-react';

interface InvoicePreviewModalProps {
  open: boolean;
  onClose: () => void;
  order: PosOrder | null;
  onPrint: () => void;
}

export default function InvoicePreviewModal({ open, onClose, order, onPrint }: InvoicePreviewModalProps) {
  const [companyName, setCompanyName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  useEffect(() => {
    if (open) {
      getCompanySettings().then((settings) => {
        setCompanyName(settings?.companyNameAr || FALLBACK_COMPANY_NAME);
        setLogoUrl(settings?.logoUrl || '');
      });
    }
  }, [open]);

  if (!order) return null;

  return (
    <Modal open={open} onClose={onClose} size="lg" title="الفاتورة">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            {logoUrl ? (
              <Image src={logoUrl} alt="logo" width={40} height={40} className="h-10 w-10 rounded-lg object-cover" unoptimized />
            ) : (
              <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-sm">
                {companyName?.charAt(0) || 'ف'}
              </div>
            )}
          </div>
        </div>

        <div className="text-center">
          <h3 className="text-lg font-bold text-text-primary">{companyName || FALLBACK_COMPANY_NAME}</h3>
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
                <td className="py-2 text-left tabular-nums"><Money value={item.price} /></td>
                <td className="py-2 text-left tabular-nums font-semibold"><Money value={item.total} /></td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="space-y-1 text-sm border-t border-border-default pt-3">
          <div className="flex justify-between text-base font-bold text-text-primary">
            <span>الإجمالي</span>
            <span className="tabular-nums"><Money value={order.total} /></span>
          </div>
          <div className="flex justify-between text-xs text-text-secondary pt-1">
            <span>طريقة الدفع</span>
            <span>{getPaymentMethodLabel(order.paymentMethod)}</span>
          </div>
          {order.paymentMethod === 'mixed' && order.mixedPayment && (
            <div className="flex justify-between text-xs text-text-secondary pl-4">
              <span>كاش</span>
              <span className="tabular-nums"><Money value={order.mixedPayment.cash || 0} /></span>
            </div>
          )}
          {order.paymentMethod === 'mixed' && order.mixedPayment && (
            <div className="flex justify-between text-xs text-text-secondary pl-4">
              <span>شبكة</span>
              <span className="tabular-nums"><Money value={order.mixedPayment.network || 0} /></span>
            </div>
          )}
        </div>

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
