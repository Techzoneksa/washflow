'use client';
import { useState } from 'react';
import Drawer from '@/components/ui/Drawer';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import type { UtilityBill, UtilityBillType } from '@/types/utility-bills';
import { Save } from 'lucide-react';

interface UtilityBillFormDrawerProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: UtilityBillFormData) => void;
  bill?: UtilityBill | null;
}

export interface UtilityBillFormData {
  type: UtilityBillType;
  provider: string;
  providerAccountNumber?: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  hasVat: boolean;
  vatAmount: number;
  total: number;
  status: 'paid' | 'unpaid';
  paymentMethod?: string;
  paidAt?: string;
  notes?: string;
}

const typeOptions = [
  { label: 'كهرباء', value: 'electricity' },
  { label: 'ماء', value: 'water' },
  { label: 'إنترنت', value: 'internet' },
  { label: 'اتصالات', value: 'telecom' },
  { label: 'إيجار', value: 'rent' },
  { label: 'اشتراك برنامج', value: 'software' },
  { label: 'بلدية', value: 'municipality' },
  { label: 'رسوم حكومية', value: 'government' },
  { label: 'أخرى', value: 'other' },
];

const paymentMethodOptions = [
  { label: 'نقدي', value: 'cash' },
  { label: 'بنك', value: 'bank' },
  { label: 'تحويل', value: 'transfer' },
  { label: 'بطاقة', value: 'card' },
];

const defaultForm: UtilityBillFormData = {
  type: 'electricity',
  provider: '',
  providerAccountNumber: '',
  issueDate: new Date().toISOString().split('T')[0],
  dueDate: new Date(new Date().getTime() + 30 * 86400000).toISOString().split('T')[0],
  amount: 0,
  hasVat: false,
  vatAmount: 0,
  total: 0,
  status: 'unpaid',
  paymentMethod: undefined,
  paidAt: undefined,
  notes: '',
};

function buildForm(bill?: UtilityBill | null): UtilityBillFormData {
  if (bill) {
    return {
      type: bill.type,
      provider: bill.provider,
      providerAccountNumber: bill.providerAccountNumber || '',
      issueDate: bill.issueDate,
      dueDate: bill.dueDate,
      amount: bill.amount,
      hasVat: bill.vatAmount > 0,
      vatAmount: bill.vatAmount,
      total: bill.total,
      status: bill.status === 'overdue' ? 'unpaid' : bill.status,
      paymentMethod: bill.paymentMethod || undefined,
      paidAt: bill.paidAt || undefined,
      notes: bill.notes || '',
    };
  }
  return { ...defaultForm };
}

export default function UtilityBillFormDrawer({ open, onClose, onSave, bill }: UtilityBillFormDrawerProps) {
  const [form, setForm] = useState<UtilityBillFormData>(buildForm(bill));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isEdit = !!bill;
  const formKey = open ? (bill?.id || 'new') : 'closed';

  const update = (field: keyof UtilityBillFormData, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleAmountChange = (value: number) => {
    const vat = form.hasVat ? value * 0.15 : 0;
    setForm((prev) => ({
      ...prev,
      amount: value,
      vatAmount: vat,
      total: value + vat,
    }));
  };

  const handleVatToggle = (hasVat: boolean) => {
    const vat = hasVat ? form.amount * 0.15 : 0;
    setForm((prev) => ({
      ...prev,
      hasVat,
      vatAmount: vat,
      total: prev.amount + vat,
    }));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.type) errs.type = 'نوع الخدمة مطلوب';
    if (!form.provider.trim()) errs.provider = 'اسم الجهة مطلوب';
    if (!form.issueDate) errs.issueDate = 'تاريخ الإصدار مطلوب';
    if (!form.dueDate) errs.dueDate = 'تاريخ الاستحقاق مطلوب';
    if (form.dueDate && form.issueDate && new Date(form.dueDate) < new Date(form.issueDate)) {
      errs.dueDate = 'تاريخ الاستحقاق لا يمكن أن يكون قبل تاريخ الإصدار';
    }
    if (form.amount <= 0) errs.amount = 'المبلغ يجب أن يكون أكبر من 0';
    if (form.status === 'paid') {
      if (!form.paymentMethod) errs.paymentMethod = 'طريقة السداد مطلوبة للحالة مسددة';
      if (!form.paidAt) errs.paidAt = 'تاريخ السداد مطلوب للحالة مسددة';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave(form);
  };

  return (
    <Drawer key={formKey} open={open} onClose={onClose} title={isEdit ? 'تعديل فاتورة الخدمة' : 'إضافة فاتورة خدمة جديدة'}>
      <div className="space-y-4">
        <Select
          label="نوع الخدمة *"
          options={typeOptions}
          value={form.type}
          onChange={(e) => update('type', e.target.value as UtilityBillType)}
          placeholder="اختر النوع"
          error={errors.type}
          fullWidth
        />
        <Input
          label="اسم الجهة *"
          value={form.provider}
          onChange={(e) => update('provider', e.target.value)}
          error={errors.provider}
          fullWidth
        />
        <Input
          label="رقم حساب الجهة"
          value={form.providerAccountNumber || ''}
          onChange={(e) => update('providerAccountNumber', e.target.value)}
          fullWidth
          dir="ltr"
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="تاريخ الإصدار *"
            type="date"
            value={form.issueDate}
            onChange={(e) => update('issueDate', e.target.value)}
            error={errors.issueDate}
            fullWidth
          />
          <Input
            label="تاريخ الاستحقاق *"
            type="date"
            value={form.dueDate}
            onChange={(e) => update('dueDate', e.target.value)}
            error={errors.dueDate}
            fullWidth
          />
        </div>
        <Input
          label="المبلغ *"
          type="number"
          value={form.amount.toString()}
          onChange={(e) => handleAmountChange(parseFloat(e.target.value) || 0)}
          error={errors.amount}
          fullWidth
        />
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-text-primary whitespace-nowrap">هل توجد ضريبة؟</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleVatToggle(true)}
              className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${form.hasVat ? 'bg-primary-50 border-primary-300 text-primary-600' : 'border-border-default text-text-secondary'}`}
            >
              نعم
            </button>
            <button
              type="button"
              onClick={() => handleVatToggle(false)}
              className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${!form.hasVat ? 'bg-primary-50 border-primary-300 text-primary-600' : 'border-border-default text-text-secondary'}`}
            >
              لا
            </button>
          </div>
        </div>
        {form.hasVat && (
          <div className="grid grid-cols-2 gap-3">
            <Input label="الضريبة (15%)" value={form.vatAmount.toFixed(2)} disabled fullWidth />
            <Input label="الإجمالي مع الضريبة" value={form.total.toFixed(2)} disabled fullWidth />
          </div>
        )}
        <Select
          label="الحالة"
          options={[
            { label: 'غير مسددة', value: 'unpaid' },
            { label: 'مسددة', value: 'paid' },
          ]}
          value={form.status}
          onChange={(e) => update('status', e.target.value as 'paid' | 'unpaid')}
          fullWidth
        />
        {form.status === 'paid' && (
          <>
            <Select
              label="طريقة السداد *"
              options={paymentMethodOptions}
              value={form.paymentMethod || ''}
              onChange={(e) => update('paymentMethod', e.target.value)}
              error={errors.paymentMethod}
              fullWidth
            />
            <Input
              label="تاريخ السداد *"
              type="date"
              value={form.paidAt || ''}
              onChange={(e) => update('paidAt', e.target.value)}
              error={errors.paidAt}
              fullWidth
            />
          </>
        )}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">مرفق</label>
          <div className="border-2 border-dashed border-border-default rounded-lg p-4 text-center text-sm text-text-secondary">
            إرفاق ملف (Mock)
          </div>
        </div>
        <Textarea
          label="ملاحظات"
          value={form.notes || ''}
          onChange={(e) => update('notes', e.target.value)}
          rows={3}
        />
        <div className="pt-2">
          <Button fullWidth icon={<Save className="h-4 w-4" />} onClick={handleSave}>
            {isEdit ? 'حفظ التعديلات' : 'إضافة الفاتورة'}
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
