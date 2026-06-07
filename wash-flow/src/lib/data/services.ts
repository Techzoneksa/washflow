import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client';
import type { ServiceItem, ServiceCategory } from '@/types/services';
import type { WashService } from '@/types/pos';

export type { ServiceItem, ServiceCategory };

export const serviceCategories: ServiceCategory[] = [
  'غسيل سيارات', 'خدمات داخلية', 'خدمات خارجية', 'باقات', 'إضافات', 'مركبات كبيرة', 'أخرى',
];

export const categoryLabels: { value: string; label: string }[] = [
  { value: 'all', label: 'الكل' },
  ...serviceCategories.map((c) => ({ value: c, label: c })),
];

function mapRowToService(row: Record<string, unknown>): ServiceItem {
  return {
    id: row.id as string,
    nameAr: row.name_ar as string,
    nameEn: row.name_en as string | undefined,
    category: row.category as ServiceCategory,
    price: Number(row.price),
    durationMinutes: row.duration_minutes ? Number(row.duration_minutes) : undefined,
    description: row.description as string | undefined,
    icon: row.icon as string | undefined,
    isActive: row.is_active as boolean,
    showInPOS: row.show_in_pos as boolean,
    isTaxable: row.is_taxable as boolean,
    sortOrder: row.sort_order as number,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function toSnakeCase(data: Record<string, unknown>): Record<string, unknown> {
  const db: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    db[snakeKey] = value;
  }
  return db;
}

export async function getServices(): Promise<ServiceItem[]> {
  if (!isSupabaseConfigured()) {
    console.warn('[Services] Supabase not configured, returning empty array');
    return [];
  }

  const client = getSupabase();
  if (!client) return [];

  const { data, error } = await client
    .from('services')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('[Services] Fetch error:', error);
    return [];
  }

  return (data || []).map(mapRowToService);
}

export async function getPOSServices(): Promise<ServiceItem[]> {
  if (!isSupabaseConfigured()) return [];
  const client = getSupabase();
  if (!client) return [];

  const { data, error } = await client
    .from('services')
    .select('*')
    .eq('is_active', true)
    .eq('show_in_pos', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('[Services] Fetch POS services error:', error);
    return [];
  }

  return (data || []).map(mapRowToService);
}

export async function getServiceById(id: string): Promise<ServiceItem | null> {
  if (!isSupabaseConfigured()) return null;
  const client = getSupabase();
  if (!client) return null;

  const { data, error } = await client
    .from('services')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('[Services] Fetch by ID error:', error);
    return null;
  }

  return data ? mapRowToService(data) : null;
}

export async function createService(data: Record<string, unknown>): Promise<ServiceItem | null> {
  if (!isSupabaseConfigured()) return null;
  const client = getSupabase();
  if (!client) return null;

  const dbData = toSnakeCase(data);

  const { data: result, error } = await client
    .from('services')
    .insert(dbData)
    .select()
    .single();

  if (error) {
    console.error('[Services] Create error:', error.message);
    return null;
  }

  return result ? mapRowToService(result) : null;
}

export async function updateService(id: string, data: Record<string, unknown>): Promise<ServiceItem | null> {
  if (!isSupabaseConfigured()) return null;
  const client = getSupabase();
  if (!client) return null;

  const dbData = toSnakeCase(data);

  const { data: result, error } = await client
    .from('services')
    .update(dbData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[Services] Update error:', error);
    return null;
  }

  return result ? mapRowToService(result) : null;
}

export async function toggleServiceActive(id: string, active: boolean): Promise<ServiceItem | null> {
  return updateService(id, { isActive: active, showInPOS: active ? true : false });
}

export async function toggleServicePOSVisibility(id: string, show: boolean): Promise<ServiceItem | null> {
  return updateService(id, { showInPOS: show });
}

export function mapServiceToPOS(service: ServiceItem): WashService {
  return {
    id: service.id,
    nameAr: service.nameAr,
    price: service.price,
    category: service.category,
    duration: service.durationMinutes ? `${service.durationMinutes} دقيقة` : 'حسب الخدمة',
    icon: service.icon || 'car',
    isActive: service.isActive,
  };
}

export async function getPOSWashServices(): Promise<WashService[]> {
  const services = await getPOSServices();
  return services.map(mapServiceToPOS);
}

export async function isDuplicateName(nameAr: string, excludeId?: string): Promise<boolean> {
  if (!isSupabaseConfigured() || !nameAr) return false;
  const client = getSupabase();
  if (!client) return false;

  let query = client
    .from('services')
    .select('id', { count: 'exact', head: true })
    .eq('name_ar', nameAr);

  if (excludeId) {
    query = query.neq('id', excludeId);
  }

  const { count, error } = await query;

  if (error) {
    console.error('[Services] Duplicate name check error:', error.message);
    return false;
  }

  return (count || 0) > 0;
}

export async function getServiceUsageCount(): Promise<number> {
  return 0;
}
