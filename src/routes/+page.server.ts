import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, parent }) => {
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  if (code && state) {
    redirect(302, `/auth/callback?${url.searchParams.toString()}`);
  }

  const { user } = await parent();
  if (user) {
    redirect(302, '/app');
  }

  const oauthError = url.searchParams.get('error');
  return { oauthError };
};
