'use client';
import Table, { Pagination } from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import type { Supplier } from '@/types/suppliers';
import type { Column } from '@/components/ui/Table';
import { Eye, Pencil, Phone } from 'lucide-react';

interface SuppliersTableProps {
  suppliers: Supplier[];
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
  onView: (s: Supplier) => void;
  onEdit: (s: Supplier) => void;
}

export default function SuppliersTable({ suppliers, page, totalPages, onPageChange, onView, onEdit }: SuppliersTableProps) {
  const columns: Column<Supplier>[] = [
    {
      key: 'name',
      header: 'اسم المورد',
      render: (s) => (
        <div>
          <p className="font-semibold">{s.name}</p>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'رقم الجوال',
      render: (s) => (
        <div className="flex items-center gap-1 text-text-secondary" dir="ltr">
          <Phone className="h-3.5 w-3.5" />
          <span className="tabular-nums">{s.phone}</span>
        </div>
      ),
    },
    {
      key: 'representativeName',
      header: 'المندوب',
      hideOnMobile: true,
      render: (s) => <span className="text-text-secondary">{s.representativeName || '—'}</span>,
    },
    {
      key: 'balance',
      header: 'الرصيد',
      render: (s) => (
        <span className={`font-semibold tabular-nums ${s.balance > 0 ? 'text-danger-600' : 'text-success-600'}`}>
          {formatCurrency(s.balance)}
        </span>
      ),
      className: 'text-left',
    },
    {
      key: 'totalPurchases',
      header: 'المشتريات',
      hideOnMobile: true,
      render: (s) => <span className="tabular-nums">{formatCurrency(s.totalPurchases)}</span>,
      className: 'text-left',
    },
    {
      key: 'invoicesCount',
      header: 'الفواتير',
      render: (s) => <span className="tabular-nums text-text-secondary">{s.invoicesCount}</span>,
    },
    {
      key: 'status',
      header: 'الحالة',
      render: (s) => s.status === 'active' ? <Badge variant="success" dot>نشط</Badge> : <Badge variant="danger" dot>غير نشط</Badge>,
    },
    {
      key: 'actions',
      header: 'الإجراءات',
      className: 'text-left',
      render: (s) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => onView(s)} className="p-1.5 rounded-md hover:bg-bg-hover text-text-secondary hover:text-primary-600 transition-colors" title="عرض">
            <Eye className="h-4 w-4" />
          </button>
          <button onClick={() => onEdit(s)} className="p-1.5 rounded-md hover:bg-bg-hover text-text-secondary hover:text-primary-600 transition-colors" title="تعديل">
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
        data={suppliers}
        keyExtractor={(s) => s.id}
        onRowClick={onView}
        mobileCard={(s) => (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-semibold">{s.name}</p>
              {s.status === 'active' ? <Badge variant="success" dot size="sm">نشط</Badge> : <Badge variant="danger" dot size="sm">غير نشط</Badge>}
            </div>
            <div className="flex items-center gap-1 text-sm text-text-secondary" dir="ltr">
              <Phone className="h-3 w-3" />
              <span className="tabular-nums">{s.phone}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">الرصيد</span>
              <span className={`font-bold tabular-nums ${s.balance > 0 ? 'text-danger-600' : 'text-success-600'}`}>
                {formatCurrency(s.balance)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-text-secondary">
              <span>{s.invoicesCount} فواتير</span>
              <span>مشتريات: {formatCurrency(s.totalPurchases)}</span>
            </div>
            <div className="flex gap-2 pt-1">
              <Button size="sm" variant="outline" icon={<Eye className="h-3 w-3" />} onClick={(e) => { e.stopPropagation(); onView(s); }}>
                عرض
              </Button>
              <Button size="sm" variant="outline" icon={<Pencil className="h-3 w-3" />} onClick={(e) => { e.stopPropagation(); onEdit(s); }}>
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
