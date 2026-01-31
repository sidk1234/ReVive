# ReVive - Progressive Web App

ReVive is an intelligent recycling assistant that helps users identify recyclable items and provides location-specific recycling guidance. The PWA is built with Next.js, Konsta UI, and Framework7.

## Features

- 📱 **Progressive Web App** - Installable on iOS and Android
- 🤖 **AI-Powered Analysis** - Identify items via photo or text input
- 📍 **Location-Aware** - ZIP code-based recycling rules
- 📊 **Impact Tracking** - Monitor your recycling activity and impact
- 🏆 **Leaderboard** - Compete with other recyclers
- 🌓 **Theme Support** - System/Light/Dark mode
- 🔒 **Authentication** - Google OAuth and email/password
- 📴 **Offline Support** - Graceful offline handling

## Tech Stack

- **Next.js 14** - React framework
- **Konsta UI v5+** - iOS/Material design components
- **Framework7 v9+** - Routing and transitions (routing only)
- **Framework7 Icons v5+** - Icon font
- **Supabase** - Backend (auth, database, edge functions)
- **Tailwind CSS** - Styling

## Project Structure

```
/
├── components/
│   └── RevivePWA.jsx          # Main PWA shell
├── pages/
│   ├── app/
│   │   └── [[...slug]].js     # Catch-all route for /app/*
│   ├── demo.js                 # Demo/preview page
│   ├── terms.js                # Terms of Service
│   └── policy.js               # Privacy Policy
├── pwa/
│   ├── components/             # PWA-specific components
│   ├── contexts/               # React contexts (Theme, Auth)
│   ├── hooks/                  # Custom hooks
│   ├── pages/                  # PWA pages
│   ├── utils/                  # Utility functions
│   └── routes.js               # Framework7 route definitions
└── supabase/
    └── functions/              # Edge functions
```

## Getting Started

See [DEPLOY.md](./DEPLOY.md) for detailed setup and deployment instructions.

### Quick Start

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables (`.env.local`):
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

3. Run development server:
```bash
npm run dev
```

4. Open http://localhost:3000/app

## PWA Routes

- `/app` or `/app/capture` - Main capture/scan page
- `/app/impact` - User impact and history
- `/app/leaderboard` - Public leaderboard
- `/app/settings` - App settings
- `/app/account` - Account management
- `/app/auth/callback` - OAuth callback
- `/app/auth/reset` - Password reset
- `/app/offline` - Offline page

## Key Features Implementation

### Install Instructions
Shown when app is accessed in browser (not installed). Platform-specific instructions for iOS and Android.

### Anonymous Quota
Guest users limited to 5 requests/day. Enforced server-side via `anon-quota` edge function.

### ZIP Autofill
Uses browser geolocation + OpenStreetMap Nominatim via `zip-lookup` edge function. Manual override supported.

### Theme System
System/Light/Dark toggle persisted in localStorage. Respects system preference by default.

### Public Leaderboard
Uses `get_public_leaderboard` RPC. Visible to both authenticated and unauthenticated users.

### Offline Detection
Dedicated offline page shown when connection is lost.

## Development

### Code Style
- Use Konsta UI components for all visible UI
- Framework7 used only for routing infrastructure
- Framework7 Icons for iconography
- Follow Swift app structure for fidelity

### Testing
- Test on iOS Safari and Android Chrome
- Verify PWA installability
- Test offline scenarios
- Verify deep links work on refresh

## Deployment

See [DEPLOY.md](./DEPLOY.md) for Vercel deployment instructions.

## License

See LICENSE file for details.

## Contact

reviveearthnonprofit@googlegroups.com
