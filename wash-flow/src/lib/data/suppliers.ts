import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client';

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  representativeName?: string;
  email?: string;
  address?: string;
  vatNumber?: string;
  crNumber?: string;
  balance: number;
  totalPurchases: number;
  totalPaid: number;
  invoicesCount: number;
  status: 'active' | 'inactive';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

function mapSupplier(row: Record<string, unknown>): Supplier {
  return {
    id: row.id as string,
    name: row.name as string,
    phone: row.phone as string,
    representativeName: row.representative_name as string | undefined,
    email: row.email as string | undefined,
    address: row.address as string | undefined,
    vatNumber: row.vat_number as string | undefined,
    crNumber: row.cr_number as string | undefined,
    balance: Number(row.balance) || 0,
    totalPurchases: Number(row.total_purchases) || 0,
    totalPaid: Number(row.total_paid) || 0,
    invoicesCount: Number(row.invoices_count) || 0,
    status: row.status as 'active' | 'inactive',
    notes: row.notes as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function getSuppliers(): Promise<Supplier[]> {
  if (!isSupabaseConfigured()) return [];
  const client = getSupabase();
  if (!client) return [];

  const { data, error } = await client
    .from('suppliers')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('[Suppliers] Fetch error:', error.message);
    throw new Error(error.message);
  }

  return (data || []).map(mapSupplier);
}

export async function getSupplierById(id: string): Promise<Supplier | null> {
  if (!isSupabaseConfigured()) return null;
  const client = getSupabase();
  if (!client) return null;

  const { data, error } = await client
    .from('suppliers')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('[Suppliers] Fetch by ID error:', error.message);
    return null;
  }

  return data ? mapSupplier(data) : null;
}

export async function searchSuppliers(query: string): Promise<Supplier[]> {
  if (!isSupabaseConfigured()) return [];
  const client = getSupabase();
  if (!client) return [];

  const { data, error } = await client
    .from('suppliers')
    .select('*')
    .or(`name.ilike.%${query}%,phone.ilike.%${query}%,representative_name.ilike.%${query}%`)
    .order('name', { ascending: true });

  if (error) {
    console.error('[Suppliers] Search error:', error.message);
    throw new Error(error.message);
  }

  return (data || []).map(mapSupplier);
}

export async function updateSupplier(
  id: string,
  data: Partial<{
    name: string;
    phone: string;
    representativeName: string;
    email: string;
    address: string;
    status: 'active' | 'inactive';
    balance: number;
    totalPurchases: number;
    totalPaid: number;
    invoicesCount: number;
    notes: string;
  }>
): Promise<Supplier | null> {
  const client = getSupabase();
  if (!client) return null;
  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.representativeName !== undefined) updateData.representative_name = data.representativeName;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.address !== undefined) updateData.address = data.address;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.balance !== undefined) updateData.balance = data.balance;
  if (data.totalPurchases !== undefined) updateData.total_purchases = data.totalPurchases;
  if (data.totalPaid !== undefined) updateData.total_paid = data.totalPaid;
  if (data.invoicesCount !== undefined) updateData.invoices_count = data.invoicesCount;
  if (data.notes !== undefined) updateData.notes = data.notes;

  const { data: row, error } = await client
    .from('suppliers')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[Suppliers] Update error:', error.message);
    return null;
  }
  return row ? mapSupplier(row) : null;
}

export async function addSupplier(data: {
  name: string;
  phone: string;
  representativeName?: string;
  vatNumber?: string;
  crNumber?: string;
  email?: string;
  address?: string;
  status: 'active' | 'inactive';
  notes?: string;
  balance?: number;
  totalPurchases?: number;
  totalPaid?: number;
  invoicesCount?: number;
}): Promise<Supplier | null> {
  const client = getSupabase();
  if (!client) return null;
  const { data: row, error } = await client
    .from('suppliers')
    .insert({
      name: data.name,
      phone: data.phone || null,
      representative_name: data.representativeName || null,
      vat_number: data.vatNumber || null,
      cr_number: data.crNumber || null,
      email: data.email || null,
      address: data.address || null,
      status: data.status || 'active',
      notes: data.notes || null,
      balance: data.balance || 0,
      total_purchases: data.totalPurchases || 0,
      total_paid: data.totalPaid || 0,
    })
    .select()
    .single();
  if (error) {
    console.error('[Suppliers] Insert error:', error.message);
    return null;
  }
  return row ? mapSupplier(row) : null;
}

export async function isDuplicateSupplierName(name: string, excludeId?: string): Promise<boolean> {
  const client = getSupabase();
  if (!client) return false;
  let query = client.from('suppliers').select('id', { count: 'exact', head: true }).eq('name', name);
  if (excludeId) query = query.neq('id', excludeId);
  const { count, error } = await query;
  if (error) {
    console.error('[Suppliers] Duplicate check error:', error.message);
    return false;
  }
  return (count || 0) > 0;
}
