'use client';
import Drawer from '@/components/ui/Drawer';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';
import type { Employee } from '@/types/employees';
import { getEmployeeLedger, getAdvancesByEmployeeId, getSalaryPaymentsByEmployeeId } from '@/lib/mock-employees';
import { Pencil, Wallet, TrendingDown, History } from 'lucide-react';

interface EmployeeDetailsDrawerProps {
  open: boolean;
  onClose: () => void;
  employee: Employee | null;
  onEdit: (employee: Employee) => void;
  onAddAdvance: (employee: Employee) => void;
  onPaySalary: (employee: Employee) => void;
}

export default function EmployeeDetailsDrawer({
  open,
  onClose,
  employee,
  onEdit,
  onAddAdvance,
  onPaySalary,
}: EmployeeDetailsDrawerProps) {
  if (!employee) return null;

  const ledger = getEmployeeLedger(employee.id);
  const advances = getAdvancesByEmployeeId(employee.id).slice(0, 5);
  const salaries = getSalaryPaymentsByEmployeeId(employee.id).slice(0, 5);

  return (
    <Drawer open={open} onClose={onClose} title="تفاصيل العامل">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-text-primary">{employee.fullName}</h3>
            <p className="text-sm text-text-secondary">{employee.jobTitle}</p>
          </div>
          <Badge variant={employee.status === 'active' ? 'success' : 'neutral'}>
            {employee.status === 'active' ? 'نشط' : 'متوقف'}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Card padding="sm" className="bg-bg-subtle">
            <p className="text-xs text-text-tertiary mb-1">رقم الهوية</p>
            <p className="text-sm font-medium text-text-primary">{employee.nationalId}</p>
          </Card>
          <Card padding="sm" className="bg-bg-subtle">
            <p className="text-xs text-text-tertiary mb-1">الجنسية</p>
            <p className="text-sm font-medium text-text-primary">{employee.nationality}</p>
          </Card>
          <Card padding="sm" className="bg-bg-subtle">
            <p className="text-xs text-text-tertiary mb-1">تاريخ الميلاد</p>
            <p className="text-sm font-medium text-text-primary">{employee.birthDate}</p>
          </Card>
          <Card padding="sm" className="bg-bg-subtle">
            <p className="text-xs text-text-tertiary mb-1">تاريخ الانضمام</p>
            <p className="text-sm font-medium text-text-primary">{employee.joinDate}</p>
          </Card>
        </div>

        {employee.phone && (
          <div>
            <p className="text-xs text-text-tertiary">الجوال</p>
            <p className="text-sm text-text-primary">{employee.phone}</p>
          </div>
        )}

        {employee.notes && (
          <div>
            <p className="text-xs text-text-tertiary">ملاحظات</p>
            <p className="text-sm text-text-primary">{employee.notes}</p>
          </div>
        )}

        {ledger && (
          <>
            <div className="border-t border-border-default pt-4">
              <h4 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                <TrendingDown className="h-4 w-4" />
                حساب العامل
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <Card padding="sm" className="bg-bg-subtle">
                  <p className="text-xs text-text-tertiary mb-1">الراتب الشهري</p>
                  <p className="text-base font-bold text-text-primary">{formatCurrency(ledger.employee.monthlySalary)}</p>
                </Card>
                <Card padding="sm" className="bg-bg-subtle">
                  <p className="text-xs text-text-tertiary mb-1">السلف المفتوحة</p>
                  <p className="text-base font-bold text-warning-500">{formatCurrency(ledger.openAdvances)}</p>
                </Card>
                <Card padding="sm" className="bg-bg-subtle">
                  <p className="text-xs text-text-tertiary mb-1">إجمالي السلف</p>
                  <p className="text-base font-bold text-text-primary">{formatCurrency(ledger.totalAdvances)}</p>
                </Card>
                <Card padding="sm" className="bg-bg-subtle">
                  <p className="text-xs text-text-tertiary mb-1">صافي الراتب المتوقع</p>
                  <p className="text-base font-bold text-success-500">
                    {formatCurrency(ledger.employee.monthlySalary - ledger.openAdvances)}
                  </p>
                </Card>
                <Card padding="sm" className="bg-bg-subtle">
                  <p className="text-xs text-text-tertiary mb-1">الرواتب المصروفة</p>
                  <p className="text-base font-bold text-text-primary">{ledger.salaryCount} شهر</p>
                </Card>
                <Card padding="sm" className="bg-bg-subtle">
                  <p className="text-xs text-text-tertiary mb-1">إجمالي ما تم صرفه</p>
                  <p className="text-base font-bold text-primary-500">{formatCurrency(ledger.totalPaidSalaries)}</p>
                </Card>
              </div>
            </div>

            <div className="border-t border-border-default pt-4">
              <h4 className="text-sm font-semibold text-text-primary mb-2 flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                آخر السلف
              </h4>
              {advances.length === 0 ? (
                <p className="text-sm text-text-tertiary">لا توجد سلف</p>
              ) : (
                <div className="space-y-2">
                  {advances.map((a) => (
                    <div key={a.id} className="flex items-center justify-between text-sm py-2 border-b border-border-subtle last:border-0">
                      <div>
                        <p className="text-text-primary">{formatCurrency(a.amount)}</p>
                        <p className="text-xs text-text-tertiary">{a.reason || a.date}</p>
                      </div>
                      <span className={`text-xs font-medium ${a.status === 'open' ? 'text-warning-500' : a.status === 'deducted' ? 'text-info-500' : 'text-success-500'}`}>
                        {a.status === 'open' ? 'مفتوحة' : a.status === 'deducted' ? 'مخصومة' : 'تم الخصم'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-border-default pt-4">
              <h4 className="text-sm font-semibold text-text-primary mb-2 flex items-center gap-2">
                <History className="h-4 w-4" />
                آخر الرواتب
              </h4>
              {salaries.length === 0 ? (
                <p className="text-sm text-text-tertiary">لا توجد رواتب</p>
              ) : (
                <div className="space-y-2">
                  {salaries.map((s) => (
                    <div key={s.id} className="flex items-center justify-between text-sm py-2 border-b border-border-subtle last:border-0">
                      <div>
                        <p className="text-text-primary">{s.month}</p>
                        <p className="text-xs text-text-tertiary">
                          الأساسي: {formatCurrency(s.baseSalary)} | المخصومات: {formatCurrency(s.advancesDeducted + s.otherDeductions)}
                        </p>
                      </div>
                      <p className="font-semibold text-success-500">{formatCurrency(s.netSalary)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        <div className="flex flex-wrap gap-2 pt-2">
          <Button variant="outline" size="sm" icon={<Pencil className="h-4 w-4" />} onClick={() => onEdit(employee)}>
            تعديل
          </Button>
          <Button variant="outline" size="sm" icon={<Wallet className="h-4 w-4" />} onClick={() => onAddAdvance(employee)}>
            إضافة سلفة
          </Button>
          <Button size="sm" icon={<TrendingDown className="h-4 w-4" />} onClick={() => onPaySalary(employee)}>
            صرف راتب
          </Button>
        </div>
      </div>
    </Drawer>
  );
}

function Badge({ variant, children }: { variant: string; children: React.ReactNode }) {
  const styles: Record<string, string> = {
    success: 'bg-success-50 text-success-700',
    neutral: 'bg-neutral-100 text-neutral-700',
    warning: 'bg-warning-50 text-warning-700',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${styles[variant] || styles.neutral}`}>
      {children}
    </span>
  );
}
