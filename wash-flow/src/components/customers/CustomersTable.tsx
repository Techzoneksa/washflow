'use client';
import type { Customer } from '@/types/customers';
import Pagination from '@/components/ui/Pagination';
import Badge from '@/components/ui/Badge';
import { Money } from '@/lib/format';
import { Eye, Edit } from 'lucide-react';

interface Props {
  customers: Customer[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onView: (customer: Customer) => void;
  onEdit: (customer: Customer) => void;
}

export default function CustomersTable({ customers, page, totalPages, onPageChange, onView, onEdit }: Props) {
  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-default">
              <th className="text-right py-3 px-4 font-medium text-text-secondary">الاسم</th>
              <th className="text-right py-3 px-4 font-medium text-text-secondary">رقم الجوال</th>
              <th className="text-right py-3 px-4 font-medium text-text-secondary">الطلبات</th>
              <th className="text-right py-3 px-4 font-medium text-text-secondary">إجمالي المشتريات</th>
              <th className="text-right py-3 px-4 font-medium text-text-secondary">آخر زيارة</th>
              <th className="text-right py-3 px-4 font-medium text-text-secondary">الحالة</th>
              <th className="text-right py-3 px-4 font-medium text-text-secondary">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id} className="border-b border-border-subtle hover:bg-bg-hover transition-colors">
                <td className="py-3 px-4">
                  <span className="font-medium text-text-primary">{customer.name || 'بدون اسم'}</span>
                </td>
                <td className="py-3 px-4 text-text-secondary">{customer.phone || 'لا يوجد رقم'}</td>
                <td className="py-3 px-4 text-center">
                  <span className="font-semibold text-text-primary tabular-nums">{customer.ordersCount}</span>
                </td>
                <td className="py-3 px-4">
                  <Money value={customer.totalSpent} className="font-semibold text-primary-600 tabular-nums" />
                </td>
                <td className="py-3 px-4 text-text-secondary">{customer.lastVisitAt || '—'}</td>
                <td className="py-3 px-4">
                  <Badge variant={customer.status === 'active' ? 'success' : 'neutral'}>
                    {customer.status === 'active' ? 'نشط' : 'غير نشط'}
                  </Badge>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onView(customer)}
                      className="p-1.5 rounded-md hover:bg-bg-hover text-text-secondary hover:text-text-primary transition-colors"
                      title="عرض"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onEdit(customer)}
                      className="p-1.5 rounded-md hover:bg-bg-hover text-text-secondary hover:text-text-primary transition-colors"
                      title="تعديل"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-4 border-t border-border-default">
        <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
      </div>
    </>
  );
}