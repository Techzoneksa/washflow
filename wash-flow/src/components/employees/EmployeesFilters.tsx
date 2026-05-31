'use client';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { Search } from 'lucide-react';
import type { EmployeeFilter } from '@/types/employees';
import { JOB_TITLES, NATIONALITIES } from '@/lib/mock-employees';

interface EmployeesFiltersProps {
  filters: EmployeeFilter;
  onFiltersChange: (filters: EmployeeFilter) => void;
}

export default function EmployeesFilters({ filters, onFiltersChange }: EmployeesFiltersProps) {
  const nationalityOptions = [
    { value: '', label: 'الكل الجنسيات' },
    ...NATIONALITIES.map(n => ({ value: n, label: n })),
  ];

  const jobTitleOptions = [
    { value: '', label: 'الكل المناصب' },
    ...JOB_TITLES.map(j => ({ value: j, label: j })),
  ];

  const statusOptions = [
    { value: 'all', label: 'الكل' },
    { value: 'active', label: 'نشط' },
    { value: 'inactive', label: 'متوقف' },
  ];

  return (
    <div className="flex flex-wrap gap-3 items-end">
      <div className="flex-1 min-w-[200px]">
        <Input
          placeholder="بحث..."
          value={filters.search}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          className="w-full"
          icon={<Search className="h-4 w-4 text-text-tertiary" />}
        />
      </div>
      <div className="w-36">
        <Select
          value={filters.status}
          onChange={(e) => onFiltersChange({ ...filters, status: e.target.value as EmployeeFilter['status'] })}
          options={statusOptions}
        />
      </div>
      <div className="w-40">
        <Select
          value={filters.nationality}
          onChange={(e) => onFiltersChange({ ...filters, nationality: e.target.value })}
          options={nationalityOptions}
        />
      </div>
      <div className="w-40">
        <Select
          value={filters.jobTitle}
          onChange={(e) => onFiltersChange({ ...filters, jobTitle: e.target.value })}
          options={jobTitleOptions}
        />
      </div>
    </div>
  );
}
