'use client';
import Button from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import type { Employee } from '@/types/employees';
import { getOpenAdvancesByEmployeeId } from '@/lib/mock-employees';
import EmployeeBadge from './EmployeeBadge';
import { Eye, Pencil } from 'lucide-react';

interface EmployeesTableProps {
  employees: Employee[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onView: (employee: Employee) => void;
  onEdit: (employee: Employee) => void;
}

export default function EmployeesTable({
  employees,
  page,
  totalPages,
  onPageChange,
  onView,
  onEdit,
}: EmployeesTableProps) {
  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-default">
              <th className="text-right px-4 py-3 font-semibold text-text-primary">الاسم</th>
              <th className="text-right px-4 py-3 font-semibold text-text-primary">رقم الهوية</th>
              <th className="text-right px-4 py-3 font-semibold text-text-primary">الجنسية</th>
              <th className="text-right px-4 py-3 font-semibold text-text-primary">المنصب</th>
              <th className="text-right px-4 py-3 font-semibold text-text-primary">الراتب</th>
              <th className="text-right px-4 py-3 font-semibold text-text-primary">السلف</th>
              <th className="text-right px-4 py-3 font-semibold text-text-primary">الحالة</th>
              <th className="text-right px-4 py-3 font-semibold text-text-primary">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => {
              const openAdvances = getOpenAdvancesByEmployeeId(emp.id);
              const openAdvancesTotal = openAdvances.reduce((sum, a) => sum + a.amount, 0);
              return (
                <tr key={emp.id} className="border-b border-border-subtle hover:bg-bg-hover">
                  <td className="px-4 py-3">
                    <div className="font-medium text-text-primary">{emp.fullName}</div>
                    {emp.phone && <div className="text-xs text-text-tertiary">{emp.phone}</div>}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{emp.nationalId}</td>
                  <td className="px-4 py-3 text-text-secondary">{emp.nationality}</td>
                  <td className="px-4 py-3 text-text-secondary">{emp.jobTitle}</td>
                  <td className="px-4 py-3 text-text-secondary">{formatCurrency(emp.monthlySalary)}</td>
                  <td className="px-4 py-3">
                    {openAdvancesTotal > 0 ? (
                      <span className="font-semibold text-warning-500">{formatCurrency(openAdvancesTotal)}</span>
                    ) : (
                      <span className="text-text-tertiary">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <EmployeeBadge status={emp.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => onView(emp)} className="p-1.5 rounded-md hover:bg-bg-hover text-text-tertiary" title="عرض">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button onClick={() => onEdit(emp)} className="p-1.5 rounded-md hover:bg-bg-hover text-text-tertiary" title="تعديل">
                        <Pencil className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 p-4 border-t border-border-default">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => onPageChange(page - 1)}>
            السابق
          </Button>
          <span className="px-3 py-1 text-sm text-text-secondary">
            {page} من {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => onPageChange(page + 1)}>
            التالي
          </Button>
        </div>
      )}
    </>
  );
}
