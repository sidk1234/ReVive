# Konsta UI Kitchen Sink Integration

This directory contains the Konsta UI Kitchen Sink React application integrated into the ReVive project.

## Overview

The kitchen-sink app is a comprehensive demo of all Konsta UI components. It has been integrated into ReVive at the `/app/kitchensink` route.

## Directory Structure

```
kitchen-sink/
├── components/          # Shared components (App, Page, Icons)
├── pages/              # Individual component demo pages
├── images/             # Image assets
├── public/             # Public assets
├── styles/             # CSS styles
├── konsta-src/         # Konsta UI source files (copied from konsta-master)
├── index.html          # Main HTML file
├── index.js            # Application entry point
├── routes.js           # Route configuration
├── vite.config.js      # Vite build configuration
└── package.json        # Dependencies and scripts
```

## Building the Kitchen Sink App

The kitchen-sink app is built using Vite and outputs to `/public/kitchensink-app/`.

### Prerequisites

Make sure you have Node.js and npm installed.

### Build Steps

1. From the ReVive root directory, run:
   ```bash
   npm run build:kitchensink
   ```

   Or manually:
   ```bash
   cd kitchen-sink
   npm install
   npm run build
   ```

2. This will create a production build in `../public/kitchensink-app/`

## Accessing the Kitchen Sink

Once built, the kitchen-sink app can be accessed at:
- Development: `http://localhost:3000/app/kitchensink`
- Production: `https://yourdomain.com/app/kitchensink`

## How It Works

1. The Next.js catch-all route `/pages/app/kitchensink/[[...slug]].js` handles all routes under `/app/kitchensink`
2. This page renders an iframe that loads the built kitchen-sink app from `/kitchensink-app/`
3. The kitchen-sink app uses HashRouter to handle internal routing
4. Route changes in Next.js are synced with the hash in the iframe URL

## Components Included

The kitchen-sink demonstrates the following Konsta UI components:

- Action Sheet
- Badge
- Breadcrumbs
- Buttons
- Cards
- Checkbox
- Chips
- Contacts List
- Content Block
- Data Table
- Dialog
- FAB (Floating Action Button)
- Form Inputs
- List
- List Button
- Menu List
- Messages
- Navbar
- Notification
- Panel (Side Panels)
- Popover
- Popup
- Preloader
- Progress Bar
- Radio
- Range Slider
- Searchbar
- Segmented Control
- Sheet Modal
- Stepper
- Subnavbar
- Tabbar
- Toast
- Toggle
- Toolbar

## Customization

### Themes

The kitchen-sink supports two themes:
- iOS (default)
- Material Design

You can switch themes using the settings in the home page.

### Colors

Multiple color themes are available and can be toggled in the app.

## Dependencies

The kitchen-sink requires the following npm packages:
- react
- react-dom
- react-router-dom
- tailwindcss
- vite
- @vitejs/plugin-react
- @tailwindcss/vite
- tailwind-merge

## Development

To run the kitchen-sink in development mode:

```bash
cd kitchen-sink
npm run dev
```

This will start a Vite dev server on a separate port (usually 5173).

## Troubleshooting

### Build Errors

If you encounter build errors:
1. Delete `node_modules` and `package-lock.json` in the kitchen-sink directory
2. Run `npm install` again
3. Ensure all path aliases in `vite.config.js` are correct

### Konsta UI Not Found

If Konsta UI components are not loading:
1. Ensure the `konsta-src` directory exists and contains the source files
2. Check that the alias in `vite.config.js` points to the correct location

### Iframe Not Loading

If the iframe doesn't load:
1. Ensure the build completed successfully
2. Check that files exist in `../public/kitchensink-app/`
3. Verify the base path in `vite.config.js` matches the public URL path

## License

This integration uses Konsta UI which is licensed under MIT.
