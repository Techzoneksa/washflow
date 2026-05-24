'use client';
import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import type { PurchaseInvoice } from '@/types/purchases';
import { formatCurrency } from '@/lib/utils';
import { DollarSign } from 'lucide-react';

interface RecordPaymentModalProps {
  open: boolean;
  onClose: () => void;
  purchase: PurchaseInvoice | null;
  onSave: (id: string, amount: number, method: string, date: string, notes: string) => void;
}

const paymentMethods = [
  { label: 'نقدي', value: 'cash' },
  { label: 'بنك', value: 'bank' },
  { label: 'تحويل', value: 'transfer' },
];

export default function RecordPaymentModal({ open, onClose, purchase, onSave }: RecordPaymentModalProps) {
  const [amount, setAmount] = useState(purchase?.remainingAmount || 0);
  const [method, setMethod] = useState('cash');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  if (!purchase) return null;

  const handleSave = () => {
    if (amount <= 0) {
      setError('مبلغ السداد يجب أن يكون أكبر من 0');
      return;
    }
    if (amount > purchase.remainingAmount) {
      setError('مبلغ السداد لا يمكن أن يتجاوز المبلغ المتبقي');
      return;
    }
    setError('');
    onSave(purchase.id, amount, method, date, notes);
  };

  return (
    <Modal open={open} onClose={onClose} title="تسجيل سداد" size="sm">
      <div className="space-y-4">
        <div className="bg-neutral-50 rounded-xl p-3 space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-text-secondary">الفاتورة</span>
            <span className="font-semibold tabular-nums">{purchase.purchaseNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">المبلغ المتبقي</span>
            <span className="font-bold text-danger-600 tabular-nums">{formatCurrency(purchase.remainingAmount)}</span>
          </div>
        </div>

        <Input
          label="مبلغ السداد *"
          type="number"
          value={amount.toString()}
          onChange={(e) => { setAmount(parseFloat(e.target.value) || 0); setError(''); }}
          error={error}
          fullWidth
        />

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">طريقة السداد *</label>
          <div className="grid grid-cols-3 gap-2">
            {paymentMethods.map((m) => (
              <button
                key={m.value}
                onClick={() => setMethod(m.value)}
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
          label="تاريخ السداد"
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

        <Button fullWidth icon={<DollarSign className="h-4 w-4" />} onClick={handleSave}>
          تأكيد السداد
        </Button>
      </div>
    </Modal>
  );
}
