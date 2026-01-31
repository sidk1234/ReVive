const konstaConfig = require('konsta/config');

/**
 * Tailwind configuration for ReVive.
 *
 * We wrap the Tailwind config with Konsta's helper to enable Konsta UI
 * classes, and we include content paths for our Next.js pages, components
 * and PWA source files. Dark mode is handled via the `class` strategy so
 * users can toggle light and dark themes.
 */
module.exports = konstaConfig({
  content: [
    './pages/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './pwa/**/*.{js,jsx,ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [],
});