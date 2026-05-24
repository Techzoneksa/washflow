'use client';
import { useState } from 'react';
import Drawer from '@/components/ui/Drawer';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import type { ServiceItem, ServiceCategory } from '@/types/services';
import { serviceCategories } from '@/lib/mock-services';
import { Save } from 'lucide-react';

interface ServiceFormDrawerProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: ServiceFormData) => void;
  service?: ServiceItem | null;
}

export interface ServiceFormData {
  nameAr: string;
  nameEn?: string;
  category: ServiceCategory;
  price: number;
  durationMinutes?: number;
  description?: string;
  icon?: string;
  isActive: boolean;
  showInPOS: boolean;
  isTaxable: boolean;
  sortOrder: number;
}

const defaultForm: ServiceFormData = {
  nameAr: '',
  nameEn: '',
  category: 'غسيل سيارات',
  price: 0,
  durationMinutes: 15,
  description: '',
  icon: 'car',
  isActive: true,
  showInPOS: true,
  isTaxable: true,
  sortOrder: 0,
};

function buildForm(service?: ServiceItem | null): ServiceFormData {
  if (service) {
    return {
      nameAr: service.nameAr,
      nameEn: service.nameEn || '',
      category: service.category,
      price: service.price,
      durationMinutes: service.durationMinutes,
      description: service.description || '',
      icon: service.icon || 'car',
      isActive: service.isActive,
      showInPOS: service.showInPOS,
      isTaxable: service.isTaxable,
      sortOrder: service.sortOrder,
    };
  }
  return { ...defaultForm, sortOrder: Date.now() % 1000 };
}

const categoryOptions = serviceCategories.map((c) => ({ label: c, value: c }));

const iconOptions = [
  { label: 'سيارة', value: 'car' },
  { label: 'شاحنة', value: 'truck' },
  { label: 'نجمة', value: 'sparkles' },
  { label: 'قطرة', value: 'droplets' },
  { label: 'علامة', value: 'badge-check' },
  { label: 'دائرة', value: 'circle' },
  { label: 'زائد', value: 'plus' },
];

export default function ServiceFormDrawer({ open, onClose, onSave, service }: ServiceFormDrawerProps) {
  const [form, setForm] = useState<ServiceFormData>(buildForm(service));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isEdit = !!service;
  const formKey = open ? (service?.id || 'new') : 'closed';

  const update = (field: keyof ServiceFormData, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.nameAr.trim()) errs.nameAr = 'اسم الخدمة بالعربي مطلوب';
    if (form.price < 0) errs.price = 'السعر لا يمكن أن يكون أقل من 0';
    if (form.price === 0 && form.category !== 'أخرى') errs.price = 'السعر يجب أن يكون أكبر من 0 للخدمات غير المصنفة كـ "أخرى"';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave(form);
  };

  return (
    <Drawer key={formKey} open={open} onClose={onClose} title={isEdit ? `تعديل: ${service?.nameAr}` : 'إضافة خدمة جديدة'}>
      <div className="space-y-4">
        <Input
          label="اسم الخدمة بالعربي *"
          value={form.nameAr}
          onChange={(e) => update('nameAr', e.target.value)}
          error={errors.nameAr}
          fullWidth
        />
        <Input
          label="الاسم بالإنجليزي"
          value={form.nameEn || ''}
          onChange={(e) => update('nameEn', e.target.value)}
          fullWidth
          dir="ltr"
        />
        <Select
          label="التصنيف *"
          options={categoryOptions}
          value={form.category}
          onChange={(e) => update('category', e.target.value)}
          fullWidth
        />
        <Input
          label="السعر *"
          type="number"
          value={form.price.toString()}
          onChange={(e) => update('price', parseFloat(e.target.value) || 0)}
          error={errors.price}
          fullWidth
        />
        <Input
          label="المدة بالدقائق"
          type="number"
          value={(form.durationMinutes || '').toString()}
          onChange={(e) => update('durationMinutes', e.target.value ? parseInt(e.target.value) : undefined)}
          fullWidth
        />
        <Textarea
          label="الوصف"
          value={form.description || ''}
          onChange={(e) => update('description', e.target.value)}
          rows={3}
        />
        <Select
          label="الأيقونة"
          options={iconOptions}
          value={form.icon || 'car'}
          onChange={(e) => update('icon', e.target.value)}
          fullWidth
        />
        <Select
          label="الحالة"
          options={[{ label: 'نشط', value: 'true' }, { label: 'غير نشط', value: 'false' }]}
          value={form.isActive ? 'true' : 'false'}
          onChange={(e) => update('isActive', e.target.value === 'true')}
          fullWidth
        />
        <Select
          label="الظهور في POS"
          options={[{ label: 'نعم', value: 'true' }, { label: 'لا', value: 'false' }]}
          value={form.showInPOS ? 'true' : 'false'}
          onChange={(e) => update('showInPOS', e.target.value === 'true')}
          fullWidth
        />
        <Select
          label="خاضع للضريبة"
          options={[{ label: 'نعم', value: 'true' }, { label: 'لا', value: 'false' }]}
          value={form.isTaxable ? 'true' : 'false'}
          onChange={(e) => update('isTaxable', e.target.value === 'true')}
          fullWidth
        />
        <Input
          label="ترتيب الظهور"
          type="number"
          value={form.sortOrder.toString()}
          onChange={(e) => update('sortOrder', parseInt(e.target.value) || 0)}
          fullWidth
        />
        <div className="pt-2">
          <Button fullWidth icon={<Save className="h-4 w-4" />} onClick={handleSave}>
            {isEdit ? 'حفظ التعديلات' : 'إضافة الخدمة'}
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
