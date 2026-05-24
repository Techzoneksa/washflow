'use client';
import { useState } from 'react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import BottomSheet from '@/components/ui/BottomSheet';
import Button from '@/components/ui/Button';
import { Search, SlidersHorizontal, X } from 'lucide-react';

interface SuppliersFiltersProps {
  search: string;
  status: string;
  balance: string;
  onSearchChange: (v: string) => void;
  onStatusChange: (v: string) => void;
  onBalanceChange: (v: string) => void;
}

const statusOptions = [
  { label: 'الكل', value: 'all' },
  { label: 'نشط', value: 'active' },
  { label: 'غير نشط', value: 'inactive' },
];

const balanceOptions = [
  { label: 'الكل', value: 'all' },
  { label: 'عليه مستحقات', value: 'hasBalance' },
  { label: 'لا يوجد مستحقات', value: 'noBalance' },
];

export default function SuppliersFilters(props: SuppliersFiltersProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  const filtersApplied = props.status !== 'all' || props.balance !== 'all';

  const clearFilters = () => {
    props.onStatusChange('all');
    props.onBalanceChange('all');
  };

  const filterContent = (
    <div className="space-y-4">
      <Select label="الحالة" options={statusOptions} value={props.status} onChange={(e) => props.onStatusChange(e.target.value)} fullWidth />
      <Select label="الرصيد" options={balanceOptions} value={props.balance} onChange={(e) => props.onBalanceChange(e.target.value)} fullWidth />
      <Button variant="ghost" fullWidth onClick={clearFilters}>مسح الكل</Button>
    </div>
  );

  return (
    <>
      <div className="hidden sm:flex flex-wrap items-end gap-3 mb-4">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="بحث باسم المورد، الجوال، المندوب..."
            value={props.search}
            onChange={(e) => props.onSearchChange(e.target.value)}
            icon={<Search className="h-4 w-4" />}
            fullWidth
          />
        </div>
        <div className="w-40">
          <Select options={statusOptions} value={props.status} onChange={(e) => props.onStatusChange(e.target.value)} />
        </div>
        <div className="w-40">
          <Select options={balanceOptions} value={props.balance} onChange={(e) => props.onBalanceChange(e.target.value)} />
        </div>
        {filtersApplied && (
          <button onClick={clearFilters} className="p-2 text-text-secondary hover:text-danger-500 transition-colors" title="مسح الفلاتر">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="sm:hidden flex items-center gap-2 mb-4">
        <div className="flex-1">
          <Input
            placeholder="بحث..."
            value={props.search}
            onChange={(e) => props.onSearchChange(e.target.value)}
            icon={<Search className="h-4 w-4" />}
            fullWidth
          />
        </div>
        <button
          onClick={() => setSheetOpen(true)}
          className={`p-2.5 rounded-lg border transition-colors ${filtersApplied ? 'bg-primary-50 border-primary-300 text-primary-600' : 'border-border-default text-text-secondary'}`}
        >
          <SlidersHorizontal className="h-5 w-5" />
        </button>
      </div>

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="فلاتر الموردين">
        {filterContent}
      </BottomSheet>
    </>
  );
}
