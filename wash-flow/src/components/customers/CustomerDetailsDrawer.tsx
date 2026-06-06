'use client';
import type { Customer } from '@/types/customers';
import Drawer from '@/components/ui/Drawer';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Money } from '@/lib/format';
import { formatPhoneForDisplay } from '@/lib/mock-customers';
import { Phone, Car, ShoppingBag, CalendarDays, Edit } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  customer: Customer | null;
  onEdit: (customer: Customer) => void;
}

export default function CustomerDetailsDrawer({ open, onClose, customer, onEdit }: Props) {
  if (!customer) return null;

  return (
    <Drawer open={open} onClose={onClose} title="تفاصيل العميل">
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-text-primary">
            {customer.name || 'عميل بدون اسم'}
          </h3>
          <Badge variant={customer.status === 'active' ? 'success' : 'neutral'}>
            {customer.status === 'active' ? 'نشط' : 'غير نشط'}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {customer.phone && (
            <div className="bg-bg-hover rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Phone className="h-4 w-4 text-text-disabled" />
                <span className="text-xs text-text-disabled">رقم الجوال</span>
              </div>
              <p className="text-sm font-medium text-text-primary">{formatPhoneForDisplay(customer.phone)}</p>
            </div>
          )}

          {customer.carPlate && (
            <div className="bg-bg-hover rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Car className="h-4 w-4 text-text-disabled" />
                <span className="text-xs text-text-disabled">رقم اللوحة</span>
              </div>
              <p className="text-sm font-medium text-text-primary">{customer.carPlate}</p>
            </div>
          )}

          {customer.carType && (
            <div className="bg-bg-hover rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Car className="h-4 w-4 text-text-disabled" />
                <span className="text-xs text-text-disabled">نوع السيارة</span>
              </div>
              <p className="text-sm font-medium text-text-primary">{customer.carType}</p>
            </div>
          )}

          <div className="bg-bg-hover rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <ShoppingBag className="h-4 w-4 text-text-disabled" />
              <span className="text-xs text-text-disabled">عدد الطلبات</span>
            </div>
            <p className="text-sm font-medium text-text-primary">{customer.ordersCount}</p>
          </div>

          <div className="bg-bg-hover rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-text-disabled">إجمالي المشتريات</span>
            </div>
            <p className="text-sm font-bold text-primary-600"><Money value={customer.totalSpent} /></p>
          </div>

          {customer.lastVisitAt && (
            <div className="bg-bg-hover rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <CalendarDays className="h-4 w-4 text-text-disabled" />
                <span className="text-xs text-text-disabled">آخر زيارة</span>
              </div>
              <p className="text-sm font-medium text-text-primary">{customer.lastVisitAt}</p>
            </div>
          )}
        </div>

        {customer.notes && (
          <div>
            <p className="text-xs text-text-disabled mb-1">ملاحظات</p>
            <p className="text-sm text-text-secondary bg-bg-hover rounded-lg p-3">{customer.notes}</p>
          </div>
        )}

        {customer.ordersCount > 0 && (
          <div>
            <p className="text-sm font-medium text-text-primary mb-2">آخر الطلبات</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between py-2 px-3 bg-bg-hover rounded-lg">
                <span className="text-sm text-text-secondary">ORD-001</span>
                <span className="text-sm text-text-secondary">2026-06-05</span>
                <span className="text-sm font-semibold text-text-primary"><Money value={120} /></span>
              </div>
              <div className="flex items-center justify-between py-2 px-3 bg-bg-hover rounded-lg">
                <span className="text-sm text-text-secondary">ORD-015</span>
                <span className="text-sm text-text-secondary">2026-05-28</span>
                <span className="text-sm font-semibold text-text-primary"><Money value={85} /></span>
              </div>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-border-default">
          <div className="flex justify-between text-xs text-text-disabled">
            <span>تاريخ الإنشاء: {customer.createdAt}</span>
            <span>آخر تحديث: {customer.updatedAt}</span>
          </div>
        </div>

        <Button
          variant="outline"
          icon={<Edit className="h-4 w-4" />}
          onClick={() => { onClose(); onEdit(customer); }}
          fullWidth
        >
          تعديل بيانات العميل
        </Button>
      </div>
    </Drawer>
  );
}