/**
 * The folder the site is served from, always ending in "/".
 * It is "/" by default and "/lordoftherims/" for `npm run build:alwaysdata` (set with Vite's --base).
 */
export const BASE_PATH = import.meta.env.BASE_URL;

/**
 * Turns a site path stored in the database (e.g. "/uploads/car.jpg" or "/placeholder.svg")
 * into a URL that works wherever the site is hosted. Full http(s) URLs are returned unchanged.
 */
export function assetUrl(path: string | null | undefined): string {
  const value = path || '/placeholder.svg';
  return value.startsWith('/') && !value.startsWith('//') ? BASE_PATH + value.slice(1) : value;
}
