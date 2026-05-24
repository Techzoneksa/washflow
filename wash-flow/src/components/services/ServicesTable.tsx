'use client';
import Table, { Pagination } from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import type { ServiceItem } from '@/types/services';
import type { Column } from '@/components/ui/Table';
import { Eye, Pencil, ToggleLeft, ToggleRight } from 'lucide-react';

interface ServicesTableProps {
  services: ServiceItem[];
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
  onView: (s: ServiceItem) => void;
  onEdit: (s: ServiceItem) => void;
  onToggle: (s: ServiceItem) => void;
}

export default function ServicesTable({ services, page, totalPages, onPageChange, onView, onEdit, onToggle }: ServicesTableProps) {
  const columns: Column<ServiceItem>[] = [
    {
      key: 'sortOrder',
      header: '#',
      render: (s) => <span className="tabular-nums text-text-secondary">{s.sortOrder}</span>,
      className: 'w-10',
    },
    {
      key: 'nameAr',
      header: 'اسم الخدمة',
      render: (s) => (
        <div>
          <p className="font-semibold">{s.nameAr}</p>
          {s.nameEn && <p className="text-xs text-text-secondary" dir="ltr">{s.nameEn}</p>}
        </div>
      ),
    },
    {
      key: 'category',
      header: 'التصنيف',
      hideOnMobile: true,
      render: (s) => <Badge variant="info" size="sm">{s.category}</Badge>,
    },
    {
      key: 'price',
      header: 'السعر',
      render: (s) => <span className="font-semibold tabular-nums">{s.price === 0 ? 'متغير' : formatCurrency(s.price)}</span>,
      className: 'text-left',
    },
    {
      key: 'duration',
      header: 'المدة',
      hideOnMobile: true,
      render: (s) => <span className="text-text-secondary">{s.durationMinutes ? `${s.durationMinutes} د` : '—'}</span>,
    },
    {
      key: 'status',
      header: 'الحالة',
      render: (s) => s.isActive ? <Badge variant="success" dot>نشط</Badge> : <Badge variant="danger" dot>غير نشط</Badge>,
    },
    {
      key: 'showInPOS',
      header: 'POS',
      hideOnMobile: true,
      render: (s) => s.showInPOS ? <Badge variant="success" size="sm">ظاهر</Badge> : <Badge variant="neutral" size="sm">مخفي</Badge>,
    },
    {
      key: 'isTaxable',
      header: 'الضريبة',
      hideOnMobile: true,
      render: (s) => s.isTaxable ? <Badge variant="primary" size="sm">نعم</Badge> : <Badge variant="neutral" size="sm">لا</Badge>,
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
          <button onClick={() => onToggle(s)} className="p-1.5 rounded-md hover:bg-bg-hover text-text-secondary hover:text-warning-600 transition-colors" title={s.isActive ? 'تعطيل' : 'تفعيل'}>
            {s.isActive ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Table
        columns={columns}
        data={services}
        keyExtractor={(s) => s.id}
        onRowClick={onView}
        mobileCard={(s) => (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{s.nameAr}</p>
                <p className="text-xs text-text-secondary">{s.category}</p>
              </div>
              <span className="font-bold tabular-nums">{s.price === 0 ? 'متغير' : formatCurrency(s.price)}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              {s.isActive ? <Badge variant="success" dot size="sm">نشط</Badge> : <Badge variant="danger" dot size="sm">غير نشط</Badge>}
              {s.showInPOS ? <Badge variant="success" size="sm">POS</Badge> : <Badge variant="neutral" size="sm">مخفي</Badge>}
              {s.durationMinutes && <span className="text-text-secondary">{s.durationMinutes} د</span>}
            </div>
            <div className="flex gap-2 pt-1">
              <Button size="sm" variant="outline" icon={<Eye className="h-3 w-3" />} onClick={(e) => { e.stopPropagation(); onView(s); }}>
                عرض
              </Button>
              <Button size="sm" variant="outline" icon={<Pencil className="h-3 w-3" />} onClick={(e) => { e.stopPropagation(); onEdit(s); }}>
                تعديل
              </Button>
              <Button size="sm" variant={s.isActive ? 'danger' : 'success'} icon={s.isActive ? <ToggleRight className="h-3 w-3" /> : <ToggleLeft className="h-3 w-3" />} onClick={(e) => { e.stopPropagation(); onToggle(s); }}>
                {s.isActive ? 'تعطيل' : 'تفعيل'}
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
