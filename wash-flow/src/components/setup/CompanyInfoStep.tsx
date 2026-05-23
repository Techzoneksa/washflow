'use client';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import { Trash2, ImageUp } from 'lucide-react';
import type { CompanyInfo } from '@/types/company';
import { useState } from 'react';

interface CompanyInfoStepProps {
  data: CompanyInfo;
  onUpdate: (data: CompanyInfo) => void;
  onNext: () => void;
}

export default function CompanyInfoStep({ data, onUpdate, onNext }: CompanyInfoStepProps) {
  const [errors, setErrors] = useState<Partial<Record<keyof CompanyInfo, string>>>({});
  const [logoPreview, setLogoPreview] = useState<string | null>(data.logo || null);

  const update = (field: keyof CompanyInfo, value: string) => {
    onUpdate({ ...data, [field]: value });
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const url = reader.result as string;
        setLogoPreview(url);
        onUpdate({ ...data, logo: url });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoPreview(null);
    onUpdate({ ...data, logo: undefined });
  };

  const validate = () => {
    const errs: typeof errors = {};
    if (!data.nameAr.trim()) errs.nameAr = 'اسم الشركة مطلوب';
    if (!data.phone.trim()) errs.phone = 'رقم الجوال مطلوب';
    if (!data.city.trim()) errs.city = 'المدينة مطلوبة';
    if (!data.address.trim()) errs.address = 'العنوان مطلوب';
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errs.email = 'البريد غير صحيح';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-semibold text-text-primary mb-1">بيانات الشركة</h3>
        <p className="text-sm text-text-secondary">أدخل البيانات الأساسية للشركة</p>
      </div>

      {/* Logo Upload */}
      <div>
        <p className="text-sm font-medium text-text-primary mb-2">شعار الشركة</p>
        {logoPreview ? (
          <div className="relative inline-block">
            <img src={logoPreview} alt="شعار" className="h-24 w-24 object-contain rounded-lg border border-border-default" />
            <button onClick={removeLogo} className="absolute -top-2 -left-2 w-6 h-6 bg-danger-500 text-white rounded-full flex items-center justify-center">
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center h-28 w-28 border-2 border-dashed border-border-default rounded-lg cursor-pointer hover:border-primary-300 bg-neutral-50">
            <ImageUp className="h-8 w-8 text-text-disabled mb-1" />
            <span className="text-[10px] text-text-disabled">PNG, SVG</span>
            <input type="file" accept="image/png,image/svg+xml" onChange={handleLogoUpload} className="hidden" />
          </label>
        )}
        <p className="text-[11px] text-text-secondary mt-1">يفضل رفع شعار بصيغة PNG أو SVG بخلفية شفافة</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="اسم الشركة بالعربي *" value={data.nameAr} onChange={(e) => update('nameAr', e.target.value)} error={errors.nameAr} fullWidth />
        <Input label="اسم الشركة بالإنجليزي" value={data.nameEn || ''} onChange={(e) => update('nameEn', e.target.value)} fullWidth />
        <Input label="رقم الجوال *" type="tel" value={data.phone} onChange={(e) => update('phone', e.target.value)} error={errors.phone} fullWidth />
        <Input label="البريد الإلكتروني" type="email" value={data.email || ''} onChange={(e) => update('email', e.target.value)} error={errors.email} fullWidth />
        <Input label="المدينة *" value={data.city} onChange={(e) => update('city', e.target.value)} error={errors.city} fullWidth />
        <Input label="السجل التجاري" value={data.commercialRecord || ''} onChange={(e) => update('commercialRecord', e.target.value)} fullWidth />
      </div>
      <Textarea label="العنوان *" value={data.address} onChange={(e) => update('address', e.target.value)} error={errors.address} rows={2} />

      <div className="flex justify-end pt-2">
        <Button onClick={() => { if (validate()) onNext(); }}>التالي</Button>
      </div>
    </div>
  );
}
