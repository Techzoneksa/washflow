'use client';
import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import { formatCurrency } from '@/lib/utils';
import type { OrderHistoryItem } from '@/types/orders';
import { RotateCcw } from 'lucide-react';

interface RefundOrderModalProps {
  open: boolean;
  onClose: () => void;
  order: OrderHistoryItem | null;
  onConfirm: (orderId: string, reason: string, amount: number) => void;
}

export default function RefundOrderModal({ open, onClose, order, onConfirm }: RefundOrderModalProps) {
  const [reason, setReason] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  if (!order) return null;

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError('يرجى إدخال سبب الاسترداد');
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('يرجى إدخال مبلغ صحيح');
      return;
    }
    if (numAmount > order.total) {
      setError('لا يمكن أن يتجاوز مبلغ الاسترداد إجمالي الطلب');
      return;
    }
    onConfirm(order.id, reason.trim(), numAmount);
    setReason('');
    setAmount('');
    setError('');
  };

  const handleClose = () => {
    setReason('');
    setAmount('');
    setError('');
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} size="sm" title="استرداد الطلب">
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-warning-50 rounded-xl">
          <RotateCcw className="h-5 w-5 text-warning-600 shrink-0" />
          <p className="text-sm text-warning-700">
            استرداد الطلب <span className="font-bold">{order.orderNumber}</span>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm bg-neutral-50 rounded-xl p-3">
          <div>
            <p className="text-text-secondary text-xs">إجمالي الطلب</p>
            <p className="font-bold tabular-nums">{formatCurrency(order.total)}</p>
          </div>
          <div>
            <p className="text-text-secondary text-xs">طريقة الدفع</p>
            <p className="font-medium">{order.paymentMethod === 'cash' ? 'نقدي' :
              order.paymentMethod === 'mada' ? 'شبكة' :
              order.paymentMethod === 'card' ? 'بطاقة' :
              order.paymentMethod === 'transfer' ? 'تحويل' : 'مختلط'}</p>
          </div>
        </div>

        <Input
          label="مبلغ الاسترداد"
          type="number"
          value={amount}
          onChange={(e) => { setAmount(e.target.value); setError(''); }}
          placeholder={order.total.toString()}
        />

        <Textarea
          label="سبب الاسترداد"
          placeholder="اكتب سبب الاسترداد..."
          value={reason}
          onChange={(e) => { setReason(e.target.value); setError(''); }}
          error={error}
          rows={3}
        />

        <div className="flex gap-2">
          <Button variant="outline" fullWidth onClick={handleClose}>رجوع</Button>
          <Button variant="danger" fullWidth onClick={handleConfirm}>تأكيد الاسترداد</Button>
        </div>
      </div>
    </Modal>
  );
}
