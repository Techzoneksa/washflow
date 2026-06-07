import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

serve(async (req) => {
  try {
    if (req.method !== 'GET') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const token = authHeader.slice(7);
    const { data: { user: caller }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !caller) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, status')
      .eq('id', caller.id)
      .single();

    if (!profile || profile.role !== 'owner' || profile.status !== 'active') {
      return new Response(JSON.stringify({ error: 'Forbidden: owner only' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }

    const { data: authUsers, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      return new Response(JSON.stringify({ error: listError.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    const adminRoles = ['owner', 'manager', 'accountant'];
    const adminAuthUserIds = authUsers?.users
      .filter((u) => u.email)
      .map((u) => u.id) || [];

    if (adminAuthUserIds.length === 0) {
      return new Response(JSON.stringify([]), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, role, status, created_at, updated_at')
      .in('id', adminAuthUserIds)
      .in('role', adminRoles);

    const userMap = new Map<string, { email: string; last_sign_in_at: string | null }>();
    for (const u of authUsers?.users || []) {
      if (adminAuthUserIds.includes(u.id)) {
        userMap.set(u.id, { email: u.email || '', last_sign_in_at: u.last_sign_in_at || null });
      }
    }

    const result = (profiles || []).map((p) => ({
      id: p.id,
      email: userMap.get(p.id)?.email || '',
      full_name: p.full_name,
      role: p.role,
      status: p.status,
      created_at: p.created_at,
      last_sign_in_at: userMap.get(p.id)?.last_sign_in_at || null,
    }));

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch {
    return new Response(
      JSON.stringify({ error: 'Internal error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
