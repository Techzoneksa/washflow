'use client';
import type { Customer } from '@/types/customers';
import Badge from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';
import { Eye, Edit, Phone } from 'lucide-react';

interface Props {
  customer: Customer;
  onView: (customer: Customer) => void;
  onEdit: (customer: Customer) => void;
}

export default function CustomerCard({ customer, onView, onEdit }: Props) {
  return (
    <div className="bg-bg-surface border border-border-default rounded-card p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-text-primary truncate">
            {customer.name || 'عميل بدون اسم'}
          </p>
          {customer.phone && (
            <div className="flex items-center gap-1.5 mt-1">
              <Phone className="h-3.5 w-3.5 text-text-disabled" />
              <span className="text-sm text-text-secondary">{customer.phone}</span>
            </div>
          )}
        </div>
        <Badge variant={customer.status === 'active' ? 'success' : 'neutral'}>
          {customer.status === 'active' ? 'نشط' : 'غير نشط'}
        </Badge>
      </div>

      {(customer.carPlate || customer.carType) && (
        <div className="mb-3 text-sm text-text-secondary">
          {customer.carPlate && <p>اللوحة: {customer.carPlate}</p>}
          {customer.carType && <p>السيارة: {customer.carType}</p>}
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
        <div className="flex gap-4">
          <div className="text-center">
            <p className="text-lg font-bold text-text-primary">{customer.ordersCount}</p>
            <p className="text-xs text-text-disabled">طلبات</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-primary-600">{formatCurrency(customer.totalSpent)}</p>
            <p className="text-xs text-text-disabled">إجمالي</p>
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => onView(customer)}
            className="p-2 rounded-lg hover:bg-bg-hover text-text-secondary transition-colors"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => onEdit(customer)}
            className="p-2 rounded-lg hover:bg-bg-hover text-text-secondary transition-colors"
          >
            <Edit className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}