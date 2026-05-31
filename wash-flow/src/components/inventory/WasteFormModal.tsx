'use client';
/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import type { InventoryItem } from '@/types/inventory';
import { INVENTORY_UNIT_LABELS } from '@/types/inventory';

export interface WasteFormData {
  quantity: number;
  reason: string;
  date: string;
  notes: string;
}

interface WasteFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: WasteFormData) => void;
  item: InventoryItem | null;
}

const wasteReasons = [
  { value: 'expired', label: 'منتهي الصلاحية' },
  { value: 'damaged', label: 'تالف' },
  { value: 'spilled', label: 'انسياب / تسرب' },
  { value: 'broken', label: 'كسر' },
  { value: 'lost', label: 'فقدان' },
  { value: 'other', label: 'أخرى' },
];

export default function WasteFormModal({
  open,
  onClose,
  onSave,
  item,
}: WasteFormModalProps) {
  const [quantity, setQuantity] = useState(0);
  const [reason, setReason] = useState('damaged');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

   
  useEffect(() => {
    if (open) {
      setQuantity(0);
      setReason('damaged');
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
      setErrors({});
    }
  }, [open]);

  if (!item) return null;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (quantity <= 0) newErrors.quantity = 'الكمية يجب أن تكون أكبر من صفر';
    if (quantity > item.currentQuantity) newErrors.quantity = `الكمية لا يمكن أن تتجاوز ${item.currentQuantity}`;
    if (!reason) newErrors.reason = 'السبب مطلوب';
    if (!date) newErrors.date = 'التاريخ مطلوب';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSave({ quantity, reason, date, notes: notes.trim() });
  };

  return (
    <Modal open={open} onClose={onClose} title="تسجيل هدر / تالف">
      <div className="space-y-4">
        <div className="bg-bg-subtle rounded-lg p-3">
          <p className="font-medium text-text-primary">{item.name}</p>
          <p className="text-sm text-text-secondary">
            المتوفر: {item.currentQuantity} {INVENTORY_UNIT_LABELS[item.unit]}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              الكمية ({INVENTORY_UNIT_LABELS[item.unit]})
            </label>
            <Input
              type="number"
              min={0}
              max={item.currentQuantity}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              error={errors.quantity}
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
          <label className="block text-sm font-medium text-text-primary mb-1">السبب</label>
          <Select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            options={wasteReasons}
            error={errors.reason}
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
            تسجيل الهدر
          </Button>
          <Button variant="outline" onClick={onClose}>
            إلغاء
          </Button>
        </div>
      </div>
    </Modal>
  );
}
