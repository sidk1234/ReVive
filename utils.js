// Utility functions used across the application.

/**
 * Creates a URL path for a given page name. In the base project these pages
 * were server-side routes. In this Next.js version we map page names to
 * lowercase route names that match the file names in the `pages` directory.
 *
 * Examples:
 *   createPageUrl('About') => '/about'
 *   createPageUrl('MyImpact') => '/myimpact'
 *
 * @param {string} page - The page name (e.g. "About", "Impact", "MyImpact").
 * @returns {string} The corresponding route path.
 */
export function createPageUrl(page) {
  // Generate a route for a given page name.  The original Base44 site uses
  // capitalised paths (e.g. "/About", "/Impact", etc.), whereas our initial
  // implementation lower‑cased everything.  To match the Base44 routing
  // exactly, this helper now preserves the page name's casing (with the
  // exception of the home page which maps to "/").  It also trims any
  // leading slashes to avoid duplication.
  if (!page || page.toLowerCase() === 'home' || page.toLowerCase() === 'index') {
    return '/';
  }
  // If the argument already looks like a path, return it unchanged
  if (page.startsWith('/')) {
    return page;
  }
  // Remove any leading slash just in case
  const trimmed = page.replace(/^\//, '');
  return `/${trimmed}`;
}