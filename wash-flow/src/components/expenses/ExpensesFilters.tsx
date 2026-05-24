'use client';
import { useState } from 'react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import BottomSheet from '@/components/ui/BottomSheet';
import Button from '@/components/ui/Button';
import { Search, SlidersHorizontal, X } from 'lucide-react';

interface ExpensesFiltersProps {
  search: string;
  type: string;
  paymentMethod: string;
  dateRange: string;
  onSearchChange: (v: string) => void;
  onTypeChange: (v: string) => void;
  onPaymentMethodChange: (v: string) => void;
  onDateRangeChange: (v: string) => void;
}

const typeOptions = [
  { label: 'الكل', value: 'all' },
  { label: 'كهرباء', value: 'electricity' },
  { label: 'ماء', value: 'water' },
  { label: 'إنترنت', value: 'internet' },
  { label: 'اتصالات', value: 'telecom' },
  { label: 'إيجار', value: 'rent' },
  { label: 'صيانة', value: 'maintenance' },
  { label: 'مواد تنظيف', value: 'cleaning' },
  { label: 'وقود', value: 'fuel' },
  { label: 'تسويق', value: 'marketing' },
  { label: 'رسوم حكومية', value: 'government' },
  { label: 'أخرى', value: 'other' },
];

const paymentMethodOptions = [
  { label: 'الكل', value: 'all' },
  { label: 'نقدي', value: 'cash' },
  { label: 'بنك', value: 'bank' },
  { label: 'تحويل', value: 'transfer' },
  { label: 'بطاقة', value: 'card' },
];

const dateRangeOptions = [
  { label: 'الكل', value: 'all' },
  { label: 'اليوم', value: 'today' },
  { label: 'آخر 7 أيام', value: 'week' },
  { label: 'هذا الشهر', value: 'month' },
];

export default function ExpensesFilters(props: ExpensesFiltersProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  const filtersApplied = props.type !== 'all' || props.paymentMethod !== 'all' || props.dateRange !== 'all';

  const clearFilters = () => {
    props.onTypeChange('all');
    props.onPaymentMethodChange('all');
    props.onDateRangeChange('all');
  };

  const filterContent = (
    <div className="space-y-4">
      <Select label="نوع المصروف" options={typeOptions} value={props.type} onChange={(e) => props.onTypeChange(e.target.value)} fullWidth />
      <Select label="طريقة الدفع" options={paymentMethodOptions} value={props.paymentMethod} onChange={(e) => props.onPaymentMethodChange(e.target.value)} fullWidth />
      <Select label="التاريخ" options={dateRangeOptions} value={props.dateRange} onChange={(e) => props.onDateRangeChange(e.target.value)} fullWidth />
      <Button variant="ghost" fullWidth onClick={clearFilters}>مسح الكل</Button>
    </div>
  );

  return (
    <>
      <div className="hidden sm:flex flex-wrap items-end gap-3 mb-4">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="بحث برقم المصروف، النوع، العنوان..."
            value={props.search}
            onChange={(e) => props.onSearchChange(e.target.value)}
            icon={<Search className="h-4 w-4" />}
            fullWidth
          />
        </div>
        <div className="w-36">
          <Select options={typeOptions} value={props.type} onChange={(e) => props.onTypeChange(e.target.value)} />
        </div>
        <div className="w-36">
          <Select options={paymentMethodOptions} value={props.paymentMethod} onChange={(e) => props.onPaymentMethodChange(e.target.value)} />
        </div>
        <div className="w-36">
          <Select options={dateRangeOptions} value={props.dateRange} onChange={(e) => props.onDateRangeChange(e.target.value)} />
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

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="فلاتر المصاريف">
        {filterContent}
      </BottomSheet>
    </>
  );
}
