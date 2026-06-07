import { getSession } from '@/lib/supabase/auth';
import { resetPasswordForEmail } from '@/lib/supabase/auth';

const API_BASE = '/api/admin/users';

export async function createAdminUser(data: {
  fullName: string;
  email: string;
  password: string;
  role: 'owner' | 'manager' | 'accountant';
  status: 'active' | 'inactive';
}): Promise<{ success: boolean; userId?: string; error?: string }> {
  const session = await getSession();
  if (!session?.access_token) return { success: false, error: 'Not authenticated' };

  try {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        full_name: data.fullName,
        email: data.email,
        password: data.password,
        role: data.role,
        status: data.status,
      }),
    });

    const result = await res.json();
    if (!res.ok) return { success: false, error: result.error || 'Failed to create user' };

    return { success: true, userId: result.user_id };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Network error' };
  }
}

export async function sendPasswordReset(email: string): Promise<{ success: boolean; error?: string }> {
  const { error } = await resetPasswordForEmail(email);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function getAdminEmails(): Promise<Record<string, string>> {
  const session = await getSession();
  if (!session?.access_token) return {};

  try {
    const res = await fetch('/api/admin/users-emails', {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    if (!res.ok) return {};
    return await res.json();
  } catch {
    return {};
  }
}
