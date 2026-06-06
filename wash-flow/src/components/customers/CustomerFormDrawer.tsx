'use client';
import { useState } from 'react';
import type { Customer, CustomerFormData } from '@/types/customers';
import Drawer from '@/components/ui/Drawer';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { isPhoneExists } from '@/lib/mock-customers';

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: CustomerFormData) => void;
  customer: Customer | null;
}

export default function CustomerFormDrawer({ open, onClose, onSave, customer }: Props) {
  const [name, setName] = useState(customer?.name || '');
  const [phone, setPhone] = useState(customer?.phone || '');
  const [carPlate, setCarPlate] = useState(customer?.carPlate || '');
  const [carType, setCarType] = useState(customer?.carType || '');
  const [notes, setNotes] = useState(customer?.notes || '');
  const [status, setStatus] = useState<'active' | 'inactive'>(customer?.status || 'active');
  const [phoneError, setPhoneError] = useState('');

  const formKey = open ? (customer?.id || 'new-customer') : 'closed';

  const handlePhoneChange = (value: string) => {
    setPhone(value);
    setPhoneError('');
  };

  const handleSave = () => {
    if (!name.trim() && !phone.trim() && !carPlate.trim()) {
      return;
    }

    if (phone.trim() && isPhoneExists(phone, customer?.id)) {
      setPhoneError('رقم الجوال مستخدم مسبقاً');
      return;
    }

    onSave({
      name: name.trim() || undefined,
      phone: phone.trim() || undefined,
      carPlate: carPlate.trim() || undefined,
      carType: carType.trim() || undefined,
      notes: notes.trim() || undefined,
      status,
    });
  };

  const canSave = name.trim() || phone.trim() || carPlate.trim();

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={customer ? 'تعديل العميل' : 'إضافة عميل'}
    >
      <div className="space-y-4" key={formKey}>
        <Input
          label="الاسم (اختياري)"
          placeholder="اسم العميل"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div>
          <Input
            label="رقم الجوال (اختياري)"
            placeholder="0551234567"
            value={phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            error={phoneError}
          />
        </div>

        <Input
          label="رقم اللوحة (اختياري)"
          placeholder="1234 أ ب"
          value={carPlate}
          onChange={(e) => setCarPlate(e.target.value)}
        />

        <Input
          label="نوع السيارة (اختياري)"
          placeholder="Toyota Camry 2022"
          value={carType}
          onChange={(e) => setCarType(e.target.value)}
        />

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">الحالة</label>
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
            options={[
              { label: 'نشط', value: 'active' },
              { label: 'غير نشط', value: 'inactive' },
            ]}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">ملاحظات (اختياري)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="ملاحظات إضافية..."
            rows={3}
            className="w-full px-3 py-2 rounded-lg border border-border-default bg-bg-surface text-sm text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-primary-300 focus:ring-1 focus:ring-primary-200"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button onClick={handleSave} disabled={!canSave} fullWidth>
            {customer ? 'حفظ التعديلات' : 'إضافة العميل'}
          </Button>
          <Button variant="outline" onClick={onClose}>
            إلغاء
          </Button>
        </div>
      </div>
    </Drawer>
  );
}