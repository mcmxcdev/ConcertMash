import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { clearAuthCookies } from '$lib/server/spotifyCookies';

export const POST: RequestHandler = ({ cookies }) => {
  clearAuthCookies(cookies);
  redirect(302, '/');
};
