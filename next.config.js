/**
 * Next.js configuration for the ReVive project.
 *
 * We enable `transpilePackages` to ensure that ESM modules from
 * Framework7, its React bindings, Konsta UI, Swiper and Dom7 are
 * transpiled by Next.js. Without this, Next's Webpack setup may
 * attempt to resolve conditional exports in these packages during
 * server-side compilation, leading to errors such as
 * "Default condition should be last one". See
 * https://github.com/framework7io/framework7/issues/4061 for details.
 */
const nextConfig = {
  transpilePackages: [
    'framework7',
    'framework7-react',
    'konsta',
    'swiper',
    'dom7',
  ],
  reactStrictMode: true,
};

module.exports = nextConfig;