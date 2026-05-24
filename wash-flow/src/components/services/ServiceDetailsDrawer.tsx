'use client';
import Drawer from '@/components/ui/Drawer';
import Badge from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { ServiceItem } from '@/types/services';
import { Package, Clock, Eye, EyeOff, BadgePercent, Hash, CalendarDays, History } from 'lucide-react';

interface ServiceDetailsDrawerProps {
  open: boolean;
  onClose: () => void;
  service: ServiceItem | null;
  usageCount?: number;
}

export default function ServiceDetailsDrawer({ open, onClose, service, usageCount = 0 }: ServiceDetailsDrawerProps) {
  if (!service) return null;

  return (
    <Drawer open={open} onClose={onClose} title={service.nameAr}>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-secondary">الحالة</span>
          {service.isActive ? <Badge variant="success">نشط</Badge> : <Badge variant="danger">غير نشط</Badge>}
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm bg-neutral-50 rounded-xl p-3">
          <div>
            <p className="text-text-secondary text-xs">اسم الخدمة</p>
            <p className="font-semibold">{service.nameAr}</p>
          </div>
          {service.nameEn && (
            <div>
              <p className="text-text-secondary text-xs">الاسم الإنجليزي</p>
              <p className="font-semibold" dir="ltr">{service.nameEn}</p>
            </div>
          )}
          <div>
            <p className="text-text-secondary text-xs">التصنيف</p>
            <p className="font-semibold">{service.category}</p>
          </div>
          <div>
            <p className="text-text-secondary text-xs">السعر</p>
            <p className="font-bold text-primary-600 tabular-nums">{formatCurrency(service.price)}</p>
          </div>
          <div>
            <p className="text-text-secondary text-xs">المدة</p>
            <div className="flex items-center gap-1 font-semibold">
              <Clock className="h-3.5 w-3.5 text-text-secondary" />
              {service.durationMinutes ? `${service.durationMinutes} دقيقة` : 'غير محدد'}
            </div>
          </div>
          <div>
            <p className="text-text-secondary text-xs">ترتيب الظهور</p>
            <div className="flex items-center gap-1 font-semibold">
              <Hash className="h-3.5 w-3.5 text-text-secondary" />
              {service.sortOrder}
            </div>
          </div>
        </div>

        {service.description && (
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-1">الوصف</h4>
            <p className="text-sm text-text-secondary">{service.description}</p>
          </div>
        )}

        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-text-primary">الإعدادات</h4>
          <div className="bg-neutral-50 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                {service.showInPOS ? <Eye className="h-4 w-4 text-success-500" /> : <EyeOff className="h-4 w-4 text-text-disabled" />}
                <span>الظهور في POS</span>
              </div>
              <span className={service.showInPOS ? 'text-success-600 font-semibold' : 'text-text-disabled'}>{service.showInPOS ? 'نعم' : 'لا'}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <BadgePercent className="h-4 w-4 text-info-500" />
                <span>خاضع للضريبة</span>
              </div>
              <span className={service.isTaxable ? 'text-info-600 font-semibold' : 'text-text-disabled'}>{service.isTaxable ? 'نعم' : 'لا'}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-text-secondary" />
                <span>عدد مرات الاستخدام</span>
              </div>
              <span className="font-semibold tabular-nums">{usageCount}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs text-text-secondary bg-neutral-50 rounded-xl p-3">
          <div className="flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" />
            <span>تاريخ الإنشاء: {formatDate(service.createdAt)}</span>
          </div>
          <div className="flex items-center gap-1">
            <History className="h-3.5 w-3.5" />
            <span>آخر تحديث: {formatDate(service.updatedAt)}</span>
          </div>
        </div>
      </div>
    </Drawer>
  );
}
