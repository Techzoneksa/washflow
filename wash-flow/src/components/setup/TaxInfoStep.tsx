'use client';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { InlineAlert } from '@/components/ui/Toast';
import type { TaxInfo } from '@/types/company';

interface TaxInfoStepProps {
  data: TaxInfo;
  onUpdate: (data: TaxInfo) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function TaxInfoStep({ data, onUpdate, onNext, onBack }: TaxInfoStepProps) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-semibold text-text-primary mb-1">البيانات الضريبية</h3>
        <p className="text-sm text-text-secondary">إعدادات ضريبة القيمة المضافة</p>
      </div>

      <InlineAlert
        type="info"
        title="ملاحظة حول زاتكا"
        description="في هذه المرحلة لا يوجد ربط فعلي مع زاتكا. سيتم فقط تجهيز بيانات الشركة والفاتورة ليكون النظام قابلًا للربط لاحقًا."
      />

      <div>
        <p className="text-sm font-medium text-text-primary mb-3">هل الشركة مسجلة في ضريبة القيمة المضافة؟</p>
        <div className="flex gap-3">
          <button
            onClick={() => onUpdate({ ...data, registered: true })}
            className={`flex-1 px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
              data.registered ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-border-default text-text-secondary hover:border-primary-200'
            }`}
          >نعم</button>
          <button
            onClick={() => onUpdate({ ...data, registered: false, taxNumber: undefined })}
            className={`flex-1 px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
              !data.registered ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-border-default text-text-secondary hover:border-primary-200'
            }`}
          >لا</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="الرقم الضريبي"
          value={data.taxNumber || ''}
          onChange={(e) => onUpdate({ ...data, taxNumber: e.target.value })}
          disabled={!data.registered}
          fullWidth
        />
        <Input
          label="نسبة الضريبة (%)"
          type="number"
          value={String(data.taxRate)}
          onChange={(e) => onUpdate({ ...data, taxRate: Number(e.target.value) || 0 })}
          fullWidth
        />
      </div>

      <div>
        <p className="text-sm font-medium text-text-primary mb-3">هل الأسعار تشمل الضريبة؟</p>
        <div className="flex gap-3">
          <button
            onClick={() => onUpdate({ ...data, priceIncludesTax: true })}
            className={`flex-1 px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
              data.priceIncludesTax ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-border-default text-text-secondary hover:border-primary-200'
            }`}
          >نعم، الأسعار شاملة الضريبة</button>
          <button
            onClick={() => onUpdate({ ...data, priceIncludesTax: false })}
            className={`flex-1 px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
              !data.priceIncludesTax ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-border-default text-text-secondary hover:border-primary-200'
            }`}
          >لا، تضاف الضريبة للفاتورة</button>
        </div>
      </div>

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack}>السابق</Button>
        <Button onClick={onNext}>التالي</Button>
      </div>
    </div>
  );
}
