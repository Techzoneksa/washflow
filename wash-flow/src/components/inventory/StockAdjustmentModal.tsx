'use client';
/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Card from '@/components/ui/Card';
import type { InventoryItem } from '@/types/inventory';
import { INVENTORY_UNIT_LABELS } from '@/types/inventory';

export interface StockAdjustmentFormData {
  actualQuantity: number;
  reason: string;
  date: string;
  notes: string;
}

interface StockAdjustmentModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: StockAdjustmentFormData) => void;
  item: InventoryItem | null;
}

const adjustmentReasons = [
  { value: 'physical_count', label: 'جرد فعلي' },
  { value: 'input_error', label: 'خطأ إدخال' },
  { value: 'unrecorded_damage', label: 'تلف غير مسجل' },
  { value: 'loss', label: 'فقدان' },
  { value: 'correction', label: 'تصحيح' },
];

export default function StockAdjustmentModal({
  open,
  onClose,
  onSave,
  item,
}: StockAdjustmentModalProps) {
  const [actualQuantity, setActualQuantity] = useState(0);
  const [reason, setReason] = useState('physical_count');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

   
  useEffect(() => {
    if (open && item) {
      setActualQuantity(item.currentQuantity);
      setReason('physical_count');
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
      setErrors({});
    }
  }, [open, item]);

  if (!item) return null;

  const difference = actualQuantity - item.currentQuantity;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (actualQuantity < 0) newErrors.actualQuantity = 'الكمية لا يمكن أن تكون سالبة';
    if (!reason) newErrors.reason = 'السبب مطلوب';
    if (!date) newErrors.date = 'التاريخ مطلوب';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSave({ actualQuantity, reason, date, notes: notes.trim() });
  };

  return (
    <Modal open={open} onClose={onClose} title="جرد / تسوية المخزون">
      <div className="space-y-4">
        <div className="bg-bg-subtle rounded-lg p-3">
          <p className="font-medium text-text-primary">{item.name}</p>
          <p className="text-sm text-text-secondary">
            الكمية بالنظام: {item.currentQuantity} {INVENTORY_UNIT_LABELS[item.unit]}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            الكمية الفعلية ({INVENTORY_UNIT_LABELS[item.unit]})
          </label>
          <Input
            type="number"
            min={0}
            value={actualQuantity}
            onChange={(e) => setActualQuantity(Number(e.target.value))}
            error={errors.actualQuantity}
          />
        </div>

        {difference !== 0 && (
          <Card padding="sm" className={`${difference > 0 ? 'bg-success-50' : 'bg-danger-50'}`}>
            <p className="text-sm">
              الفرق:{' '}
              <span className={`font-bold ${difference > 0 ? 'text-success-500' : 'text-danger-500'}`}>
                {difference > 0 ? '+' : ''}{difference} {INVENTORY_UNIT_LABELS[item.unit]}
              </span>
            </p>
          </Card>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">السبب</label>
            <Select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              options={adjustmentReasons}
              error={errors.reason}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">التاريخ</label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              error={errors.date}
            />
          </div>
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
            تسجيل التسوية
          </Button>
          <Button variant="outline" onClick={onClose}>
            إلغاء
          </Button>
        </div>
      </div>
    </Modal>
  );
}
