/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    // If you use Konsta's classnames in JS, keep this. Otherwise it can be removed.
    "./node_modules/konsta/**/*.{js,jsx,ts,tsx}",
    "!./kitchen-sink/**",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
