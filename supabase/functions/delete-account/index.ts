// supabase/functions/delete-account/index.ts
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
  });
}

function getSupabaseAdmin() {
  const url = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

function getSupabaseAnon() {
  const url = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  return createClient(url, anonKey, { auth: { persistSession: false } });
}

async function getUserId(req: Request) {
  const auth = req.headers.get("authorization");
  if (!auth?.toLowerCase().startsWith("bearer ")) return null;
  const token = auth.slice("bearer ".length);
  const supabase = getSupabaseAnon();
  const { data, error } = await supabase.auth.getUser(token);
  if (error) return null;
  return data.user?.id ?? null;
}

serve(async (req) => {
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });

  const userId = await getUserId(req);
  if (!userId) return json(401, { error: "Not authenticated" });

  const admin = getSupabaseAdmin();

  // 1) Delete user row in auth (this cascades to profiles & impact_entries via FK on delete cascade if set)
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) return json(500, { error: "deleteUser failed", detail: error.message });

  return json(200, { ok: true });
});