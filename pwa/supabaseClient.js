// Simple Supabase client setup. The URL and anonymous key are loaded
// from environment variables defined in your Vercel project or `.env` file.
import { createClient } from '@supabase/supabase-js';

// In the Next.js environment, environment variables are exposed via
// process.env with the NEXT_PUBLIC_ prefix. Fallbacks ensure this
// client still works during development or when compiled with Vite.
const supabaseUrl =
  typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SUPABASE_URL
    ? process.env.NEXT_PUBLIC_SUPABASE_URL
    : import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey =
  typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    : import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to get the current auth session. The session
// contains the JWT required for calling your Supabase Edge Functions.
export async function getSession() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}