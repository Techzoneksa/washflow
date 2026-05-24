'use client';
import { useState } from 'react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import BottomSheet from '@/components/ui/BottomSheet';
import Button from '@/components/ui/Button';
import { getSuppliers } from '@/lib/mock-suppliers';
import { Search, SlidersHorizontal, X } from 'lucide-react';

interface PurchasesFiltersProps {
  search: string;
  paymentStatus: string;
  paymentMethod: string;
  supplierId: string;
  dateRange: string;
  onSearchChange: (v: string) => void;
  onPaymentStatusChange: (v: string) => void;
  onPaymentMethodChange: (v: string) => void;
  onSupplierChange: (v: string) => void;
  onDateRangeChange: (v: string) => void;
}

const paymentStatusOptions = [
  { label: 'الكل', value: 'all' },
  { label: 'مدفوعة', value: 'paid' },
  { label: 'غير مدفوعة', value: 'unpaid' },
  { label: 'مدفوعة جزئيًا', value: 'partial' },
];

const paymentMethodOptions = [
  { label: 'الكل', value: 'all' },
  { label: 'نقدي', value: 'cash' },
  { label: 'بنك', value: 'bank' },
  { label: 'تحويل', value: 'transfer' },
  { label: 'آجل', value: 'credit' },
];

const dateOptions = [
  { label: 'الكل', value: 'all' },
  { label: 'اليوم', value: 'today' },
  { label: 'آخر 7 أيام', value: 'week' },
  { label: 'هذا الشهر', value: 'month' },
];

export default function PurchasesFilters(props: PurchasesFiltersProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const suppliers = getSuppliers();

  const supplierOptions = [
    { label: 'الكل', value: 'all' },
    ...suppliers.map((s) => ({ label: s.name, value: s.id })),
  ];

  const filtersApplied = props.paymentStatus !== 'all' || props.paymentMethod !== 'all' || props.supplierId !== 'all' || props.dateRange !== 'all';

  const clearFilters = () => {
    props.onPaymentStatusChange('all');
    props.onPaymentMethodChange('all');
    props.onSupplierChange('all');
    props.onDateRangeChange('all');
  };

  const filterContent = (
    <div className="space-y-4">
      <Select label="حالة السداد" options={paymentStatusOptions} value={props.paymentStatus} onChange={(e) => props.onPaymentStatusChange(e.target.value)} fullWidth />
      <Select label="طريقة الدفع" options={paymentMethodOptions} value={props.paymentMethod} onChange={(e) => props.onPaymentMethodChange(e.target.value)} fullWidth />
      <Select label="المورد" options={supplierOptions} value={props.supplierId} onChange={(e) => props.onSupplierChange(e.target.value)} fullWidth />
      <Select label="التاريخ" options={dateOptions} value={props.dateRange} onChange={(e) => props.onDateRangeChange(e.target.value)} fullWidth />
      <Button variant="ghost" fullWidth onClick={clearFilters}>مسح الكل</Button>
    </div>
  );

  return (
    <>
      <div className="hidden sm:flex flex-wrap items-end gap-3 mb-4">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="بحث برقم الشراء، المورد، البند..."
            value={props.search}
            onChange={(e) => props.onSearchChange(e.target.value)}
            icon={<Search className="h-4 w-4" />}
            fullWidth
          />
        </div>
        <div className="w-36">
          <Select options={paymentStatusOptions} value={props.paymentStatus} onChange={(e) => props.onPaymentStatusChange(e.target.value)} />
        </div>
        <div className="w-36">
          <Select options={paymentMethodOptions} value={props.paymentMethod} onChange={(e) => props.onPaymentMethodChange(e.target.value)} />
        </div>
        <div className="w-44">
          <Select options={supplierOptions} value={props.supplierId} onChange={(e) => props.onSupplierChange(e.target.value)} />
        </div>
        <div className="w-36">
          <Select options={dateOptions} value={props.dateRange} onChange={(e) => props.onDateRangeChange(e.target.value)} />
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

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="فلاتر المشتريات">
        {filterContent}
      </BottomSheet>
    </>
  );
}
