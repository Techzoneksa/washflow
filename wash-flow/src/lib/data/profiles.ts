import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client';
import type { UserRole } from '@/types';

export interface ProfileData {
  id: string;
  fullName: string;
  role: UserRole;
  status: 'active' | 'inactive';
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

function mapRowToProfile(row: Record<string, unknown>): ProfileData {
  return {
    id: row.id as string,
    fullName: row.full_name as string,
    role: row.role as UserRole,
    status: row.status as 'active' | 'inactive',
    avatarUrl: row.avatar_url as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function getProfiles(): Promise<ProfileData[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }
  const client = getSupabase();
  if (!client) return [];

  const { data, error } = await client
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Profiles] Fetch error:', error.message);
    return [];
  }

  return (data || []).map(mapRowToProfile);
}

export async function updateProfileRole(id: string, role: UserRole): Promise<ProfileData | null> {
  if (!isSupabaseConfigured()) return null;
  const client = getSupabase();
  if (!client) return null;

  const { data, error } = await client
    .from('profiles')
    .update({ role })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[Profiles] Update role error:', error.message);
    return null;
  }

  return data ? mapRowToProfile(data) : null;
}

export async function updateProfileStatus(id: string, status: 'active' | 'inactive'): Promise<ProfileData | null> {
  if (!isSupabaseConfigured()) return null;
  const client = getSupabase();
  if (!client) return null;

  const { data, error } = await client
    .from('profiles')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[Profiles] Update status error:', error.message);
    return null;
  }

  return data ? mapRowToProfile(data) : null;
}
