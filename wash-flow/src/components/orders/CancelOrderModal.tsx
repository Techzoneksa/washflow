'use client';
import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';
import type { OrderHistoryItem } from '@/types/orders';
import { AlertTriangle } from 'lucide-react';

interface CancelOrderModalProps {
  open: boolean;
  onClose: () => void;
  order: OrderHistoryItem | null;
  onConfirm: (orderId: string, reason: string) => void;
}

export default function CancelOrderModal({ open, onClose, order, onConfirm }: CancelOrderModalProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!order) return null;

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError('يرجى إدخال سبب الإلغاء');
      return;
    }
    onConfirm(order.id, reason.trim());
    setReason('');
    setError('');
  };

  const handleClose = () => {
    setReason('');
    setError('');
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} size="sm" title="إلغاء الطلب">
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-warning-50 rounded-xl">
          <AlertTriangle className="h-5 w-5 text-warning-600 shrink-0" />
          <p className="text-sm text-warning-700">
            هل أنت متأكد من إلغاء الطلب <span className="font-bold">{order.orderNumber}</span>؟
          </p>
        </div>

        <Textarea
          label="سبب الإلغاء"
          placeholder="اكتب سبب الإلغاء..."
          value={reason}
          onChange={(e) => { setReason(e.target.value); setError(''); }}
          error={error}
          rows={3}
        />

        <div className="flex gap-2">
          <Button variant="outline" fullWidth onClick={handleClose}>رجوع</Button>
          <Button variant="danger" fullWidth onClick={handleConfirm}>تأكيد الإلغاء</Button>
        </div>
      </div>
    </Modal>
  );
}
