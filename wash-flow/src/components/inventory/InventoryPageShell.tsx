'use client';
import { useState, useMemo, useCallback } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import InventorySummaryCards from './InventorySummaryCards';
import InventoryFilters from './InventoryFilters';
import InventoryTable from './InventoryTable';
import InventoryItemCard from './InventoryItemCard';
import InventoryDetailsDrawer from './InventoryDetailsDrawer';
import InventoryItemFormDrawer from './InventoryItemFormDrawer';
import StockMovementFormModal from './StockMovementFormModal';
import WasteFormModal from './WasteFormModal';
import StockAdjustmentModal from './StockAdjustmentModal';
import {
  getInventoryItems,
  getInventorySummary,
  filterInventoryItems,
  addInventoryItem,
  updateInventoryItem,
  addStockMovement,
  addWasteEntry,
  addStockAdjustment,
} from '@/lib/mock-inventory';
import type { InventoryItem, InventoryFilter } from '@/types/inventory';
import type { InventoryItemFormData } from './InventoryItemFormDrawer';
import type { StockMovementFormData } from './StockMovementFormModal';
import type { WasteFormData } from './WasteFormModal';
import type { StockAdjustmentFormData } from './StockAdjustmentModal';
import { Plus, Package } from 'lucide-react';

const PAGE_SIZE = 10;

export default function InventoryPageShell() {
  const { toast } = useToast();
  const [items, setItems] = useState<InventoryItem[]>(getInventoryItems());
  const [filters, setFilters] = useState<InventoryFilter>({
    search: '',
    category: 'all',
    status: 'all',
    stockStatus: 'all',
    supplierId: '',
  });
  const [page, setPage] = useState(1);

  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [movementModalOpen, setMovementModalOpen] = useState(false);
  const [wasteModalOpen, setWasteModalOpen] = useState(false);
  const [adjustmentModalOpen, setAdjustmentModalOpen] = useState(false);

  const refreshItems = useCallback(() => {
    setItems([...getInventoryItems()]);
  }, []);

  const summary = useMemo(() => getInventorySummary(), [items]);

  const filtered = useMemo(() => {
    return filterInventoryItems(items, filters);
  }, [items, filters]);

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return {
      items: filtered.slice(start, start + PAGE_SIZE),
      totalPages: Math.ceil(filtered.length / PAGE_SIZE),
    };
  }, [filtered, page]);

  const handleView = useCallback((item: InventoryItem) => {
    setSelectedItem(item);
    setDetailsOpen(true);
  }, []);

  const handleEdit = useCallback((item: InventoryItem) => {
    setEditItem(item);
    setFormOpen(true);
  }, []);

  const handleAdd = useCallback(() => {
    setEditItem(null);
    setFormOpen(true);
  }, []);

  const handleSave = useCallback((data: InventoryItemFormData) => {
    if (editItem) {
      const updated = updateInventoryItem(editItem.id, {
        name: data.name,
        category: data.category,
        unit: data.unit,
        currentQuantity: data.currentQuantity,
        minimumQuantity: data.minimumQuantity,
        averageCost: data.averageCost,
        supplierId: data.supplierId,
        supplierName: data.supplierName,
        status: data.status,
        notes: data.notes || '',
      });
      if (updated) {
        refreshItems();
        setFormOpen(false);
        setEditItem(null);
        toast('success', 'تم تحديث المادة بنجاح');
      }
    } else {
      const created = addInventoryItem({
        name: data.name,
        category: data.category,
        unit: data.unit,
        currentQuantity: data.currentQuantity,
        minimumQuantity: data.minimumQuantity,
        averageCost: data.averageCost,
        supplierId: data.supplierId,
        supplierName: data.supplierName,
        status: data.status,
        notes: data.notes || '',
      });
      if (created) {
        refreshItems();
        setFormOpen(false);
        toast('success', 'تم إضافة المادة بنجاح');
      }
    }
  }, [editItem, refreshItems, toast]);

  const handleCloseForm = useCallback(() => {
    setFormOpen(false);
    setEditItem(null);
  }, []);

  const handleStockMovement = useCallback((item: InventoryItem) => {
    setSelectedItem(item);
    setMovementModalOpen(true);
  }, []);

  const handleSaveMovement = useCallback((data: StockMovementFormData) => {
    if (!selectedItem) return;
    addStockMovement({
      itemId: selectedItem.id,
      itemName: selectedItem.name,
      type: data.type,
      quantity: data.quantity,
      unit: selectedItem.unit,
      reason: data.reason,
      referenceType: 'manual',
      referenceId: '',
      createdBy: 'مالك النظام',
    });
    refreshItems();
    setMovementModalOpen(false);
    toast('success', 'تم تسجيل الحركة بنجاح');
  }, [selectedItem, refreshItems, toast]);

  const handleWaste = useCallback((item: InventoryItem) => {
    setSelectedItem(item);
    setWasteModalOpen(true);
  }, []);

  const handleSaveWaste = useCallback((data: WasteFormData) => {
    if (!selectedItem) return;
    addWasteEntry({
      itemId: selectedItem.id,
      itemName: selectedItem.name,
      quantity: data.quantity,
      unit: selectedItem.unit,
      reason: data.reason,
      date: data.date,
      notes: data.notes || '',
      createdBy: 'مالك النظام',
    });
    refreshItems();
    setWasteModalOpen(false);
    toast('success', 'تم تسجيل الهدر بنجاح');
  }, [selectedItem, refreshItems, toast]);

  const handleAdjustment = useCallback((item: InventoryItem) => {
    setSelectedItem(item);
    setAdjustmentModalOpen(true);
  }, []);

  const handleSaveAdjustment = useCallback((data: StockAdjustmentFormData) => {
    if (!selectedItem) return;
    addStockAdjustment({
      itemId: selectedItem.id,
      itemName: selectedItem.name,
      systemQuantity: selectedItem.currentQuantity,
      actualQuantity: data.actualQuantity,
      difference: data.actualQuantity - selectedItem.currentQuantity,
      reason: data.reason,
      date: data.date,
      notes: data.notes || '',
      createdBy: 'مالك النظام',
    });
    refreshItems();
    setAdjustmentModalOpen(false);
    toast('success', 'تم تسجيل التسوية بنجاح');
  }, [selectedItem, refreshItems, toast]);

  return (
    <>
      <PageHeader
        title="المخزون"
        description="إدارة مواد المخزون والمستودع"
        actions={
          <Button icon={<Plus className="h-4 w-4" />} onClick={handleAdd}>
            إضافة مادة
          </Button>
        }
      />

      <InventorySummaryCards data={summary} />

      <div className="bg-bg-surface border border-border-default rounded-card">
        <div className="p-4 pb-0">
          <InventoryFilters
            filters={filters}
            onFiltersChange={(f) => { setFilters(f); setPage(1); }}
          />
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<Package className="h-16 w-16" />}
            title="لا توجد مواد"
            description="لا توجد مواد تطابق معايير البحث"
          />
        ) : (
          <>
            <div className="hidden md:block">
              <InventoryTable
                items={paginated.items}
                page={page}
                totalPages={paginated.totalPages}
                onPageChange={setPage}
                onView={handleView}
                onEdit={handleEdit}
                onStockMovement={handleStockMovement}
                onWaste={handleWaste}
                onAdjust={handleAdjustment}
              />
            </div>
            <div className="md:hidden p-4 space-y-3">
              {paginated.items.map((item) => (
                <InventoryItemCard
                  key={item.id}
                  item={item}
                  onView={handleView}
                  onEdit={handleEdit}
                  onStockMovement={handleStockMovement}
                  onWaste={handleWaste}
                  onAdjust={handleAdjustment}
                />
              ))}
              {paginated.totalPages > 1 && (
                <div className="flex justify-center gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                  >
                    السابق
                  </Button>
                  <span className="px-3 py-1 text-sm text-text-secondary">
                    {page} / {paginated.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === paginated.totalPages}
                    onClick={() => setPage(p => p + 1)}
                  >
                    التالي
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <InventoryDetailsDrawer
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        item={selectedItem}
        onEdit={(item) => { setDetailsOpen(false); handleEdit(item); }}
        onStockMovement={(item) => { setDetailsOpen(false); handleStockMovement(item); }}
        onWaste={(item) => { setDetailsOpen(false); handleWaste(item); }}
        onAdjust={(item) => { setDetailsOpen(false); handleAdjustment(item); }}
      />

      <InventoryItemFormDrawer
        open={formOpen}
        onClose={handleCloseForm}
        onSave={handleSave}
        item={editItem}
      />

      {selectedItem && (
        <>
          <StockMovementFormModal
            open={movementModalOpen}
            onClose={() => setMovementModalOpen(false)}
            onSave={handleSaveMovement}
            item={selectedItem}
          />
          <WasteFormModal
            open={wasteModalOpen}
            onClose={() => setWasteModalOpen(false)}
            onSave={handleSaveWaste}
            item={selectedItem}
          />
          <StockAdjustmentModal
            open={adjustmentModalOpen}
            onClose={() => setAdjustmentModalOpen(false)}
            onSave={handleSaveAdjustment}
            item={selectedItem}
          />
        </>
      )}
    </>
  );
}
