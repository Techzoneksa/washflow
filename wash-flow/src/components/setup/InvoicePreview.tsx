'use client';
import Image from 'next/image';
import Card from '@/components/ui/Card';
import type { InvoiceSettings } from '@/types/company';

interface InvoicePreviewProps {
  settings: InvoiceSettings;
  companyName: string;
  logo?: string;
  showTax: boolean;
  taxNumber?: string;
  taxRate: number;
  priceIncludesTax?: boolean;
}

export default function InvoicePreview({
  settings, companyName, logo, showTax, taxNumber, taxRate, priceIncludesTax = false,
}: InvoicePreviewProps) {
  const subtotal = 45;
  const taxAmount = priceIncludesTax ? 0 : subtotal * (taxRate / 100);
  const total = priceIncludesTax ? subtotal : subtotal + taxAmount;
  const qrPlaceholder = 'https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=washflow';

  return (
    <Card padding="none" className="overflow-hidden">
      <div className={`bg-bg-surface ${settings.paperSize === 'thermal-80mm' ? 'max-w-[300px]' : 'max-w-[210mm]'} mx-auto`}>
        {/* Header */}
        <div className="p-3 border-b border-border-default">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {settings.showLogo && logo && <Image src={logo} alt="شعار" width={40} height={40} className="h-10 w-10 object-contain" unoptimized />}
              {settings.showLogo && !logo && <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600 text-xs font-bold">WF</div>}
              <div>
                <h4 className="text-sm font-bold text-text-primary">{companyName || 'اسم الشركة'}</h4>
                <p className="text-[10px] text-text-secondary">{settings.invoiceTitle}</p>
              </div>
            </div>
            {settings.showQr && (
              <Image src={qrPlaceholder} alt="QR" width={56} height={56} className="h-14 w-14 opacity-50" unoptimized />
            )}
          </div>
        </div>

        {/* Invoice Info */}
        <div className="p-3 border-b border-border-default text-[11px] space-y-0.5">
          <div className="flex justify-between">
            <span className="text-text-secondary">رقم الفاتورة:</span>
            <span className="text-text-primary font-medium">{settings.invoicePrefix}0001</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">رقم الطلب:</span>
            <span className="text-text-primary">{settings.orderPrefix}001</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">التاريخ:</span>
            <span className="text-text-primary">23 مايو 2026</span>
          </div>
          {showTax && taxNumber && (
            <div className="flex justify-between">
              <span className="text-text-secondary">الرقم الضريبي:</span>
              <span className="text-text-primary">{taxNumber}</span>
            </div>
          )}
        </div>

        {/* Items */}
        <div className="p-3 border-b border-border-default">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-border-default">
                <th className="text-right py-1 text-text-secondary font-medium">الخدمة</th>
                <th className="text-center py-1 text-text-secondary font-medium">الكمية</th>
                <th className="text-left py-1 text-text-secondary font-medium">السعر</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-1.5 text-text-primary">غسيل خارجي</td>
                <td className="text-center py-1.5 text-text-primary">1</td>
                <td className="text-left py-1.5 text-text-primary">25.00</td>
              </tr>
              <tr>
                <td className="py-1.5 text-text-primary">غسيل داخلي</td>
                <td className="text-center py-1.5 text-text-primary">1</td>
                <td className="text-left py-1.5 text-text-primary">20.00</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="p-3 border-b border-border-default text-[11px] space-y-0.5">
          <div className="flex justify-between">
            <span className="text-text-secondary">المجموع:</span>
            <span className="text-text-primary">{subtotal.toFixed(2)} ر.س</span>
          </div>
          {!priceIncludesTax && (
            <div className="flex justify-between">
              <span className="text-text-secondary">الضريبة ({taxRate}%):</span>
              <span className="text-text-primary">{taxAmount.toFixed(2)} ر.س</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-bold pt-1 border-t border-border-default">
            <span className="text-text-primary">الإجمالي:</span>
            <span className="text-primary-600">{total.toFixed(2)} ر.س</span>
          </div>
        </div>

        {/* Footer */}
        {settings.footerText && (
          <div className="p-3 text-[10px] text-text-secondary text-center">
            {settings.footerText}
          </div>
        )}
      </div>
    </Card>
  );
}
