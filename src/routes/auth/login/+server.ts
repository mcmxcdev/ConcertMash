import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
  SPOTIFY_CLIENT_ID as CLIENT_ID,
  SPOTIFY_REDIRECT_URI as REDIRECT_URI,
} from '$lib/server/spotifyConfig';
const SCOPES =
  'playlist-modify-public playlist-modify-private ugc-image-upload';

const generateRandomString = (length: number) => {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return bytes.reduce((acc, x) => acc + possible[x % possible.length], '');
};

const sha256 = async (plain: string) => {
  const data = new TextEncoder().encode(plain);
  return crypto.subtle.digest('SHA-256', data);
};

const base64encode = (input: ArrayBuffer) =>
  btoa(
    Array.from(new Uint8Array(input), (b) => String.fromCodePoint(b)).join(''),
  )
    .replaceAll('=', '')
    .replaceAll('+', '-')
    .replaceAll('/', '_');

export const GET: RequestHandler = async ({ cookies }) => {
  const codeVerifier = generateRandomString(64);
  const state = generateRandomString(16);
  const codeChallenge = base64encode(await sha256(codeVerifier));

  const cookieOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 600,
  };

  cookies.set('pkce_verifier', codeVerifier, cookieOpts);
  cookies.set('oauth_state', state, cookieOpts);

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    scope: SCOPES,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
    redirect_uri: REDIRECT_URI,
    state,
  });

  redirect(302, `https://accounts.spotify.com/authorize?${params}`);
};
