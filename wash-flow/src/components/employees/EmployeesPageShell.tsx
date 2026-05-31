'use client';
import { useState, useMemo, useCallback } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import EmployeesSummaryCards from './EmployeesSummaryCards';
import EmployeesFilters from './EmployeesFilters';
import EmployeesTable from './EmployeesTable';
import EmployeeCard from './EmployeeCard';
import EmployeeDetailsDrawer from './EmployeeDetailsDrawer';
import EmployeeFormDrawer, { EmployeeFormData } from './EmployeeFormDrawer';
import AdvanceFormModal, { AdvanceFormData } from './AdvanceFormModal';
import SalaryPaymentModal, { SalaryPaymentFormData } from './SalaryPaymentModal';
import {
  getEmployees,
  getEmployeesSummary,
  filterEmployees,
  addEmployee,
  updateEmployee,
  addAdvance,
  addSalaryPayment,
  getOpenAdvancesByEmployeeId,
} from '@/lib/mock-employees';
import type { Employee, EmployeeFilter } from '@/types/employees';
import { Plus, Users } from 'lucide-react';

const PAGE_SIZE = 10;

export default function EmployeesPageShell() {
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>(getEmployees());
  const [filters, setFilters] = useState<EmployeeFilter>({
    search: '',
    status: 'all',
    nationality: '',
    jobTitle: '',
  });
  const [page, setPage] = useState(1);

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [advanceModalOpen, setAdvanceModalOpen] = useState(false);
  const [salaryModalOpen, setSalaryModalOpen] = useState(false);

  const refreshEmployees = useCallback(() => {
    setEmployees([...getEmployees()]);
  }, []);

  const summary = useMemo(() => getEmployeesSummary(), [employees]);

  const filtered = useMemo(() => {
    return filterEmployees(employees, filters);
  }, [employees, filters]);

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return {
      items: filtered.slice(start, start + PAGE_SIZE),
      totalPages: Math.ceil(filtered.length / PAGE_SIZE),
    };
  }, [filtered, page]);

  const existingNationalIds = useMemo(() => employees.map(e => e.nationalId), [employees]);

  const handleView = useCallback((emp: Employee) => {
    setSelectedEmployee(emp);
    setDetailsOpen(true);
  }, []);

  const handleEdit = useCallback((emp: Employee) => {
    setEditEmployee(emp);
    setFormOpen(true);
  }, []);

  const handleAdd = useCallback(() => {
    setEditEmployee(null);
    setFormOpen(true);
  }, []);

  const handleSave = useCallback((data: EmployeeFormData) => {
    if (editEmployee) {
      const updated = updateEmployee(editEmployee.id, {
        fullName: data.fullName,
        nationalId: data.nationalId,
        nationality: data.nationality,
        birthDate: data.birthDate,
        joinDate: data.joinDate,
        jobTitle: data.jobTitle,
        monthlySalary: data.monthlySalary,
        phone: data.phone,
        status: data.status,
        notes: data.notes,
      });
      if (updated) {
        refreshEmployees();
        setFormOpen(false);
        setEditEmployee(null);
        toast('success', 'تم تحديث بيانات العامل بنجاح');
      }
    } else {
      const created = addEmployee({
        fullName: data.fullName,
        nationalId: data.nationalId,
        nationality: data.nationality,
        birthDate: data.birthDate,
        joinDate: data.joinDate,
        jobTitle: data.jobTitle,
        monthlySalary: data.monthlySalary,
        phone: data.phone,
        status: data.status,
        notes: data.notes,
      });
      if (created) {
        refreshEmployees();
        setFormOpen(false);
        toast('success', 'تم إضافة العامل بنجاح');
      }
    }
  }, [editEmployee, refreshEmployees, toast]);

  const handleCloseForm = useCallback(() => {
    setFormOpen(false);
    setEditEmployee(null);
  }, []);

  const handleAddAdvance = useCallback((emp: Employee) => {
    setSelectedEmployee(emp);
    setAdvanceModalOpen(true);
  }, []);

  const handleSaveAdvance = useCallback((data: AdvanceFormData) => {
    addAdvance({
      ...data,
      status: 'open',
    });
    refreshEmployees();
    setAdvanceModalOpen(false);
    toast('success', 'تم تسجيل السلفة بنجاح');
  }, [refreshEmployees, toast]);

  const handlePaySalary = useCallback((emp: Employee) => {
    setSelectedEmployee(emp);
    setSalaryModalOpen(true);
  }, []);

  const handleSaveSalary = useCallback((data: SalaryPaymentFormData) => {
    addSalaryPayment(data);

    if (data.advancesDeducted > 0) {
      const openAdvances = getOpenAdvancesByEmployeeId(data.employeeId);
      let remaining = data.advancesDeducted;
      for (const adv of openAdvances) {
        if (remaining <= 0) break;
        adv.status = 'deducted';
        remaining -= adv.amount;
      }
    }

    refreshEmployees();
    setSalaryModalOpen(false);
    toast('success', 'تم صرف الراتب بنجاح');
  }, [refreshEmployees, toast]);

  return (
    <>
      <PageHeader
        title="العمالة"
        description="إدارة العمال والرواتب والسلف"
        actions={
          <Button icon={<Plus className="h-4 w-4" />} onClick={handleAdd}>
            إضافة عامل
          </Button>
        }
      />

      <EmployeesSummaryCards data={summary} />

      <div className="bg-bg-surface border border-border-default rounded-card">
        <div className="p-4 pb-0">
          <EmployeesFilters
            filters={filters}
            onFiltersChange={(f) => { setFilters(f); setPage(1); }}
          />
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<Users className="h-16 w-16" />}
            title="لا توجد عمال"
            description="لا توجد عمال مطابقين لمعايير البحث"
          />
        ) : (
          <>
            <div className="hidden md:block">
              <EmployeesTable
                employees={paginated.items}
                page={page}
                totalPages={paginated.totalPages}
                onPageChange={setPage}
                onView={handleView}
                onEdit={handleEdit}
              />
            </div>
            <div className="md:hidden p-4 space-y-3">
              {paginated.items.map((emp) => (
                <EmployeeCard
                  key={emp.id}
                  employee={emp}
                  onView={handleView}
                  onEdit={handleEdit}
                />
              ))}
              {paginated.totalPages > 1 && (
                <div className="flex justify-center gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                  >
                    السابق
                  </Button>
                  <span className="px-3 py-1 text-sm text-text-secondary">
                    {page} / {paginated.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === paginated.totalPages}
                    onClick={() => setPage(p => p + 1)}
                  >
                    التالي
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <EmployeeDetailsDrawer
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        employee={selectedEmployee}
        onEdit={(emp) => { setDetailsOpen(false); handleEdit(emp); }}
        onAddAdvance={(emp) => { setDetailsOpen(false); handleAddAdvance(emp); }}
        onPaySalary={(emp) => { setDetailsOpen(false); handlePaySalary(emp); }}
      />

      <EmployeeFormDrawer
        open={formOpen}
        onClose={handleCloseForm}
        onSave={handleSave}
        employee={editEmployee}
        existingNationalIds={existingNationalIds}
      />

      {selectedEmployee && (
        <>
          <AdvanceFormModal
            open={advanceModalOpen}
            onClose={() => setAdvanceModalOpen(false)}
            onSave={handleSaveAdvance}
            employee={selectedEmployee}
          />
          <SalaryPaymentModal
            open={salaryModalOpen}
            onClose={() => setSalaryModalOpen(false)}
            onSave={handleSaveSalary}
            employee={selectedEmployee}
          />
        </>
      )}
    </>
  );
}
