# Quick Start Guide: Konsta UI Kitchen Sink Integration

This guide will help you get the Konsta UI Kitchen Sink running in your ReVive application.

## ⚠️ IMPORTANT: Build Order

**You MUST build the kitchen-sink BEFORE running the Next.js dev server!**

The kitchen-sink uses Tailwind CSS v4 while the main app uses v3. They must be built separately to avoid conflicts.

## What Was Done

The Konsta UI Kitchen Sink (a comprehensive demo app showcasing mobile UI components) has been integrated into the ReVive project at the route `/app/kitchensink`.

### Files Added/Modified:

1. **`/kitchen-sink/`** - Complete kitchen-sink application from konsta-master
   - Contains all components, pages, and configuration
   - Includes build configuration (vite.config.js)
   - Has its own package.json with necessary dependencies

2. **`/pages/app/kitchensink/[[...slug]].js`** - Next.js catch-all route
   - Renders the kitchen-sink app in an iframe
   - Handles all sub-routes under /app/kitchensink

3. **`/package.json`** - Updated with:
   - New script: `build:kitchensink`
   - New dependency: `react-router-dom`

4. **Documentation**:
   - `/README.md` - Main project README
   - `/kitchen-sink/README.md` - Kitchen-sink specific README
   - `/kitchen-sink/setup.sh` - Setup script

## Step-by-Step Setup

### 1. Install Main Dependencies

From the ReVive root directory:

```bash
npm install
```

### 2. Build the Kitchen Sink (REQUIRED FIRST!)

**This must be done before running Next.js!**

You have three options:

**Option A: Quick setup (recommended for first time)**
```bash
npm run setup
# This runs: npm install && npm run build:kitchensink
```

**Option B: Using the npm script**
```bash
npm run build:kitchensink
```

**Option C: Manual build**
```bash
cd kitchen-sink
npm install
npm run build
cd ..
```

**⚠️ Important**: Wait for the build to complete. You should see output like:
```
✓ built in XXXms
```

### 3. Verify the Build

Check that the build was successful:

```bash
ls -la public/kitchensink-app/
# You should see: index.html and assets/ directory
```

### 4. Start the Development Server

**Only after the kitchen-sink is built:**

```bash
npm run dev
```

Or use the all-in-one command (builds kitchen-sink then starts Next.js):

```bash
npm run dev:full
```

### 5. Access the Kitchen Sink

Open your browser and navigate to:
```
http://localhost:3000/app/kitchensink
```

## What You'll See

The kitchen-sink homepage will show:
- Theme selector (iOS / Material Design)
- Dark mode toggle
- Color theme options
- List of all available component demos

You can click on any component to see its demo page.

## Available Component Demos

The kitchen-sink includes demos for 30+ components:

**Actions & Buttons**
- Action Sheet
- Buttons
- FAB (Floating Action Button)
- Chips

**Forms & Input**
- Form Inputs
- Checkbox
- Radio
- Toggle
- Stepper
- Range Slider
- Searchbar

**Lists & Data**
- List
- List Button
- Menu List
- Contacts List
- Data Table

**Navigation**
- Navbar
- Tabbar
- Toolbar
- Subnavbar
- Breadcrumbs
- Segmented Control

**Overlays & Modals**
- Dialog
- Popup
- Popover
- Sheet Modal
- Panel (Side Panels)
- Action Sheet

**Feedback**
- Toast
- Notification
- Preloader
- Progress Bar

**Content**
- Cards
- Content Block
- Badge
- Messages

## Troubleshooting

### "Failed to Load Kitchen Sink" Error

This means the kitchen-sink hasn't been built yet. Follow Step 2 above to build it.

### Build Fails with Dependency Errors

1. Delete `kitchen-sink/node_modules` and `kitchen-sink/package-lock.json`
2. Run `npm install` in the kitchen-sink directory again
3. Try the build again

### Components Not Displaying Correctly

1. Check your browser console for errors
2. Ensure the build completed successfully
3. Verify files exist in `public/kitchensink-app/`

### Routing Issues

The kitchen-sink uses HashRouter internally, so routes will look like:
```
/app/kitchensink#/buttons
/app/kitchensink#/cards
```

This is normal and expected behavior.

## Customization

### Changing Themes

Themes can be changed in the kitchen-sink app itself using the settings on the homepage.

### Modifying Components

To modify the kitchen-sink components:

1. Edit files in `kitchen-sink/pages/` or `kitchen-sink/components/`
2. Rebuild: `npm run build:kitchensink`
3. Refresh your browser

### Adding New Components

1. Create a new page in `kitchen-sink/pages/YourComponent.jsx`
2. Import it in `kitchen-sink/routes.js`
3. Add it to the routes array
4. Rebuild the app

## Next Steps

- Explore all the component demos
- Check out the Konsta UI documentation
- Customize the themes and colors
- Use the components as reference for your own development

## Resources

- [Konsta UI Documentation](https://konstaui.com)
- [Konsta UI GitHub](https://github.com/konstaui/konsta)
- Kitchen Sink README: `kitchen-sink/README.md`
- Main Project README: `README.md`

## Questions or Issues?

If you encounter any problems:
1. Check the troubleshooting section above
2. Review the error messages in your console
3. Ensure all build steps were completed successfully
4. Verify that all dependencies are installed

Happy coding! 🚀
