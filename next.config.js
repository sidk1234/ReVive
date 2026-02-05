/** @type {import('next').NextConfig} */
const path = require("path");
const nextConfig = {
  reactStrictMode: true,
  // Fix hydration mismatch
  compiler: {
    styledComponents: true,
  },
  transpilePackages: ["framework7", "framework7-react"],
  experimental: {
    esmExternals: "loose",
  },
  webpack: (config) => {
    // Work around Framework7 package.json export condition ordering issue in Next/webpack.
    if (config.resolve) {
      config.resolve.exportsFields = [];
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        "framework7-react$": path.resolve(
          __dirname,
          "node_modules/framework7-react/framework7-react.js"
        ),
        "framework7$": path.resolve(
          __dirname,
          "node_modules/framework7/framework7-lite.esm.js"
        ),
        "framework7/lite": path.resolve(
          __dirname,
          "node_modules/framework7/framework7-lite.esm.js"
        ),
      };
    }
    return config;
  },
  // Disable React strict mode if it causes issues
  // reactStrictMode: false,
};

module.exports = nextConfig;
