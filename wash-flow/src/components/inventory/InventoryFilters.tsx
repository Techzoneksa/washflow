'use client';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { Search } from 'lucide-react';
import type { InventoryFilter, InventoryCategory } from '@/types/inventory';
import { INVENTORY_CATEGORY_LABELS } from '@/types/inventory';

interface InventoryFiltersProps {
  filters: InventoryFilter;
  onFiltersChange: (filters: InventoryFilter) => void;
}

const categoryOptions = [
  { value: 'all', label: 'الكل' },
  ...Object.entries(INVENTORY_CATEGORY_LABELS).map(([value, label]) => ({ value, label })),
];

const statusOptions = [
  { value: 'all', label: 'الكل' },
  { value: 'active', label: 'نشط' },
  { value: 'inactive', label: 'غير نشط' },
];

const stockStatusOptions = [
  { value: 'all', label: 'الكل' },
  { value: 'low', label: 'منخفض المخزون' },
  { value: 'out', label: 'نفد المخزون' },
];

export default function InventoryFilters({ filters, onFiltersChange }: InventoryFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3 items-end">
      <div className="flex-1 min-w-[200px]">
        <Input
          placeholder="بحث باسم المادة..."
          value={filters.search}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          className="w-full"
          icon={<Search className="h-4 w-4 text-text-tertiary" />}
        />
      </div>
      <div className="w-40">
        <Select
          value={filters.category}
          onChange={(e) => onFiltersChange({ ...filters, category: e.target.value as InventoryCategory | 'all' })}
          options={categoryOptions}
        />
      </div>
      <div className="w-32">
        <Select
          value={filters.status}
          onChange={(e) => onFiltersChange({ ...filters, status: e.target.value as 'all' | 'active' | 'inactive' })}
          options={statusOptions}
        />
      </div>
      <div className="w-40">
        <Select
          value={filters.stockStatus}
          onChange={(e) => onFiltersChange({ ...filters, stockStatus: e.target.value as 'all' | 'low' | 'out' })}
          options={stockStatusOptions}
        />
      </div>
    </div>
  );
}
