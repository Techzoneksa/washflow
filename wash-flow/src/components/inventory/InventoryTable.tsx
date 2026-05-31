'use client';
import Button from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import type { InventoryItem } from '@/types/inventory';
import { INVENTORY_CATEGORY_LABELS, INVENTORY_UNIT_LABELS } from '@/types/inventory';
import LowStockBadge from './LowStockBadge';
import { Eye, Pencil, ArrowDownCircle, Trash2, Scale } from 'lucide-react';

interface InventoryTableProps {
  items: InventoryItem[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onView: (item: InventoryItem) => void;
  onEdit: (item: InventoryItem) => void;
  onStockMovement: (item: InventoryItem) => void;
  onWaste: (item: InventoryItem) => void;
  onAdjust: (item: InventoryItem) => void;
}

export default function InventoryTable({
  items,
  page,
  totalPages,
  onPageChange,
  onView,
  onEdit,
  onStockMovement,
  onWaste,
  onAdjust,
}: InventoryTableProps) {
  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-default">
              <th className="text-right px-4 py-3 font-semibold text-text-primary">المادة</th>
              <th className="text-right px-4 py-3 font-semibold text-text-primary">التصنيف</th>
              <th className="text-right px-4 py-3 font-semibold text-text-primary">الوحدة</th>
              <th className="text-right px-4 py-3 font-semibold text-text-primary">الكمية</th>
              <th className="text-right px-4 py-3 font-semibold text-text-primary">الحد الأدنى</th>
              <th className="text-right px-4 py-3 font-semibold text-text-primary">الحالة</th>
              <th className="text-right px-4 py-3 font-semibold text-text-primary">التكلفة</th>
              <th className="text-right px-4 py-3 font-semibold text-text-primary">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const isLow = item.currentQuantity > 0 && item.currentQuantity <= item.minimumQuantity;
              const isOut = item.currentQuantity === 0;
              return (
                <tr key={item.id} className="border-b border-border-subtle hover:bg-bg-hover">
                  <td className="px-4 py-3">
                    <div className="font-medium text-text-primary">{item.name}</div>
                    {item.supplierName && (
                      <div className="text-xs text-text-tertiary">{item.supplierName}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {INVENTORY_CATEGORY_LABELS[item.category]}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {INVENTORY_UNIT_LABELS[item.unit]}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-semibold ${isOut ? 'text-danger-500' : isLow ? 'text-warning-500' : 'text-text-primary'}`}>
                      {item.currentQuantity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{item.minimumQuantity}</td>
                  <td className="px-4 py-3">
                    <LowStockBadge current={item.currentQuantity} minimum={item.minimumQuantity} status={item.status} />
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {formatCurrency(item.averageCost)} / {INVENTORY_UNIT_LABELS[item.unit]}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => onView(item)} className="p-1.5 rounded-md hover:bg-bg-hover text-text-tertiary" title="عرض">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button onClick={() => onEdit(item)} className="p-1.5 rounded-md hover:bg-bg-hover text-text-tertiary" title="تعديل">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => onStockMovement(item)} className="p-1.5 rounded-md hover:bg-bg-hover text-primary-500" title="حركة مخزون">
                        <ArrowDownCircle className="h-4 w-4" />
                      </button>
                      <button onClick={() => onWaste(item)} className="p-1.5 rounded-md hover:bg-bg-hover text-warning-500" title="هدر">
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => onAdjust(item)} className="p-1.5 rounded-md hover:bg-bg-hover text-info-500" title="تسوية">
                        <Scale className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 p-4 border-t border-border-default">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
          >
            السابق
          </Button>
          <span className="px-3 py-1 text-sm text-text-secondary">
            {page} من {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page === totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            التالي
          </Button>
        </div>
      )}
    </>
  );
}
