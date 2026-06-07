import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client';
import type { ServiceRecipe, RecipeFormItem } from '@/types/recipes';

interface InventoryItemForRecipe {
  id: string;
  name: string;
  category: string;
  base_unit: string;
  current_quantity: number;
  average_cost: number;
  status: string;
}

export async function getServiceRecipe(serviceId: string): Promise<ServiceRecipe | null> {
  if (!isSupabaseConfigured()) return null;
  const client = getSupabase();
  if (!client) return null;

  const { data, error } = await client.rpc('get_service_recipe', {
    p_service_id: serviceId,
  });

  if (error) {
    console.error('[Recipes] getServiceRecipe error:', error);
    return null;
  }

  if (!data) return null;

  const recipe: ServiceRecipe = {
    id: data.id,
    serviceId: data.service_id,
    status: data.status,
    notes: data.notes || undefined,
    createdBy: data.created_by || undefined,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    items: (data.items || []).map((item: Record<string, unknown>) => ({
      id: item.id as string,
      recipeId: item.recipe_id as string,
      inventoryItemId: item.inventory_item_id as string,
      name: item.name as string,
      category: item.category as string,
      quantity: Number(item.quantity),
      unit: item.unit as string,
      unitCost: Number(item.unit_cost),
      lineCost: Number(item.line_cost),
      currentQuantity: Number(item.current_quantity),
      status: item.status as string,
      sortOrder: Number(item.sort_order),
    })),
  };

  return recipe;
}

export async function getInventoryItemsForRecipe(): Promise<InventoryItemForRecipe[]> {
  if (!isSupabaseConfigured()) return [];
  const client = getSupabase();
  if (!client) return [];

  const { data, error } = await client.rpc('get_inventory_items_for_recipe');

  if (error) {
    console.error('[Recipes] getInventoryItemsForRecipe error:', error);
    return [];
  }

  return data || [];
}

export async function saveServiceRecipe(
  serviceId: string,
  status: string,
  notes: string | null,
  items: RecipeFormItem[],
): Promise<{ success: boolean; recipeId?: string }> {
  if (!isSupabaseConfigured()) return { success: false };
  const client = getSupabase();
  if (!client) return { success: false };

  const pItems = items.map((item, idx) => ({
    inventory_item_id: item.inventoryItemId,
    quantity: item.quantity,
    unit: item.unit,
    sort_order: idx,
  }));

  const { data, error } = await client.rpc('save_service_recipe', {
    p_service_id: serviceId,
    p_status: status,
    p_notes: notes,
    p_items: JSON.stringify(pItems),
  });

  if (error) {
    console.error('[Recipes] saveServiceRecipe error:', error);
    return { success: false };
  }

  return { success: true, recipeId: data?.recipe_id };
}

export async function completeOrderWithConsumption(
  orderId: string,
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { success: false, error: 'Supabase not configured' };
  const client = getSupabase();
  if (!client) return { success: false, error: 'No client' };

  const { error } = await client.rpc('complete_order_with_consumption', {
    p_order_id: orderId,
  });

  if (error) {
    console.error('[Recipes] completeOrderWithConsumption error:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function revertOrderConsumption(
  orderItemId: string,
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { success: false, error: 'Supabase not configured' };
  const client = getSupabase();
  if (!client) return { success: false, error: 'No client' };

  const { error } = await client.rpc('revert_order_consumption', {
    p_order_item_id: orderItemId,
  });

  if (error) {
    console.error('[Recipes] revertOrderConsumption error:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
