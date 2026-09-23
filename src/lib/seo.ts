/**
 * Central SEO configuration. Absolute URLs are required for canonical tags,
 * Open Graph / Twitter card images and the sitemap, so the production origin
 * is hard-coded here rather than read from the (localhost) dev env.
 */
export const SITE_URL = 'https://concertmash.com';
export const SITE_NAME = 'ConcertMash';
export const SITE_TITLE =
  'ConcertMash – Instantly build a Spotify playlist for your next concert';
export const SITE_DESCRIPTION =
  'ConcertMash turns your concert or festival line-up into a ready-to-play Spotify playlist in seconds. Enter the artists, pick top songs or full discographies, and get a playlist automatically.';

/**
2332×2008 source image; social platforms crop as needed.
*/
export const OG_IMAGE = `${SITE_URL}/concertmash.png`;
export const OG_IMAGE_WIDTH = 2332;
export const OG_IMAGE_HEIGHT = 2008;

/**
Absolute URL helper for canonical / og:url tags.
*/
export const canonical = (path = '/') =>
  path === '/' ? `${SITE_URL}/` : `${SITE_URL}/${path.replace(/^\/+/, '')}`;
