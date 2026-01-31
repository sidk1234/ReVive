# ReVive PWA - Deployment Guide

This guide covers how to run and deploy the ReVive Progressive Web App.

## Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Vercel account (for deployment)

## Local Development

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Run Development Server

```bash
npm run dev
```

The app will be available at:
- Main website: http://localhost:3000
- PWA: http://localhost:3000/app

## Building for Production

```bash
npm run build
npm start
```

## Vercel Deployment

### 1. Connect Repository

1. Go to [Vercel](https://vercel.com)
2. Import your GitHub repository
3. Vercel will auto-detect Next.js

### 2. Environment Variables

In Vercel project settings, add:

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- `NEXT_PUBLIC_SITE_URL` - Your Vercel deployment URL (e.g., `https://reviveearth.vercel.app`)

### 3. Supabase Edge Functions

Deploy edge functions to Supabase:

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Deploy functions
supabase functions deploy revive
supabase functions deploy anon-quota
supabase functions deploy zip-lookup
supabase functions deploy delete-account
```

### 4. Edge Function Secrets

Set secrets in Supabase dashboard or via CLI:

```bash
supabase secrets set OPENAI_API_KEY=your_openai_key
supabase secrets set CORS_ORIGINS=https://reviveearth.vercel.app
supabase secrets set ALLOW_WEB_SEARCH=true
```

### 5. Database Setup

Ensure the following tables and RPCs exist:

- `profiles` table
- `impact_entries` table
- `app_settings` table
- `anon_request_usage` table
- `get_public_leaderboard(limit)` RPC function
- `bump_anon_usage(fp_hash)` RPC function

### 6. Deploy

Vercel will automatically deploy on push to main branch. The PWA will be available at:

- Main site: `https://your-domain.vercel.app`
- PWA: `https://your-domain.vercel.app/app`

## PWA Features

### Install Instructions

The PWA shows install instructions when accessed in a browser (not installed). Once installed, the instructions are skipped.

### Offline Support

The app detects offline status and shows a dedicated offline page. Core functionality requires internet connection.

### Deep Linking

All `/app/*` routes work correctly on refresh thanks to Next.js catch-all routing.

## Testing Checklist

- [ ] `/app` loads correctly
- [ ] Install instructions show when not installed
- [ ] Install instructions skip when installed (standalone mode)
- [ ] All tabs navigate correctly
- [ ] Auth flows work (Google OAuth, email/password)
- [ ] Guest quota enforced (5/day)
- [ ] ZIP autofill works with geolocation
- [ ] Theme toggle works (System/Light/Dark)
- [ ] Offline detection works
- [ ] Public leaderboard loads (logged out)
- [ ] Deep links work on refresh
- [ ] Safe areas respected (no clipped UI)

## Troubleshooting

### PWA not installable

- Check `manifest.webmanifest` is accessible
- Ensure HTTPS (required for PWA)
- Verify service worker registration

### Framework7 routing issues

- Ensure all pages use `useAppRouter` hook
- Check that routes are properly defined in `pwa/routes.js`

### Supabase connection errors

- Verify environment variables are set
- Check Supabase project is active
- Ensure RPC functions are deployed and public

### Build errors

- Clear `.next` folder and rebuild
- Check for TypeScript/ESLint errors
- Verify all dependencies are installed

## Support

For issues or questions, contact: reviveearthnonprofit@googlegroups.com

