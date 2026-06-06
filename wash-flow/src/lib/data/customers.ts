/**
 * Customer Data Access Layer
 * Real backend using Supabase (Phase 1)
 * Falls back to mock data if Supabase not configured
 */

import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client';
import type { Customer } from '@/types/customers';
import type { CustomerFormData } from '@/types/customers';

// Re-export types for convenience
export type { Customer, CustomerFormData };

// ============================================================
// REAL SUPABASE FUNCTIONS
// ============================================================

export async function getCustomers(): Promise<Customer[]> {
  if (!isSupabaseConfigured()) {
    console.warn('[Customers] Supabase not configured, returning empty array');
    return [];
  }

  const client = getSupabase();
  if (!client) return [];

  const { data, error } = await client
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Customers] Fetch error:', error);
    return [];
  }

  return (data || []) as Customer[];
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }
  const client = getSupabase();
  if (!client) return null;

  const { data, error } = await client
    .from('customers')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('[Customers] Fetch by ID error:', error);
    return null;
  }

  return data as Customer;
}

export async function getCustomerByPhone(phone: string): Promise<Customer | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }
  const client = getSupabase();
  if (!client) return null;

  const normalized = normalizePhone(phone);

  const { data, error } = await client
    .from('customers')
    .select('*')
    .like('phone', `%${normalized.slice(-9)}%`)
    .limit(1);

  if (error) {
    console.error('[Customers] Fetch by phone error:', error);
    return null;
  }

  return (data && data.length > 0) ? data[0] as Customer : null;
}

export async function createCustomer(data: CustomerFormData): Promise<Customer | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }
  const client = getSupabase();
  if (!client) return null;

  const { data: result, error } = await client
    .from('customers')
    .insert({
      name: data.name || null,
      phone: data.phone || null,
      car_plate: data.carPlate || null,
      car_type: data.carType || null,
      notes: data.notes || null,
      status: data.status || 'active',
    })
    .select()
    .single();

  if (error) {
    console.error('[Customers] Create error:', error);
    return null;
  }

  return result as Customer;
}

export async function updateCustomer(id: string, data: Partial<CustomerFormData>): Promise<Customer | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }
  const client = getSupabase();
  if (!client) return null;

  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name || null;
  if (data.phone !== undefined) updateData.phone = data.phone || null;
  if (data.carPlate !== undefined) updateData.car_plate = data.carPlate || null;
  if (data.carType !== undefined) updateData.car_type = data.carType || null;
  if (data.notes !== undefined) updateData.notes = data.notes || null;
  if (data.status !== undefined) updateData.status = data.status;

  const { data: result, error } = await client
    .from('customers')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[Customers] Update error:', error);
    return null;
  }

  return result as Customer;
}

export async function isPhoneExists(phone: string, excludeId?: string): Promise<boolean> {
  if (!isSupabaseConfigured() || !phone) {
    return false;
  }
  const client = getSupabase();
  if (!client) return false;

  normalizePhone(phone);

  let query = client
    .from('customers')
    .select('id', { count: 'exact', head: true })
    .not('phone', 'is', null);

  if (excludeId) {
    query = query.neq('id', excludeId);
  }

  const { count, error } = await query;

  if (error) {
    console.error('[Customers] Phone check error:', error);
    return false;
  }

  return (count || 0) > 0;
}

export function normalizePhone(phone: string): string {
  let p = phone.replace(/[\s\-\(\)]/g, '');
  if (p.startsWith('+966')) p = p.slice(4);
  if (p.startsWith('966')) p = p.slice(3);
  if (p.startsWith('05')) p = '5' + p.slice(2);
  if (p.startsWith('5')) p = '5' + p.slice(1);
  return p;
}

export interface CustomerSummary {
  totalCustomers: number;
  todayCustomers: number;
  activeCustomers: number;
  totalOrdersLinked: number;
  topCustomer: Customer | null;
}

export async function getCustomersSummary(): Promise<CustomerSummary> {
  if (!isSupabaseConfigured()) {
    return {
      totalCustomers: 0,
      todayCustomers: 0,
      activeCustomers: 0,
      totalOrdersLinked: 0,
      topCustomer: null,
    };
  }
  const client = getSupabase();
  if (!client) return {
    totalCustomers: 0,
    todayCustomers: 0,
    activeCustomers: 0,
    totalOrdersLinked: 0,
    topCustomer: null,
  };

  const [allResult, todayResult, activeResult] = await Promise.all([
    client.from('customers').select('*', { count: 'exact', head: true }),
    client.from('customers').select('*', { count: 'exact', head: true }).not('last_visit_at', 'is', null),
    client.from('customers').select('*', { count: 'exact', head: true }).eq('status', 'active'),
  ]);

  const totalCustomers = allResult.count || 0;
  const activeCustomers = activeResult.count || 0;

  const { data: topData } = await client
    .from('customers')
    .select('*')
    .order('total_spent', { ascending: false })
    .limit(1);

  return {
    totalCustomers,
    todayCustomers: todayResult.count || 0,
    activeCustomers,
    totalOrdersLinked: 0,
    topCustomer: topData && topData.length > 0 ? topData[0] as Customer : null,
  };
}

export interface CustomerFilter {
  search: string;
  status: 'all' | 'active' | 'inactive';
  hasOrders: 'all' | 'yes' | 'no';
}

export async function filterCustomers(filters: CustomerFilter): Promise<Customer[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }
  const client = getSupabase();
  if (!client) return [];

  let query = client.from('customers').select('*');

  if (filters.search.trim()) {
    const q = filters.search.trim();
    query = query.or(`name.ilike.%${q}%,phone.ilike.%${q}%,car_plate.ilike.%${q}%,car_type.ilike.%${q}%`);
  }

  if (filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }

  if (filters.hasOrders === 'yes') {
    query = query.gt('orders_count', 0);
  } else if (filters.hasOrders === 'no') {
    query = query.eq('orders_count', 0);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('[Customers] Filter error:', error);
    return [];
  }

  return (data || []) as Customer[];
}