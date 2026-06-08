'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/layout/PageHeader';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import PurchaseItemsTable from './PurchaseItemsTable';
import PurchaseSummary from './PurchaseSummary';
import { getSuppliers, getSupplierById, createSupplier, getPurchaseById, createPurchase, updateSupplierBalance } from '@/lib/data/purchases';
import { Search, FileText, Save, X, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';
import type { PurchaseItemForm } from './PurchaseItemsTable';
import type { PaymentStatus, PaymentMethod } from '@/types/purchases';

interface PurchaseFormPageProps {
  mode: 'create' | 'edit';
  id?: string;
}

const paymentMethodOptions = [
  { label: 'كاش', value: 'cash' },
  { label: 'بنك', value: 'bank' },
  { label: 'آجل', value: 'credit' },
  { label: 'جزئي', value: 'partial' },
];

const paymentStatusOptions = [
  { label: 'مدفوعة', value: 'paid' },
  { label: 'غير مدفوعة', value: 'unpaid' },
  { label: 'مدفوعة جزئيًا', value: 'partial' },
];

const partialPaymentMethodOptions = [
  { label: 'كاش', value: 'cash' },
  { label: 'بنك', value: 'bank' },
];

interface SupplierOption {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  representativeName?: string;
  balance: number;
  paymentTerms?: string;
}

function SearchableSupplierSelect({
  value,
  onChange,
  onAddNew,
  error,
}: {
  value: string;
  onChange: (id: string, name: string) => void;
  onAddNew: () => void;
  error?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [suppliers, setSuppliers] = useState<{ id: string; name: string; phone?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getSuppliers().then((data) => {
      setSuppliers(data.map((d) => ({ id: d.id, name: d.name, phone: d.phone })));
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selected = suppliers.find((s) => s.id === value);
  const filtered = suppliers.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()) || (s.phone || '').includes(search));

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-sm font-medium text-text-primary mb-1.5">المورد *</label>
      <div
        className={cn(
          'w-full flex items-center gap-2 px-4 py-2 text-sm rounded-md border bg-bg-surface cursor-pointer h-10',
          'focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent',
          error ? 'border-danger-500' : 'border-border-default'
        )}
        onClick={() => { setOpen(true); setSearch(''); }}
      >
        <Search className="h-4 w-4 shrink-0 text-text-disabled" />
        <span className={cn('flex-1 truncate', !selected && 'text-text-disabled')}>
          {selected ? selected.name : 'اختر مورد...'}
        </span>
      </div>
      {error && <p className="text-xs text-danger-500 mt-1">{error}</p>}

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-bg-surface border border-border-default rounded-md shadow-lg max-h-72 overflow-hidden flex flex-col">
          <div className="p-2 border-b border-border-default">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث عن مورد..."
              className="w-full px-3 py-1.5 text-sm rounded-md border border-border-default bg-bg-surface focus:outline-none focus:ring-2 focus:ring-primary-500"
              autoFocus
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-3 text-sm text-text-secondary text-center">جاري التحميل...</div>
            ) : filtered.length === 0 ? (
              <div className="p-3 text-sm text-text-secondary text-center">لا توجد نتائج</div>
            ) : (
              filtered.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={cn(
                    'w-full text-right px-3 py-2.5 text-sm hover:bg-bg-hover transition-colors flex items-center justify-between',
                    s.id === value && 'bg-primary-50 text-primary-600'
                  )}
                  onClick={() => { onChange(s.id, s.name); setOpen(false); }}
                >
                  <span className="font-medium">{s.name}</span>
                  {s.phone && <span className="text-xs text-text-secondary" dir="ltr">{s.phone}</span>}
                </button>
              ))
            )}
          </div>
          <div className="p-2 border-t border-border-default">
            <button
              type="button"
              className="w-full text-center text-sm text-primary-600 hover:text-primary-700 py-1.5 rounded-md hover:bg-primary-50 transition-colors"
              onClick={(e) => { e.stopPropagation(); onAddNew(); setOpen(false); }}
            >
              + إضافة مورد جديد
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PurchaseFormPage({ mode, id }: PurchaseFormPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState('');

  // Form fields
  const [supplierId, setSupplierId] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [supplierInvoiceNumber, setSupplierInvoiceNumber] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('unpaid');
  const [partialPaymentMethod, setPartialPaymentMethod] = useState<'cash' | 'bank'>('cash');
  const [remainingDueDate, setRemainingDueDate] = useState('');
  const [paidAmount, setPaidAmount] = useState(0);
  const [accountId, setAccountId] = useState('');
  const [notes, setNotes] = useState('');

  // Items
  const [items, setItems] = useState<PurchaseItemForm[]>([]);

  // UI state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState('');
  const [newSupplierPhone, setNewSupplierPhone] = useState('');
  const [newSupplierRep, setNewSupplierRep] = useState('');
  const [newSupplierEmail, setNewSupplierEmail] = useState('');
  const [newSupplierAddress, setNewSupplierAddress] = useState('');
  const [newSupplierError, setNewSupplierError] = useState('');

  // Supplier detail
  const [supplierDetail, setSupplierDetail] = useState<SupplierOption | null>(null);

  // Computed
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const discountTotal = items.reduce((sum, item) => sum + item.discount, 0);
  const total = subtotal - discountTotal;

  // Load existing purchase in edit mode
  useEffect(() => {
    if (mode === 'edit' && id) {
      getPurchaseById(id).then((purchase) => {
        if (!purchase) {
          setLoadError('فاتورة المشتريات غير موجودة');
          setLoading(false);
          return;
        }
        setSupplierId(purchase.supplierId);
        setSupplierName(purchase.supplierName);
        setSupplierInvoiceNumber(purchase.supplierInvoiceNumber || '');
        setDescription(purchase.description || '');
        setDate(purchase.date);
        setDueDate(purchase.dueDate || '');
        setPaymentStatus(purchase.paymentStatus);
        setPaymentMethod(purchase.paymentMethod || '');
        setPartialPaymentMethod(purchase.partialPaymentMethod || 'cash');
        setRemainingDueDate(purchase.remainingDueDate || '');
        setPaidAmount(purchase.paidAmount);
        setAccountId(purchase.accountId || '');
        setNotes(purchase.notes || '');
        setItems(
          purchase.items.map((item) => ({
            tempId: `edit-${item.id}`,
            inventoryItemId: item.inventoryItemId || '',
            inventoryItemName: item.inventoryItemName || '',
            description: item.description || '',
            purchaseUnit: item.purchaseUnit || item.unit || '',
            quantity: item.quantity,
            conversionFactor: item.conversionFactor || 1,
            quantityInBaseUnit: item.quantityInBaseUnit || item.quantity,
            baseUnit: item.baseUnit || '',
            unitPrice: item.unitPrice,
            discount: item.discount || 0,
            total: item.total,
          }))
        );
        if (purchase.supplierId) {
          getSupplierById(purchase.supplierId).then((s) => {
            if (s) setSupplierDetail(s);
          });
        }
        setLoading(false);
      });
    }
  }, [mode, id]);

  // Fetch supplier detail when supplier changes
  useEffect(() => {
    if (!supplierId) return;
    getSupplierById(supplierId).then((s) => {
      setSupplierDetail(s);
    });
  }, [supplierId]);

  const validate = useCallback((): boolean => {
    const errs: Record<string, string> = {};
    if (!supplierId) errs.supplierId = 'المورد مطلوب';
    if (!supplierInvoiceNumber.trim()) errs.supplierInvoiceNumber = 'رقم فاتورة المورد مطلوب';
    if (!date) errs.date = 'التاريخ مطلوب';
    if (items.length === 0) errs.items = 'يجب إضافة بند واحد على الأقل';

    items.forEach((item, i) => {
      if (!item.inventoryItemId) errs[`item-${i}-name`] = 'المادة مطلوبة';
      if (item.quantity <= 0) errs[`item-${i}-qty`] = 'الكمية يجب أن تكون أكبر من 0';
      if (item.unitPrice < 0) errs[`item-${i}-price`] = 'السعر لا يمكن أن يكون سالبًا';
    });

    if (paymentMethod === 'partial' && paidAmount > total) {
      errs.paidAmount = 'المبلغ المدفوع لا يمكن أن يتجاوز الإجمالي';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [supplierId, supplierInvoiceNumber, date, items, paymentMethod, paidAmount, total]);

  const handleSave = useCallback(async (status: 'draft' | 'approved') => {
    if (!validate()) return;
    setSaving(true);

    const paid = paymentMethod === 'partial' ? paidAmount : (paymentStatus === 'paid' ? total : 0);
    const remaining = total - paid;

    const result = await createPurchase({
      supplierId,
      supplierName,
      supplierInvoiceNumber: supplierInvoiceNumber.trim(),
      description: description || undefined,
      date,
      dueDate: dueDate || undefined,
      items: items.map((item) => ({
        id: item.tempId,
        name: item.inventoryItemName || item.description || `مادة ${item.tempId.slice(-4)}`,
        unit: item.purchaseUnit || item.baseUnit || 'حبة',
        inventoryItemId: item.inventoryItemId,
        inventoryItemName: item.inventoryItemName,
        description: item.description || undefined,
        purchaseUnit: item.purchaseUnit,
        quantity: item.quantity,
        conversionFactor: item.conversionFactor,
        quantityInBaseUnit: item.quantityInBaseUnit,
        baseUnit: item.baseUnit,
        unitPrice: item.unitPrice,
        discount: item.discount,
        total: item.unitPrice * item.quantity - item.discount,
      })),
      subtotal,
      discountTotal,
      total,
      paymentStatus,
      paymentMethod: (paymentMethod as PaymentMethod) || undefined,
      partialPaymentMethod: paymentMethod === 'partial' ? partialPaymentMethod : undefined,
      remainingDueDate: paymentMethod === 'partial' ? remainingDueDate || undefined : undefined,
      paidAmount: paid,
      remainingAmount: remaining,
      accountId: accountId || undefined,
      notes: notes || undefined,
      status,
    });

    setSaving(false);

    if (result.error) {
      toast('error', 'فشل الحفظ', result.error);
      return;
    }

    if (status === 'approved' && remaining > 0) {
      const balanceError = await updateSupplierBalance(supplierId, remaining);
      if (balanceError) {
        toast('warning', 'تم حفظ الفاتورة لكن فشل تحديث رصيد المورد', balanceError);
      }
    }

    toast('success', status === 'approved' ? 'تم اعتماد الفاتورة بنجاح' : 'تم حفظ المسودة بنجاح');
    router.push('/purchases');
  }, [validate, supplierId, supplierName, supplierInvoiceNumber, description, date, dueDate, paymentStatus, paymentMethod, partialPaymentMethod, remainingDueDate, paidAmount, accountId, notes, items, subtotal, discountTotal, total, toast, router]);

  const handleAddSupplier = async () => {
    if (!newSupplierName.trim()) {
      setNewSupplierError('اسم المورد مطلوب');
      return;
    }
    try {
      const result = await createSupplier({
        name: newSupplierName.trim(),
        phone: newSupplierPhone.trim() || undefined,
        representativeName: newSupplierRep.trim() || undefined,
        email: newSupplierEmail.trim() || undefined,
        address: newSupplierAddress.trim() || undefined,
      });
      if (result) {
        setSupplierId(result.id);
        setSupplierName(result.name);
        setShowAddSupplierModal(false);
        setNewSupplierName('');
        setNewSupplierPhone('');
        setNewSupplierRep('');
        setNewSupplierEmail('');
        setNewSupplierAddress('');
        setNewSupplierError('');
      }
    } catch (err) {
      setNewSupplierError(err instanceof Error ? err.message : 'فشل إنشاء المورد');
    }
  };

  const handlePaidAmountChange = (val: string) => {
    const amount = parseFloat(val) || 0;
    if (paymentMethod === 'partial' && amount > total) {
      setErrors((prev) => ({ ...prev, paidAmount: 'المبلغ المدفوع لا يمكن أن يتجاوز الإجمالي' }));
    } else {
      setErrors((prev) => ({ ...prev, paidAmount: '' }));
    }
    setPaidAmount(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <AlertTriangle className="h-12 w-12 text-danger-500" />
        <p className="text-text-secondary">{loadError}</p>
        <Button variant="outline" onClick={() => router.push('/purchases')}>العودة للمشتريات</Button>
      </div>
    );
  }

  return (
    <>
      {/* Breadcrumb */}
      <nav className="text-xs text-text-secondary mb-1">
        <button onClick={() => router.push('/purchases')} className="hover:text-primary-600">المشتريات</button>
        {' ← '}
        <button onClick={() => router.push('/purchases')} className="hover:text-primary-600">فواتير المشتريات</button>
        {' ← '}
        <span className="text-text-primary">{mode === 'create' ? 'إنشاء فاتورة' : 'تعديل فاتورة'}</span>
      </nav>

      {/* Page Header */}
      <PageHeader
        title={mode === 'create' ? 'إنشاء فاتورة مشتريات' : 'تعديل فاتورة مشتريات'}
        showBack
      />

      <div className="space-y-6 pb-32">
        {/* Section A — Invoice Header Fields */}
        <Card>
          <CardHeader>
            <CardTitle>بيانات الفاتورة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SearchableSupplierSelect
                value={supplierId}
                onChange={(id, name) => { setSupplierId(id); setSupplierName(name); setErrors((p) => ({ ...p, supplierId: '' })); if (!id) setSupplierDetail(null); }}
                onAddNew={() => setShowAddSupplierModal(true)}
                error={errors.supplierId}
              />
              <Input
                label="رقم فاتورة المورد *"
                value={supplierInvoiceNumber}
                onChange={(e) => { setSupplierInvoiceNumber(e.target.value); setErrors((p) => ({ ...p, supplierInvoiceNumber: '' })); }}
                error={errors.supplierInvoiceNumber}
                fullWidth
                placeholder="رقم الفاتورة من المورد"
              />
              <Input
                label="تاريخ الفاتورة *"
                type="date"
                value={date}
                onChange={(e) => { setDate(e.target.value); setErrors((p) => ({ ...p, date: '' })); }}
                error={errors.date}
                fullWidth
              />
              <Input
                label="تاريخ الاستحقاق"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                fullWidth
              />
              <Input
                label="وصف الفاتورة"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                fullWidth
                placeholder="وصف اختياري"
              />
              <Select
                label="طريقة السداد"
                options={paymentMethodOptions}
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                placeholder="اختر طريقة السداد"
                fullWidth
              />
              <Select
                label="حالة السداد"
                options={paymentStatusOptions}
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                fullWidth
              />
              <Input
                label="الحساب / الصندوق"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                fullWidth
                placeholder="اختياري"
              />
            </div>

            {/* Partial payment fields */}
            {paymentMethod === 'partial' && (
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-4">
                <h4 className="text-sm font-semibold text-amber-800">بيانات الدفع الجزئي</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="المبلغ المدفوع"
                    type="number"
                    min="0"
                    step="0.01"
                    value={paidAmount.toString()}
                    onChange={(e) => handlePaidAmountChange(e.target.value)}
                    error={errors.paidAmount}
                    fullWidth
                  />
                  <Select
                    label="طريقة دفع المبلغ المدفوع"
                    options={partialPaymentMethodOptions}
                    value={partialPaymentMethod}
                    onChange={(e) => setPartialPaymentMethod(e.target.value as 'cash' | 'bank')}
                    fullWidth
                  />
                  <Input
                    label="تاريخ استحقاق المتبقي"
                    type="date"
                    value={remainingDueDate}
                    onChange={(e) => setRemainingDueDate(e.target.value)}
                    fullWidth
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section B — Supplier Details (conditional) */}
        {supplierDetail && (
          <Card>
            <CardHeader>
              <CardTitle>تفاصيل المورد</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-text-secondary block text-xs">اسم المورد</span>
                  <span className="font-medium">{supplierDetail.name}</span>
                </div>
                {supplierDetail.phone && (
                  <div>
                    <span className="text-text-secondary block text-xs">رقم الجوال</span>
                    <span dir="ltr">{supplierDetail.phone}</span>
                  </div>
                )}
                {supplierDetail.representativeName && (
                  <div>
                    <span className="text-text-secondary block text-xs">اسم المندوب</span>
                    <span>{supplierDetail.representativeName}</span>
                  </div>
                )}
                {supplierDetail.email && (
                  <div>
                    <span className="text-text-secondary block text-xs">البريد الإلكتروني</span>
                    <span dir="ltr" className="text-xs">{supplierDetail.email}</span>
                  </div>
                )}
                {supplierDetail.address && (
                  <div>
                    <span className="text-text-secondary block text-xs">العنوان</span>
                    <span>{supplierDetail.address}</span>
                  </div>
                )}
                <div>
                  <span className="text-text-secondary block text-xs">الرصيد المستحق</span>
                  <span className={supplierDetail.balance > 0 ? 'text-danger-600 font-semibold' : ''}>
                    {supplierDetail.balance.toFixed(2)}
                  </span>
                </div>
                {supplierDetail.paymentTerms && (
                  <div>
                    <span className="text-text-secondary block text-xs">شروط الدفع</span>
                    <span>{supplierDetail.paymentTerms}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Section C — Purchase Items Table */}
        <Card>
          <CardHeader>
            <CardTitle>بنود الفاتورة</CardTitle>
          </CardHeader>
          <CardContent>
            <PurchaseItemsTable items={items} onChange={setItems} errors={errors} />
          </CardContent>
        </Card>

        {/* Section D — Summary */}
        <Card>
          <CardHeader>
            <CardTitle>ملخص المبالغ</CardTitle>
          </CardHeader>
          <CardContent>
            <PurchaseSummary items={items} paidAmount={paymentMethod === 'partial' ? paidAmount : (paymentStatus === 'paid' ? total : 0)} total={total} />
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>ملاحظات</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="ملاحظات إضافية (اختياري)"
            />
          </CardContent>
        </Card>
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-bg-surface border-t border-border-default shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
          <Button variant="outline" icon={<X className="h-4 w-4" />} onClick={() => router.back()}>
            إلغاء
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="secondary" icon={<Save className="h-4 w-4" />} loading={saving} onClick={() => handleSave('draft')}>
              حفظ كمسودة
            </Button>
            <Button variant="primary" icon={<FileText className="h-4 w-4" />} loading={saving} onClick={() => handleSave('approved')}>
              حفظ واعتماد
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Add Supplier Modal */}
      <Modal open={showAddSupplierModal} onClose={() => setShowAddSupplierModal(false)} size="sm" title="إضافة مورد جديد">
        <div className="space-y-4">
          <Input label="اسم المورد *" value={newSupplierName} onChange={(e) => setNewSupplierName(e.target.value)} fullWidth />
          <Input label="رقم الجوال" value={newSupplierPhone} onChange={(e) => setNewSupplierPhone(e.target.value)} fullWidth />
          <Input label="اسم المندوب" value={newSupplierRep} onChange={(e) => setNewSupplierRep(e.target.value)} fullWidth />
          <Input label="البريد الإلكتروني" type="email" value={newSupplierEmail} onChange={(e) => setNewSupplierEmail(e.target.value)} fullWidth />
          <Input label="العنوان" value={newSupplierAddress} onChange={(e) => setNewSupplierAddress(e.target.value)} fullWidth />
          {newSupplierError && <p className="text-xs text-danger-500">{newSupplierError}</p>}
          <div className="flex gap-2">
            <Button variant="outline" fullWidth onClick={() => setShowAddSupplierModal(false)}>إلغاء</Button>
            <Button fullWidth onClick={handleAddSupplier}>إضافة</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
