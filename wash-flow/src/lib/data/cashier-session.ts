import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client';
import type { CashierSession } from '@/types/pos-devices';

const SESSION_KEY = 'wf_cashier_session';

export async function authenticateCashier(
  posCode: string,
  username: string,
  pin: string
): Promise<{ success: boolean; session?: CashierSession; error?: string }> {
  if (!isSupabaseConfigured()) return { success: false, error: 'Supabase not configured' };
  const client = getSupabase();
  if (!client) return { success: false, error: 'No client' };

  const { data, error } = await client.rpc('authenticate_pos_cashier', {
    p_pos_code: posCode,
    p_username: username,
    p_pin: pin,
  });

  if (error || !data) {
    return { success: false, error: 'اسم المستخدم أو PIN غير صحيح' };
  }

  const result = data as Record<string, unknown>;

  if (!result.success) {
    return { success: false, error: 'اسم المستخدم أو PIN غير صحيح' };
  }

  const session: CashierSession = {
    sessionId: result.token as string,
    cashierAccountId: result.cashier_account_id as string,
    posDeviceId: result.pos_device_id as string,
    cashierName: result.cashier_name as string,
    posCode: result.pos_code as string,
    expiresAt: result.expires_at as string,
  };

  if (typeof window !== 'undefined') {
    sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        token: session.sessionId,
        cashierAccountId: session.cashierAccountId,
        posDeviceId: session.posDeviceId,
        cashierName: session.cashierName,
        posCode: session.posCode,
        expiresAt: session.expiresAt,
      })
    );
  }

  return { success: true, session };
}

export function getStoredCashierSession(): { token: string; cashierAccountId: string; posDeviceId: string; cashierName: string; posCode: string; expiresAt: string } | null {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (new Date(parsed.expiresAt) < new Date()) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearCashierSession(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(SESSION_KEY);
  }
}

export async function verifyCashierSession(token: string): Promise<CashierSession | null> {
  if (!isSupabaseConfigured()) return null;
  const client = getSupabase();
  if (!client) return null;

  const { data, error } = await client.rpc('verify_cashier_session', {
    p_token: token,
  });

  if (error || !data) return null;

  const result = data as Record<string, unknown>;
  if (!result.session_id) return null;

  return {
    sessionId: result.session_id as string,
    cashierAccountId: result.cashier_account_id as string,
    posDeviceId: result.pos_device_id as string,
    cashierName: result.cashier_name as string,
    posCode: result.pos_code as string,
    expiresAt: result.expires_at as string,
  };
}
