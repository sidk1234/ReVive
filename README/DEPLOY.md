# ReVive Deployment Guide

## Local Development

1. Install dependencies:

```bash
npm install
```

2. (Optional) Build the Konsta Kitchen Sink demo:

```bash
npm run build:kitchensink
```

3. Set environment variables in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

4. Start the dev server:

```bash
npm run dev
```

5. Open:
- Marketing site: `http://localhost:3000`
- ReVive PWA: `http://localhost:3000/app`
- Demo page: `http://localhost:3000/demo`

## Vercel Deployment

1. Import the GitHub repository into Vercel.
2. Set Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` (e.g., `https://reviveearth.vercel.app`)
3. Build command: `npm run build`
4. Output directory: leave default (Next.js)

## Supabase Notes

- Supabase Edge Functions are already defined in `supabase/functions`.
- Do not recreate tables or functions; the PWA assumes they already exist.
- The PWA calls these edge functions:
  - `revive`
  - `anon-quota`
  - `zip-lookup`
  - `delete-account`

## PWA Install

- iOS: Safari > Share > Add to Home Screen
- Android: Chrome > menu > Install app / Add to Home screen
