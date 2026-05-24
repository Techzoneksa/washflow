'use client';
import { useState } from 'react';
import Drawer from '@/components/ui/Drawer';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import { getSuppliers } from '@/lib/mock-suppliers';
import { formatCurrency } from '@/lib/utils';
import { Plus, Trash2, Save } from 'lucide-react';

interface PurchaseItemForm {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

export interface PurchaseFormData {
  supplierId: string;
  supplierName: string;
  supplierInvoiceNumber?: string;
  date: string;
  items: PurchaseItemForm[];
  subtotal: number;
  vatAmount: number;
  total: number;
  paymentStatus: 'paid' | 'unpaid' | 'partial';
  paymentMethod?: 'cash' | 'bank' | 'transfer' | 'credit';
  paidAmount: number;
  remainingAmount: number;
  notes?: string;
}

interface PurchaseFormDrawerProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: PurchaseFormData) => void;
  preselectedSupplierId?: string;
}

const units = ['حبة', 'كرتون', 'علبة', 'لتر', 'جالون', 'كيس', 'رول', 'خدمة', 'أخرى'];

const paymentStatusOptions = [
  { label: 'مدفوعة', value: 'paid' },
  { label: 'غير مدفوعة', value: 'unpaid' },
  { label: 'مدفوعة جزئيًا', value: 'partial' },
];

const paymentMethodOptions = [
  { label: 'نقدي', value: 'cash' },
  { label: 'بنك', value: 'bank' },
  { label: 'تحويل', value: 'transfer' },
  { label: 'آجل', value: 'credit' },
];

let itemIdCounter = Date.now();

function createEmptyItem(): PurchaseItemForm {
  return {
    id: `item-${itemIdCounter++}`,
    name: '',
    quantity: 1,
    unit: 'حبة',
    unitPrice: 0,
    total: 0,
  };
}

export default function PurchaseFormDrawer({ open, onClose, onSave, preselectedSupplierId }: PurchaseFormDrawerProps) {
  const suppliers = getSuppliers();
  const supplierOptions = suppliers.map((s) => ({ label: s.name, value: s.id }));

  const [supplierId, setSupplierId] = useState(preselectedSupplierId || '');
  const [supplierInvoiceNumber, setSupplierInvoiceNumber] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState<PurchaseItemForm[]>([createEmptyItem()]);
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'unpaid' | 'partial'>('unpaid');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank' | 'transfer' | 'credit'>('cash');
  const [paidAmount, setPaidAmount] = useState(0);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedSupplier = suppliers.find((s) => s.id === supplierId);
  const supplierName = selectedSupplier?.name || '';

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const vatAmount = Math.round(subtotal * 0.15 * 100) / 100;
  const total = subtotal + vatAmount;
  const remainingAmount = Math.max(0, total - paidAmount);

  const updateItem = (id: string, field: keyof PurchaseItemForm, value: unknown) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          const qty = field === 'quantity' ? (value as number) : item.quantity;
          const price = field === 'unitPrice' ? (value as number) : item.unitPrice;
          updated.total = Math.round(qty * price * 100) / 100;
        }
        return updated;
      })
    );
  };

  const addItem = () => {
    setItems((prev) => [...prev, createEmptyItem()]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!supplierId) errs.supplierId = 'المورد مطلوب';
    if (!date) errs.date = 'التاريخ مطلوب';
    if (items.length === 0) errs.items = 'يجب إضافة بند واحد على الأقل';

    items.forEach((item, i) => {
      if (!item.name.trim()) errs[`item-${i}-name`] = 'اسم البند مطلوب';
      if (item.quantity <= 0) errs[`item-${i}-qty`] = 'الكمية يجب أن تكون أكبر من 0';
      if (item.unitPrice < 0) errs[`item-${i}-price`] = 'السعر لا يمكن أن يكون سالبًا';
    });

    if (paymentStatus === 'paid' && paidAmount !== total) {
      errs.paidAmount = 'المدفوع يجب أن يساوي الإجمالي للحالة مدفوعة';
    }
    if (paymentStatus === 'unpaid' && paidAmount !== 0) {
      errs.paidAmount = 'المدفوع يجب أن يكون 0 للحالة غير مدفوعة';
    }
    if (paymentStatus === 'partial' && (paidAmount <= 0 || paidAmount >= total)) {
      errs.paidAmount = 'المدفوع يجب أن يكون أكبر من 0 وأقل من الإجمالي للحالة جزئية';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({
      supplierId,
      supplierName,
      supplierInvoiceNumber: supplierInvoiceNumber || undefined,
      date,
      items: items.map(({ id, name, quantity, unit, unitPrice, total }) => ({ id, name, quantity, unit, unitPrice, total })),
      subtotal,
      vatAmount,
      total,
      paymentStatus,
      paymentMethod: paymentStatus === 'unpaid' ? undefined : paymentMethod,
      paidAmount,
      remainingAmount,
      notes: notes || undefined,
    });
  };

  return (
    <Drawer open={open} onClose={onClose} title="إضافة فاتورة مشتريات">
      <div className="space-y-5">
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-text-primary">بيانات عامة</h4>
          <Select
            label="المورد *"
            options={supplierOptions}
            value={supplierId}
            onChange={(e) => { setSupplierId(e.target.value); setErrors((p) => ({ ...p, supplierId: '' })); }}
            error={errors.supplierId}
            fullWidth
          />
          <Input
            label="رقم فاتورة المورد"
            value={supplierInvoiceNumber}
            onChange={(e) => setSupplierInvoiceNumber(e.target.value)}
            fullWidth
          />
          <Input
            label="تاريخ الفاتورة *"
            type="date"
            value={date}
            onChange={(e) => { setDate(e.target.value); setErrors((p) => ({ ...p, date: '' })); }}
            error={errors.date}
            fullWidth
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-text-primary">بنود الفاتورة</h4>
            <Button size="sm" variant="ghost" icon={<Plus className="h-3 w-3" />} onClick={addItem}>
              إضافة بند
            </Button>
          </div>
          {errors.items && <p className="text-xs text-danger-500">{errors.items}</p>}

          {items.map((item, i) => (
            <div key={item.id} className="bg-neutral-50 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-secondary">البند {i + 1}</span>
                {items.length > 1 && (
                  <button onClick={() => removeItem(item.id)} className="text-danger-500 hover:text-danger-600 p-1">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <Input
                placeholder="اسم البند *"
                value={item.name}
                onChange={(e) => { updateItem(item.id, 'name', e.target.value); setErrors((p) => ({ ...p, [`item-${i}-name`]: '' })); }}
                error={errors[`item-${i}-name`]}
                fullWidth
              />
              <div className="grid grid-cols-3 gap-2">
                <Input
                  label="الكمية *"
                  type="number"
                  value={item.quantity.toString()}
                  onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                  error={errors[`item-${i}-qty`]}
                  fullWidth
                />
                <div>
                  <label className="block text-xs font-medium text-text-primary mb-1">الوحدة</label>
                  <select
                    value={item.unit}
                    onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-border-default bg-bg-surface text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {units.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
                <Input
                  label="سعر الوحدة *"
                  type="number"
                  value={item.unitPrice.toString()}
                  onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                  error={errors[`item-${i}-price`]}
                  fullWidth
                />
              </div>
              <div className="text-left text-sm">
                <span className="text-text-secondary">الإجمالي: </span>
                <span className="font-semibold tabular-nums">{formatCurrency(item.total)}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2 bg-neutral-50 rounded-xl p-3">
          <h4 className="text-sm font-semibold text-text-primary">الضريبة والإجمالي</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-text-secondary">
              <span>الإجمالي قبل الضريبة</span>
              <span className="tabular-nums">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-text-secondary">
              <span>ضريبة القيمة المضافة (15%)</span>
              <span className="tabular-nums">{formatCurrency(vatAmount)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-text-primary pt-1 border-t border-border-default">
              <span>الإجمالي النهائي</span>
              <span className="tabular-nums">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-text-primary">السداد</h4>
          <Select
            label="حالة السداد"
            options={paymentStatusOptions}
            value={paymentStatus}
            onChange={(e) => {
              const val = e.target.value as 'paid' | 'unpaid' | 'partial';
              setPaymentStatus(val);
              if (val === 'paid') setPaidAmount(total);
              if (val === 'unpaid') setPaidAmount(0);
              setErrors((p) => ({ ...p, paidAmount: '' }));
            }}
            fullWidth
          />
          {paymentStatus !== 'unpaid' && (
            <Select
              label="طريقة السداد"
              options={paymentMethodOptions}
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as 'cash' | 'bank' | 'transfer' | 'credit')}
              fullWidth
            />
          )}
          {(paymentStatus === 'partial' || paymentStatus === 'paid') && (
            <Input
              label="المبلغ المدفوع"
              type="number"
              value={paidAmount.toString()}
              onChange={(e) => { setPaidAmount(parseFloat(e.target.value) || 0); setErrors((p) => ({ ...p, paidAmount: '' })); }}
              error={errors.paidAmount}
              fullWidth
            />
          )}
          {paymentStatus === 'partial' && (
            <div className="text-sm text-text-secondary">
              <span>المتبقي: </span>
              <span className="font-semibold tabular-nums text-danger-600">{formatCurrency(remainingAmount)}</span>
            </div>
          )}
        </div>

        <Textarea
          label="ملاحظات"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
        />

        <div className="pt-2">
          <Button fullWidth icon={<Save className="h-4 w-4" />} onClick={handleSave}>
            حفظ فاتورة المشتريات
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
