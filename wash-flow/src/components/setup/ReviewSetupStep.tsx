'use client';
import Card, { CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import type { CompanyInfo, TaxInfo, InvoiceSettings } from '@/types/company';

interface ReviewSetupStepProps {
  company: CompanyInfo;
  tax: TaxInfo;
  invoice: InvoiceSettings;
  onBack: () => void;
  onSave: () => void;
  saving: boolean;
}

export default function ReviewSetupStep({ company, tax, invoice, onBack, onSave, saving }: ReviewSetupStepProps) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-semibold text-text-primary mb-1">مراجعة الإعدادات</h3>
        <p className="text-sm text-text-secondary">تأكد من صحة البيانات قبل الحفظ</p>
      </div>

      <Card>
        <CardTitle>بيانات الشركة</CardTitle>
        <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
          <div><span className="text-text-secondary">الاسم:</span> <span className="text-text-primary font-medium">{company.nameAr}</span></div>
          {company.nameEn && <div><span className="text-text-secondary">English:</span> <span className="text-text-primary">{company.nameEn}</span></div>}
          <div><span className="text-text-secondary">الجوال:</span> <span className="text-text-primary">{company.phone}</span></div>
          {company.email && <div><span className="text-text-secondary">البريد:</span> <span className="text-text-primary">{company.email}</span></div>}
          <div><span className="text-text-secondary">المدينة:</span> <span className="text-text-primary">{company.city}</span></div>
          <div className="col-span-2"><span className="text-text-secondary">العنوان:</span> <span className="text-text-primary">{company.address}</span></div>
        </div>
      </Card>

      <Card>
        <CardTitle>البيانات الضريبية</CardTitle>
        <div className="space-y-2 mt-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-text-secondary">مسجلة في الضريبة:</span>
            <Badge variant={tax.registered ? 'success' : 'neutral'} size="sm">{tax.registered ? 'نعم' : 'لا'}</Badge>
          </div>
          {tax.registered && <div><span className="text-text-secondary">الرقم الضريبي:</span> <span className="text-text-primary font-medium">{tax.taxNumber}</span></div>}
          <div><span className="text-text-secondary">نسبة الضريبة:</span> <span className="text-text-primary">{tax.taxRate}%</span></div>
          <div className="flex items-center gap-2">
            <span className="text-text-secondary">الأسعار تشمل الضريبة:</span>
            <Badge variant={tax.priceIncludesTax ? 'success' : 'neutral'} size="sm">{tax.priceIncludesTax ? 'نعم' : 'لا'}</Badge>
          </div>
        </div>
      </Card>

      <Card>
        <CardTitle>إعدادات الفاتورة</CardTitle>
        <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
          <div><span className="text-text-secondary">الحجم:</span> <span className="text-text-primary">{invoice.paperSize === 'thermal-80mm' ? 'حراري 80mm' : 'A4'}</span></div>
          <div><span className="text-text-secondary">النسخ:</span> <span className="text-text-primary">{invoice.defaultCopies}</span></div>
          <div><span className="text-text-secondary">الشعار:</span> <Badge variant={invoice.showLogo ? 'success' : 'neutral'} size="sm">{invoice.showLogo ? 'ظاهر' : 'مخفي'}</Badge></div>
          <div><span className="text-text-secondary">QR:</span> <Badge variant={invoice.showQr ? 'success' : 'neutral'} size="sm">{invoice.showQr ? 'ظاهر' : 'مخفي'}</Badge></div>
          <div><span className="text-text-secondary">بادئة الفاتورة:</span> <span className="text-text-primary font-mono">{invoice.invoicePrefix}</span></div>
          <div><span className="text-text-secondary">بادئة الطلب:</span> <span className="text-text-primary font-mono">{invoice.orderPrefix}</span></div>
        </div>
      </Card>

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack}>رجوع</Button>
        <Button onClick={onSave} loading={saving}>حفظ الإعدادات</Button>
      </div>
    </div>
  );
}
