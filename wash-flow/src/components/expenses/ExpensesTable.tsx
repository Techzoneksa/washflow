'use client';
import Table, { Pagination } from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Expense, ExpenseType } from '@/types/expenses';
import type { Column } from '@/components/ui/Table';
import { Eye, Pencil } from 'lucide-react';

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

const paymentMethodLabels: Record<string, string> = {
  cash: 'نقدي',
  bank: 'بنك',
  transfer: 'تحويل',
  card: 'بطاقة',
};

interface ExpensesTableProps {
  expenses: Expense[];
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
  onView: (e: Expense) => void;
  onEdit: (e: Expense) => void;
}

export default function ExpensesTable({ expenses, page, totalPages, onPageChange, onView, onEdit }: ExpensesTableProps) {
  const columns: Column<Expense>[] = [
    {
      key: 'expenseNumber',
      header: 'رقم المصروف',
      render: (e) => <span className="font-semibold tabular-nums">{e.expenseNumber}</span>,
    },
    {
      key: 'date',
      header: 'التاريخ',
      render: (e) => <span className="text-text-secondary">{formatDate(e.date)}</span>,
    },
    {
      key: 'type',
      header: 'النوع',
      render: (e) => <Badge variant="info" size="sm">{expenseTypeLabels[e.type]}</Badge>,
    },
    {
      key: 'title',
      header: 'العنوان',
      hideOnMobile: true,
      render: (e) => <span className="text-text-secondary truncate max-w-[160px] block">{e.title}</span>,
    },
    {
      key: 'amount',
      header: 'المبلغ',
      render: (e) => <span className="tabular-nums">{formatCurrency(e.amount)}</span>,
      className: 'text-left',
    },
    {
      key: 'vatAmount',
      header: 'الضريبة',
      hideOnMobile: true,
      render: (e) => <span className="tabular-nums text-text-secondary">{formatCurrency(e.vatAmount)}</span>,
      className: 'text-left',
    },
    {
      key: 'total',
      header: 'الإجمالي',
      render: (e) => <span className="font-semibold tabular-nums">{formatCurrency(e.total)}</span>,
      className: 'text-left',
    },
    {
      key: 'paymentMethod',
      header: 'طريقة الدفع',
      hideOnMobile: true,
      render: (e) => <span className="text-text-secondary">{paymentMethodLabels[e.paymentMethod]}</span>,
    },
    {
      key: 'createdBy',
      header: 'بواسطة',
      hideOnMobile: true,
      render: (e) => <span className="text-text-secondary">{e.createdBy}</span>,
    },
    {
      key: 'actions',
      header: 'الإجراءات',
      className: 'text-left',
      render: (e) => (
        <div className="flex items-center gap-1" onClick={(e2) => e2.stopPropagation()}>
          <button onClick={() => onView(e)} className="p-1.5 rounded-md hover:bg-bg-hover text-text-secondary hover:text-primary-600 transition-colors" title="عرض">
            <Eye className="h-4 w-4" />
          </button>
          <button onClick={() => onEdit(e)} className="p-1.5 rounded-md hover:bg-bg-hover text-text-secondary hover:text-primary-600 transition-colors" title="تعديل">
            <Pencil className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Table
        columns={columns}
        data={expenses}
        keyExtractor={(e) => e.id}
        onRowClick={onView}
        mobileCard={(e) => (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold tabular-nums">{e.expenseNumber}</span>
              <Badge variant="info" size="sm">{expenseTypeLabels[e.type]}</Badge>
            </div>
            <p className="text-text-primary font-medium text-sm">{e.title}</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">{formatDate(e.date)}</span>
              <span className="font-bold tabular-nums">{formatCurrency(e.total)}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-text-secondary">
              <span>{paymentMethodLabels[e.paymentMethod]}</span>
              <span>{e.createdBy}</span>
            </div>
            <div className="flex gap-2 pt-1">
              <Button size="sm" variant="outline" icon={<Eye className="h-3 w-3" />} onClick={(e2) => { e2.stopPropagation(); onView(e); }}>
                عرض
              </Button>
              <Button size="sm" variant="outline" icon={<Pencil className="h-3 w-3" />} onClick={(e2) => { e2.stopPropagation(); onEdit(e); }}>
                تعديل
              </Button>
            </div>
          </div>
        )}
      />
      <div className="px-4 pb-4">
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={onPageChange} />
      </div>
    </>
  );
}
