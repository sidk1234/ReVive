// Supabase Edge Function: anon-quota
//
// Returns the guest scanning quota for anonymous users. This
// implementation uses a simple daily limit of five scans. You can
// extend this function to query a rate-limited table similar to
// `bump_anon_usage`.
import { serve } from 'https://deno.land/std@0.181.0/http/server.ts';

serve(async (req) => {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  // Hard-coded guest quota. Replace with calls to your rate limiting
  // logic as needed.
  const limit = 5;
  const remaining = 5;
  return new Response(JSON.stringify({ limit, remaining }), {
    headers: { 'Content-Type': 'application/json' },
  });
});