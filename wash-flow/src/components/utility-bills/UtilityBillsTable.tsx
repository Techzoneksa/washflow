'use client';
import Table, { Pagination } from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { UtilityBill, UtilityBillType, UtilityBillStatus } from '@/types/utility-bills';
import type { Column } from '@/components/ui/Table';
import { Eye, Pencil } from 'lucide-react';

const billTypeLabels: Record<UtilityBillType, string> = {
  electricity: 'كهرباء',
  water: 'ماء',
  internet: 'إنترنت',
  telecom: 'اتصالات',
  rent: 'إيجار',
  software: 'اشتراك برنامج',
  municipality: 'بلدية',
  government: 'رسوم حكومية',
  other: 'أخرى',
};

const paymentMethodLabels: Record<string, string> = {
  cash: 'نقدي',
  bank: 'بنك',
  transfer: 'تحويل',
  card: 'بطاقة',
};

interface UtilityBillsTableProps {
  bills: UtilityBill[];
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
  onView: (b: UtilityBill) => void;
  onEdit: (b: UtilityBill) => void;
}

function statusBadge(status: UtilityBillStatus) {
  if (status === 'paid') return <Badge variant="success" dot size="sm">مسددة</Badge>;
  if (status === 'overdue') return <Badge variant="danger" dot size="sm">متأخرة</Badge>;
  return <Badge variant="warning" dot size="sm">غير مسددة</Badge>;
}

export default function UtilityBillsTable({ bills, page, totalPages, onPageChange, onView, onEdit }: UtilityBillsTableProps) {
  const columns: Column<UtilityBill>[] = [
    {
      key: 'billNumber',
      header: 'رقم الفاتورة',
      render: (b) => <span className="font-semibold tabular-nums">{b.billNumber}</span>,
    },
    {
      key: 'type',
      header: 'نوع الخدمة',
      render: (b) => <Badge variant="info" size="sm">{billTypeLabels[b.type]}</Badge>,
    },
    {
      key: 'provider',
      header: 'الجهة',
      hideOnMobile: true,
      render: (b) => <span className="text-text-secondary truncate max-w-[140px] block">{b.provider}</span>,
    },
    {
      key: 'issueDate',
      header: 'تاريخ الإصدار',
      hideOnMobile: true,
      render: (b) => <span className="text-text-secondary">{formatDate(b.issueDate)}</span>,
    },
    {
      key: 'dueDate',
      header: 'تاريخ الاستحقاق',
      render: (b) => <span className="text-text-secondary">{formatDate(b.dueDate)}</span>,
    },
    {
      key: 'total',
      header: 'الإجمالي',
      render: (b) => <span className="font-semibold tabular-nums">{formatCurrency(b.total)}</span>,
      className: 'text-left',
    },
    {
      key: 'status',
      header: 'الحالة',
      render: (b) => statusBadge(b.status),
    },
    {
      key: 'paymentMethod',
      header: 'طريقة السداد',
      hideOnMobile: true,
      render: (b) => <span className="text-text-secondary">{b.paymentMethod ? paymentMethodLabels[b.paymentMethod] : '—'}</span>,
    },
    {
      key: 'actions',
      header: 'الإجراءات',
      className: 'text-left',
      render: (b) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => onView(b)} className="p-1.5 rounded-md hover:bg-bg-hover text-text-secondary hover:text-primary-600 transition-colors" title="عرض">
            <Eye className="h-4 w-4" />
          </button>
          <button onClick={() => onEdit(b)} className="p-1.5 rounded-md hover:bg-bg-hover text-text-secondary hover:text-primary-600 transition-colors" title="تعديل">
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
        data={bills}
        keyExtractor={(b) => b.id}
        onRowClick={onView}
        mobileCard={(b) => (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold tabular-nums">{b.billNumber}</span>
              <Badge variant="info" size="sm">{billTypeLabels[b.type]}</Badge>
            </div>
            <p className="text-text-primary text-sm truncate">{b.provider}</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">{formatDate(b.dueDate)}</span>
              <span className="font-bold tabular-nums">{formatCurrency(b.total)}</span>
            </div>
            <div className="flex items-center justify-between">
              {statusBadge(b.status)}
              <span className="text-xs text-text-secondary">{b.paymentMethod ? paymentMethodLabels[b.paymentMethod] : ''}</span>
            </div>
            <div className="flex gap-2 pt-1">
              <Button size="sm" variant="outline" icon={<Eye className="h-3 w-3" />} onClick={(e) => { e.stopPropagation(); onView(b); }}>
                عرض
              </Button>
              <Button size="sm" variant="outline" icon={<Pencil className="h-3 w-3" />} onClick={(e) => { e.stopPropagation(); onEdit(b); }}>
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
