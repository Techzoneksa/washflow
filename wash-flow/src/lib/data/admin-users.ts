import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { resetPasswordForEmail } from '@/lib/supabase/auth';

export interface AdminUserData {
  id: string;
  email: string;
  fullName: string;
  role: string;
  status: string;
  createdAt: string;
  lastSignInAt: string | null;
}

function mapAdminUser(raw: Record<string, unknown>): AdminUserData {
  return {
    id: raw.id as string,
    email: raw.email as string,
    fullName: raw.full_name as string,
    role: raw.role as string,
    status: raw.status as string,
    createdAt: raw.created_at as string,
    lastSignInAt: raw.last_sign_in_at as string | null,
  };
}

export async function createAdminUser(data: {
  fullName: string;
  email: string;
  role: 'owner' | 'manager' | 'accountant';
  status: 'active' | 'inactive';
}): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { success: false, error: 'Supabase not configured' };
  const client = getSupabase();
  if (!client) return { success: false, error: 'No client' };

  try {
    const { data: result, error } = await client.functions.invoke('create-admin-user', {
      body: {
        full_name: data.fullName,
        email: data.email,
        role: data.role,
        status: data.status,
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    const parsed = result as Record<string, unknown>;
    if (!parsed.success) {
      return { success: false, error: (parsed.error as string) || 'Failed to create user' };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Network error' };
  }
}

export async function getAdminUsers(): Promise<AdminUserData[]> {
  if (!isSupabaseConfigured()) return [];
  const client = getSupabase();
  if (!client) return [];

  try {
    const { data: result, error } = await client.functions.invoke('list-admin-users', {
      method: 'GET',
    });

    if (error) {
      console.error('[AdminUsers] Fetch error:', error.message);
      return [];
    }

    const rows = result as Record<string, unknown>[];
    return (rows || []).map(mapAdminUser);
  } catch (err) {
    console.error('[AdminUsers] Fetch error:', err);
    return [];
  }
}

export async function sendPasswordReset(email: string): Promise<{ success: boolean; error?: string }> {
  const { error } = await resetPasswordForEmail(email);
  if (error) return { success: false, error: error.message };
  return { success: true };
}
