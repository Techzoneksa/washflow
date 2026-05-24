'use client';
import { useState } from 'react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import BottomSheet from '@/components/ui/BottomSheet';
import Button from '@/components/ui/Button';
import { Search, SlidersHorizontal, X } from 'lucide-react';

interface UtilityBillsFiltersProps {
  search: string;
  status: string;
  type: string;
  dueDateRange: string;
  onSearchChange: (v: string) => void;
  onStatusChange: (v: string) => void;
  onTypeChange: (v: string) => void;
  onDueDateRangeChange: (v: string) => void;
}

const statusOptions = [
  { label: 'الكل', value: 'all' },
  { label: 'مسددة', value: 'paid' },
  { label: 'غير مسددة', value: 'unpaid' },
  { label: 'متأخرة', value: 'overdue' },
];

const typeOptions = [
  { label: 'الكل', value: 'all' },
  { label: 'كهرباء', value: 'electricity' },
  { label: 'ماء', value: 'water' },
  { label: 'إنترنت', value: 'internet' },
  { label: 'اتصالات', value: 'telecom' },
  { label: 'إيجار', value: 'rent' },
  { label: 'اشتراك برنامج', value: 'software' },
  { label: 'بلدية', value: 'municipality' },
  { label: 'رسوم حكومية', value: 'government' },
  { label: 'أخرى', value: 'other' },
];

const dueDateRangeOptions = [
  { label: 'الكل', value: 'all' },
  { label: 'المستحق اليوم', value: 'today' },
  { label: 'المستحق خلال 7 أيام', value: 'week' },
  { label: 'هذا الشهر', value: 'month' },
  { label: 'متأخرة', value: 'overdue' },
];

export default function UtilityBillsFilters(props: UtilityBillsFiltersProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  const filtersApplied = props.status !== 'all' || props.type !== 'all' || props.dueDateRange !== 'all';

  const clearFilters = () => {
    props.onStatusChange('all');
    props.onTypeChange('all');
    props.onDueDateRangeChange('all');
  };

  const filterContent = (
    <div className="space-y-4">
      <Select label="الحالة" options={statusOptions} value={props.status} onChange={(e) => props.onStatusChange(e.target.value)} fullWidth />
      <Select label="نوع الخدمة" options={typeOptions} value={props.type} onChange={(e) => props.onTypeChange(e.target.value)} fullWidth />
      <Select label="تاريخ الاستحقاق" options={dueDateRangeOptions} value={props.dueDateRange} onChange={(e) => props.onDueDateRangeChange(e.target.value)} fullWidth />
      <Button variant="ghost" fullWidth onClick={clearFilters}>مسح الكل</Button>
    </div>
  );

  return (
    <>
      <div className="hidden sm:flex flex-wrap items-end gap-3 mb-4">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="بحث برقم الفاتورة، النوع، الجهة..."
            value={props.search}
            onChange={(e) => props.onSearchChange(e.target.value)}
            icon={<Search className="h-4 w-4" />}
            fullWidth
          />
        </div>
        <div className="w-36">
          <Select options={statusOptions} value={props.status} onChange={(e) => props.onStatusChange(e.target.value)} />
        </div>
        <div className="w-36">
          <Select options={typeOptions} value={props.type} onChange={(e) => props.onTypeChange(e.target.value)} />
        </div>
        <div className="w-36">
          <Select options={dueDateRangeOptions} value={props.dueDateRange} onChange={(e) => props.onDueDateRangeChange(e.target.value)} />
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

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="فلاتر فواتير الخدمات">
        {filterContent}
      </BottomSheet>
    </>
  );
}
