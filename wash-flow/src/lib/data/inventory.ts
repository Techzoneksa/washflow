import { getSupabase } from '@/lib/supabase/client';
import type { InventoryItem, StockMovement, WasteEntry, StockAdjustment, InventoryCategory, InventoryUnit, StockMovementReference } from '@/types/inventory';
import { INVENTORY_CATEGORY_LABELS, INVENTORY_UNIT_LABELS } from '@/types/inventory';

export const INVENTORY_CATEGORY_OPTIONS = Object.entries(INVENTORY_CATEGORY_LABELS).map(([value, label]) => ({ value, label }));
export const INVENTORY_UNIT_OPTIONS = Object.entries(INVENTORY_UNIT_LABELS).map(([value, label]) => ({ value, label }));

function mapInventoryItem(row: Record<string, unknown>): InventoryItem {
  return {
    id: row.id as string,
    name: row.name as string,
    category: row.category as InventoryCategory,
    unit: row.unit as InventoryUnit,
    baseUnit: row.unit as InventoryUnit,
    purchaseUnit: undefined,
    conversionFactor: 1,
    currentQuantity: Number(row.current_quantity) || 0,
    minimumQuantity: Number(row.minimum_quantity) || 0,
    averageCost: Number(row.average_cost) || 0,
    supplierId: (row.supplier_id as string) || '',
    supplierName: '',
    status: row.status as InventoryItem['status'],
    notes: (row.notes as string) || '',
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function mapStockMovement(row: Record<string, unknown>): StockMovement {
  return {
    id: row.id as string,
    itemId: row.item_id as string,
    itemName: '',
    type: row.type as StockMovement['type'],
    quantity: Number(row.quantity) || 0,
    unit: (row.unit as string) || '',
    reason: (row.reason as string) || '',
    referenceType: (row.reference_type as StockMovementReference) || 'manual',
    referenceId: (row.reference_id as string) || '',
    createdBy: (row.created_by as string) || '',
    createdAt: row.created_at as string,
  };
}

// ─── Inventory Items ─────────────────────────────────────────

export async function getInventoryItems(): Promise<InventoryItem[]> {
  const client = getSupabase();
  if (!client) return [];
  const { data, error } = await client
    .from('inventory_items')
    .select('*')
    .order('name', { ascending: true });
  if (error) {
    console.error('[Inventory] Fetch error:', error.message);
    throw new Error(error.message);
  }
  return (data || []).map(mapInventoryItem);
}

export async function getInventoryItemById(id: string): Promise<InventoryItem | null> {
  const client = getSupabase();
  if (!client) return null;
  const { data, error } = await client
    .from('inventory_items')
    .select('*')
    .eq('id', id)
    .single();
  if (error) {
    console.error('[Inventory] Fetch by ID error:', error.message);
    return null;
  }
  return data ? mapInventoryItem(data) : null;
}

export async function addInventoryItem(data: {
  name: string;
  category: InventoryCategory;
  unit: InventoryUnit;
  currentQuantity: number;
  minimumQuantity: number;
  averageCost: number;
  supplierId: string;
  status: InventoryItem['status'];
  notes: string;
}): Promise<InventoryItem | null> {
  const client = getSupabase();
  if (!client) return null;
  const { data: row, error } = await client
    .from('inventory_items')
    .insert({
      name: data.name,
      category: data.category,
      unit: data.unit,
      current_quantity: data.currentQuantity,
      minimum_quantity: data.minimumQuantity,
      average_cost: data.averageCost,
      supplier_id: data.supplierId || null,
      status: data.status,
      notes: data.notes || null,
    })
    .select()
    .single();
  if (error) {
    console.error('[Inventory] Insert error:', error.message);
    return null;
  }
  return row ? mapInventoryItem(row) : null;
}

export async function updateInventoryItem(
  id: string,
  updates: Partial<{
    name: string;
    category: InventoryCategory;
    unit: InventoryUnit;
    currentQuantity: number;
    minimumQuantity: number;
    averageCost: number;
    supplierId: string;
    status: InventoryItem['status'];
    notes: string;
  }>
): Promise<InventoryItem | null> {
  const client = getSupabase();
  if (!client) return null;
  const dbData: Record<string, unknown> = {};
  if (updates.name !== undefined) dbData.name = updates.name;
  if (updates.category !== undefined) dbData.category = updates.category;
  if (updates.unit !== undefined) dbData.unit = updates.unit;
  if (updates.currentQuantity !== undefined) dbData.current_quantity = updates.currentQuantity;
  if (updates.minimumQuantity !== undefined) dbData.minimum_quantity = updates.minimumQuantity;
  if (updates.averageCost !== undefined) dbData.average_cost = updates.averageCost;
  if (updates.supplierId !== undefined) dbData.supplier_id = updates.supplierId || null;
  if (updates.status !== undefined) dbData.status = updates.status;
  if (updates.notes !== undefined) dbData.notes = updates.notes || null;
  const { data: row, error } = await client
    .from('inventory_items')
    .update(dbData)
    .eq('id', id)
    .select()
    .single();
  if (error) {
    console.error('[Inventory] Update error:', error.message);
    return null;
  }
  return row ? mapInventoryItem(row) : null;
}

export async function searchInventoryItems(query: string): Promise<InventoryItem[]> {
  const client = getSupabase();
  if (!client) return [];
  const { data, error } = await client
    .from('inventory_items')
    .select('*')
    .or(`name.ilike.%${query}%,notes.ilike.%${query}%`)
    .order('name', { ascending: true });
  if (error) {
    console.error('[Inventory] Search error:', error.message);
    throw new Error(error.message);
  }
  return (data || []).map(mapInventoryItem);
}

// ─── Stock Movements ─────────────────────────────────────────

export async function getStockMovements(): Promise<StockMovement[]> {
  const client = getSupabase();
  if (!client) return [];
  const { data, error } = await client
    .from('stock_movements')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('[StockMovements] Fetch error:', error.message);
    throw new Error(error.message);
  }
  return (data || []).map(mapStockMovement);
}

export async function getStockMovementsByItemId(itemId: string): Promise<StockMovement[]> {
  const client = getSupabase();
  if (!client) return [];
  const { data, error } = await client
    .from('stock_movements')
    .select('*')
    .eq('item_id', itemId)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('[StockMovements] Fetch by item error:', error.message);
    throw new Error(error.message);
  }
  return (data || []).map(mapStockMovement);
}

export async function addStockMovement(data: {
  itemId: string;
  itemName: string;
  type: StockMovement['type'];
  quantity: number;
  unit: string;
  reason: string;
  referenceType: string;
  referenceId: string;
  createdBy: string;
}): Promise<StockMovement | null> {
  const client = getSupabase();
  if (!client) return null;
  const { data: row, error } = await client
    .from('stock_movements')
    .insert({
      item_id: data.itemId,
      type: data.type,
      quantity: data.quantity,
      unit: data.unit,
      reason: data.reason,
      reference_type: data.referenceType,
      reference_id: data.referenceId || null,
      created_by: data.createdBy,
    })
    .select()
    .single();
  if (error) {
    console.error('[StockMovements] Insert error:', error.message);
    return null;
  }
  return row ? mapStockMovement(row) : null;
}

// ─── Waste Entries ───────────────────────────────────────────

function mapWasteEntry(row: Record<string, unknown>): WasteEntry {
  return {
    id: row.id as string,
    itemId: row.item_id as string,
    itemName: '',
    quantity: Number(row.quantity) || 0,
    unit: (row.unit as string) || '',
    reason: (row.reason as string) || '',
    date: (row.date as string) || '',
    notes: (row.notes as string) || '',
    createdBy: (row.created_by as string) || '',
    createdAt: row.created_at as string,
  };
}

export async function getWasteEntries(): Promise<WasteEntry[]> {
  const client = getSupabase();
  if (!client) return [];
  const { data, error } = await client
    .from('waste_entries')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('[Waste] Fetch error:', error.message);
    throw new Error(error.message);
  }
  return (data || []).map(mapWasteEntry);
}

export async function addWasteEntry(data: {
  itemId: string;
  itemName: string;
  quantity: number;
  unit: string;
  reason: string;
  date: string;
  notes: string;
  createdBy: string;
}): Promise<WasteEntry | null> {
  const client = getSupabase();
  if (!client) return null;
  const { data: row, error } = await client
    .from('waste_entries')
    .insert({
      item_id: data.itemId,
      quantity: data.quantity,
      unit: data.unit,
      reason: data.reason,
      date: data.date,
      notes: data.notes || null,
      created_by: data.createdBy,
    })
    .select()
    .single();
  if (error) {
    console.error('[Waste] Insert error:', error.message);
    return null;
  }
  return row ? mapWasteEntry(row) : null;
}

// ─── Stock Adjustments ───────────────────────────────────────

function mapStockAdjustment(row: Record<string, unknown>): StockAdjustment {
  return {
    id: row.id as string,
    itemId: row.item_id as string,
    itemName: '',
    systemQuantity: Number(row.system_quantity) || 0,
    actualQuantity: Number(row.actual_quantity) || 0,
    difference: Number(row.difference) || 0,
    reason: (row.reason as string) || '',
    date: (row.date as string) || '',
    notes: (row.notes as string) || '',
    createdBy: (row.created_by as string) || '',
    createdAt: row.created_at as string,
  };
}

export async function getStockAdjustments(): Promise<StockAdjustment[]> {
  const client = getSupabase();
  if (!client) return [];
  const { data, error } = await client
    .from('stock_adjustments')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('[StockAdjustments] Fetch error:', error.message);
    throw new Error(error.message);
  }
  return (data || []).map(mapStockAdjustment);
}

export async function addStockAdjustment(data: {
  itemId: string;
  itemName: string;
  systemQuantity: number;
  actualQuantity: number;
  difference: number;
  reason: string;
  date: string;
  notes: string;
  createdBy: string;
}): Promise<StockAdjustment | null> {
  const client = getSupabase();
  if (!client) return null;
  const { data: row, error } = await client
    .from('stock_adjustments')
    .insert({
      item_id: data.itemId,
      system_quantity: data.systemQuantity,
      actual_quantity: data.actualQuantity,
      difference: data.difference,
      reason: data.reason,
      date: data.date,
      notes: data.notes || null,
      created_by: data.createdBy,
    })
    .select()
    .single();
  if (error) {
    console.error('[StockAdjustments] Insert error:', error.message);
    return null;
  }
  return row ? mapStockAdjustment(row) : null;
}
