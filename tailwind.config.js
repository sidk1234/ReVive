// Tailwind configuration for the ReVive project.
//
// This file defines the paths that Tailwind should scan for class names and
// extends the default theme to add custom font families used by Konsta UI.
// We intentionally avoid requiring `konsta/config` here because Konsta UI
// version 5 no longer exports it. Instead, we import the Konsta theme CSS
// directly in `styles/globals.css` (see that file for details) and rely on
// Tailwind to purge unused styles based on the content paths defined below.

module.exports = {
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
      // utility classes. These classes are used by Konsta's base styles.
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
};