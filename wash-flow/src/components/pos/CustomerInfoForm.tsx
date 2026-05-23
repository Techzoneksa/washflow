'use client';
import { useState } from 'react';
import { ChevronDown, ChevronUp, User, Phone, Car } from 'lucide-react';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import type { PosCustomerInfo } from '@/types/pos';

interface CustomerInfoFormProps {
  value: PosCustomerInfo;
  onChange: (info: PosCustomerInfo) => void;
}

export default function CustomerInfoForm({ value, onChange }: CustomerInfoFormProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-border-default rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium text-text-secondary hover:bg-bg-hover transition-colors"
      >
        <span>بيانات العميل (اختياري)</span>
        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-2.5 border-t border-border-default pt-2.5">
          <Input
            placeholder="اسم العميل"
            value={value.name || ''}
            onChange={(e) => onChange({ ...value, name: e.target.value })}
            icon={<User className="h-4 w-4" />}
            inputSize="sm"
            fullWidth
          />
          <Input
            placeholder="رقم الجوال"
            value={value.phone || ''}
            onChange={(e) => onChange({ ...value, phone: e.target.value })}
            icon={<Phone className="h-4 w-4" />}
            inputSize="sm"
            fullWidth
          />
          <Input
            placeholder="رقم لوحة السيارة"
            value={value.plateNumber || ''}
            onChange={(e) => onChange({ ...value, plateNumber: e.target.value })}
            icon={<Car className="h-4 w-4" />}
            inputSize="sm"
            fullWidth
          />
          <Textarea
            placeholder="ملاحظات"
            value={value.notes || ''}
            onChange={(e) => onChange({ ...value, notes: e.target.value })}
            className="min-h-[60px] text-sm"
          />
        </div>
      )}
    </div>
  );
}
