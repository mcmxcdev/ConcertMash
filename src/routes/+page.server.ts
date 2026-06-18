import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ url }) => {
  const oauthError = url.searchParams.get('error');
  return { oauthError };
};
