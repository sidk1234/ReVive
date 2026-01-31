/**
 * Next.js configuration for the ReVive project.
 *
 * We enable React strict mode and customise the Webpack configuration to
 * mark certain Framework7 modules as external. Without this, the Next.js
 * build attempts to resolve `framework7/lite-bundle`, `framework7-react`
 * and related CSS bundles during the server-side build phase, which
 * triggers errors like "Default condition should be last one" due to
 * Framework7's package.json `exports` ordering. Declaring them as
 * externals instructs Webpack not to bundle these packages; instead
 * they will be loaded at runtime in the browser via dynamic imports in
 * `RevivePWA.jsx`. See discussion in
 * https://github.com/framework7io/framework7/issues/4061 for context.
 */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    // Ensure externals array exists.
    config.externals = config.externals || [];
    // Declare Framework7 modules as externals to prevent Next.js from
    // bundling them. They will be resolved at runtime in the browser.
    config.externals.push({
      'framework7/lite-bundle': 'commonjs framework7/lite-bundle',
      'framework7-react': 'commonjs framework7-react',
      'framework7/css/bundle': 'commonjs framework7/css/bundle',
    });
    return config;
  },
};

module.exports = nextConfig;
