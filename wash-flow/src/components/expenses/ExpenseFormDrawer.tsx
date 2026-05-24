'use client';
import { useState } from 'react';
import Drawer from '@/components/ui/Drawer';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import type { Expense, ExpenseType } from '@/types/expenses';
import { Save } from 'lucide-react';

interface ExpenseFormDrawerProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: ExpenseFormData) => void;
  expense?: Expense | null;
}

export interface ExpenseFormData {
  type: ExpenseType;
  title: string;
  description?: string;
  date: string;
  amount: number;
  hasVat: boolean;
  vatAmount: number;
  total: number;
  paymentMethod: 'cash' | 'bank' | 'transfer' | 'card';
  accountName?: string;
  notes?: string;
}

const typeOptions = [
  { label: 'كهرباء', value: 'electricity' },
  { label: 'ماء', value: 'water' },
  { label: 'إنترنت', value: 'internet' },
  { label: 'اتصالات', value: 'telecom' },
  { label: 'إيجار', value: 'rent' },
  { label: 'مواد تنظيف', value: 'cleaning' },
  { label: 'صيانة', value: 'maintenance' },
  { label: 'وقود', value: 'fuel' },
  { label: 'تسويق', value: 'marketing' },
  { label: 'رسوم حكومية', value: 'government' },
  { label: 'أخرى', value: 'other' },
];

const paymentMethodOptions = [
  { label: 'نقدي', value: 'cash' },
  { label: 'بنك', value: 'bank' },
  { label: 'تحويل', value: 'transfer' },
  { label: 'بطاقة', value: 'card' },
];

const defaultForm: ExpenseFormData = {
  type: 'other',
  title: '',
  description: '',
  date: new Date().toISOString().split('T')[0],
  amount: 0,
  hasVat: false,
  vatAmount: 0,
  total: 0,
  paymentMethod: 'cash',
  accountName: '',
  notes: '',
};

function buildForm(expense?: Expense | null): ExpenseFormData {
  if (expense) {
    return {
      type: expense.type,
      title: expense.title,
      description: expense.description || '',
      date: expense.date,
      amount: expense.amount,
      hasVat: expense.vatAmount > 0,
      vatAmount: expense.vatAmount,
      total: expense.total,
      paymentMethod: expense.paymentMethod,
      accountName: expense.accountName || '',
      notes: expense.notes || '',
    };
  }
  return { ...defaultForm, date: new Date().toISOString().split('T')[0] };
}

export default function ExpenseFormDrawer({ open, onClose, onSave, expense }: ExpenseFormDrawerProps) {
  const [form, setForm] = useState<ExpenseFormData>(buildForm(expense));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isEdit = !!expense;
  const formKey = open ? (expense?.id || 'new') : 'closed';

  const update = (field: keyof ExpenseFormData, value: unknown) => {
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
    if (!form.type) errs.type = 'نوع المصروف مطلوب';
    if (!form.title.trim()) errs.title = 'العنوان مطلوب';
    if (!form.date) errs.date = 'التاريخ مطلوب';
    if (form.amount <= 0) errs.amount = 'المبلغ يجب أن يكون أكبر من 0';
    if (!form.paymentMethod) errs.paymentMethod = 'طريقة الدفع مطلوبة';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({
      ...form,
      vatAmount: form.hasVat ? form.amount * 0.15 : 0,
      total: form.amount + (form.hasVat ? form.amount * 0.15 : 0),
    });
  };

  return (
    <Drawer key={formKey} open={open} onClose={onClose} title={isEdit ? 'تعديل المصروف' : 'إضافة مصروف جديد'}>
      <div className="space-y-4">
        <Select
          label="نوع المصروف *"
          options={typeOptions}
          value={form.type}
          onChange={(e) => update('type', e.target.value as ExpenseType)}
          placeholder="اختر النوع"
          error={errors.type}
          fullWidth
        />
        <Input
          label="العنوان *"
          value={form.title}
          onChange={(e) => update('title', e.target.value)}
          error={errors.title}
          fullWidth
        />
        <Textarea
          label="الوصف"
          value={form.description || ''}
          onChange={(e) => update('description', e.target.value)}
          rows={2}
        />
        <Input
          label="التاريخ *"
          type="date"
          value={form.date}
          onChange={(e) => update('date', e.target.value)}
          error={errors.date}
          fullWidth
        />
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
          label="طريقة الدفع *"
          options={paymentMethodOptions}
          value={form.paymentMethod}
          onChange={(e) => update('paymentMethod', e.target.value as 'cash' | 'bank' | 'transfer' | 'card')}
          error={errors.paymentMethod}
          fullWidth
        />
        <Input
          label="الحساب المدفوع منه"
          value={form.accountName || ''}
          onChange={(e) => update('accountName', e.target.value)}
          fullWidth
        />
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
            {isEdit ? 'حفظ التعديلات' : 'إضافة المصروف'}
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
