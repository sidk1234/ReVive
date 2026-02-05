// supabase/functions/zip-lookup/index.ts
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
    });
  }

  const { lat, lon } = await req.json().catch(() => ({}));
  if (typeof lat !== "number" || typeof lon !== "number") {
    return new Response(JSON.stringify({ error: "Missing lat/lon" }), {
      status: 400,
      headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
    });
  }

  // Nominatim reverse geocode
  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lon));
  url.searchParams.set("addressdetails", "1");

  const r = await fetch(url.toString(), {
    headers: {
      // Nominatim asks for a valid UA/identifier
      "user-agent": "ReVive/1.0 (reviveearth.vercel.app)",
    },
  });

  if (!r.ok) {
    return new Response(JSON.stringify({ error: "Geocode failed", status: r.status }), {
      status: 502,
      headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
    });
  }

  const data = await r.json();
  const zip = data?.address?.postcode ?? null;

  return new Response(JSON.stringify({ zip }), {
    headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
  });
});