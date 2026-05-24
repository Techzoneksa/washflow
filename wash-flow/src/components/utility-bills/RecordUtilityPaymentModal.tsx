'use client';
import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import type { UtilityBill } from '@/types/utility-bills';
import { formatCurrency } from '@/lib/utils';
import { DollarSign } from 'lucide-react';

interface RecordUtilityPaymentModalProps {
  open: boolean;
  onClose: () => void;
  bill: UtilityBill | null;
  onSave: (id: string, method: string, date: string, notes: string) => void;
}

const paymentMethods = [
  { label: 'نقدي', value: 'cash' },
  { label: 'بنك', value: 'bank' },
  { label: 'تحويل', value: 'transfer' },
  { label: 'بطاقة', value: 'card' },
];

export default function RecordUtilityPaymentModal({ open, onClose, bill, onSave }: RecordUtilityPaymentModalProps) {
  const [method, setMethod] = useState('cash');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  if (!bill) return null;

  const handleSave = () => {
    if (!method) {
      setError('يرجى اختيار طريقة السداد');
      return;
    }
    if (!date) {
      setError('يرجى إدخال تاريخ السداد');
      return;
    }
    setError('');
    onSave(bill.id, method, date, notes);
  };

  return (
    <Modal open={open} onClose={onClose} title="تسجيل سداد فاتورة خدمة" size="sm">
      <div className="space-y-4">
        <div className="bg-neutral-50 rounded-xl p-3 space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-text-secondary">الفاتورة</span>
            <span className="font-semibold tabular-nums">{bill.billNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">الجهة</span>
            <span className="font-semibold">{bill.provider}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">المبلغ المستحق</span>
            <span className="font-bold text-primary-600 tabular-nums">{formatCurrency(bill.total)}</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">طريقة السداد *</label>
          <div className="grid grid-cols-2 gap-2">
            {paymentMethods.map((m) => (
              <button
                key={m.value}
                onClick={() => { setMethod(m.value); setError(''); }}
                className={`py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                  method === m.value
                    ? 'bg-primary-50 border-primary-300 text-primary-600'
                    : 'border-border-default text-text-secondary hover:bg-bg-hover'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <Input
          label="تاريخ السداد *"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          fullWidth
        />

        <Input
          label="ملاحظات"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          fullWidth
        />

        {error && <p className="text-xs text-danger-500">{error}</p>}

        <Button fullWidth icon={<DollarSign className="h-4 w-4" />} onClick={handleSave}>
          تأكيد السداد
        </Button>
      </div>
    </Modal>
  );
}
