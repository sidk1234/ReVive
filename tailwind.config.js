/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    // Explicitly exclude kitchen-sink to avoid conflicts
    "!./kitchen-sink/**",
  ],
  theme: {
    extend: {
      colors: {
        // You can extend custom colors here to more closely match the original site
      }
    }
  },
  plugins: [],
};