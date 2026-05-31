'use client';
import { useState, useEffect } from 'react';
import Drawer from '@/components/ui/Drawer';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import type { InventoryItem, InventoryCategory, InventoryUnit } from '@/types/inventory';
import { INVENTORY_CATEGORY_OPTIONS, INVENTORY_UNIT_OPTIONS } from '@/lib/mock-inventory';

export interface InventoryItemFormData {
  name: string;
  category: InventoryCategory;
  unit: InventoryUnit;
  currentQuantity: number;
  minimumQuantity: number;
  averageCost: number;
  supplierId: string;
  supplierName: string;
  status: 'active' | 'inactive';
  notes: string;
}

interface InventoryItemFormDrawerProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: InventoryItemFormData) => void;
  item: InventoryItem | null;
}

export default function InventoryItemFormDrawer({
  open,
  onClose,
  onSave,
  item,
}: InventoryItemFormDrawerProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<InventoryCategory>('washing');
  const [unit, setUnit] = useState<InventoryUnit>('liter');
  const [currentQuantity, setCurrentQuantity] = useState(0);
  const [minimumQuantity, setMinimumQuantity] = useState(0);
  const [averageCost, setAverageCost] = useState(0);
  const [supplierId, setSupplierId] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (item) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(item.name);
       
      setCategory(item.category);
       
      setUnit(item.unit);
       
      setCurrentQuantity(item.currentQuantity);
       
      setMinimumQuantity(item.minimumQuantity);
       
      setAverageCost(item.averageCost);
       
      setSupplierId(item.supplierId);
       
      setSupplierName(item.supplierName);
       
      setStatus(item.status);
       
      setNotes(item.notes);
    } else {
      setName('');
      setCategory('washing');
      setUnit('liter');
      setCurrentQuantity(0);
      setMinimumQuantity(0);
      setAverageCost(0);
      setSupplierId('');
      setSupplierName('');
      setStatus('active');
      setNotes('');
    }
    setErrors({});
  }, [item, open]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'اسم المادة مطلوب';
    if (currentQuantity < 0) newErrors.currentQuantity = 'الكمية لا يمكن أن تكون سالبة';
    if (minimumQuantity < 0) newErrors.minimumQuantity = 'الحد الأدنى لا يمكن أن يكون سالبًا';
    if (averageCost < 0) newErrors.averageCost = 'التكلفة لا يمكن أن تكون سالبة';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSave({
      name: name.trim(),
      category,
      unit,
      currentQuantity,
      minimumQuantity,
      averageCost,
      supplierId,
      supplierName,
      status,
      notes: notes.trim(),
    });
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={item ? 'تعديل المادة' : 'إضافة مادة جديدة'}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">اسم المادة *</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="مثال: صابون سائل للغسيل"
            error={errors.name}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">التصنيف *</label>
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value as InventoryCategory)}
              options={INVENTORY_CATEGORY_OPTIONS}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">الوحدة *</label>
            <Select
              value={unit}
              onChange={(e) => setUnit(e.target.value as InventoryUnit)}
              options={INVENTORY_UNIT_OPTIONS}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">الكمية الحالية *</label>
            <Input
              type="number"
              min={0}
              value={currentQuantity}
              onChange={(e) => setCurrentQuantity(Number(e.target.value))}
              error={errors.currentQuantity}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">الحد الأدنى *</label>
            <Input
              type="number"
              min={0}
              value={minimumQuantity}
              onChange={(e) => setMinimumQuantity(Number(e.target.value))}
              error={errors.minimumQuantity}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">متوسط التكلفة (ر.س)</label>
          <Input
            type="number"
            min={0}
            step={0.01}
            value={averageCost}
            onChange={(e) => setAverageCost(Number(e.target.value))}
            placeholder="0.00"
            error={errors.averageCost}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">المورد</label>
          <Input
            value={supplierName}
            onChange={(e) => {
              setSupplierName(e.target.value);
              if (!supplierId) setSupplierId(e.target.value);
            }}
            placeholder="اسم المورد"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">الحالة</label>
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
            options={[
              { value: 'active', label: 'نشط' },
              { value: 'inactive', label: 'غير نشط' },
            ]}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">ملاحظات</label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="ملاحظات إضافية..."
            rows={3}
          />
        </div>

        <div className="flex gap-2 pt-2">
          <Button className="flex-1" onClick={handleSubmit}>
            {item ? 'تحديث' : 'إضافة'}
          </Button>
          <Button variant="outline" onClick={onClose}>
            إلغاء
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
