'use client';
import { useState } from 'react';
import Drawer from '@/components/ui/Drawer';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import type { Supplier } from '@/types/suppliers';
import { Save } from 'lucide-react';

interface SupplierFormDrawerProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: SupplierFormData) => void;
  supplier?: Supplier | null;
}

export interface SupplierFormData {
  name: string;
  phone: string;
  representativeName?: string;
  vatNumber?: string;
  crNumber?: string;
  email?: string;
  address?: string;
  status: 'active' | 'inactive';
  notes?: string;
}

const defaultForm: SupplierFormData = {
  name: '',
  phone: '',
  representativeName: '',
  vatNumber: '',
  crNumber: '',
  email: '',
  address: '',
  status: 'active',
  notes: '',
};

function buildForm(supplier?: Supplier | null): SupplierFormData {
  if (supplier) {
    return {
      name: supplier.name,
      phone: supplier.phone,
      representativeName: supplier.representativeName || '',
      vatNumber: supplier.vatNumber || '',
      crNumber: supplier.crNumber || '',
      email: supplier.email || '',
      address: supplier.address || '',
      status: supplier.status,
      notes: supplier.notes || '',
    };
  }
  return { ...defaultForm };
}

export default function SupplierFormDrawer({ open, onClose, onSave, supplier }: SupplierFormDrawerProps) {
  const [form, setForm] = useState<SupplierFormData>(buildForm(supplier));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isEdit = !!supplier;
  const formKey = open ? (supplier?.id || 'new') : 'closed';

  const update = (field: keyof SupplierFormData, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'اسم المورد مطلوب';
    if (!form.phone.trim()) errs.phone = 'رقم الجوال مطلوب';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'البريد الإلكتروني غير صحيح';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave(form);
  };

  return (
    <Drawer key={formKey} open={open} onClose={onClose} title={isEdit ? `تعديل: ${supplier?.name}` : 'إضافة مورد جديد'}>
      <div className="space-y-4">
        <Input
          label="اسم المورد *"
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
          error={errors.name}
          fullWidth
        />
        <Input
          label="رقم الجوال *"
          value={form.phone}
          onChange={(e) => update('phone', e.target.value)}
          error={errors.phone}
          fullWidth
          dir="ltr"
        />
        <Input
          label="اسم المندوب"
          value={form.representativeName || ''}
          onChange={(e) => update('representativeName', e.target.value)}
          fullWidth
        />
        <Input
          label="الرقم الضريبي"
          value={form.vatNumber || ''}
          onChange={(e) => update('vatNumber', e.target.value)}
          fullWidth
          dir="ltr"
        />
        <Input
          label="السجل التجاري"
          value={form.crNumber || ''}
          onChange={(e) => update('crNumber', e.target.value)}
          fullWidth
          dir="ltr"
        />
        <Input
          label="البريد الإلكتروني"
          type="email"
          value={form.email || ''}
          onChange={(e) => update('email', e.target.value)}
          error={errors.email}
          fullWidth
          dir="ltr"
        />
        <Input
          label="العنوان"
          value={form.address || ''}
          onChange={(e) => update('address', e.target.value)}
          fullWidth
        />
        <Select
          label="الحالة"
          options={[{ label: 'نشط', value: 'active' }, { label: 'غير نشط', value: 'inactive' }]}
          value={form.status}
          onChange={(e) => update('status', e.target.value as 'active' | 'inactive')}
          fullWidth
        />
        <Textarea
          label="ملاحظات"
          value={form.notes || ''}
          onChange={(e) => update('notes', e.target.value)}
          rows={3}
        />
        <div className="pt-2">
          <Button fullWidth icon={<Save className="h-4 w-4" />} onClick={handleSave}>
            {isEdit ? 'حفظ التعديلات' : 'إضافة المورد'}
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
