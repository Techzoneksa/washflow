'use client';
import { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Tabs from '@/components/ui/Tabs';
import InvoicePreview from './InvoicePreview';
import type { InvoiceSettings } from '@/types/company';

interface InvoiceSettingsStepProps {
  data: InvoiceSettings;
  companyName: string;
  logo?: string;
  showTaxNumber: boolean;
  taxNumber?: string;
  taxRate: number;
  priceIncludesTax: boolean;
  onUpdate: (data: InvoiceSettings) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function InvoiceSettingsStep({
  data, companyName, logo, showTaxNumber: showTax, taxNumber, taxRate, priceIncludesTax, onUpdate, onNext, onBack,
}: InvoiceSettingsStepProps) {
  const [previewTab, setPreviewTab] = useState('settings');

  const update = (field: keyof InvoiceSettings, value: string | number | boolean) => {
    onUpdate({ ...data, [field]: value });
  };

  const tabs = [
    { id: 'settings', label: 'الإعدادات' },
    { id: 'preview', label: 'معاينة الفاتورة' },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-semibold text-text-primary mb-1">إعدادات الفاتورة</h3>
        <p className="text-sm text-text-secondary">تخصيص شكل ومحتوى الفاتورة</p>
      </div>

      <Tabs tabs={tabs} activeTab={previewTab} onChange={setPreviewTab} variant="pills" />

      {previewTab === 'settings' ? (
        <div className="space-y-4">
          <Input label="عنوان الفاتورة" value={data.invoiceTitle} onChange={(e) => update('invoiceTitle', e.target.value)} fullWidth />
          <Input label="نص أسفل الفاتورة" value={data.footerText} onChange={(e) => update('footerText', e.target.value)} fullWidth />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="حجم الفاتورة"
              options={[
                { label: 'حراري 80mm', value: 'thermal-80mm' },
                { label: 'A4', value: 'a4' },
              ]}
              value={data.paperSize}
              onChange={(e) => update('paperSize', e.target.value)}
            />
            <Input
              label="عدد النسخ الافتراضي"
              type="number"
              value={String(data.defaultCopies)}
              onChange={(e) => update('defaultCopies', Number(e.target.value) || 1)}
              fullWidth
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-border-default hover:bg-neutral-50">
              <input type="checkbox" checked={data.showLogo} onChange={(e) => update('showLogo', e.target.checked)} className="w-4 h-4 text-primary-500" />
              <span className="text-sm text-text-primary">إظهار الشعار في الفاتورة</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-border-default hover:bg-neutral-50">
              <input type="checkbox" checked={data.showTaxNumber} onChange={(e) => update('showTaxNumber', e.target.checked)} className="w-4 h-4 text-primary-500" />
              <span className="text-sm text-text-primary">إظهار الرقم الضريبي</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-border-default hover:bg-neutral-50">
              <input type="checkbox" checked={data.showQr} onChange={(e) => update('showQr', e.target.checked)} className="w-4 h-4 text-primary-500" />
              <span className="text-sm text-text-primary">إظهار QR Placeholder</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-border-default hover:bg-neutral-50">
              <input type="checkbox" checked={data.autoNumbering} onChange={(e) => update('autoNumbering', e.target.checked)} className="w-4 h-4 text-primary-500" />
              <span className="text-sm text-text-primary">ترقيم تلقائي</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="بادئة رقم الفاتورة" value={data.invoicePrefix} onChange={(e) => update('invoicePrefix', e.target.value)} fullWidth />
            <Input label="بادئة رقم الطلب" value={data.orderPrefix} onChange={(e) => update('orderPrefix', e.target.value)} fullWidth />
          </div>

          <div className="flex justify-between pt-2">
            <Button variant="outline" onClick={onBack}>السابق</Button>
            <Button onClick={onNext}>التالي</Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <InvoicePreview settings={data} companyName={companyName} logo={logo} showTax={showTax && !!taxNumber} taxNumber={taxNumber} taxRate={taxRate} priceIncludesTax={priceIncludesTax} />
          <div className="flex justify-between pt-2">
            <Button variant="outline" onClick={onBack}>السابق</Button>
            <Button onClick={onNext}>التالي</Button>
          </div>
        </div>
      )}
    </div>
  );
}
