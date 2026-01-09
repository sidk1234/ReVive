// Supabase client initialization
//
// This helper creates a Supabase client using environment variables for the URL
// and anonymous key. When these variables are not provided (e.g. during local
// development without a backend), the client will still be created but API
// calls will likely fail. You should define `NEXT_PUBLIC_SUPABASE_URL` and
// `NEXT_PUBLIC_SUPABASE_ANON_KEY` in your Vercel project or `.env.local`.

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a single supabase client for the entire app
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper to check if Supabase has been configured. You can use this to
// conditionally perform fallback logic when no URL or key is present.
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);