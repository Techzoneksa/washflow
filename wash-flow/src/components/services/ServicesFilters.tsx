'use client';
import { useState } from 'react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import BottomSheet from '@/components/ui/BottomSheet';
import Button from '@/components/ui/Button';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { categoryLabels } from '@/lib/mock-services';

interface ServicesFiltersProps {
  search: string;
  status: string;
  posVisibility: string;
  category: string;
  taxable: string;
  onSearchChange: (v: string) => void;
  onStatusChange: (v: string) => void;
  onPosVisibilityChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
  onTaxableChange: (v: string) => void;
}

const statusOptions = [
  { label: 'الكل', value: 'all' },
  { label: 'نشط', value: 'active' },
  { label: 'غير نشط', value: 'inactive' },
];

const posOptions = [
  { label: 'الكل', value: 'all' },
  { label: 'يظهر في POS', value: 'visible' },
  { label: 'مخفي من POS', value: 'hidden' },
];

const taxableOptions = [
  { label: 'الكل', value: 'all' },
  { label: 'خاضع للضريبة', value: 'taxable' },
  { label: 'غير خاضع للضريبة', value: 'non-taxable' },
];

export default function ServicesFilters(props: ServicesFiltersProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  const filtersApplied = props.status !== 'all' || props.posVisibility !== 'all' || props.category !== 'all' || props.taxable !== 'all';

  const clearFilters = () => {
    props.onStatusChange('all');
    props.onPosVisibilityChange('all');
    props.onCategoryChange('all');
    props.onTaxableChange('all');
  };

  const filterContent = (
    <div className="space-y-4">
      <Select label="الحالة" options={statusOptions} value={props.status} onChange={(e) => props.onStatusChange(e.target.value)} fullWidth />
      <Select label="الظهور في POS" options={posOptions} value={props.posVisibility} onChange={(e) => props.onPosVisibilityChange(e.target.value)} fullWidth />
      <Select label="التصنيف" options={categoryLabels} value={props.category} onChange={(e) => props.onCategoryChange(e.target.value)} fullWidth />
      <Select label="الضريبة" options={taxableOptions} value={props.taxable} onChange={(e) => props.onTaxableChange(e.target.value)} fullWidth />
      <Button variant="ghost" fullWidth onClick={clearFilters}>مسح الكل</Button>
    </div>
  );

  return (
    <>
      {/* Desktop Filters */}
      <div className="hidden sm:flex flex-wrap items-end gap-3 mb-4">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="بحث باسم الخدمة، التصنيف، السعر..."
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
          <Select options={posOptions} value={props.posVisibility} onChange={(e) => props.onPosVisibilityChange(e.target.value)} />
        </div>
        <div className="w-40">
          <Select options={categoryLabels} value={props.category} onChange={(e) => props.onCategoryChange(e.target.value)} />
        </div>
        <div className="w-40">
          <Select options={taxableOptions} value={props.taxable} onChange={(e) => props.onTaxableChange(e.target.value)} />
        </div>
        {filtersApplied && (
          <button onClick={clearFilters} className="p-2 text-text-secondary hover:text-danger-500 transition-colors" title="مسح الفلاتر">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Mobile Filters */}
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

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="الفلاتر">
        {filterContent}
      </BottomSheet>
    </>
  );
}
