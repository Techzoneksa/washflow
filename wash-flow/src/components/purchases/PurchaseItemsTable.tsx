'use client';
import { useState, useRef, useEffect } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { Search, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getInventoryItemsForPurchase, createInventoryItem } from '@/lib/data/purchases';
import { formatMoneyAmount } from '@/lib/format';

export interface PurchaseItemForm {
  tempId: string;
  inventoryItemId: string;
  inventoryItemName: string;
  description: string;
  purchaseUnit: string;
  quantity: number;
  conversionFactor: number;
  quantityInBaseUnit: number;
  baseUnit: string;
  unitPrice: number;
  discount: number;
  total: number;
}

interface PurchaseItemsTableProps {
  items: PurchaseItemForm[];
  onChange: (items: PurchaseItemForm[]) => void;
  errors?: Record<string, string>;
}

interface SearchableItemSelectProps {
  value: string;
  onChange: (id: string, item: { name: string; purchaseUnit?: string; baseUnit: string; conversionFactor: number }) => void;
  error?: string;
  label: string;
}

let tempIdCounter = Date.now();

function createEmptyItem(): PurchaseItemForm {
  return {
    tempId: `item-${tempIdCounter++}`,
    inventoryItemId: '',
    inventoryItemName: '',
    description: '',
    purchaseUnit: '',
    quantity: 1,
    conversionFactor: 1,
    quantityInBaseUnit: 0,
    baseUnit: '',
    unitPrice: 0,
    discount: 0,
    total: 0,
  };
}

function SearchableItemSelect({ value, onChange, error, label }: SearchableItemSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<{ id: string; name: string; purchaseUnit?: string; baseUnit: string; conversionFactor: number; currentQuantity: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemUnit, setNewItemUnit] = useState('');
  const [newItemFactor, setNewItemFactor] = useState('1');
  const [newItemError, setNewItemError] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getInventoryItemsForPurchase().then((data) => {
      setItems(data.map((d) => ({ ...d, currentQuantity: d.currentQuantity })));
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedItem = items.find((i) => i.id === value);
  const filtered = items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));

  const handleCreateItem = async () => {
    if (!newItemName.trim()) {
      setNewItemError('الاسم مطلوب');
      return;
    }
    if (!newItemUnit.trim()) {
      setNewItemError('الوحدة الأساسية مطلوبة');
      return;
    }
    const factor = parseFloat(newItemFactor);
    if (factor <= 0) {
      setNewItemError('معامل التحويل يجب أن يكون أكبر من 0');
      return;
    }
    try {
      const result = await createInventoryItem({
        name: newItemName.trim(),
        baseUnit: newItemUnit.trim(),
        purchaseUnit: newItemUnit.trim(),
        conversionFactor: factor,
      });
      if (result) {
        const newItem = { id: result.id, name: result.name, purchaseUnit: result.purchaseUnit, baseUnit: result.baseUnit, conversionFactor: result.conversionFactor, currentQuantity: 0 };
        setItems((prev) => [...prev, newItem]);
        onChange(result.id, { name: result.name, purchaseUnit: result.purchaseUnit, baseUnit: result.baseUnit, conversionFactor: result.conversionFactor });
        setShowNewModal(false);
        setNewItemName('');
        setNewItemUnit('');
        setNewItemFactor('1');
        setNewItemError('');
        setOpen(false);
      }
    } catch {
      setNewItemError('فشل إنشاء المادة');
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-xs font-medium text-text-primary mb-1">{label}</label>
      <div
        className={cn(
          'w-full flex items-center gap-2 px-3 py-1.5 text-sm rounded-md border bg-bg-surface cursor-pointer',
          'focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent',
          error ? 'border-danger-500' : 'border-border-default'
        )}
        onClick={() => { setOpen(true); setSearch(''); }}
      >
        <Search className="h-3.5 w-3.5 shrink-0 text-text-disabled" />
        <span className={cn('flex-1 truncate', !selectedItem && 'text-text-disabled')}>
          {selectedItem ? `${selectedItem.name} (${selectedItem.currentQuantity} ${selectedItem.baseUnit})` : 'اختر مادة...'}
        </span>
      </div>
      {error && <p className="text-xs text-danger-500 mt-1">{error}</p>}

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-bg-surface border border-border-default rounded-md shadow-lg max-h-64 overflow-hidden flex flex-col">
          <div className="p-2 border-b border-border-default">
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث عن مادة..."
              className="w-full px-3 py-1.5 text-sm rounded-md border border-border-default bg-bg-surface focus:outline-none focus:ring-2 focus:ring-primary-500"
              autoFocus
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-3 text-sm text-text-secondary text-center">جاري التحميل...</div>
            ) : filtered.length === 0 ? (
              <div className="p-3 text-sm text-text-secondary text-center">
                لا توجد مواد مطابقة
              </div>
            ) : (
              filtered.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={cn(
                    'w-full text-right px-3 py-2 text-sm hover:bg-bg-hover transition-colors flex items-center justify-between',
                    item.id === value && 'bg-primary-50 text-primary-600'
                  )}
                  onClick={() => {
                    onChange(item.id, { name: item.name, purchaseUnit: item.purchaseUnit, baseUnit: item.baseUnit, conversionFactor: item.conversionFactor });
                    setOpen(false);
                  }}
                >
                  <span>{item.name}</span>
                  <span className="text-xs text-text-secondary">{item.currentQuantity} {item.baseUnit}</span>
                </button>
              ))
            )}
          </div>
          <div className="p-2 border-t border-border-default">
            <button
              type="button"
              className="w-full text-center text-sm text-primary-600 hover:text-primary-700 py-1.5 rounded-md hover:bg-primary-50 transition-colors"
              onClick={(e) => { e.stopPropagation(); setShowNewModal(true); }}
            >
              + إضافة مادة جديدة
            </button>
          </div>
        </div>
      )}

      <Modal open={showNewModal} onClose={() => setShowNewModal(false)} size="sm" title="إضافة مادة جديدة">
        <div className="space-y-4">
          <Input label="اسم المادة *" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} fullWidth />
          <Input label="الوحدة الأساسية *" value={newItemUnit} onChange={(e) => setNewItemUnit(e.target.value)} placeholder="مثال: مل, لتر, حبة" fullWidth />
          <Input label="معامل التحويل" type="number" value={newItemFactor} onChange={(e) => setNewItemFactor(e.target.value)} helperText="عدد الوحدات الأساسية لكل وحدة شراء" fullWidth />
          {newItemError && <p className="text-xs text-danger-500">{newItemError}</p>}
          <div className="flex gap-2">
            <Button variant="outline" fullWidth onClick={() => setShowNewModal(false)}>إلغاء</Button>
            <Button fullWidth onClick={handleCreateItem}>إضافة</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function PurchaseItemsTable({ items, onChange, errors }: PurchaseItemsTableProps) {
  const addItem = () => {
    onChange([...items, createEmptyItem()]);
  };

  const removeItem = (tempId: string) => {
    if (items.length <= 1) return;
    onChange(items.filter((i) => i.tempId !== tempId));
  };

  const updateItem = (tempId: string, field: keyof PurchaseItemForm, value: unknown) => {
    onChange(
      items.map((item) => {
        if (item.tempId !== tempId) return item;
        const updated = { ...item, [field]: value };

        if (field === 'inventoryItemId') {
          const itemData = value as { id: string; name?: string; purchaseUnit?: string; baseUnit: string; conversionFactor: number };
          updated.inventoryItemId = itemData.id;
          if (itemData.name) updated.inventoryItemName = itemData.name;
          if (itemData.purchaseUnit) updated.purchaseUnit = itemData.purchaseUnit;
          if (itemData.baseUnit) updated.baseUnit = itemData.baseUnit;
          if (itemData.conversionFactor) updated.conversionFactor = itemData.conversionFactor;
        }

        if (field === 'inventoryItemName' && typeof value === 'string') {
          updated.inventoryItemName = value;
        }

        const q = field === 'quantity' ? (value as number) : updated.quantity;
        const cf = field === 'conversionFactor' ? (value as number) : updated.conversionFactor;
        const up = field === 'unitPrice' ? (value as number) : updated.unitPrice;
        const d = field === 'discount' ? (value as number) : updated.discount;

        updated.quantityInBaseUnit = q * cf;
        updated.total = (up * q) - d;

        return updated;
      })
    );
  };

  const handleItemSelect = (tempId: string, selectedId: string, itemData: { name: string; purchaseUnit?: string; baseUnit: string; conversionFactor: number }) => {
    onChange(
      items.map((item) => {
        if (item.tempId !== tempId) return item;
        const updated = {
          ...item,
          inventoryItemId: selectedId,
          inventoryItemName: itemData.name,
          purchaseUnit: itemData.purchaseUnit || itemData.baseUnit,
          baseUnit: itemData.baseUnit,
          conversionFactor: itemData.conversionFactor,
          quantityInBaseUnit: item.quantity * itemData.conversionFactor,
        };
        updated.total = (updated.unitPrice * updated.quantity) - updated.discount;
        return updated;
      })
    );
  };

  const computeTotal = (item: PurchaseItemForm) => (item.unitPrice * item.quantity) - item.discount;

  const desktopColumns = [
    { header: '#', width: 'w-10', render: (_: PurchaseItemForm, i: number) => <span className="text-text-secondary">{i + 1}</span> },
    { header: 'المادة', width: 'min-w-[180px]', render: (item: PurchaseItemForm, i: number) => (
      <SearchableItemSelect
        value={item.inventoryItemId}
        onChange={(id, data) => handleItemSelect(item.tempId, id, data)}
        error={errors?.[`item-${i}-name`]}
        label=""
      />
    )},
    { header: 'الوصف', width: 'min-w-[120px]', render: (item: PurchaseItemForm) => (
      <input
        type="text"
        value={item.description}
        onChange={(e) => updateItem(item.tempId, 'description', e.target.value)}
        className="w-full px-2 py-1 text-sm rounded border border-border-default bg-transparent focus:outline-none focus:ring-1 focus:ring-primary-500"
        placeholder="اختياري"
      />
    )},
    { header: 'وحدة الشراء', width: 'w-28', render: (item: PurchaseItemForm) => (
      <input
        type="text"
        value={item.purchaseUnit}
        onChange={(e) => updateItem(item.tempId, 'purchaseUnit', e.target.value)}
        className="w-full px-2 py-1 text-sm rounded border border-border-default bg-transparent focus:outline-none focus:ring-1 focus:ring-primary-500"
      />
    )},
    { header: 'الكمية', width: 'w-20', render: (item: PurchaseItemForm, i: number) => (
      <input
        type="number"
        min="0.01"
        step="any"
        value={item.quantity}
        onChange={(e) => updateItem(item.tempId, 'quantity', parseFloat(e.target.value) || 0)}
        className={cn(
          'w-full px-2 py-1 text-sm rounded border bg-transparent focus:outline-none focus:ring-1 focus:ring-primary-500 tabular-nums',
          errors?.[`item-${i}-qty`] ? 'border-danger-500' : 'border-border-default'
        )}
      />
    )},
    { header: 'معامل التحويل', width: 'w-24', render: (item: PurchaseItemForm) => (
      <input
        type="number"
        min="0.01"
        step="any"
        value={item.conversionFactor}
        onChange={(e) => updateItem(item.tempId, 'conversionFactor', parseFloat(e.target.value) || 1)}
        className="w-full px-2 py-1 text-sm rounded border border-border-default bg-transparent focus:outline-none focus:ring-1 focus:ring-primary-500 tabular-nums"
      />
    )},
    { header: 'كمية المخزون', width: 'w-28', render: (item: PurchaseItemForm) => (
      <span className="text-sm tabular-nums text-text-secondary">{item.quantityInBaseUnit} {item.baseUnit || item.purchaseUnit}</span>
    )},
    { header: 'سعر الوحدة', width: 'w-24', render: (item: PurchaseItemForm, i: number) => (
      <input
        type="number"
        min="0"
        step="any"
        value={item.unitPrice}
        onChange={(e) => updateItem(item.tempId, 'unitPrice', parseFloat(e.target.value) || 0)}
        className={cn(
          'w-full px-2 py-1 text-sm rounded border bg-transparent focus:outline-none focus:ring-1 focus:ring-primary-500 tabular-nums',
          errors?.[`item-${i}-price`] ? 'border-danger-500' : 'border-border-default'
        )}
      />
    )},
    { header: 'الخصم', width: 'w-20', render: (item: PurchaseItemForm) => (
      <input
        type="number"
        min="0"
        step="any"
        value={item.discount}
        onChange={(e) => updateItem(item.tempId, 'discount', parseFloat(e.target.value) || 0)}
        className="w-full px-2 py-1 text-sm rounded border border-border-default bg-transparent focus:outline-none focus:ring-1 focus:ring-primary-500 tabular-nums"
      />
    )},
    { header: 'الإجمالي', width: 'w-24', render: (item: PurchaseItemForm) => (
      <span className="text-sm font-semibold tabular-nums">{formatMoneyAmount(computeTotal(item))}</span>
    )},
    { header: '', width: 'w-10', render: (item: PurchaseItemForm) => (
      <button
        type="button"
        onClick={() => removeItem(item.tempId)}
        disabled={items.length <= 1}
        className="p-1 rounded-md text-danger-500 hover:bg-danger-50 disabled:text-text-disabled disabled:hover:bg-transparent transition-colors"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    )},
  ];

  return (
    <div>
      <div className="mb-3">
        <Button size="sm" variant="outline" icon={<Plus className="h-3.5 w-3.5" />} onClick={addItem}>
          إضافة بند
        </Button>
      </div>

      {errors?.items && <p className="text-xs text-danger-500 mb-2">{errors.items}</p>}

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto border border-border-default rounded-lg">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-default bg-neutral-50">
              {desktopColumns.map((col) => (
                <th key={col.header} className={`${col.width} px-2 py-2.5 text-right text-xs font-semibold text-text-secondary whitespace-nowrap`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={desktopColumns.length} className="px-4 py-8 text-center text-text-secondary text-sm">
                  لا توجد بنود. أضف بندًا جديدًا.
                </td>
              </tr>
            ) : (
              items.map((item, i) => (
                <tr key={item.tempId} className="border-b border-border-default last:border-b-0 hover:bg-neutral-50/50">
                  {desktopColumns.map((col) => (
                    <td key={`${item.tempId}-${col.header}`} className={`${col.width} px-2 py-2 align-middle`}>
                      {col.render(item, i)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {items.length === 0 ? (
          <div className="text-center text-text-secondary text-sm py-8">لا توجد بنود.</div>
        ) : (
          items.map((item, i) => (
            <div key={item.tempId} className="border border-border-default rounded-lg p-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-secondary">البند {i + 1}</span>
                {items.length > 1 && (
                  <button type="button" onClick={() => removeItem(item.tempId)} className="text-danger-500 p-1">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <SearchableItemSelect
                value={item.inventoryItemId}
                onChange={(id, data) => handleItemSelect(item.tempId, id, data)}
                error={errors?.[`item-${i}-name`]}
                label="المادة"
              />

              <Input label="الوصف" value={item.description} onChange={(e) => updateItem(item.tempId, 'description', e.target.value)} fullWidth inputSize="sm" />

              <div className="grid grid-cols-2 gap-2">
                <Input label="وحدة الشراء" value={item.purchaseUnit} onChange={(e) => updateItem(item.tempId, 'purchaseUnit', e.target.value)} fullWidth inputSize="sm" />
                <Input label="الكمية" type="number" value={item.quantity.toString()} onChange={(e) => updateItem(item.tempId, 'quantity', parseFloat(e.target.value) || 0)} error={errors?.[`item-${i}-qty`]} fullWidth inputSize="sm" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Input label="معامل التحويل" type="number" value={item.conversionFactor.toString()} onChange={(e) => updateItem(item.tempId, 'conversionFactor', parseFloat(e.target.value) || 1)} fullWidth inputSize="sm" />
                <Input label="سعر الوحدة" type="number" value={item.unitPrice.toString()} onChange={(e) => updateItem(item.tempId, 'unitPrice', parseFloat(e.target.value) || 0)} error={errors?.[`item-${i}-price`]} fullWidth inputSize="sm" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Input label="الخصم" type="number" value={item.discount.toString()} onChange={(e) => updateItem(item.tempId, 'discount', parseFloat(e.target.value) || 0)} fullWidth inputSize="sm" />
                <div>
                  <label className="block text-xs font-medium text-text-primary mb-1">كمية المخزون</label>
                  <div className="h-9 px-3 flex items-center text-sm text-text-secondary bg-bg-surface rounded-md border border-border-default">
                    {item.quantityInBaseUnit} {item.baseUnit || item.purchaseUnit}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-1 border-t border-border-default">
                <span className="text-xs text-text-secondary">الإجمالي</span>
                <span className="text-sm font-bold tabular-nums">{formatMoneyAmount(computeTotal(item))}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {items.length >= 5 && (
        <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
          <span>⚠</span> الحد الأقصى 5 مواد لكل فاتورة
        </p>
      )}
    </div>
  );
}
