'use client';
import { useMemo } from 'react';
import Drawer from '@/components/ui/Drawer';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { getPurchasesBySupplier } from '@/lib/mock-purchases';
import type { Supplier } from '@/types/suppliers';
import { Phone, User, FileDigit, Building2, Mail, MapPin, ShoppingCart, Banknote, FileText, CalendarDays, History, Pencil, Plus } from 'lucide-react';

interface SupplierDetailsDrawerProps {
  open: boolean;
  onClose: () => void;
  supplier: Supplier | null;
  onEdit?: (s: Supplier) => void;
  onAddPurchase?: (s: Supplier) => void;
}

export default function SupplierDetailsDrawer({ open, onClose, supplier, onEdit, onAddPurchase }: SupplierDetailsDrawerProps) {
  const supplierPurchases = useMemo(
    () => supplier ? getPurchasesBySupplier(supplier.id).slice(0, 5) : [],
    [supplier]
  );

  if (!supplier) return null;

  return (
    <Drawer open={open} onClose={onClose} title={supplier.name}>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-secondary">الحالة</span>
          {supplier.status === 'active' ? <Badge variant="success">نشط</Badge> : <Badge variant="danger">غير نشط</Badge>}
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm bg-neutral-50 rounded-xl p-3">
          <div>
            <p className="text-text-secondary text-xs">اسم المورد</p>
            <p className="font-semibold">{supplier.name}</p>
          </div>
          <div>
            <p className="text-text-secondary text-xs">رقم الجوال</p>
            <div className="flex items-center gap-1 font-semibold" dir="ltr">
              <Phone className="h-3.5 w-3.5 text-text-secondary" />
              <span className="tabular-nums">{supplier.phone}</span>
            </div>
          </div>
          {supplier.representativeName && (
            <div>
              <p className="text-text-secondary text-xs">اسم المندوب</p>
              <div className="flex items-center gap-1 font-semibold">
                <User className="h-3.5 w-3.5 text-text-secondary" />
                {supplier.representativeName}
              </div>
            </div>
          )}
          {supplier.vatNumber && (
            <div>
              <p className="text-text-secondary text-xs">الرقم الضريبي</p>
              <div className="flex items-center gap-1 font-semibold" dir="ltr">
                <FileDigit className="h-3.5 w-3.5 text-text-secondary" />
                <span className="tabular-nums">{supplier.vatNumber}</span>
              </div>
            </div>
          )}
          {supplier.crNumber && (
            <div>
              <p className="text-text-secondary text-xs">السجل التجاري</p>
              <div className="flex items-center gap-1 font-semibold" dir="ltr">
                <Building2 className="h-3.5 w-3.5 text-text-secondary" />
                <span className="tabular-nums">{supplier.crNumber}</span>
              </div>
            </div>
          )}
          {supplier.email && (
            <div>
              <p className="text-text-secondary text-xs">البريد الإلكتروني</p>
              <div className="flex items-center gap-1 font-semibold" dir="ltr">
                <Mail className="h-3.5 w-3.5 text-text-secondary" />
                {supplier.email}
              </div>
            </div>
          )}
          {supplier.address && (
            <div className="col-span-2">
              <p className="text-text-secondary text-xs">العنوان</p>
              <div className="flex items-center gap-1 font-semibold">
                <MapPin className="h-3.5 w-3.5 text-text-secondary shrink-0" />
                {supplier.address}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-text-primary">المالية</h4>
          <div className="grid grid-cols-2 gap-3 bg-neutral-50 rounded-xl p-3">
            <div>
              <p className="text-xs text-text-secondary">الرصيد الحالي</p>
              <p className={`font-bold text-lg tabular-nums ${supplier.balance > 0 ? 'text-danger-600' : 'text-success-600'}`}>
                {formatCurrency(supplier.balance)}
              </p>
            </div>
            <div>
              <p className="text-xs text-text-secondary">إجمالي المشتريات</p>
              <div className="flex items-center gap-1 font-bold tabular-nums">
                <ShoppingCart className="h-4 w-4 text-text-secondary" />
                {formatCurrency(supplier.totalPurchases)}
              </div>
            </div>
            <div>
              <p className="text-xs text-text-secondary">إجمالي المدفوع</p>
              <div className="flex items-center gap-1 font-semibold tabular-nums text-success-600">
                <Banknote className="h-4 w-4" />
                {formatCurrency(supplier.totalPaid)}
              </div>
            </div>
            <div>
              <p className="text-xs text-text-secondary">عدد الفواتير</p>
              <div className="flex items-center gap-1 font-semibold tabular-nums">
                <FileText className="h-4 w-4 text-text-secondary" />
                {supplier.invoicesCount}
              </div>
            </div>
          </div>
        </div>

        {supplierPurchases.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-2">آخر المشتريات</h4>
            <div className="space-y-2">
              {supplierPurchases.map((p) => (
                <div key={p.id} className="flex items-center justify-between bg-neutral-50 rounded-lg p-2.5 text-sm">
                  <div>
                    <p className="font-semibold tabular-nums">{p.purchaseNumber}</p>
                    <p className="text-xs text-text-secondary">{formatDate(p.date)}</p>
                  </div>
                  <div className="text-left">
                    <p className="font-semibold tabular-nums">{formatCurrency(p.total)}</p>
                    <Badge variant={p.paymentStatus === 'paid' ? 'success' : p.paymentStatus === 'partial' ? 'warning' : 'danger'} size="sm">
                      {p.paymentStatus === 'paid' ? 'مدفوعة' : p.paymentStatus === 'partial' ? 'جزئية' : 'غير مدفوعة'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {supplier.notes && (
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-1">ملاحظات</h4>
            <p className="text-sm text-text-secondary bg-neutral-50 rounded-xl p-3">{supplier.notes}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 text-xs text-text-secondary bg-neutral-50 rounded-xl p-3">
          <div className="flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" />
            <span>تاريخ الإنشاء: {formatDate(supplier.createdAt)}</span>
          </div>
          <div className="flex items-center gap-1">
            <History className="h-3.5 w-3.5" />
            <span>آخر تحديث: {formatDate(supplier.updatedAt)}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          {onEdit && (
            <Button fullWidth variant="outline" icon={<Pencil className="h-4 w-4" />} onClick={() => { onEdit(supplier); onClose(); }}>
              تعديل المورد
            </Button>
          )}
          {onAddPurchase && (
            <Button fullWidth variant="primary" icon={<Plus className="h-4 w-4" />} onClick={() => { onAddPurchase(supplier); onClose(); }}>
              إضافة فاتورة مشتريات
            </Button>
          )}
        </div>
      </div>
    </Drawer>
  );
}
