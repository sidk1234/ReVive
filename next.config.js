/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Fix hydration mismatch
  compiler: {
    styledComponents: true,
  },
  // Disable React strict mode if it causes issues
  // reactStrictMode: false,
};

module.exports = nextConfig;