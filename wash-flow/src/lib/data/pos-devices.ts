import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client';
import type { PosDevice } from '@/types/pos-devices';

function mapRowToDevice(row: Record<string, unknown>): PosDevice {
  return {
    id: row.id as string,
    posCode: row.pos_code as string,
    deviceName: row.device_name as string,
    status: row.status as 'active' | 'inactive',
    notes: row.notes as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function getPosDevices(): Promise<PosDevice[]> {
  if (!isSupabaseConfigured()) return [];
  const client = getSupabase();
  if (!client) return [];

  const { data, error } = await client
    .from('pos_devices')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[PosDevices] Fetch error:', error.message);
    return [];
  }

  return (data || []).map(mapRowToDevice);
}

export async function getPosDeviceById(id: string): Promise<PosDevice | null> {
  if (!isSupabaseConfigured()) return null;
  const client = getSupabase();
  if (!client) return null;

  const { data, error } = await client
    .from('pos_devices')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('[PosDevices] Fetch by ID error:', error.message);
    return null;
  }

  return data ? mapRowToDevice(data) : null;
}

export async function createPosDevice(
  posCode: string,
  deviceName: string,
  notes?: string
): Promise<{ success: boolean; deviceId?: string; error?: string }> {
  if (!isSupabaseConfigured()) return { success: false, error: 'Supabase not configured' };
  const client = getSupabase();
  if (!client) return { success: false, error: 'No client' };

  const { data, error } = await client.rpc('create_pos_device', {
    p_pos_code: posCode,
    p_device_name: deviceName,
    p_notes: notes || null,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, deviceId: (data as Record<string, unknown>).device_id as string };
}

export async function updatePosDevice(
  deviceId: string,
  posCode: string,
  deviceName: string,
  status: string,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { success: false, error: 'Supabase not configured' };
  const client = getSupabase();
  if (!client) return { success: false, error: 'No client' };

  const { error } = await client.rpc('update_pos_device', {
    p_device_id: deviceId,
    p_pos_code: posCode,
    p_device_name: deviceName,
    p_status: status,
    p_notes: notes || null,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
