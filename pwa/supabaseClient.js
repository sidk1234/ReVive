import { createClient } from '@supabase/supabase-js';

// Supabase client configured with environment variables. You should
// create NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in
// your deployment environment (e.g. Vercel). These keys are safe to
// expose to the browser【423729414308890†L124-L134】.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);