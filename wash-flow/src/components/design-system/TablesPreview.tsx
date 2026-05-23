'use client';
import Table, { Pagination } from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import { formatCurrency, getStatusLabel } from '@/lib/utils';
import { mockOrders } from '@/lib/mock-data';
import type { Order } from '@/types';

const statusVariant: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'primary'> = {
  completed: 'success',
  'in-progress': 'info',
  cancelled: 'danger',
  refunded: 'warning',
  new: 'primary',
};

const paymentVariant: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'neutral'> = {
  paid: 'success',
  unpaid: 'danger',
  partial: 'warning',
  overdue: 'danger',
};

export default function TablesPreview() {
  const columns = [
    { key: 'id', header: 'رقم الطلب', className: 'w-24' },
    { key: 'services', header: 'الخدمات', render: (item: Order) => item.services.join('، '), hideOnMobile: false },
    {
      key: 'total',
      header: 'المجموع',
      render: (item: Order) => <span className="font-semibold">{formatCurrency(item.total)}</span>,
      className: 'w-24',
    },
    {
      key: 'status',
      header: 'الحالة',
      render: (item: Order) => (
        <Badge variant={statusVariant[item.status] || 'neutral'} size="sm">
          {getStatusLabel(item.status)}
        </Badge>
      ),
      className: 'w-28',
    },
    {
      key: 'paymentStatus',
      header: 'الدفع',
      render: (item: Order) => (
        <Badge variant={paymentVariant[item.paymentStatus] || 'neutral'} size="sm">
          {getStatusLabel(item.paymentStatus)}
        </Badge>
      ),
      className: 'w-28',
    },
    {
      key: 'createdAt',
      header: 'التاريخ',
      render: (item: Order) => new Date(item.createdAt).toLocaleDateString('ar-SA'),
      className: 'w-20',
      hideOnMobile: true,
    },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold text-text-primary mb-6">الجداول</h2>
      <p className="text-sm text-text-secondary mb-4">
        في سطح المكتب يظهر كجدول، وفي الجوال يتحول إلى بطاقات.
      </p>

      <div className="bg-bg-surface border border-border-default rounded-card overflow-hidden">
        <div className="p-4 border-b border-border-default">
          <h3 className="text-sm font-semibold text-text-primary">آخر الطلبات</h3>
        </div>
        <Table
          columns={columns}
          data={mockOrders}
          keyExtractor={(item) => item.id}
          onRowClick={(item) => alert(`تم النقر على ${item.id}`)}
        />
        <div className="px-4 border-t border-border-default">
          <Pagination currentPage={1} totalPages={3} onPageChange={() => {}} />
        </div>
      </div>
    </div>
  );
}
