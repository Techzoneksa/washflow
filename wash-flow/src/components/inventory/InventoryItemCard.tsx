'use client';
import Card from '@/components/ui/Card';
import type { InventoryItem } from '@/types/inventory';
import { INVENTORY_CATEGORY_LABELS, INVENTORY_UNIT_LABELS } from '@/types/inventory';
import LowStockBadge from './LowStockBadge';
import { ArrowDownCircle, Trash2, Scale } from 'lucide-react';

interface InventoryItemCardProps {
  item: InventoryItem;
  onView: (item: InventoryItem) => void;
  onEdit: (item: InventoryItem) => void;
  onStockMovement: (item: InventoryItem) => void;
  onWaste: (item: InventoryItem) => void;
  onAdjust: (item: InventoryItem) => void;
}

export default function InventoryItemCard({
  item,
  onView,
  onEdit,
  onStockMovement,
  onWaste,
  onAdjust,
}: InventoryItemCardProps) {
  return (
    <Card padding="md" className="space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-text-primary">{item.name}</h3>
          <p className="text-sm text-text-secondary">
            {INVENTORY_CATEGORY_LABELS[item.category]}
          </p>
        </div>
        <LowStockBadge current={item.currentQuantity} minimum={item.minimumQuantity} status={item.status} />
      </div>

      <div className="flex items-center justify-between text-sm">
        <div>
          <span className="text-text-tertiary">الكمية:</span>
          <span className="font-semibold mr-1">
            {item.currentQuantity} {INVENTORY_UNIT_LABELS[item.unit]}
          </span>
        </div>
        <div>
          <span className="text-text-tertiary">الحد:</span>
          <span className="font-semibold mr-1">{item.minimumQuantity}</span>
        </div>
      </div>

      {item.supplierName && (
        <p className="text-xs text-text-tertiary">{item.supplierName}</p>
      )}

      <div className="flex items-center gap-2 pt-2 border-t border-border-subtle">
        <button onClick={() => onView(item)} className="flex-1 py-1.5 rounded-md bg-bg-hover text-text-secondary hover:text-text-primary text-sm">
          عرض
        </button>
        <button onClick={() => onEdit(item)} className="flex-1 py-1.5 rounded-md bg-bg-hover text-text-secondary hover:text-text-primary text-sm">
          تعديل
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={() => onStockMovement(item)} className="flex-1 py-1.5 rounded-md bg-primary-50 text-primary-500 hover:bg-primary-100 text-sm flex items-center justify-center gap-1">
          <ArrowDownCircle className="h-4 w-4" />
          استهلاك
        </button>
        <button onClick={() => onWaste(item)} className="flex-1 py-1.5 rounded-md bg-warning-50 text-warning-500 hover:bg-warning-100 text-sm flex items-center justify-center gap-1">
          <Trash2 className="h-4 w-4" />
          هدر
        </button>
        <button onClick={() => onAdjust(item)} className="flex-1 py-1.5 rounded-md bg-info-50 text-info-500 hover:bg-info-100 text-sm flex items-center justify-center gap-1">
          <Scale className="h-4 w-4" />
          تسوية
        </button>
      </div>
    </Card>
  );
}
