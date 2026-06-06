'use client';
import type { CustomerSummary } from '@/lib/mock-customers';
import { formatCurrency } from '@/lib/utils';
import { Users, UserCheck, UserPlus, ShoppingBag } from 'lucide-react';

interface Props {
  data: CustomerSummary;
}

export default function CustomersSummaryCards({ data }: Props) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      <div className="bg-bg-surface border border-border-default rounded-card p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center">
            <Users className="h-5 w-5 text-primary-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary">{data.totalCustomers}</p>
            <p className="text-xs text-text-secondary">إجمالي العملاء</p>
          </div>
        </div>
      </div>

      <div className="bg-bg-surface border border-border-default rounded-card p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-success-50 flex items-center justify-center">
            <UserPlus className="h-5 w-5 text-success-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary">{data.todayCustomers}</p>
            <p className="text-xs text-text-secondary">عملاء اليوم</p>
          </div>
        </div>
      </div>

      <div className="bg-bg-surface border border-border-default rounded-card p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-info-50 flex items-center justify-center">
            <UserCheck className="h-5 w-5 text-info-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary">{data.activeCustomers}</p>
            <p className="text-xs text-text-secondary">عملاء نشطون</p>
          </div>
        </div>
      </div>

      <div className="bg-bg-surface border border-border-default rounded-card p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-warning-50 flex items-center justify-center">
            <ShoppingBag className="h-5 w-5 text-warning-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary">{data.totalOrdersLinked}</p>
            <p className="text-xs text-text-secondary">طلبات مرتبطة</p>
          </div>
        </div>
      </div>

      {data.topCustomer && (
        <div className="col-span-2 lg:col-span-4 bg-gradient-to-l from-primary-50 to-bg-surface border border-primary-100 rounded-card p-4">
          <p className="text-xs text-primary-500 mb-1">أفضل عميل</p>
          <p className="text-base font-semibold text-text-primary">
            {data.topCustomer.name || 'عميل بدون اسم'}
            {data.topCustomer.phone && ` — ${data.topCustomer.phone}`}
          </p>
          <p className="text-lg font-bold text-primary-600 mt-1">
            {formatCurrency(data.topCustomer.totalSpent)}
          </p>
          <p className="text-xs text-text-secondary mt-0.5">{data.topCustomer.ordersCount} طلب</p>
        </div>
      )}
    </div>
  );
}