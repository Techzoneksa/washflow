import { getSupabase } from './client';
import type { User } from '@supabase/supabase-js';

export async function getCurrentUser(): Promise<User | null> {
  const client = getSupabase();
  if (!client) return null;
  const { data } = await client.auth.getUser();
  return data.user;
}

export async function getSession() {
  const client = getSupabase();
  if (!client) return { session: null };
  const { data } = await client.auth.getSession();
  return data.session;
}

export async function signOut() {
  const client = getSupabase();
  if (!client) return { error: null };
  const { error } = await client.auth.signOut();
  return { error };
}

export function onAuthStateChange(callback: (user: User | null) => void) {
  const client = getSupabase();
  if (!client) return { data: { unsubscribe: () => {} } };
  return client.auth.onAuthStateChange((_, session) => {
    callback(session?.user ?? null);
  });
}