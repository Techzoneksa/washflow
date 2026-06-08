import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client';
import type { PurchaseInvoice, PurchaseItem, PaymentMethod } from '@/types/purchases';

export function mapPurchaseRow(row: Record<string, unknown>): PurchaseInvoice {
  return {
    id: row.id as string,
    purchaseNumber: row.purchase_number as string,
    supplierId: row.supplier_id as string,
    supplierName: row.supplier_name as string,
    supplierInvoiceNumber: row.supplier_invoice_number as string | undefined,
    description: row.description as string | undefined,
    date: row.date as string,
    dueDate: row.due_date as string | undefined,
    items: [],
    subtotal: Number(row.subtotal) || 0,
    discountTotal: row.discount_total !== undefined ? Number(row.discount_total) : Number(row.vat_amount) || 0,
    total: Number(row.total) || 0,
    paymentStatus: row.payment_status as PurchaseInvoice['paymentStatus'],
    paymentMethod: row.payment_method as PurchaseInvoice['paymentMethod'],
    partialPaymentMethod: row.partial_payment_method as PurchaseInvoice['partialPaymentMethod'],
    remainingDueDate: row.remaining_due_date as string | undefined,
    paidAmount: Number(row.paid_amount) || 0,
    remainingAmount: Number(row.remaining_amount) || 0,
    accountId: row.account_id as string | undefined,
    attachmentUrl: row.attachment_url as string | undefined,
    notes: row.notes as string | undefined,
    status: row.status as PurchaseInvoice['status'],
    createdBy: row.created_by as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function mapPurchaseItemRow(row: Record<string, unknown>): PurchaseItem {
  return {
    id: row.id as string,
    name: (row.inventory_item_name as string) || (row.name as string) || '',
    unit: (row.purchase_unit as string) || (row.unit as string) || '',
    purchaseId: row.purchase_id as string | undefined,
    inventoryItemId: row.inventory_item_id as string | undefined,
    inventoryItemName: row.inventory_item_name as string | undefined,
    description: row.description as string | undefined,
    purchaseUnit: row.purchase_unit as string | undefined,
    quantity: Number(row.quantity) || 0,
    conversionFactor: Number(row.conversion_factor) || 1,
    quantityInBaseUnit: Number(row.quantity_in_base_unit) || 0,
    baseUnit: row.base_unit as string | undefined,
    unitPrice: Number(row.unit_price) || 0,
    discount: Number(row.discount) || 0,
    total: Number(row.total) || 0,
  };
}

export async function getPurchaseById(id: string): Promise<PurchaseInvoice | null> {
  if (!isSupabaseConfigured()) return null;
  const client = getSupabase();
  if (!client) return null;

  const { data, error } = await client
    .from('purchases')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('[Purchases] Fetch by ID error:', error.message);
    return null;
  }

  const purchase = mapPurchaseRow(data);

  const { data: items, error: itemsError } = await client
    .from('purchase_items')
    .select('*')
    .eq('purchase_id', id)
    .order('sort_order', { ascending: true });

  if (!itemsError && items) {
    purchase.items = items.map(mapPurchaseItemRow);
  }

  return purchase;
}

export async function getSuppliers(): Promise<{ id: string; name: string; phone?: string; email?: string; address?: string; representativeName?: string; balance: number; paymentTerms?: string }[]> {
  if (!isSupabaseConfigured()) return [];
  const client = getSupabase();
  if (!client) return [];

  const { data, error } = await client
    .from('suppliers')
    .select('id, name, phone, email, address, representative_name, balance, payment_terms')
    .eq('status', 'active')
    .order('name', { ascending: true });

  if (error) {
    console.error('[Purchases] Fetch suppliers error:', error.message);
    return [];
  }

  return (data || []).map((s: Record<string, unknown>) => ({
    id: s.id as string,
    name: s.name as string,
    phone: s.phone as string | undefined,
    email: s.email as string | undefined,
    address: s.address as string | undefined,
    representativeName: s.representative_name as string | undefined,
    balance: Number(s.balance) || 0,
    paymentTerms: s.payment_terms as string | undefined,
  }));
}

export async function getSupplierById(id: string) {
  if (!isSupabaseConfigured()) return null;
  const client = getSupabase();
  if (!client) return null;

  const { data, error } = await client
    .from('suppliers')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('[Purchases] Fetch supplier error:', error.message);
    return null;
  }

  return data ? {
    id: data.id as string,
    name: data.name as string,
    phone: data.phone as string,
    representativeName: data.representative_name as string | undefined,
    email: data.email as string | undefined,
    address: data.address as string | undefined,
    balance: Number(data.balance) || 0,
    paymentTerms: data.payment_terms as string | undefined,
  } : null;
}

export async function createSupplier(data: { name: string; phone?: string; representativeName?: string; email?: string; address?: string }): Promise<{ id: string; name: string } | null> {
  if (!isSupabaseConfigured()) return null;
  const client = getSupabase();
  if (!client) return null;

  const { data: result, error } = await client
    .from('suppliers')
    .insert({
      name: data.name,
      phone: data.phone || null,
      representative_name: data.representativeName || null,
      email: data.email || null,
      address: data.address || null,
      status: 'active',
      balance: 0,
    })
    .select('id, name')
    .single();

  if (error) {
    console.error('[Purchases] Create supplier error:', error.message);
    throw new Error(error.message);
  }

  return result as { id: string; name: string };
}

export async function getInventoryItemsForPurchase(): Promise<{ id: string; name: string; purchaseUnit?: string; baseUnit: string; conversionFactor: number; currentQuantity: number; averageCost: number }[]> {
  if (!isSupabaseConfigured()) return [];
  const client = getSupabase();
  if (!client) return [];

  const { data, error } = await client
    .from('inventory_items')
    .select('id, name, purchase_unit, base_unit, conversion_factor, current_quantity, average_cost')
    .eq('status', 'active')
    .order('name', { ascending: true });

  if (error) {
    console.error('[Purchases] Fetch inventory items error:', error.message);
    return [];
  }

  return (data || []).map((item: Record<string, unknown>) => ({
    id: item.id as string,
    name: item.name as string,
    purchaseUnit: item.purchase_unit as string | undefined,
    baseUnit: item.base_unit as string,
    conversionFactor: Number(item.conversion_factor) || 1,
    currentQuantity: Number(item.current_quantity) || 0,
    averageCost: Number(item.average_cost) || 0,
  }));
}

export async function createInventoryItem(data: { name: string; purchaseUnit?: string; baseUnit: string; conversionFactor: number; supplierId?: string }): Promise<{ id: string; name: string; purchaseUnit?: string; baseUnit: string; conversionFactor: number } | null> {
  if (!isSupabaseConfigured()) return null;
  const client = getSupabase();
  if (!client) return null;

  const { data: result, error } = await client
    .from('inventory_items')
    .insert({
      name: data.name,
      purchase_unit: data.purchaseUnit || null,
      base_unit: data.baseUnit,
      conversion_factor: data.conversionFactor || 1,
      supplier_id: data.supplierId || null,
      status: 'active',
      category: 'other',
    })
    .select('id, name, purchase_unit, base_unit, conversion_factor')
    .single();

  if (error) {
    console.error('[Purchases] Create inventory item error:', error.message);
    throw new Error(error.message);
  }

  return {
    id: result.id as string,
    name: result.name as string,
    purchaseUnit: result.purchase_unit as string | undefined,
    baseUnit: result.base_unit as string,
    conversionFactor: Number(result.conversion_factor) || 1,
  };
}

export interface CreatePurchasePayload {
  supplierId: string;
  supplierName: string;
  supplierInvoiceNumber?: string;
  description?: string;
  date: string;
  dueDate?: string;
  items: PurchaseItem[];
  subtotal: number;
  discountTotal: number;
  total: number;
  paymentStatus: 'paid' | 'unpaid' | 'partial';
  paymentMethod?: PaymentMethod;
  partialPaymentMethod?: 'cash' | 'bank';
  remainingDueDate?: string;
  paidAmount: number;
  remainingAmount: number;
  accountId?: string;
  notes?: string;
  status: 'draft' | 'approved';
}

export async function createPurchase(data: CreatePurchasePayload): Promise<{ purchase: PurchaseInvoice | null; error?: string }> {
  if (!isSupabaseConfigured()) return { purchase: null, error: 'Supabase غير مهيأ' };
  const client = getSupabase();
  if (!client) return { purchase: null, error: 'Supabase غير مهيأ' };

  try {
    const { data: purchase, error: purchaseError } = await client
      .from('purchases')
      .insert({
        supplier_id: data.supplierId,
        supplier_name: data.supplierName,
        supplier_invoice_number: data.supplierInvoiceNumber || null,
        description: data.description || null,
        date: data.date,
        due_date: data.dueDate || null,
        subtotal: data.subtotal,
        discount_total: data.discountTotal,
        total: data.total,
        payment_status: data.paymentStatus,
        payment_method: data.paymentMethod || null,
        partial_payment_method: data.partialPaymentMethod || null,
        remaining_due_date: data.remainingDueDate || null,
        paid_amount: data.paidAmount,
        remaining_amount: data.remainingAmount,
        account_id: data.accountId || null,
        notes: data.notes || null,
        status: data.status,
      })
      .select()
      .single();

    if (purchaseError) return { purchase: null, error: purchaseError.message };

    const mappedPurchase = mapPurchaseRow(purchase);
    const errors: string[] = [];

    for (let i = 0; i < data.items.length; i++) {
      const item = data.items[i];
      const { data: itemResult, error: itemError } = await client
        .from('purchase_items')
        .insert({
          purchase_id: purchase.id,
          inventory_item_id: item.inventoryItemId || null,
          inventory_item_name: item.inventoryItemName || null,
          description: item.description || null,
          purchase_unit: item.purchaseUnit,
          quantity: item.quantity,
          conversion_factor: item.conversionFactor,
          quantity_in_base_unit: item.quantityInBaseUnit,
          base_unit: item.baseUnit || null,
          unit_price: item.unitPrice,
          discount: item.discount,
          total: item.total,
          sort_order: i,
        })
        .select()
        .single();

      if (itemError) {
        errors.push(itemError.message);
        continue;
      }

      mappedPurchase.items.push(mapPurchaseItemRow(itemResult));

      if (data.status === 'approved' && item.inventoryItemId) {
        const invError = await updateInventoryForPurchaseItem(client, item);
        if (invError) errors.push(invError);
      }
    }

    if (errors.length > 0) {
      return { purchase: null, error: errors.join('; ') };
    }

    return { purchase: mappedPurchase };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'خطأ غير متوقع';
    return { purchase: null, error: message };
  }
}

async function updateInventoryForPurchaseItem(
  client: NonNullable<ReturnType<typeof getSupabase>>,
  item: PurchaseItem
): Promise<string | null> {
  if (!item.inventoryItemId) return null;

  const { data: invItem, error: invError } = await client
    .from('inventory_items')
    .select('current_quantity, average_cost')
    .eq('id', item.inventoryItemId)
    .single();

  if (invError || !invItem) return `فشل تحديث المخزون للمادة ${item.inventoryItemName || item.inventoryItemId}`;

  const oldQty = Number(invItem.current_quantity) || 0;
  const oldAvgCost = Number(invItem.average_cost) || 0;
  const qtyAdded = item.quantityInBaseUnit || item.quantity || 0;
  const cf = item.conversionFactor || 1;
  const unitCostPerBaseUnit = cf > 0 ? item.unitPrice / cf : item.unitPrice;

  const newAvgCost = (oldQty * oldAvgCost + qtyAdded * unitCostPerBaseUnit) / (oldQty + qtyAdded);

  const { error: updateError } = await client
    .from('inventory_items')
    .update({
      current_quantity: oldQty + qtyAdded,
      average_cost: Math.round(newAvgCost * 100) / 100,
    })
    .eq('id', item.inventoryItemId);

  if (updateError) return `فشل تحديث كمية المخزون: ${updateError.message}`;

  const { error: movementError } = await client
    .from('stock_movements')
    .insert({
      inventory_item_id: item.inventoryItemId,
      type: 'purchase',
      quantity: qtyAdded,
      unit: item.baseUnit || item.purchaseUnit,
      reason: `فاتورة مشتريات - ${item.inventoryItemName || ''}`,
      reference_type: 'purchase',
      reference_id: item.id,
    });

  if (movementError) return `فشل تسجيل حركة المخزون: ${movementError.message}`;

  return null;
}

export async function updateSupplierBalance(supplierId: string, delta: number): Promise<string | null> {
  if (!isSupabaseConfigured()) return 'Supabase غير مهيأ';
  const client = getSupabase();
  if (!client) return 'Supabase غير مهيأ';

  const { data: supplier } = await client
    .from('suppliers')
    .select('balance')
    .eq('id', supplierId)
    .single();

  if (!supplier) return 'المورد غير موجود';

  const currentBalance = Number(supplier.balance) || 0;

  const { error } = await client
    .from('suppliers')
    .update({ balance: currentBalance + delta })
    .eq('id', supplierId);

  if (error) return `فشل تحديث رصيد المورد: ${error.message}`;

  return null;
}

export async function updatePurchase(id: string, data: Partial<CreatePurchasePayload>): Promise<{ purchase: PurchaseInvoice | null; error?: string }> {
  if (!isSupabaseConfigured()) return { purchase: null, error: 'Supabase غير مهيأ' };
  const client = getSupabase();
  if (!client) return { purchase: null, error: 'Supabase غير مهيأ' };

  const updateData: Record<string, unknown> = {};
  if (data.supplierId !== undefined) updateData.supplier_id = data.supplierId;
  if (data.supplierName !== undefined) updateData.supplier_name = data.supplierName;
  if (data.supplierInvoiceNumber !== undefined) updateData.supplier_invoice_number = data.supplierInvoiceNumber;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.date !== undefined) updateData.date = data.date;
  if (data.dueDate !== undefined) updateData.due_date = data.dueDate;
  if (data.subtotal !== undefined) updateData.subtotal = data.subtotal;
  if (data.discountTotal !== undefined) updateData.discount_total = data.discountTotal;
  if (data.total !== undefined) updateData.total = data.total;
  if (data.paymentStatus !== undefined) updateData.payment_status = data.paymentStatus;
  if (data.paymentMethod !== undefined) updateData.payment_method = data.paymentMethod;
  if (data.partialPaymentMethod !== undefined) updateData.partial_payment_method = data.partialPaymentMethod;
  if (data.remainingDueDate !== undefined) updateData.remaining_due_date = data.remainingDueDate;
  if (data.paidAmount !== undefined) updateData.paid_amount = data.paidAmount;
  if (data.remainingAmount !== undefined) updateData.remaining_amount = data.remainingAmount;
  if (data.accountId !== undefined) updateData.account_id = data.accountId;
  if (data.notes !== undefined) updateData.notes = data.notes;
  if (data.status !== undefined) updateData.status = data.status;

  const { data: result, error } = await client
    .from('purchases')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) return { purchase: null, error: error.message };

  return { purchase: mapPurchaseRow(result) };
}

export async function getPurchases(filters?: {
  supplierId?: string;
  status?: string;
  paymentStatus?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}): Promise<PurchaseInvoice[]> {
  if (!isSupabaseConfigured()) return [];
  const client = getSupabase();
  if (!client) return [];

  let queryBuilder = client
    .from('purchases')
    .select('*')
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });

  if (filters?.supplierId) {
    queryBuilder = queryBuilder.eq('supplier_id', filters.supplierId);
  }

  if (filters?.status) {
    queryBuilder = queryBuilder.eq('status', filters.status);
  }

  if (filters?.paymentStatus) {
    queryBuilder = queryBuilder.eq('payment_status', filters.paymentStatus);
  }

  if (filters?.dateFrom) {
    queryBuilder = queryBuilder.gte('date', filters.dateFrom);
  }

  if (filters?.dateTo) {
    queryBuilder = queryBuilder.lte('date', filters.dateTo);
  }

  if (filters?.limit) {
    queryBuilder = queryBuilder.limit(filters.limit);
  }

  if (filters?.offset) {
    queryBuilder = queryBuilder.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
  }

  const { data, error } = await queryBuilder;

  if (error) {
    console.error('[Purchases] Fetch list error:', error.message);
    return [];
  }

  const purchases = (data || []).map(mapPurchaseRow);
  const purchaseIds = purchases.map(p => p.id);

  if (purchaseIds.length === 0) return [];

  const { data: items, error: itemsError } = await client
    .from('purchase_items')
    .select('*')
    .in('purchase_id', purchaseIds)
    .order('sort_order', { ascending: true });

  if (!itemsError && items) {
    const grouped: Record<string, PurchaseItem[]> = {};
    for (const item of items) {
      const pi = mapPurchaseItemRow(item);
      const pid = item.purchase_id as string;
      if (!grouped[pid]) grouped[pid] = [];
      grouped[pid].push(pi);
    }
    for (const purchase of purchases) {
      purchase.items = grouped[purchase.id] || [];
    }
  }

  return purchases;
}

export async function getPurchasesBySupplier(supplierId: string): Promise<PurchaseInvoice[]> {
  return getPurchases({ supplierId });
}
