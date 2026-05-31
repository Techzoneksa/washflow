import type {
  InventoryItem,
  StockMovement,
  WasteEntry,
  StockAdjustment,
} from '@/types/inventory';
import { INVENTORY_CATEGORY_LABELS, INVENTORY_UNIT_LABELS } from '@/types/inventory';

export const INVENTORY_CATEGORY_OPTIONS = Object.entries(INVENTORY_CATEGORY_LABELS).map(([value, label]) => ({ value, label }));
export const INVENTORY_UNIT_OPTIONS = Object.entries(INVENTORY_UNIT_LABELS).map(([value, label]) => ({ value, label }));

function makeItem(overrides: Partial<InventoryItem> = {}): InventoryItem {
  return {
    id: '',
    name: '',
    category: 'washing',
    unit: 'liter',
    currentQuantity: 0,
    minimumQuantity: 0,
    averageCost: 0,
    supplierId: '',
    supplierName: '',
    status: 'active',
    notes: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

function d(daysAgo: number): string {
  return new Date(Date.now() - daysAgo * 86400000).toISOString();
}

export const mockInventoryItems: InventoryItem[] = [
  makeItem({
    id: 'inv-1', name: 'صابون سائل للغسيل', category: 'washing', unit: 'liter',
    currentQuantity: 120, minimumQuantity: 50, averageCost: 18.5,
    supplierId: 'sup-1', supplierName: 'مؤسسة الإتقان للتوريدات', status: 'active',
    createdAt: d(90), updatedAt: d(5),
  }),
  makeItem({
    id: 'inv-2', name: 'شامبو سيارات فاخر', category: 'washing', unit: 'liter',
    currentQuantity: 45, minimumQuantity: 30, averageCost: 42,
    supplierId: 'sup-1', supplierName: 'مؤسسة الإتقان للتوريدات', status: 'active',
    createdAt: d(90), updatedAt: d(3),
  }),
  makeItem({
    id: 'inv-3', name: 'ملمع إطارات', category: 'polishing', unit: 'liter',
    currentQuantity: 18, minimumQuantity: 10, averageCost: 35,
    supplierId: 'sup-2', supplierName: 'شركة الندى للمواد', status: 'active',
    createdAt: d(85), updatedAt: d(7),
  }),
  makeItem({
    id: 'inv-4', name: 'منظف أسطح بلاستيكية', category: 'interior_cleaning', unit: 'bottle',
    currentQuantity: 32, minimumQuantity: 15, averageCost: 22,
    supplierId: 'sup-2', supplierName: 'شركة الندى للمواد', status: 'active',
    createdAt: d(80), updatedAt: d(10),
  }),
  makeItem({
    id: 'inv-5', name: 'معطر جوeus', category: 'disinfection', unit: 'bottle',
    currentQuantity: 0, minimumQuantity: 10, averageCost: 28,
    supplierId: 'sup-3', supplierName: 'متجر السيارات المتحدة', status: 'active',
    createdAt: d(75), updatedAt: d(2),
  }),
  makeItem({
    id: 'inv-6', name: 'فوط مايكروفايبر', category: 'towels_microfiber', unit: 'piece',
    currentQuantity: 85, minimumQuantity: 40, averageCost: 8.5,
    supplierId: 'sup-3', supplierName: 'متجر السيارات المتحدة', status: 'active',
    createdAt: d(70), updatedAt: d(15),
  }),
  makeItem({
    id: 'inv-7', name: 'مناديل تنظيف احترافية', category: 'towels_microfiber', unit: 'carton',
    currentQuantity: 12, minimumQuantity: 20, averageCost: 55,
    supplierId: 'sup-1', supplierName: 'مؤسسة الإتقان للتوريدات', status: 'active',
    createdAt: d(65), updatedAt: d(8),
  }),
  makeItem({
    id: 'inv-8', name: 'أكياس نفايات سوداء', category: 'packaging_bags', unit: 'roll',
    currentQuantity: 28, minimumQuantity: 15, averageCost: 12,
    supplierId: 'sup-4', supplierName: 'موردي الخليج', status: 'active',
    createdAt: d(60), updatedAt: d(20),
  }),
  makeItem({
    id: 'inv-9', name: 'مطهر أسطح', category: 'disinfection', unit: 'liter',
    currentQuantity: 25, minimumQuantity: 10, averageCost: 15,
    supplierId: 'sup-2', supplierName: 'شركة الندى للمواد', status: 'active',
    createdAt: d(55), updatedAt: d(12),
  }),
  makeItem({
    id: 'inv-10', name: 'فرش تنظيف متعددة', category: 'tools_consumables', unit: 'piece',
    currentQuantity: 40, minimumQuantity: 20, averageCost: 6,
    supplierId: 'sup-4', supplierName: 'موردي الخليج', status: 'active',
    createdAt: d(50), updatedAt: d(25),
  }),
  makeItem({
    id: 'inv-11', name: 'فلتر مياه', category: 'filters_parts', unit: 'piece',
    currentQuantity: 5, minimumQuantity: 5, averageCost: 45,
    supplierId: 'sup-1', supplierName: 'مؤسسة الإتقان للتوريدات', status: 'active',
    createdAt: d(45), updatedAt: d(30),
  }),
  makeItem({
    id: 'inv-12', name: 'مواد إزالة بقع', category: 'interior_cleaning', unit: 'bottle',
    currentQuantity: 15, minimumQuantity: 8, averageCost: 32,
    supplierId: 'sup-2', supplierName: 'شركة الندى للمواد', status: 'active',
    createdAt: d(40), updatedAt: d(18),
  }),
  makeItem({
    id: 'inv-13', name: 'شمع تلميع', category: 'polishing', unit: 'bottle',
    currentQuantity: 8, minimumQuantity: 10, averageCost: 48,
    supplierId: 'sup-3', supplierName: 'متجر السيارات المتحدة', status: 'active',
    createdAt: d(35), updatedAt: d(6),
  }),
  makeItem({
    id: 'inv-14', name: 'ماء مقطر', category: 'washing', unit: 'gallon',
    currentQuantity: 22, minimumQuantity: 10, averageCost: 8,
    supplierId: 'sup-4', supplierName: 'موردي الخليج', status: 'active',
    createdAt: d(30), updatedAt: d(22),
  }),
  makeItem({
    id: 'inv-15', name: 'زجاجات رذاذ فارغة', category: 'tools_consumables', unit: 'piece',
    currentQuantity: 50, minimumQuantity: 20, averageCost: 3.5,
    supplierId: 'sup-4', supplierName: 'موردي الخليج', status: 'active',
    createdAt: d(25), updatedAt: d(35),
  }),
];

function makeMovement(overrides: Partial<StockMovement> = {}): StockMovement {
  return {
    id: '',
    itemId: '',
    itemName: '',
    type: 'consumption',
    quantity: 0,
    unit: 'liter',
    reason: '',
    referenceType: 'manual',
    referenceId: '',
    createdBy: 'مالك النظام',
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

export const mockStockMovements: StockMovement[] = [
  makeMovement({ id: 'mov-1', itemId: 'inv-1', itemName: 'صابون سائل للغسيل', type: 'purchase', quantity: 50, unit: 'liter', reason: 'شراء من المورد', referenceType: 'purchase', referenceId: 'pur-1', createdBy: 'مالك النظام', createdAt: d(30) }),
  makeMovement({ id: 'mov-2', itemId: 'inv-1', itemName: 'صابون سائل للغسيل', type: 'consumption', quantity: 8, unit: 'liter', reason: 'استهلاك يومي', referenceType: 'manual', referenceId: 'mov-2', createdBy: 'موظف 1', createdAt: d(28) }),
  makeMovement({ id: 'mov-3', itemId: 'inv-2', itemName: 'شامبو سيارات فاخر', type: 'purchase', quantity: 30, unit: 'liter', reason: 'شراء من المورد', referenceType: 'purchase', referenceId: 'pur-2', createdBy: 'مالك النظام', createdAt: d(25) }),
  makeMovement({ id: 'mov-4', itemId: 'inv-2', itemName: 'شامبو سيارات فاخر', type: 'consumption', quantity: 5, unit: 'liter', reason: 'استهلاك يومي', referenceType: 'manual', createdBy: 'موظف 2', createdAt: d(23) }),
  makeMovement({ id: 'mov-5', itemId: 'inv-3', itemName: 'ملمع إطارات', type: 'purchase', quantity: 15, unit: 'liter', reason: 'شراء من المورد', referenceType: 'purchase', referenceId: 'pur-3', createdBy: 'مالك النظام', createdAt: d(20) }),
  makeMovement({ id: 'mov-6', itemId: 'inv-6', itemName: 'فوط مايكروفايبر', type: 'purchase', quantity: 40, unit: 'piece', reason: 'شراء من المورد', referenceType: 'purchase', referenceId: 'pur-4', createdBy: 'مالك النظام', createdAt: d(18) }),
  makeMovement({ id: 'mov-7', itemId: 'inv-6', itemName: 'فوط مايكروفايبر', type: 'waste', quantity: 3, unit: 'piece', reason: 'فوط تالفة', referenceType: 'waste', createdBy: 'موظف 1', createdAt: d(15) }),
  makeMovement({ id: 'mov-8', itemId: 'inv-5', itemName: 'معطر جوeus', type: 'consumption', quantity: 4, unit: 'bottle', reason: 'استهلاك أسبوعي', referenceType: 'manual', createdBy: 'موظف 2', createdAt: d(10) }),
  makeMovement({ id: 'mov-9', itemId: 'inv-7', itemName: 'مناديل تنظيف احترافية', type: 'consumption', quantity: 2, unit: 'carton', reason: 'استهلاك يومي', referenceType: 'manual', createdBy: 'موظف 1', createdAt: d(8) }),
  makeMovement({ id: 'mov-10', itemId: 'inv-1', itemName: 'صابون سائل للغسيل', type: 'waste', quantity: 2, unit: 'liter', reason: 'انسياب بسبب تلف عبوة', referenceType: 'waste', createdBy: 'موظف 1', createdAt: d(5) }),
  makeMovement({ id: 'mov-11', itemId: 'inv-13', itemName: 'شمع تلميع', type: 'purchase', quantity: 10, unit: 'bottle', reason: 'شراء من المورد', referenceType: 'purchase', referenceId: 'pur-5', createdBy: 'مالك النظام', createdAt: d(3) }),
  makeMovement({ id: 'mov-12', itemId: 'inv-13', itemName: 'شمع تلميع', type: 'consumption', quantity: 2, unit: 'bottle', reason: 'استهلاك يومي', referenceType: 'manual', createdBy: 'موظف 2', createdAt: d(1) }),
];

function makeWaste(overrides: Partial<WasteEntry> = {}): WasteEntry {
  return {
    id: '',
    itemId: '',
    itemName: '',
    quantity: 0,
    unit: 'liter',
    reason: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    createdBy: 'مالك النظام',
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

export const mockWasteEntries: WasteEntry[] = [
  makeWaste({ id: 'waste-1', itemId: 'inv-6', itemName: 'فوط مايكروفايبر', quantity: 2, unit: 'piece', reason: 'تالفة', date: d(15), notes: 'فوط بالية بعد فترة استخدام طويلة', createdBy: 'موظف 1', createdAt: d(15) }),
  makeWaste({ id: 'waste-2', itemId: 'inv-1', itemName: 'صابون سائل للغسيل', quantity: 2, unit: 'liter', reason: 'انسياب', date: d(5), notes: 'تلف عبوة أثناء النقل', createdBy: 'موظف 1', createdAt: d(5) }),
  makeWaste({ id: 'waste-3', itemId: 'inv-5', itemName: 'معطر جوeus', quantity: 1, unit: 'bottle', reason: 'منتهي الصلاحية', date: d(2), notes: 'انتهاء الصلاحية', createdBy: 'موظف 2', createdAt: d(2) }),
];

function makeAdjustment(overrides: Partial<StockAdjustment> = {}): StockAdjustment {
  return {
    id: '',
    itemId: '',
    itemName: '',
    systemQuantity: 0,
    actualQuantity: 0,
    difference: 0,
    reason: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    createdBy: 'مالك النظام',
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

export const mockStockAdjustments: StockAdjustment[] = [
  makeAdjustment({ id: 'adj-1', itemId: 'inv-6', itemName: 'فوط مايكروفايبر', systemQuantity: 90, actualQuantity: 85, difference: -5, reason: 'فقدان', date: d(20), notes: 'فقدان أثناء الجرد', createdBy: 'مالك النظام', createdAt: d(20) }),
  makeAdjustment({ id: 'adj-2', itemId: 'inv-10', itemName: 'فرش تنظيف متعددة', systemQuantity: 45, actualQuantity: 40, difference: -5, reason: 'تلف غير مسجل', date: d(10), notes: 'كسر أثناء الاستخدام', createdBy: 'المدير', createdAt: d(10) }),
];

const inventoryItems: InventoryItem[] = [...mockInventoryItems];
const stockMovements: StockMovement[] = [...mockStockMovements];
const wasteEntries: WasteEntry[] = [...mockWasteEntries];
const stockAdjustments: StockAdjustment[] = [...mockStockAdjustments];

export function getInventoryItems(): InventoryItem[] {
  return inventoryItems;
}

export function getInventoryItemById(id: string): InventoryItem | undefined {
  return inventoryItems.find(i => i.id === id);
}

export function getStockMovements(): StockMovement[] {
  return stockMovements;
}

export function getStockMovementsByItemId(itemId: string): StockMovement[] {
  return stockMovements.filter(m => m.itemId === itemId);
}

export function getWasteEntries(): WasteEntry[] {
  return wasteEntries;
}

export function getStockAdjustments(): StockAdjustment[] {
  return stockAdjustments;
}

export function addInventoryItem(item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>): InventoryItem {
  const newItem: InventoryItem = {
    ...item,
    id: `inv-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  inventoryItems.push(newItem);
  return newItem;
}

export function updateInventoryItem(id: string, updates: Partial<InventoryItem>): InventoryItem | undefined {
  const index = inventoryItems.findIndex(i => i.id === id);
  if (index === -1) return undefined;
  inventoryItems[index] = { ...inventoryItems[index], ...updates, updatedAt: new Date().toISOString() };
  return inventoryItems[index];
}

export function addStockMovement(movement: Omit<StockMovement, 'id' | 'createdAt'>): StockMovement {
  const newMovement: StockMovement = {
    ...movement,
    id: `mov-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  stockMovements.unshift(newMovement);

  const item = inventoryItems.find(i => i.id === movement.itemId);
  if (item) {
    if (movement.type === 'purchase') {
      item.currentQuantity += movement.quantity;
    } else if (movement.type === 'consumption' || movement.type === 'waste') {
      item.currentQuantity = Math.max(0, item.currentQuantity - movement.quantity);
    } else if (movement.type === 'adjustment') {
      item.currentQuantity = movement.quantity;
    }
    item.updatedAt = new Date().toISOString();
  }

  return newMovement;
}

export function addWasteEntry(entry: Omit<WasteEntry, 'id' | 'createdAt'>): WasteEntry {
  const newEntry: WasteEntry = {
    ...entry,
    id: `waste-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  wasteEntries.unshift(newEntry);

  const item = inventoryItems.find(i => i.id === entry.itemId);
  if (item) {
    item.currentQuantity = Math.max(0, item.currentQuantity - entry.quantity);
    item.updatedAt = new Date().toISOString();
  }

  return newEntry;
}

export function addStockAdjustment(adjustment: Omit<StockAdjustment, 'id' | 'createdAt'>): StockAdjustment {
  const newAdjustment: StockAdjustment = {
    ...adjustment,
    id: `adj-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  stockAdjustments.unshift(newAdjustment);

  const item = inventoryItems.find(i => i.id === adjustment.itemId);
  if (item) {
    item.currentQuantity = adjustment.actualQuantity;
    item.updatedAt = new Date().toISOString();
  }

  return newAdjustment;
}

export function getInventorySummary() {
  const total = inventoryItems.length;
  const lowStock = inventoryItems.filter(i => i.currentQuantity > 0 && i.currentQuantity <= i.minimumQuantity).length;
  const outOfStock = inventoryItems.filter(i => i.currentQuantity === 0).length;
  const totalValue = inventoryItems.reduce((sum, i) => sum + i.currentQuantity * i.averageCost, 0);
  const lastMovement = stockMovements[0]?.createdAt || null;

  return { total, lowStock, outOfStock, totalValue, lastMovement };
}

export function filterInventoryItems(
  items: InventoryItem[],
  filters: { search: string; category: string; status: string; stockStatus: string; supplierId: string }
): InventoryItem[] {
  return items.filter(item => {
    if (filters.search && !item.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.category !== 'all' && item.category !== filters.category) return false;
    if (filters.status !== 'all' && item.status !== filters.status) return false;
    if (filters.supplierId && item.supplierId !== filters.supplierId) return false;
    if (filters.stockStatus === 'low' && !(item.currentQuantity > 0 && item.currentQuantity <= item.minimumQuantity)) return false;
    if (filters.stockStatus === 'out' && item.currentQuantity !== 0) return false;
    return true;
  });
}
