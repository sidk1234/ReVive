# ReVive Earth

ReVive is a Next.js site with an embedded fidelity PWA at `/app` that mirrors the native iOS experience.

## Features

- Public marketing site
- /app PWA with Konsta UI + Framework7 routing
- Supabase auth + impact tracking
- ZIP-aware recycling guidance
- Public leaderboard

## New: Konsta UI Kitchen Sink

This project now includes the Konsta UI Kitchen Sink - a comprehensive demo of mobile UI components.

### Accessing the Kitchen Sink

The kitchen-sink is available at `/app/kitchensink` when running the development server.

### Building the Kitchen Sink

Before you can access the kitchen-sink, you need to build it:

```bash
# Quick build using npm script
npm run build:kitchensink

# Or manually
cd kitchen-sink
./setup.sh
```

For more details, see [kitchen-sink/README.md](kitchen-sink/README.md)

## Getting Started

### Prerequisites

- Node.js 14.x or higher
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd ReVive-main
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file with your Supabase credentials (already included in the project)

4. (Optional) Build the kitchen-sink app:
   ```bash
   npm run build:kitchensink
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
# Build the Next.js app
npm run build

# Build the kitchen-sink (if not already built)
npm run build:kitchensink

# Start the production server
npm start
```

## Project Structure

```
ReVive-main/
├── pages/              # Next.js pages
│   ├── app/           # App routes
│   │   └── kitchensink/  # Kitchen Sink catch-all route
│   ├── api/           # API routes
│   └── ...            # Other pages
├── components/        # React components
│   ├── home/         # Home page components
│   └── ui/           # UI components
├── kitchen-sink/     # Konsta UI Kitchen Sink app
│   ├── components/   # Kitchen sink components
│   ├── pages/        # Component demo pages
│   └── ...           # Other kitchen sink files
├── public/           # Static files
│   └── kitchensink-app/  # Built kitchen-sink app (generated)
├── styles/           # Global styles
├── lib/              # Utility libraries
├── api/              # API utilities
└── entities/         # Data models
```

## Routes

### Main Application Routes

- `/` - Home page
- `/Home` - Main application home
- `/About` - About page
- `/Impact` - Impact tracking
- `/MyImpact` - Personal impact dashboard
- `/Community` - Community features
- `/Locations` - Recycling locations
- `/Profile` - User profile
- `/Sponsors` - Sponsors page
- `/login` - Login page
- `/admin` - Admin dashboard
- `/u/[username]` - User profiles
- `/app` - ReVive PWA (installable)
- `/demo` - PWA demo page

### Kitchen Sink Route

- `/app/kitchensink` - Konsta UI Kitchen Sink homepage
- `/app/kitchensink/*` - Individual component demos

## Technologies

- **Framework**: Next.js 14
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **Database**: Supabase
- **State Management**: TanStack Query
- **Additional UI**: Konsta UI (for kitchen-sink)

## Kitchen Sink Components

The kitchen-sink includes demos for:
- Action Sheets, Badges, Breadcrumbs
- Buttons, Cards, Checkboxes, Chips
- Data Tables, Dialogs, FABs
- Forms, Lists, Menus
- Messages, Modals, Notifications
- Navigation components
- And many more!

See [kitchen-sink/README.md](kitchen-sink/README.md) for the complete list.

## Environment Variables

Create a `.env.local` file with the following:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=https://reviveearth.vercel.app
```

## Deployment

See `README/DEPLOY.md` for local run steps and Vercel deployment notes.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Support

For issues or questions, please open an issue on the repository.
