'use client';
/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import type { Employee, PaymentMethod } from '@/types/employees';

export interface AdvanceFormData {
  employeeId: string;
  employeeName: string;
  amount: number;
  date: string;
  reason: string;
  paymentMethod: PaymentMethod;
  deductFromSalary: boolean;
  notes: string;
}

interface AdvanceFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: AdvanceFormData) => void;
  employee: Employee | null;
}

const paymentMethodOptions = [
  { value: 'cash', label: 'نقدي' },
  { value: 'bank', label: 'بنك' },
  { value: 'transfer', label: 'تحويل' },
];

export default function AdvanceFormModal({
  open,
  onClose,
  onSave,
  employee,
}: AdvanceFormModalProps) {
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [deductFromSalary, setDeductFromSalary] = useState(true);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setAmount(0);
      setDate(new Date().toISOString().split('T')[0]);
      setReason('');
      setPaymentMethod('cash');
      setDeductFromSalary(true);
      setNotes('');
      setErrors({});
    }
  }, [open]);

  if (!employee) return null;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (amount <= 0) newErrors.amount = 'المبلغ يجب أن يكون أكبر من صفر';
    if (!date) newErrors.date = 'التاريخ مطلوب';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSave({
      employeeId: employee.id,
      employeeName: employee.fullName,
      amount,
      date,
      reason: reason.trim(),
      paymentMethod,
      deductFromSalary,
      notes: notes.trim(),
    });
  };

  return (
    <Modal open={open} onClose={onClose} title="إضافة سلفة">
      <div className="space-y-4">
        <div className="bg-bg-subtle rounded-lg p-3">
          <p className="font-medium text-text-primary">{employee.fullName}</p>
          <p className="text-sm text-text-secondary">{employee.jobTitle}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">المبلغ (ر.س) *</label>
            <Input
              type="number"
              min={0}
              value={amount.toString()}
              onChange={(e) => setAmount(Number(e.target.value) || 0)}
              error={errors.amount}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">التاريخ *</label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              error={errors.date}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">سبب السلفة</label>
          <Input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="مثال: إيجار، علاج، طوارئ..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">طريقة الصرف</label>
          <Select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
            options={paymentMethodOptions}
          />
        </div>

        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={deductFromSalary}
              onChange={(e) => setDeductFromSalary(e.target.checked)}
              className="w-4 h-4 rounded border-border-default text-primary-500 focus:ring-primary-500"
            />
            <span className="text-sm text-text-primary">تخصم من الراتب</span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">ملاحظات</label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="ملاحظات إضافية..."
            rows={2}
          />
        </div>

        <div className="flex gap-2 pt-2">
          <Button className="flex-1" onClick={handleSubmit}>
            حفظ السلفة
          </Button>
          <Button variant="outline" onClick={onClose}>
            إلغاء
          </Button>
        </div>
      </div>
    </Modal>
  );
}
