// Supabase Edge Function: zip-lookup
//
// Accepts { lat, lng } in the request body and returns
// { zip } by calling OpenStreetMap's Nominatim reverse geocoder. This
// endpoint does not require authentication and does not expose any
// secret keys.
import { serve } from 'https://deno.land/std@0.181.0/http/server.ts';

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  try {
    const { lat, lng } = await req.json();
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return new Response(JSON.stringify({ error: 'invalid_coords' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const url = new URL('https://nominatim.openstreetmap.org/reverse');
    url.searchParams.set('format', 'jsonv2');
    url.searchParams.set('lat', String(lat));
    url.searchParams.set('lon', String(lng));
    url.searchParams.set('addressdetails', '1');
    const res = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'RecAI/1.0 (recaiapp.vercel.app)',
        Accept: 'application/json',
      },
    });
    const data = await res.json();
    const zip = data?.address?.postcode ?? null;
    return new Response(JSON.stringify({ zip }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});