'use client';
import Drawer from '@/components/ui/Drawer';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Expense, ExpenseType } from '@/types/expenses';
import { CalendarDays, History, Tag, FileText, DollarSign, Receipt, Building2, Paperclip, Pencil } from 'lucide-react';

const expenseTypeLabels: Record<ExpenseType, string> = {
  electricity: 'كهرباء',
  water: 'ماء',
  internet: 'إنترنت',
  telecom: 'اتصالات',
  rent: 'إيجار',
  salaries: 'رواتب',
  cleaning: 'مواد تنظيف',
  maintenance: 'صيانة',
  fuel: 'وقود',
  marketing: 'تسويق',
  government: 'رسوم حكومية',
  other: 'أخرى',
};

const paymentMethodLabels: Record<string, string> = {
  cash: 'نقدي',
  bank: 'بنك',
  transfer: 'تحويل',
  card: 'بطاقة',
};

interface ExpenseDetailsDrawerProps {
  open: boolean;
  onClose: () => void;
  expense: Expense | null;
  onEdit?: (e: Expense) => void;
}

export default function ExpenseDetailsDrawer({ open, onClose, expense, onEdit }: ExpenseDetailsDrawerProps) {
  if (!expense) return null;

  return (
    <Drawer open={open} onClose={onClose} title={expense.expenseNumber}>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-secondary">نوع المصروف</span>
          <Badge variant="info">{expenseTypeLabels[expense.type]}</Badge>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm bg-neutral-50 rounded-xl p-3">
          <div className="col-span-2">
            <p className="text-text-secondary text-xs">العنوان</p>
            <p className="font-semibold">{expense.title}</p>
          </div>
          {expense.description && (
            <div className="col-span-2">
              <p className="text-text-secondary text-xs">الوصف</p>
              <p className="font-semibold">{expense.description}</p>
            </div>
          )}
          <div>
            <p className="text-text-secondary text-xs">رقم المصروف</p>
            <div className="flex items-center gap-1 font-semibold" dir="ltr">
              <FileText className="h-3.5 w-3.5 text-text-secondary" />
              <span className="tabular-nums">{expense.expenseNumber}</span>
            </div>
          </div>
          <div>
            <p className="text-text-secondary text-xs">التاريخ</p>
            <div className="flex items-center gap-1 font-semibold">
              <CalendarDays className="h-3.5 w-3.5 text-text-secondary" />
              {formatDate(expense.date)}
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
                {formatCurrency(expense.amount)}
              </div>
            </div>
            <div>
              <p className="text-xs text-text-secondary">الضريبة</p>
              <div className="flex items-center gap-1 font-semibold tabular-nums text-warning-600">
                <Receipt className="h-4 w-4" />
                {formatCurrency(expense.vatAmount)}
              </div>
            </div>
            <div>
              <p className="text-xs text-text-secondary">الإجمالي</p>
              <p className="font-bold text-lg tabular-nums text-primary-600">{formatCurrency(expense.total)}</p>
            </div>
            <div>
              <p className="text-xs text-text-secondary">طريقة الدفع</p>
              <div className="flex items-center gap-1 font-semibold">
                <Tag className="h-4 w-4 text-text-secondary" />
                {paymentMethodLabels[expense.paymentMethod]}
              </div>
            </div>
            {expense.accountName && (
              <div className="col-span-2">
                <p className="text-xs text-text-secondary">الحساب المدفوع منه</p>
                <div className="flex items-center gap-1 font-semibold">
                  <Building2 className="h-4 w-4 text-text-secondary" />
                  {expense.accountName}
                </div>
              </div>
            )}
          </div>
        </div>

        {expense.attachmentUrl && (
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-1">المرفق</h4>
            <div className="flex items-center gap-2 bg-neutral-50 rounded-xl p-3 text-sm text-primary-600">
              <Paperclip className="h-4 w-4" />
              <span>مرفق مصروف {expense.expenseNumber}</span>
            </div>
          </div>
        )}

        {expense.notes && (
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-1">ملاحظات</h4>
            <p className="text-sm text-text-secondary bg-neutral-50 rounded-xl p-3">{expense.notes}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 text-xs text-text-secondary bg-neutral-50 rounded-xl p-3">
          <div>
            <p className="text-text-secondary text-xs">أنشئ بواسطة</p>
            <p className="font-semibold text-text-primary text-sm">{expense.createdBy}</p>
          </div>
          <div className="flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" />
            <span>تاريخ الإنشاء: {formatDate(expense.createdAt)}</span>
          </div>
          <div className="flex items-center gap-1">
            <History className="h-3.5 w-3.5" />
            <span>آخر تحديث: {formatDate(expense.updatedAt)}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          {onEdit && (
            <Button fullWidth variant="outline" icon={<Pencil className="h-4 w-4" />} onClick={() => { onEdit(expense); onClose(); }}>
              تعديل المصروف
            </Button>
          )}
        </div>
      </div>
    </Drawer>
  );
}
