// Tailwind configuration for the ReVive project.
//
// We wrap the configuration with `konsta/config` so that Konsta UI's
// component classes are generated automatically. The `content` paths
// include the Next.js pages, our React components, and the PWA source
// files so that unused classes are purged correctly. Dark mode is set
// to `class` so that a `dark` class on the `<html>` element toggles
// dark mode. You can extend the theme or add plugins as needed.

const konstaConfig = require('konsta/config');

module.exports = konstaConfig({
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './pwa/**/*.{js,jsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // Define custom font families used by Konsta UI. By adding
      // `fontFamily.ios` and `fontFamily.material`, Tailwind will
      // automatically generate `.font-ios` and `.font-material`
      // utility classes. This avoids PostCSS errors when Konsta's
      // base styles apply these classes.
      fontFamily: {
        ios: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Helvetica Neue"',
          'Inter',
          'sans-serif',
        ],
        material: [
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
});