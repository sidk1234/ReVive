/**
 * Next.js configuration for ReVive.
 *
 * We enable `reactStrictMode` to surface potential bugs in development.
 *
 * The `transpilePackages` option tells Next's bundler to compile certain
 * ESM-only dependencies, including Framework7 and Konsta. Without this
 * directive, these packages expose conditional exports that can trigger the
 * "Default condition should be last one" error during the build. Including
 * Swiper and Dom7 here ensures their ESM modules are also transpiled.
 *
 * See: https://nextjs.org/docs/architecture/nextjs-compiler#transpilepackages
 */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    'framework7',
    'framework7-react',
    'konsta',
    'swiper',
    'dom7'
  ],
};

module.exports = nextConfig;
