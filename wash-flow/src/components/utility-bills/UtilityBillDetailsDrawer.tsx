'use client';
import Drawer from '@/components/ui/Drawer';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { UtilityBill, UtilityBillType, UtilityBillStatus } from '@/types/utility-bills';
import { CalendarDays, History, FileText, Building2, Phone, DollarSign, Receipt, CheckCircle2, Clock, Paperclip, Pencil, CreditCard } from 'lucide-react';

const billTypeLabels: Record<UtilityBillType, string> = {
  electricity: 'كهرباء',
  water: 'ماء',
  internet: 'إنترنت',
  telecom: 'اتصالات',
  rent: 'إيجار',
  software: 'اشتراك برنامج',
  municipality: 'بلدية',
  government: 'رسوم حكومية',
  other: 'أخرى',
};

const paymentMethodLabels: Record<string, string> = {
  cash: 'نقدي',
  bank: 'بنك',
  transfer: 'تحويل',
  card: 'بطاقة',
};

interface UtilityBillDetailsDrawerProps {
  open: boolean;
  onClose: () => void;
  bill: UtilityBill | null;
  onEdit?: (b: UtilityBill) => void;
  onRecordPayment?: (b: UtilityBill) => void;
}

function statusBadge(status: UtilityBillStatus) {
  if (status === 'paid') return <Badge variant="success">مسددة</Badge>;
  if (status === 'overdue') return <Badge variant="danger">متأخرة</Badge>;
  return <Badge variant="warning">غير مسددة</Badge>;
}

export default function UtilityBillDetailsDrawer({ open, onClose, bill, onEdit, onRecordPayment }: UtilityBillDetailsDrawerProps) {
  if (!bill) return null;

  return (
    <Drawer open={open} onClose={onClose} title={bill.billNumber}>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-secondary">الحالة</span>
          {statusBadge(bill.status)}
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm bg-neutral-50 rounded-xl p-3">
          <div>
            <p className="text-text-secondary text-xs">رقم الفاتورة</p>
            <div className="flex items-center gap-1 font-semibold" dir="ltr">
              <FileText className="h-3.5 w-3.5 text-text-secondary" />
              <span className="tabular-nums">{bill.billNumber}</span>
            </div>
          </div>
          <div>
            <p className="text-text-secondary text-xs">نوع الخدمة</p>
            <Badge variant="info" size="sm">{billTypeLabels[bill.type]}</Badge>
          </div>
          <div className="col-span-2">
            <p className="text-text-secondary text-xs">الجهة</p>
            <div className="flex items-center gap-1 font-semibold">
              <Building2 className="h-3.5 w-3.5 text-text-secondary" />
              {bill.provider}
            </div>
          </div>
          {bill.providerAccountNumber && (
            <div className="col-span-2">
              <p className="text-text-secondary text-xs">رقم حساب الجهة</p>
              <div className="flex items-center gap-1 font-semibold" dir="ltr">
                <Phone className="h-3.5 w-3.5 text-text-secondary" />
                <span className="tabular-nums">{bill.providerAccountNumber}</span>
              </div>
            </div>
          )}
          <div>
            <p className="text-text-secondary text-xs">تاريخ الإصدار</p>
            <div className="flex items-center gap-1 font-semibold">
              <CalendarDays className="h-3.5 w-3.5 text-text-secondary" />
              {formatDate(bill.issueDate)}
            </div>
          </div>
          <div>
            <p className="text-text-secondary text-xs">تاريخ الاستحقاق</p>
            <div className={`flex items-center gap-1 font-semibold ${bill.status === 'overdue' ? 'text-danger-600' : ''}`}>
              <Clock className="h-3.5 w-3.5" />
              {formatDate(bill.dueDate)}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-text-primary">المالية</h4>
          <div className="grid grid-cols-2 gap-3 bg-neutral-50 rounded-xl p-3">
            <div>
              <p className="text-xs text-text-secondary">المبلغ</p>
              <div className="flex items-center gap-1 font-semibold tabular-nums">
                <DollarSign className="h-4 w-4 text-text-secondary" />
                {formatCurrency(bill.amount)}
              </div>
            </div>
            <div>
              <p className="text-xs text-text-secondary">الضريبة</p>
              <div className="flex items-center gap-1 font-semibold tabular-nums text-warning-600">
                <Receipt className="h-4 w-4" />
                {formatCurrency(bill.vatAmount)}
              </div>
            </div>
            <div>
              <p className="text-xs text-text-secondary">الإجمالي</p>
              <p className="font-bold text-lg tabular-nums text-primary-600">{formatCurrency(bill.total)}</p>
            </div>
            {bill.paymentMethod && (
              <div>
                <p className="text-xs text-text-secondary">طريقة السداد</p>
                <div className="flex items-center gap-1 font-semibold">
                  <CreditCard className="h-4 w-4 text-text-secondary" />
                  {paymentMethodLabels[bill.paymentMethod]}
                </div>
              </div>
            )}
            {bill.paidAt && (
              <div className="col-span-2">
                <p className="text-xs text-text-secondary">تاريخ السداد</p>
                <div className="flex items-center gap-1 font-semibold text-success-600">
                  <CheckCircle2 className="h-4 w-4" />
                  {formatDate(bill.paidAt)}
                </div>
              </div>
            )}
          </div>
        </div>

        {bill.attachmentUrl && (
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-1">المرفق</h4>
            <div className="flex items-center gap-2 bg-neutral-50 rounded-xl p-3 text-sm text-primary-600">
              <Paperclip className="h-4 w-4" />
              <span>مرفق فاتورة {bill.billNumber}</span>
            </div>
          </div>
        )}

        {bill.notes && (
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-1">ملاحظات</h4>
            <p className="text-sm text-text-secondary bg-neutral-50 rounded-xl p-3">{bill.notes}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 text-xs text-text-secondary bg-neutral-50 rounded-xl p-3">
          <div>
            <p className="text-text-secondary text-xs">أنشئ بواسطة</p>
            <p className="font-semibold text-text-primary text-sm">{bill.createdBy}</p>
          </div>
          <div className="flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" />
            <span>تاريخ الإنشاء: {formatDate(bill.createdAt)}</span>
          </div>
          <div className="flex items-center gap-1">
            <History className="h-3.5 w-3.5" />
            <span>آخر تحديث: {formatDate(bill.updatedAt)}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          {onEdit && (
            <Button fullWidth variant="outline" icon={<Pencil className="h-4 w-4" />} onClick={() => { onEdit(bill); onClose(); }}>
              تعديل الفاتورة
            </Button>
          )}
          {onRecordPayment && bill.status !== 'paid' && (
            <Button fullWidth variant="primary" icon={<DollarSign className="h-4 w-4" />} onClick={() => { onRecordPayment(bill); onClose(); }}>
              تسجيل سداد
            </Button>
          )}
        </div>
      </div>
    </Drawer>
  );
}

