// Supabase Edge Function: delete-account
//
// Hard deletes the authenticated user's data from the database and
// removes their account from Supabase Auth. The function expects
// the Authorization header containing a valid JWT. It uses the
// Supabase service role key to perform deletions.

import { serve } from 'https://deno.land/std@0.181.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader?.toLowerCase().startsWith('bearer ')
    ? authHeader.substring(7)
    : null;
  if (!token) {
    return new Response(JSON.stringify({ error: 'missing_token' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  // Client for verifying JWT
  const supabase = createClient(supabaseUrl, anonKey);
  // Admin client with service role
  const admin = createClient(supabaseUrl, serviceRoleKey);
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return new Response(JSON.stringify({ error: 'invalid_token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    // Delete related rows
    const userId = user.id;
    const delEntries = await admin.from('impact_entries').delete().eq('user_id', userId);
    if (delEntries.error) {
      console.error(delEntries.error);
      return new Response(JSON.stringify({ error: 'failed_to_delete_entries' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const delProfiles = await admin.from('profiles').delete().eq('id', userId);
    if (delProfiles.error) {
      console.error(delProfiles.error);
      return new Response(JSON.stringify({ error: 'failed_to_delete_profile' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    // Delete auth user
    const { error: authError } = await admin.auth.admin.deleteUser(userId, false);
    if (authError) {
      console.error(authError);
      return new Response(JSON.stringify({ error: 'failed_to_delete_auth_user' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'unexpected_error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});