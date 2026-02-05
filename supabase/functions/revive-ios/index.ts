import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const allowedOrigins = (Deno.env.get("CORS_ORIGINS") ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter((origin) => origin.length > 0);

const baseCorsHeaders = {
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Vary": "Origin",
};

function resolveCorsHeaders(origin: string | null) {
  if (!origin) {
    return { ...baseCorsHeaders };
  }
  if (allowedOrigins.includes(origin)) {
    return { ...baseCorsHeaders, "Access-Control-Allow-Origin": origin };
  }
  return { ...baseCorsHeaders };
}

function jsonResponse(
  body: Record<string, unknown>,
  status = 200,
  origin: string | null = null,
) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...resolveCorsHeaders(origin),
      "Content-Type": "application/json",
    },
  });
}

const publicConfigEnabled = Deno.env.get("PUBLIC_CONFIG_ENABLED") === "true";

serve((req) => {
  const origin = req.headers.get("origin");
  if (origin && !allowedOrigins.includes(origin)) {
    return jsonResponse({ error: "Origin not allowed." }, 403, origin);
  }

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: resolveCorsHeaders(origin) });
  }

  if (req.method !== "GET") {
    return jsonResponse({ error: "Not found." }, 404, origin);
  }

  if (!publicConfigEnabled) {
    return jsonResponse({ error: "Not found." }, 404, origin);
  }

  return jsonResponse(
    {
      supabase_url: Deno.env.get("SUPABASE_URL") ?? "",
      supabase_anon_key: Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      google_ios_client_id: Deno.env.get("GOOGLE_IOS_CLIENT_ID") ?? "",
      google_web_client_id: Deno.env.get("GOOGLE_WEB_CLIENT_ID") ?? "",
      google_reversed_client_id:
        Deno.env.get("GOOGLE_REVERSED_CLIENT_ID") ?? "",
    },
    200,
    origin,
  );
});
