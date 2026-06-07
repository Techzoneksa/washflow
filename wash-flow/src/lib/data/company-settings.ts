import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client';

export interface CompanySettingsData {
  id?: string;
  companyNameAr: string;
  companyNameEn?: string;
  logoUrl?: string;
  phone: string;
  email?: string;
  address: string;
  crNumber?: string;
  invoicePrefix?: string;
}

export const FALLBACK_COMPANY_NAME = 'فال المستقبل';

function mapRowToSettings(row: Record<string, unknown>): CompanySettingsData {
  return {
    id: row.id as string,
    companyNameAr: (row.company_name_ar as string) || FALLBACK_COMPANY_NAME,
    companyNameEn: row.company_name_en as string | undefined,
    logoUrl: row.logo_url as string | undefined,
    phone: (row.phone as string) || '',
    email: row.email as string | undefined,
    address: (row.address as string) || '',
    crNumber: row.cr_number as string | undefined,
    invoicePrefix: row.invoice_prefix as string | undefined,
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

export async function getCompanySettings(): Promise<CompanySettingsData | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }
  const client = getSupabase();
  if (!client) return null;

  const { data, error } = await client
    .from('company_settings')
    .select('*')
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('[CompanySettings] Fetch error:', error.message);
    return null;
  }

  if (!data) return null;

  return mapRowToSettings(data);
}

export async function upsertCompanySettings(settings: CompanySettingsData): Promise<CompanySettingsData | null> {
  if (!isSupabaseConfigured()) return null;
  const client = getSupabase();
  if (!client) return null;

  const dbData = toSnakeCase(settings as unknown as Record<string, unknown>);
  delete dbData.id;

  const { data, error } = await client
    .from('company_settings')
    .upsert(dbData, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    console.error('[CompanySettings] Upsert error:', error.message);
    return null;
  }

  return data ? mapRowToSettings(data) : null;
}
