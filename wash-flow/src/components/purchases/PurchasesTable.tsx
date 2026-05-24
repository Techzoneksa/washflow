'use client';
import Table, { Pagination } from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { PurchaseInvoice } from '@/types/purchases';
import type { Column } from '@/components/ui/Table';
import { Eye } from 'lucide-react';

interface PurchasesTableProps {
  purchases: PurchaseInvoice[];
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
  onView: (p: PurchaseInvoice) => void;
}

function getPaymentBadge(status: string) {
  switch (status) {
    case 'paid': return <Badge variant="success" size="sm">مدفوعة</Badge>;
    case 'partial': return <Badge variant="warning" size="sm">جزئية</Badge>;
    default: return <Badge variant="danger" size="sm">غير مدفوعة</Badge>;
  }
}

function getPaymentMethodLabel(method?: string) {
  const labels: Record<string, string> = {
    cash: 'نقدي', bank: 'بنك', transfer: 'تحويل', credit: 'آجل',
  };
  return method ? (labels[method] || method) : '—';
}

export default function PurchasesTable({ purchases, page, totalPages, onPageChange, onView }: PurchasesTableProps) {
  const columns: Column<PurchaseInvoice>[] = [
    {
      key: 'purchaseNumber',
      header: 'رقم الشراء',
      render: (p) => <span className="font-semibold tabular-nums">{p.purchaseNumber}</span>,
    },
    {
      key: 'supplierInvoiceNumber',
      header: 'فاتورة المورد',
      hideOnMobile: true,
      render: (p) => <span className="text-text-secondary">{p.supplierInvoiceNumber || '—'}</span>,
    },
    {
      key: 'supplierName',
      header: 'المورد',
      render: (p) => <span className="font-medium">{p.supplierName}</span>,
    },
    {
      key: 'date',
      header: 'التاريخ',
      hideOnMobile: true,
      render: (p) => <span className="text-text-secondary">{formatDate(p.date)}</span>,
    },
    {
      key: 'total',
      header: 'الإجمالي',
      render: (p) => <span className="font-semibold tabular-nums">{formatCurrency(p.total)}</span>,
      className: 'text-left',
    },
    {
      key: 'paidAmount',
      header: 'المدفوع',
      hideOnMobile: true,
      render: (p) => <span className="tabular-nums text-success-600">{formatCurrency(p.paidAmount)}</span>,
      className: 'text-left',
    },
    {
      key: 'remainingAmount',
      header: 'المتبقي',
      render: (p) => (
        <span className={`tabular-nums font-semibold ${p.remainingAmount > 0 ? 'text-danger-600' : 'text-text-secondary'}`}>
          {formatCurrency(p.remainingAmount)}
        </span>
      ),
      className: 'text-left',
    },
    {
      key: 'paymentStatus',
      header: 'السداد',
      render: (p) => getPaymentBadge(p.paymentStatus),
    },
    {
      key: 'paymentMethod',
      header: 'طريقة الدفع',
      hideOnMobile: true,
      render: (p) => <span className="text-text-secondary">{getPaymentMethodLabel(p.paymentMethod)}</span>,
    },
    {
      key: 'actions',
      header: 'الإجراءات',
      className: 'text-left',
      render: (p) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => onView(p)} className="p-1.5 rounded-md hover:bg-bg-hover text-text-secondary hover:text-primary-600 transition-colors" title="عرض">
            <Eye className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Table
        columns={columns}
        data={purchases}
        keyExtractor={(p) => p.id}
        onRowClick={onView}
        mobileCard={(p) => (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold tabular-nums">{p.purchaseNumber}</span>
              {getPaymentBadge(p.paymentStatus)}
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">{p.supplierName}</span>
              <span className="text-xs text-text-secondary">{formatDate(p.date)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold tabular-nums">{formatCurrency(p.total)}</span>
              {p.remainingAmount > 0 && (
                <span className="text-sm text-danger-600 tabular-nums">متبقي: {formatCurrency(p.remainingAmount)}</span>
              )}
            </div>
            <div className="flex gap-2 pt-1">
              <Button size="sm" variant="outline" icon={<Eye className="h-3 w-3" />} onClick={(e) => { e.stopPropagation(); onView(p); }}>
                عرض
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
