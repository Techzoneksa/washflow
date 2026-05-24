'use client';
import { useState, useMemo, useCallback } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import ExpensesSummaryCards from './ExpensesSummaryCards';
import ExpensesFilters from './ExpensesFilters';
import ExpensesTable from './ExpensesTable';
import ExpenseDetailsDrawer from './ExpenseDetailsDrawer';
import ExpenseFormDrawer from './ExpenseFormDrawer';
import { getExpenses, addExpense, updateExpense } from '@/lib/mock-expenses';
import type { Expense, ExpenseType } from '@/types/expenses';
import type { ExpenseFormData } from './ExpenseFormDrawer';
import { Plus, Wallet } from 'lucide-react';

const PAGE_SIZE = 10;

const expenseTypeLabels: Record<ExpenseType, string> = {
  electricity: 'كهرباء',
  water: 'ماء',
  internet: 'إنترنت',
  telecom: 'اتصالات',
  rent: 'إيجار',
  salaries: 'رواتب',
  cleaning: 'مواد تنظيف',
  maintenance: 'صيانة',
  fuel: 'وقود',
  marketing: 'تسويق',
  government: 'رسوم حكومية',
  other: 'أخرى',
};

export default function ExpensesPageShell() {
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>(getExpenses);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [paymentMethod, setPaymentMethod] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [page, setPage] = useState(1);

  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editExpense, setEditExpense] = useState<Expense | null>(null);

  const refreshExpenses = useCallback(() => {
    setExpenses([...getExpenses()]);
  }, []);

  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      if (search) {
        const q = search.toLowerCase();
        const match =
          e.expenseNumber.toLowerCase().includes(q) ||
          expenseTypeLabels[e.type].includes(q) ||
          e.title.toLowerCase().includes(q) ||
          (e.description || '').toLowerCase().includes(q) ||
          e.paymentMethod.toLowerCase().includes(q) ||
          e.createdBy.includes(q) ||
          (e.notes || '').toLowerCase().includes(q);
        if (!match) return false;
      }
      if (typeFilter !== 'all' && e.type !== typeFilter) return false;
      if (paymentMethod !== 'all' && e.paymentMethod !== paymentMethod) return false;
      if (dateRange !== 'all') {
        const expenseDate = new Date(e.date);
        const now = new Date();
        if (dateRange === 'today') {
          const todayStr = now.toISOString().split('T')[0];
          if (e.date !== todayStr) return false;
        } else if (dateRange === 'week') {
          const weekAgo = new Date(now.getTime() - 7 * 86400000);
          if (expenseDate < weekAgo) return false;
        } else if (dateRange === 'month') {
          if (expenseDate.getMonth() !== now.getMonth() || expenseDate.getFullYear() !== now.getFullYear()) return false;
        }
      }
      return true;
    });
  }, [expenses, search, typeFilter, paymentMethod, dateRange]);

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return {
      items: filtered.slice(start, start + PAGE_SIZE),
      totalPages: Math.ceil(filtered.length / PAGE_SIZE),
    };
  }, [filtered, page]);

  const summary = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const todayTotal = expenses
      .filter((e) => e.date === todayStr)
      .reduce((sum, e) => sum + e.total, 0);
    const monthTotal = expenses
      .filter((e) => {
        const d = new Date(e.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((sum, e) => sum + e.total, 0);
    const totalVat = expenses.reduce((sum, e) => sum + e.vatAmount, 0);

    const typeCounts: Record<string, number> = {};
    expenses.forEach((e) => {
      typeCounts[e.type] = (typeCounts[e.type] || 0) + 1;
    });
    let topType = '';
    let maxCount = 0;
    for (const [t, c] of Object.entries(typeCounts)) {
      if (c > maxCount) {
        maxCount = c;
        topType = expenseTypeLabels[t as ExpenseType] || t;
      }
    }
    return { todayTotal, monthTotal, count: expenses.length, topType, totalVat };
  }, [expenses]);

  const handleView = useCallback((e: Expense) => {
    setSelectedExpense(e);
    setDetailsOpen(true);
  }, []);

  const handleEdit = useCallback((e: Expense) => {
    setEditExpense(e);
    setFormOpen(true);
  }, []);

  const handleAdd = useCallback(() => {
    setEditExpense(null);
    setFormOpen(true);
  }, []);

  const handleSave = useCallback((data: ExpenseFormData) => {
    if (editExpense) {
      const updated = updateExpense(editExpense.id, {
        type: data.type,
        title: data.title,
        description: data.description || undefined,
        date: data.date,
        amount: data.amount,
        vatAmount: data.vatAmount,
        total: data.total,
        paymentMethod: data.paymentMethod,
        accountName: data.accountName || undefined,
        notes: data.notes || undefined,
      });
      if (updated) {
        refreshExpenses();
        setFormOpen(false);
        setEditExpense(null);
        toast('success', 'تم تحديث المصروف بنجاح');
      }
    } else {
      const created = addExpense({
        type: data.type,
        title: data.title,
        description: data.description || undefined,
        date: data.date,
        amount: data.amount,
        vatAmount: data.hasVat ? data.amount * 0.15 : 0,
        total: data.amount + (data.hasVat ? data.amount * 0.15 : 0),
        paymentMethod: data.paymentMethod,
        accountName: data.accountName || undefined,
        attachmentUrl: undefined,
        notes: data.notes || undefined,
        createdBy: 'مالك النظام',
      });
      if (created) {
        refreshExpenses();
        setFormOpen(false);
        toast('success', 'تم إضافة المصروف بنجاح');
      }
    }
  }, [editExpense, refreshExpenses, toast]);

  const handleCloseForm = useCallback(() => {
    setFormOpen(false);
    setEditExpense(null);
  }, []);

  return (
    <>
      <PageHeader
        title="المصاريف"
        description="تسجيل ومتابعة مصاريف التشغيل"
        actions={
          <Button icon={<Plus className="h-4 w-4" />} onClick={handleAdd}>
            إضافة مصروف
          </Button>
        }
      />

      <ExpensesSummaryCards data={summary} />

      <div className="bg-bg-surface border border-border-default rounded-card">
        <div className="p-4 pb-0">
          <ExpensesFilters
            search={search}
            type={typeFilter}
            paymentMethod={paymentMethod}
            dateRange={dateRange}
            onSearchChange={(v) => { setSearch(v); setPage(1); }}
            onTypeChange={(v) => { setTypeFilter(v); setPage(1); }}
            onPaymentMethodChange={(v) => { setPaymentMethod(v); setPage(1); }}
            onDateRangeChange={(v) => { setDateRange(v); setPage(1); }}
          />
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<Wallet className="h-16 w-16" />}
            title="لا توجد مصاريف"
            description="لا توجد مصاريف تطابق معايير البحث"
          />
        ) : (
          <ExpensesTable
            expenses={paginated.items}
            page={page}
            totalPages={paginated.totalPages}
            onPageChange={setPage}
            onView={handleView}
            onEdit={handleEdit}
          />
        )}
      </div>

      <ExpenseDetailsDrawer
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        expense={selectedExpense}
        onEdit={handleEdit}
      />

      <ExpenseFormDrawer
        open={formOpen}
        onClose={handleCloseForm}
        onSave={handleSave}
        expense={editExpense}
      />
    </>
  );
}
