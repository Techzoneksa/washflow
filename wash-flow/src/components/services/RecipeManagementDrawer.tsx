'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import Drawer from '@/components/ui/Drawer';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import { Money } from '@/lib/format';
import { useToast } from '@/components/ui/Toast';
import { getServiceRecipe, getInventoryItemsForRecipe, saveServiceRecipe } from '@/lib/data/recipes';
import type { ServiceItem } from '@/types/services';
import type { ServiceRecipe, RecipeFormItem } from '@/types/recipes';
import { Plus, Trash2, Save, Search, Package } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  service: ServiceItem | null;
  userRole?: string | null;
}

export default function RecipeManagementDrawer({ open, onClose, service, userRole }: Props) {
  const { toast } = useToast();
  const [recipe, setRecipe] = useState<ServiceRecipe | null>(null);
  const [allItems, setAllItems] = useState<Array<{ id: string; name: string; base_unit: string; current_quantity: number; average_cost: number; status: string }>>([]);
  const [formItems, setFormItems] = useState<RecipeFormItem[]>([]);
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [selectedItemId, setSelectedItemId] = useState('');
  const [selectedItemName, setSelectedItemName] = useState('');
  const [selectedItemUnit, setSelectedItemUnit] = useState('');
  const [selectedItemCost, setSelectedItemCost] = useState(0);
  const [quantity, setQuantity] = useState('');
  const [itemSearch, setItemSearch] = useState('');

  const isReadOnly = userRole === 'accountant' || userRole === 'cashier';

  useEffect(() => {
    if (!open || !service) return;

    let cancelled = false;

    (async () => {
      const [recipeData, items] = await Promise.all([
        getServiceRecipe(service.id),
        getInventoryItemsForRecipe(),
      ]);
      if (cancelled) return;
      setAllItems(items);
      setRecipe(recipeData);
      setFormItems(recipeData ? recipeData.items.map((item) => ({
        inventoryItemId: item.inventoryItemId,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        unitCost: item.unitCost,
        sortOrder: item.sortOrder,
      })) : []);
      setStatus(recipeData?.status || 'active');
      setNotes(recipeData?.notes || '');
      setSelectedItemId('');
      setItemSearch('');
      setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [open, service]);

  const addedItemIds = useMemo(() => new Set(formItems.map((f) => f.inventoryItemId)), [formItems]);

  const filteredInventory = useMemo(() => {
    return allItems
      .filter((item) => item.status === 'active')
      .filter((item) => !addedItemIds.has(item.id))
      .filter((item) => {
        if (!itemSearch) return true;
        const q = itemSearch.toLowerCase();
        return item.name.toLowerCase().includes(q);
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [allItems, addedItemIds, itemSearch]);



  const totalMaterialCost = useMemo(() => {
    return formItems.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);
  }, [formItems]);

  const margin = service ? service.price - totalMaterialCost : 0;

  const handleSelectItem = useCallback((item: { id: string; name: string; base_unit: string; average_cost: number }) => {
    setSelectedItemId(item.id);
    setSelectedItemName(item.name);
    setSelectedItemUnit(item.base_unit);
    setSelectedItemCost(Number(item.average_cost || 0));
    setQuantity('');
    setItemSearch('');
  }, []);

  const handleAddItem = useCallback(() => {
    const qty = parseFloat(quantity);
    if (!selectedItemId || !qty || qty <= 0) return;
    if (formItems.length >= 5) return;

    setFormItems((prev) => [
      ...prev,
      {
        inventoryItemId: selectedItemId,
        name: selectedItemName,
        quantity: qty,
        unit: selectedItemUnit,
        unitCost: selectedItemCost,
        sortOrder: prev.length,
      },
    ]);

    setSelectedItemId('');
    setSelectedItemName('');
    setSelectedItemUnit('');
    setSelectedItemCost(0);
    setQuantity('');
  }, [selectedItemId, selectedItemName, selectedItemUnit, selectedItemCost, quantity, formItems.length]);

  const handleRemoveItem = useCallback((inventoryItemId: string) => {
    setFormItems((prev) => prev.filter((f) => f.inventoryItemId !== inventoryItemId));
  }, []);

  const handleSave = useCallback(async () => {
    if (!service) return;
    setSaving(true);

    const result = await saveServiceRecipe(
      service.id,
      status,
      notes || null,
      formItems,
    );

    if (result.success) {
      toast('success', recipe ? 'تم تحديث بطاقة الاستهلاك' : 'تم إنشاء بطاقة الاستهلاك');
      const updated = await getServiceRecipe(service.id);
      if (updated) {
        setRecipe(updated);
        setStatus(updated.status);
        setNotes(updated.notes || '');
        setFormItems(updated.items.map((item) => ({
          inventoryItemId: item.inventoryItemId,
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          unitCost: item.unitCost,
          sortOrder: item.sortOrder,
        })));
      }
    } else {
      toast('error', 'حدث خطأ أثناء حفظ بطاقة الاستهلاك');
    }

    setSaving(false);
  }, [service, status, notes, formItems, recipe, toast]);

  if (!service) return null;

  return (
    <Drawer open={open} onClose={onClose} title={`بطاقة استهلاك: ${service.nameAr}`}>
      <div className="flex flex-col gap-4">
        <div className="bg-neutral-50 rounded-lg p-3 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-text-primary">{service.nameAr}</span>
            <Badge variant={status === 'active' ? 'success' : 'neutral'} size="sm">
              {status === 'active' ? 'نشط' : 'غير نشط'}
            </Badge>
          </div>
          <div className="text-xs text-text-secondary">
            السعر: <Money value={service.price} />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500" />
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-text-primary">المواد المستهلكة</h4>

              {formItems.length === 0 ? (
                <div className="text-center py-6 text-text-secondary text-sm">
                  <Package className="h-8 w-8 mx-auto mb-2 text-text-disabled" />
                  لا توجد مواد مضافة بعد
                </div>
              ) : (
                <div className="space-y-1">
                  {formItems.map((item) => {
                    const lineCost = item.quantity * item.unitCost;
                    return (
                      <div key={item.inventoryItemId} className="flex items-center gap-2 p-2 rounded-md bg-bg-hover">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.name}</p>
                          <p className="text-xs text-text-secondary">
                            الكمية: {item.quantity} {item.unit}
                            {' | '}
                            تكلفة الوحدة: <Money value={item.unitCost} />
                          </p>
                          <p className="text-xs font-semibold">
                            الإجمالي: <Money value={lineCost} />
                          </p>
                        </div>
                        {!isReadOnly && (
                          <button
                            onClick={() => handleRemoveItem(item.inventoryItemId)}
                            className="p-1 rounded hover:bg-danger-50 text-text-secondary hover:text-danger-500"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {formItems.length > 0 && (
              <div className="bg-neutral-50 rounded-lg p-3 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">إجمالي تكلفة المواد:</span>
                  <span className="font-semibold"><Money value={totalMaterialCost} /></span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">سعر البيع:</span>
                  <span className="font-semibold"><Money value={service.price} /></span>
                </div>
                <div className="border-t border-border-default pt-1.5 flex justify-between">
                  <span className="text-text-secondary">الهامش قبل المصاريف التشغيلية:</span>
                  <span className={`font-bold ${margin >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                    <Money value={margin} />
                  </span>
                </div>
              </div>
            )}

            {!isReadOnly && (
              <>
                {formItems.length >= 5 ? (
                  <div className="text-xs text-warning-600 bg-warning-50 rounded-md p-2 text-center">
                    تم الوصول للحد الأقصى (5 مواد)
                  </div>
                ) : allItems.length === 0 ? (
                  <div className="text-xs text-text-secondary bg-neutral-50 rounded-md p-2 text-center">
                    لا توجد مواد مخزون. أضف المواد أولًا من صفحة المخزون.
                  </div>
                ) : (
                  <div className="space-y-2 border border-border-default rounded-lg p-3">
                    <h5 className="text-xs font-semibold text-text-primary">إضافة مادة</h5>

                    <div className="relative">
                      <Input
                        placeholder="بحث عن مادة..."
                        value={itemSearch}
                        onChange={(e) => setItemSearch(e.target.value)}
                        icon={<Search className="h-4 w-4" />}
                        fullWidth
                      />
                    </div>

                    {filteredInventory.length > 0 ? (
                      <div className="max-h-40 overflow-y-auto space-y-1">
                        {filteredInventory.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => handleSelectItem(item)}
                            className={`w-full text-right p-2 rounded-md text-sm transition-colors ${
                              selectedItemId === item.id
                                ? 'bg-primary-50 text-primary-700 border border-primary-200'
                                : 'bg-bg-hover hover:bg-neutral-100 border border-transparent'
                            }`}
                          >
                            <span className="font-medium">{item.name}</span>
                            <span className="text-xs text-text-secondary mr-2">
                              الرصيد: {item.current_quantity} {item.base_unit}
                              {' | '}
                              <Money value={item.average_cost} />/الوحدة
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-text-secondary text-center py-2">
                        {itemSearch ? 'لا توجد نتائج' : 'تمت إضافة جميع المواد'}
                      </p>
                    )}

                    {selectedItemId && (
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <Input
                            type="number"
                            placeholder="الكمية"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            min="0"
                            step="0.001"
                            fullWidth
                          />
                        </div>
                        <span className="text-sm text-text-secondary shrink-0">{selectedItemUnit}</span>
                        <Button
                          size="sm"
                          icon={<Plus className="h-3.5 w-3.5" />}
                          onClick={handleAddItem}
                          disabled={!quantity || parseFloat(quantity) <= 0}
                        >
                          إضافة
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-primary">حالة البطاقة</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setStatus('active')}
                      className={`flex-1 py-2 rounded-md text-sm font-medium border transition-colors ${
                        status === 'active'
                          ? 'bg-success-50 text-success-700 border-success-200'
                          : 'bg-bg-surface text-text-secondary border-border-default'
                      }`}
                    >
                      نشط
                    </button>
                    <button
                      onClick={() => setStatus('inactive')}
                      className={`flex-1 py-2 rounded-md text-sm font-medium border transition-colors ${
                        status === 'inactive'
                          ? 'bg-neutral-100 text-text-primary border-border-default'
                          : 'bg-bg-surface text-text-secondary border-border-default'
                      }`}
                    >
                      غير نشط
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-text-primary">ملاحظات</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full mt-1 rounded-md border border-border-default bg-bg-surface px-4 py-2 text-sm text-text-primary resize-none h-20"
                    placeholder="ملاحظات..."
                  />
                </div>

                <Button
                  fullWidth
                  icon={<Save className="h-4 w-4" />}
                  onClick={handleSave}
                  loading={saving}
                >
                  حفظ بطاقة الاستهلاك
                </Button>
              </>
            )}

            {isReadOnly && formItems.length === 0 && (
              <p className="text-sm text-text-secondary text-center py-4">
                لا توجد بطاقة استهلاك لهذه الخدمة
              </p>
            )}
          </>
        )}
      </div>
    </Drawer>
  );
}
