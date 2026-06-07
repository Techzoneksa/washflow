import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client';

export interface ConsumptionDashboardData {
  todayConsumptionQty: number;
  topConsumedMaterial: { name: string; quantity: number; unit: string } | null;
  todayConsumptionCost: number;
  servicesWithoutRecipe: number;
  lowStockMaterials: number;
  todayRevenue: number;
  todayOrders: number;
  todayExpenses: number;
}

const empty: ConsumptionDashboardData = {
  todayConsumptionQty: 0,
  topConsumedMaterial: null,
  todayConsumptionCost: 0,
  servicesWithoutRecipe: 0,
  lowStockMaterials: 0,
  todayRevenue: 0,
  todayOrders: 0,
  todayExpenses: 0,
};

export async function getDashboardData(): Promise<ConsumptionDashboardData> {
  if (!isSupabaseConfigured()) return empty;
  const client = getSupabase();
  if (!client) return empty;

  try {
    const { data, error } = await client.rpc('get_dashboard_consumption_stats');
    if (error || !data) {
      console.error('[Dashboard] RPC error:', error);
      return empty;
    }

    return {
      todayConsumptionQty: Number(data.today_consumption_qty || 0),
      topConsumedMaterial: data.top_consumed_material?.name
        ? {
            name: data.top_consumed_material.name,
            quantity: Number(data.top_consumed_material.quantity),
            unit: data.top_consumed_material.unit || '',
          }
        : null,
      todayConsumptionCost: Number(data.today_consumption_cost || 0),
      servicesWithoutRecipe: Number(data.services_without_recipe || 0),
      lowStockMaterials: Number(data.low_stock_materials || 0),
      todayRevenue: Number(data.today_revenue || 0),
      todayOrders: Number(data.today_orders || 0),
      todayExpenses: Number(data.today_expenses || 0),
    };
  } catch (err) {
    console.error('[Dashboard] Error:', err);
    return empty;
  }
}
