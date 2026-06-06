import { getSupabase, isSupabaseConfigured } from './client';
import type { User } from '@supabase/supabase-js';
import type { UserRole } from '@/types';

export interface AuthProfile {
  id: string;
  fullName: string;
  role: UserRole;
  status: 'active' | 'inactive';
}

export async function getCurrentUser(): Promise<User | null> {
  const client = getSupabase();
  if (!client) return null;
  const { data } = await client.auth.getUser();
  return data.user;
}

export async function getSession() {
  const client = getSupabase();
  if (!client) return null;
  const { data } = await client.auth.getSession();
  return data.session;
}

export async function signIn(email: string, password: string) {
  const client = getSupabase();
  if (!client) return { data: null, error: new Error('Supabase not configured') };
  const result = await client.auth.signInWithPassword({ email, password });
  return result;
}

export async function signOutUser() {
  const client = getSupabase();
  if (!client) return { error: null };
  const { error } = await client.auth.signOut();
  return { error };
}

export async function getCurrentProfile(): Promise<AuthProfile | null> {
  const client = getSupabase();
  if (!client) return null;

  const user = await getCurrentUser();
  if (!user) return null;

  const { data, error } = await client
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error || !data) return null;

  if (data.status === 'inactive') return null;

  return {
    id: data.id,
    fullName: data.full_name,
    role: data.role as UserRole,
    status: data.status,
  };
}

export async function getCurrentRole(): Promise<UserRole | null> {
  const profile = await getCurrentProfile();
  return profile?.role || null;
}

export async function isAuthenticated(): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const user = await getCurrentUser();
  return !!user;
}

export function onAuthStateChange(callback: (user: User | null) => void) {
  const client = getSupabase();
  if (!client) return { data: { unsubscribe: () => {} } };
  return client.auth.onAuthStateChange((_, session) => {
    callback(session?.user ?? null);
  });
}
