// supabase/functions/anon-quota/index.ts
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const DAILY_GUEST_LIMIT = 5;

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
}

function getSupabaseAdmin() {
  const url = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

serve(async (req) => {
  const ua = req.headers.get("user-agent") ?? "";
  const xff = req.headers.get("x-forwarded-for") ?? "";
  const fp = await sha256Hex(`${ua}||${xff}`);

  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("anon_request_usage")
    .select("count")
    .eq("fp_hash", fp)
    .eq("day_key", new Date().toISOString().slice(0, 10))
    .maybeSingle();

  const used = error ? 0 : Number(data?.count ?? 0);
  const remaining = Math.max(0, DAILY_GUEST_LIMIT - used);

  return new Response(JSON.stringify({ used, remaining, limit: DAILY_GUEST_LIMIT }), {
    headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
  });
});