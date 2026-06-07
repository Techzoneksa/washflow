import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client';
import type { CashierAccount } from '@/types/pos-devices';

function mapRowToAccount(row: Record<string, unknown>): CashierAccount {
  return {
    id: row.id as string,
    posDeviceId: row.pos_device_id as string,
    employeeId: row.employee_id as string | undefined,
    username: row.username as string,
    fullName: row.full_name as string,
    status: row.status as 'active' | 'inactive',
    failedAttempts: Number(row.failed_attempts),
    lockedUntil: row.locked_until as string | undefined,
    lastLoginAt: row.last_login_at as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function getCashierAccounts(): Promise<CashierAccount[]> {
  if (!isSupabaseConfigured()) return [];
  const client = getSupabase();
  if (!client) return [];

  const { data, error } = await client
    .from('cashier_accounts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[CashierAccounts] Fetch error:', error.message);
    return [];
  }

  return (data || []).map(mapRowToAccount);
}

export async function getCashierAccountsByDevice(deviceId: string): Promise<CashierAccount[]> {
  if (!isSupabaseConfigured()) return [];
  const client = getSupabase();
  if (!client) return [];

  const { data, error } = await client
    .from('cashier_accounts')
    .select('*')
    .eq('pos_device_id', deviceId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[CashierAccounts] Fetch by device error:', error.message);
    return [];
  }

  return (data || []).map(mapRowToAccount);
}

export async function createCashierAccount(
  posDeviceId: string,
  username: string,
  fullName: string,
  pin: string,
  employeeId?: string
): Promise<{ success: boolean; accountId?: string; error?: string }> {
  if (!isSupabaseConfigured()) return { success: false, error: 'Supabase not configured' };
  const client = getSupabase();
  if (!client) return { success: false, error: 'No client' };

  const { data, error } = await client.rpc('create_cashier_account', {
    p_pos_device_id: posDeviceId,
    p_username: username,
    p_full_name: fullName,
    p_pin: pin,
    p_employee_id: employeeId || null,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, accountId: (data as Record<string, unknown>).account_id as string };
}

export async function updateCashierAccount(
  accountId: string,
  posDeviceId: string,
  username: string,
  fullName: string,
  status: string,
  employeeId?: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { success: false, error: 'Supabase not configured' };
  const client = getSupabase();
  if (!client) return { success: false, error: 'No client' };

  const { error } = await client.rpc('update_cashier_account', {
    p_account_id: accountId,
    p_pos_device_id: posDeviceId,
    p_username: username,
    p_full_name: fullName,
    p_status: status,
    p_employee_id: employeeId || null,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function changeCashierPin(
  accountId: string,
  newPin: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { success: false, error: 'Supabase not configured' };
  const client = getSupabase();
  if (!client) return { success: false, error: 'No client' };

  const { error } = await client.rpc('change_cashier_pin', {
    p_account_id: accountId,
    p_new_pin: newPin,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function unlockCashierAccount(
  accountId: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { success: false, error: 'Supabase not configured' };
  const client = getSupabase();
  if (!client) return { success: false, error: 'No client' };

  const { error } = await client.rpc('unlock_cashier_account', {
    p_account_id: accountId,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
