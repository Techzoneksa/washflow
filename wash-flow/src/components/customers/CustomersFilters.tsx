'use client';
import type { CustomerFilter } from '@/lib/data/customers';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';

interface Props {
  filters: CustomerFilter;
  onFiltersChange: (filters: CustomerFilter) => void;
}

export default function CustomersFilters({ filters, onFiltersChange }: Props) {
  return (
    <div className="flex flex-wrap gap-3">
      <div className="flex-1 min-w-[200px]">
        <Input
          placeholder="بحث بالاسم أو رقم الجوال أو اللوحة..."
          value={filters.search}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
        />
      </div>
      <div className="w-[140px]">
        <Select
          value={filters.status}
          onChange={(e) => onFiltersChange({ ...filters, status: e.target.value as CustomerFilter['status'] })}
          options={[
            { label: 'الكل', value: 'all' },
            { label: 'نشط', value: 'active' },
            { label: 'غير نشط', value: 'inactive' },
          ]}
        />
      </div>
      <div className="w-[160px]">
        <Select
          value={filters.hasOrders}
          onChange={(e) => onFiltersChange({ ...filters, hasOrders: e.target.value as CustomerFilter['hasOrders'] })}
          options={[
            { label: 'كل الحالات', value: 'all' },
            { label: 'لديه طلبات', value: 'yes' },
            { label: 'بدون طلبات', value: 'no' },
          ]}
        />
      </div>
    </div>
  );
}