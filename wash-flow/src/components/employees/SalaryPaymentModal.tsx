'use client';
/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useMemo } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Card from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';
import type { Employee, PaymentMethod } from '@/types/employees';
import { getOpenAdvancesByEmployeeId } from '@/lib/mock-employees';

export interface SalaryPaymentFormData {
  employeeId: string;
  employeeName: string;
  month: string;
  baseSalary: number;
  advancesDeducted: number;
  otherDeductions: number;
  netSalary: number;
  paymentMethod: PaymentMethod;
  paidAt: string;
  notes: string;
}

interface SalaryPaymentModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: SalaryPaymentFormData) => void;
  employee: Employee | null;
}

const paymentMethodOptions = [
  { value: 'cash', label: 'نقدي' },
  { value: 'bank', label: 'بنك' },
  { value: 'transfer', label: 'تحويل' },
];

export default function SalaryPaymentModal({
  open,
  onClose,
  onSave,
  employee,
}: SalaryPaymentModalProps) {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [month, setMonth] = useState(currentMonth);
  const [advancesDeducted, setAdvancesDeducted] = useState(0);
  const [otherDeductions, setOtherDeductions] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [paidAt, setPaidAt] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const openAdvances = useMemo(() => {
    if (!employee) return [];
    return getOpenAdvancesByEmployeeId(employee.id);
  }, [employee]);

  const totalOpenAdvances = openAdvances.reduce((sum, a) => sum + a.amount, 0);

  useEffect(() => {
    if (open && employee) {
      setMonth(currentMonth);
      setAdvancesDeducted(0);
      setOtherDeductions(0);
      setPaymentMethod('cash');
      setPaidAt(new Date().toISOString().split('T')[0]);
      setNotes('');
      setErrors({});
    }
  }, [open, employee, currentMonth]);

  if (!employee) return null;

  const baseSalary = employee.monthlySalary;
  const netSalary = baseSalary - advancesDeducted - otherDeductions;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!month) newErrors.month = 'الشهر مطلوب';
    if (!paidAt) newErrors.paidAt = 'تاريخ الصرف مطلوب';
    if (advancesDeducted < 0) newErrors.advancesDeducted = 'لا يمكن أن يكون سالبًا';
    if (otherDeductions < 0) newErrors.otherDeductions = 'لا يمكن أن يكون سالبًا';
    if (netSalary < 0) newErrors.netSalary = 'صافي الراتب لا يمكن أن يكون سالبًا';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSave({
      employeeId: employee.id,
      employeeName: employee.fullName,
      month,
      baseSalary,
      advancesDeducted,
      otherDeductions,
      netSalary,
      paymentMethod,
      paidAt,
      notes: notes.trim(),
    });
  };

  return (
    <Modal open={open} onClose={onClose} title="صرف راتب">
      <div className="space-y-4">
        <div className="bg-bg-subtle rounded-lg p-3">
          <p className="font-medium text-text-primary">{employee.fullName}</p>
          <p className="text-sm text-text-secondary">{employee.jobTitle}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">الشهر *</label>
            <Input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              error={errors.month}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">تاريخ الصرف *</label>
            <Input
              type="date"
              value={paidAt}
              onChange={(e) => setPaidAt(e.target.value)}
              error={errors.paidAt}
            />
          </div>
        </div>

        <Card padding="sm" className="bg-bg-subtle">
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>الراتب الأساسي</span>
              <span className="font-medium">{formatCurrency(baseSalary)}</span>
            </div>
            {totalOpenAdvances > 0 && (
              <>
                <div className="flex justify-between text-warning-500">
                  <span>السلف المفتوحة المتاحة للخصم</span>
                  <span className="font-medium">{formatCurrency(totalOpenAdvances)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-tertiary">الخصم من السلف</span>
                  <Input
                    type="number"
                    min={0}
                    max={totalOpenAdvances}
                    value={advancesDeducted.toString()}
                    onChange={(e) => setAdvancesDeducted(Math.min(Number(e.target.value) || 0, totalOpenAdvances))}
                    error={errors.advancesDeducted}
                    className="w-28"
                  />
                </div>
              </>
            )}
            <div className="flex justify-between">
              <span>خصومات أخرى</span>
              <Input
                type="number"
                min={0}
                value={otherDeductions.toString()}
                onChange={(e) => setOtherDeductions(Number(e.target.value) || 0)}
                error={errors.otherDeductions}
                className="w-28"
              />
            </div>
            <div className="flex justify-between pt-1 border-t border-border-default font-bold text-success-500">
              <span>صافي الراتب</span>
              <span>{formatCurrency(netSalary)}</span>
            </div>
          </div>
        </Card>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">طريقة الصرف</label>
          <Select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
            options={paymentMethodOptions}
          />
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
            صرف الراتب
          </Button>
          <Button variant="outline" onClick={onClose}>
            إلغاء
          </Button>
        </div>
      </div>
    </Modal>
  );
}
