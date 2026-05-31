export type InventoryCategory =
  | 'washing'
  | 'polishing'
  | 'interior_cleaning'
  | 'disinfection'
  | 'towels_microfiber'
  | 'tools_consumables'
  | 'filters_parts'
  | 'packaging_bags'
  | 'other';

export const INVENTORY_CATEGORY_LABELS: Record<InventoryCategory, string> = {
  washing: 'مواد غسيل',
  polishing: 'مواد تلميع',
  interior_cleaning: 'مواد تنظيف داخلي',
  disinfection: 'مواد تعقيم',
  towels_microfiber: 'فوط ومناشف',
  tools_consumables: 'أدوات استهلاكية',
  filters_parts: 'قطع وفلاتر',
  packaging_bags: 'تغليف وأكياس',
  other: 'أخرى',
};

export type InventoryUnit =
  | 'liter'
  | 'gallon'
  | 'box'
  | 'carton'
  | 'piece'
  | 'bag'
  | 'roll'
  | 'bottle'
  | 'kilo'
  | 'pack';

export const INVENTORY_UNIT_LABELS: Record<InventoryUnit, string> = {
  liter: 'لتر',
  gallon: 'جالون',
  box: 'علبة',
  carton: 'كرتون',
  piece: 'حبة',
  bag: 'كيس',
  roll: 'رول',
  bottle: 'عبوة',
  kilo: 'كيلو',
  pack: 'حزمة',
};

export type StockMovementType = 'purchase' | 'consumption' | 'waste' | 'adjustment';
export type StockMovementReference = 'purchase' | 'manual' | 'waste' | 'adjustment';

export const STOCK_MOVEMENT_TYPE_LABELS: Record<StockMovementType, string> = {
  purchase: 'دخول من مشتريات',
  consumption: 'استهلاك تشغيلي',
  waste: 'هدر / تالف',
  adjustment: 'جرد / تسوية',
};

export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  unit: InventoryUnit;
  currentQuantity: number;
  minimumQuantity: number;
  averageCost: number;
  supplierId: string;
  supplierName: string;
  status: 'active' | 'inactive';
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockMovement {
  id: string;
  itemId: string;
  itemName: string;
  type: StockMovementType;
  quantity: number;
  unit: string;
  reason: string;
  referenceType: StockMovementReference;
  referenceId: string;
  createdBy: string;
  createdAt: string;
}

export interface WasteEntry {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  unit: string;
  reason: string;
  date: string;
  notes: string;
  createdBy: string;
  createdAt: string;
}

export interface StockAdjustment {
  id: string;
  itemId: string;
  itemName: string;
  systemQuantity: number;
  actualQuantity: number;
  difference: number;
  reason: string;
  date: string;
  notes: string;
  createdBy: string;
  createdAt: string;
}

export type InventoryFilter = {
  search: string;
  category: InventoryCategory | 'all';
  status: 'all' | 'active' | 'inactive';
  stockStatus: 'all' | 'low' | 'out';
  supplierId: string;
};

export type StockMovementFilter = {
  search: string;
  type: StockMovementType | 'all';
  itemId: string;
  dateFrom: string;
  dateTo: string;
};
