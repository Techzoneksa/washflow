'use client';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';
import type { Employee } from '@/types/employees';
import { getOpenAdvancesByEmployeeId } from '@/lib/mock-employees';
import { Phone } from 'lucide-react';

interface EmployeeCardProps {
  employee: Employee;
  onView: (employee: Employee) => void;
  onEdit: (employee: Employee) => void;
}

export default function EmployeeCard({ employee, onView, onEdit }: EmployeeCardProps) {
  const openAdvances = getOpenAdvancesByEmployeeId(employee.id);
  const openAdvancesTotal = openAdvances.reduce((sum, a) => sum + a.amount, 0);

  return (
    <Card padding="md" className="space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-text-primary">{employee.fullName}</h3>
          <p className="text-sm text-text-secondary">{employee.jobTitle}</p>
        </div>
        <Badge variant={employee.status === 'active' ? 'success' : 'neutral'}>
          {employee.status === 'active' ? 'نشط' : 'متوقف'}
        </Badge>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div>
          <span className="text-text-tertiary">الراتب:</span>
          <span className="font-semibold mr-1">{formatCurrency(employee.monthlySalary)}</span>
        </div>
        {openAdvancesTotal > 0 && (
          <div>
            <span className="text-text-tertiary">السلف:</span>
            <span className="font-semibold text-warning-500 mr-1">{formatCurrency(openAdvancesTotal)}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-text-tertiary">
        <span>{employee.nationality}</span>
        {employee.phone && (
          <span className="flex items-center gap-1">
            <Phone className="h-3 w-3" />
            {employee.phone}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-border-subtle">
        <button onClick={() => onView(employee)} className="flex-1 py-1.5 rounded-md bg-bg-hover text-text-secondary hover:text-text-primary text-sm">
          عرض
        </button>
        <button onClick={() => onEdit(employee)} className="flex-1 py-1.5 rounded-md bg-bg-hover text-text-secondary hover:text-text-primary text-sm">
          تعديل
        </button>
      </div>
    </Card>
  );
}
