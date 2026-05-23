'use client';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { Search } from 'lucide-react';

interface InvoicesFiltersProps {
  search: string;
  status: string;
  paymentMethod: string;
  onSearchChange: (v: string) => void;
  onStatusChange: (v: string) => void;
  onPaymentMethodChange: (v: string) => void;
}

const statusOptions = [
  { label: 'الكل', value: 'all' },
  { label: 'مدفوعة', value: 'paid' },
  { label: 'مستردة', value: 'refunded' },
];

const paymentOptions = [
  { label: 'الكل', value: 'all' },
  { label: 'نقدي', value: 'cash' },
  { label: 'شبكة / مدى', value: 'mada' },
  { label: 'بطاقة', value: 'card' },
  { label: 'تحويل', value: 'transfer' },
  { label: 'دفع مختلط', value: 'mixed' },
];

export default function InvoicesFilters(props: InvoicesFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-4">
      <div className="flex-1">
        <Input
          placeholder="بحث برقم الفاتورة، الطلب، العميل..."
          value={props.search}
          onChange={(e) => props.onSearchChange(e.target.value)}
          icon={<Search className="h-4 w-4" />}
          fullWidth
        />
      </div>
      <div className="w-full sm:w-44">
        <Select
          options={statusOptions}
          value={props.status}
          onChange={(e) => props.onStatusChange(e.target.value)}
        />
      </div>
      <div className="w-full sm:w-44">
        <Select
          options={paymentOptions}
          value={props.paymentMethod}
          onChange={(e) => props.onPaymentMethodChange(e.target.value)}
        />
      </div>
    </div>
  );
}
