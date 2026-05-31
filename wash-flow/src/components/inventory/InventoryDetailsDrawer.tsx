'use client';
import Drawer from '@/components/ui/Drawer';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';
import type { InventoryItem } from '@/types/inventory';
import { INVENTORY_CATEGORY_LABELS, INVENTORY_UNIT_LABELS, STOCK_MOVEMENT_TYPE_LABELS } from '@/types/inventory';
import { getStockMovementsByItemId } from '@/lib/mock-inventory';
import { Pencil, ArrowDownCircle, Trash2, Scale, History } from 'lucide-react';

interface InventoryDetailsDrawerProps {
  open: boolean;
  onClose: () => void;
  item: InventoryItem | null;
  onEdit: (item: InventoryItem) => void;
  onStockMovement: (item: InventoryItem) => void;
  onWaste: (item: InventoryItem) => void;
  onAdjust: (item: InventoryItem) => void;
}

export default function InventoryDetailsDrawer({
  open,
  onClose,
  item,
  onEdit,
  onStockMovement,
  onWaste,
  onAdjust,
}: InventoryDetailsDrawerProps) {
  if (!item) return null;

  const isLow = item.currentQuantity > 0 && item.currentQuantity <= item.minimumQuantity;
  const isOut = item.currentQuantity === 0;
  const movements = getStockMovementsByItemId(item.id).slice(0, 10);

  return (
    <Drawer open={open} onClose={onClose} title="تفاصيل المادة">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-text-primary">{item.name}</h3>
            <p className="text-sm text-text-secondary">
              {INVENTORY_CATEGORY_LABELS[item.category]}
            </p>
          </div>
          <Badge variant={isOut ? 'danger' : isLow ? 'warning' : 'success'}>
            {isOut ? 'نفد' : isLow ? 'منخفض' : 'متوفر'}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Card padding="sm" className="bg-bg-subtle">
            <p className="text-xs text-text-tertiary mb-1">الكمية الحالية</p>
            <p className={`text-lg font-bold ${isOut ? 'text-danger-500' : isLow ? 'text-warning-500' : 'text-text-primary'}`}>
              {item.currentQuantity} {INVENTORY_UNIT_LABELS[item.unit]}
            </p>
          </Card>
          <Card padding="sm" className="bg-bg-subtle">
            <p className="text-xs text-text-tertiary mb-1">الحد الأدنى</p>
            <p className="text-lg font-bold text-text-primary">{item.minimumQuantity}</p>
          </Card>
          <Card padding="sm" className="bg-bg-subtle">
            <p className="text-xs text-text-tertiary mb-1">متوسط التكلفة</p>
            <p className="text-lg font-bold text-text-primary">{formatCurrency(item.averageCost)}</p>
          </Card>
          <Card padding="sm" className="bg-bg-subtle">
            <p className="text-xs text-text-tertiary mb-1">القيمة الإجمالية</p>
            <p className="text-lg font-bold text-primary-500">{formatCurrency(item.currentQuantity * item.averageCost)}</p>
          </Card>
        </div>

        {item.supplierName && (
          <div>
            <p className="text-xs text-text-tertiary">المورد</p>
            <p className="text-sm text-text-primary">{item.supplierName}</p>
          </div>
        )}

        {item.notes && (
          <div>
            <p className="text-xs text-text-tertiary">ملاحظات</p>
            <p className="text-sm text-text-primary">{item.notes}</p>
          </div>
        )}

        <div className="border-t border-border-default pt-4">
          <h4 className="text-sm font-semibold text-text-primary mb-2 flex items-center gap-2">
            <History className="h-4 w-4" />
            آخر الحركات
          </h4>
          {movements.length === 0 ? (
            <p className="text-sm text-text-tertiary">لا توجد حركات</p>
          ) : (
            <div className="space-y-2">
              {movements.map((m) => (
                <div key={m.id} className="flex items-center justify-between text-sm py-2 border-b border-border-subtle last:border-0">
                  <div>
                    <p className="text-text-primary">{STOCK_MOVEMENT_TYPE_LABELS[m.type]}</p>
                    <p className="text-xs text-text-tertiary">{m.reason}</p>
                  </div>
                  <div className="text-left">
                    <p className={`font-semibold ${m.type === 'purchase' ? 'text-success-500' : 'text-danger-500'}`}>
                      {m.type === 'purchase' ? '+' : '-'}{m.quantity} {INVENTORY_UNIT_LABELS[item.unit]}
                    </p>
                    <p className="text-xs text-text-tertiary">
                      {new Date(m.createdAt).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <Button variant="outline" size="sm" icon={<Pencil className="h-4 w-4" />} onClick={() => onEdit(item)}>
            تعديل
          </Button>
          <Button variant="outline" size="sm" icon={<ArrowDownCircle className="h-4 w-4" />} onClick={() => onStockMovement(item)}>
            استهلاك
          </Button>
          <Button variant="outline" size="sm" icon={<Trash2 className="h-4 w-4" />} onClick={() => onWaste(item)}>
            هدر
          </Button>
          <Button variant="outline" size="sm" icon={<Scale className="h-4 w-4" />} onClick={() => onAdjust(item)}>
            تسوية
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
