'use client';
/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import type { InventoryItem, StockMovementType } from '@/types/inventory';
import { INVENTORY_UNIT_LABELS } from '@/types/inventory';

export interface StockMovementFormData {
  type: StockMovementType;
  quantity: number;
  reason: string;
}

interface StockMovementFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: StockMovementFormData) => void;
  item: InventoryItem | null;
}

export default function StockMovementFormModal({
  open,
  onClose,
  onSave,
  item,
}: StockMovementFormModalProps) {
  const [type, setType] = useState<StockMovementType>('consumption');
  const [quantity, setQuantity] = useState(0);
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

   
  useEffect(() => {
    if (open) {
      setType('consumption');
      setQuantity(0);
      setReason('');
      setErrors({});
    }
  }, [open]);

  if (!item) return null;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (quantity <= 0) newErrors.quantity = 'الكمية يجب أن تكون أكبر من صفر';
    if (!reason.trim()) newErrors.reason = 'السبب مطلوب';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSave({ type, quantity, reason: reason.trim() });
  };

  return (
    <Modal open={open} onClose={onClose} title="تسجيل حركة مخزون">
      <div className="space-y-4">
        <div className="bg-bg-subtle rounded-lg p-3">
          <p className="font-medium text-text-primary">{item.name}</p>
          <p className="text-sm text-text-secondary">
            المتوفر: {item.currentQuantity} {INVENTORY_UNIT_LABELS[item.unit]}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">نوع الحركة</label>
          <Select
            value={type}
            onChange={(e) => setType(e.target.value as StockMovementType)}
            options={[
              { value: 'consumption', label: 'استهلاك تشغيلي' },
              { value: 'purchase', label: 'دخول من مشتريات' },
            ]}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            الكمية ({INVENTORY_UNIT_LABELS[item.unit]})
          </label>
          <Input
            type="number"
            min={0}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            error={errors.quantity}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">السبب</label>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="سبب الحركة..."
            rows={2}
            error={errors.reason}
          />
        </div>

        <div className="flex gap-2 pt-2">
          <Button className="flex-1" onClick={handleSubmit}>
            تسجيل
          </Button>
          <Button variant="outline" onClick={onClose}>
            إلغاء
          </Button>
        </div>
      </div>
    </Modal>
  );
}
