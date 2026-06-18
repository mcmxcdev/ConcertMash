import { error, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { setTokenCookies } from '$lib/server/spotifyCookies';
import {
  SPOTIFY_CLIENT_ID as CLIENT_ID,
  SPOTIFY_REDIRECT_URI as REDIRECT_URI,
} from '$lib/server/spotifyConfig';

export const GET: RequestHandler = async ({ url, cookies }) => {
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const oauthError = url.searchParams.get('error');

  if (oauthError) {
    redirect(302, `/?error=${encodeURIComponent(oauthError)}`);
  }

  const storedState = cookies.get('oauth_state');
  const codeVerifier = cookies.get('pkce_verifier');

  cookies.delete('oauth_state', { path: '/' });
  cookies.delete('pkce_verifier', { path: '/' });

  if (!code || !state || state !== storedState || !codeVerifier) {
    error(400, 'Invalid OAuth callback');
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      code_verifier: codeVerifier,
    }),
  });

  if (!response.ok) {
    error(502, 'Token exchange with Spotify failed');
  }

  const data = (await response.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
  };
  setTokenCookies(cookies, data, true);

  return new Response(null, {
    status: 302,
    headers: { Location: new URL('/app', url.origin).href },
  });
};
