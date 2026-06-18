import type { Cookies } from '@sveltejs/kit';

import { SPOTIFY_CLIENT_ID } from './spotifyConfig';

const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const REFRESH_TOKEN_LIFETIME_MS = 180 * 24 * 60 * 60 * 1000; // 180 days
const EXPIRY_BUFFER_MS = 5 * 60 * 1000;

type TokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
};

type RefreshResult =
  | { status: 'ok'; data: TokenResponse }
  | { status: 'invalid_grant' }
  | { status: 'error' };

let refreshInFlight: Promise<RefreshResult> | null = null;
let refreshInFlightFor: string | null = null;

const cookieOpts = (maxAge: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge,
});

const parseCookieTimestamp = (value: string | undefined): number | null => {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const refreshTokenFromSpotify = async (
  refreshToken: string,
): Promise<RefreshResult> => {
  try {
    const response = await fetch(SPOTIFY_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: SPOTIFY_CLIENT_ID,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      if (data.error === 'invalid_grant') {
        return { status: 'invalid_grant' };
      }
      return { status: 'error' };
    }

    return {
      status: 'ok',
      data: (await response.json()) as TokenResponse,
    };
  } catch {
    return { status: 'error' };
  }
};

const getSharedRefresh = (refreshToken: string): Promise<RefreshResult> => {
  if (refreshInFlight && refreshInFlightFor === refreshToken) {
    return refreshInFlight;
  }

  refreshInFlightFor = refreshToken;
  // eslint-disable-next-line unicorn/prefer-await
  refreshInFlight = refreshTokenFromSpotify(refreshToken).finally(() => {
    refreshInFlight = null;
    refreshInFlightFor = null;
  });
  return refreshInFlight;
};

export const clearAuthCookies = (cookies: Cookies) => {
  for (const name of [
    'spotify_access_token',
    'spotify_refresh_token',
    'spotify_expires_at',
    'spotify_refresh_token_issued_at',
  ]) {
    cookies.delete(name, { path: '/' });
  }
};

export const setTokenCookies = (
  cookies: Cookies,
  data: { access_token: string; refresh_token?: string; expires_in: number },
  isNewAuth = false,
) => {
  cookies.set(
    'spotify_access_token',
    data.access_token,
    cookieOpts(data.expires_in),
  );
  if (data.refresh_token) {
    cookies.set(
      'spotify_refresh_token',
      data.refresh_token,
      cookieOpts(REFRESH_TOKEN_LIFETIME_MS / 1000),
    );
  }
  cookies.set(
    'spotify_expires_at',
    (Date.now() + data.expires_in * 1000).toString(),
    cookieOpts(REFRESH_TOKEN_LIFETIME_MS / 1000),
  );
  if (isNewAuth) {
    cookies.set(
      'spotify_refresh_token_issued_at',
      Date.now().toString(),
      cookieOpts(REFRESH_TOKEN_LIFETIME_MS / 1000),
    );
  }
};

export const getValidAccessToken = async (
  cookies: Cookies,
): Promise<string | null> => {
  const accessToken = cookies.get('spotify_access_token');
  const refreshToken = cookies.get('spotify_refresh_token');
  const expiresAt = cookies.get('spotify_expires_at');
  const refreshTokenIssuedAt = cookies.get('spotify_refresh_token_issued_at');

  if (!refreshToken) return null;

  if (refreshTokenIssuedAt) {
    const issuedAt = parseCookieTimestamp(refreshTokenIssuedAt);
    if (issuedAt === null) {
      clearAuthCookies(cookies);
      return null;
    }
    if (Date.now() > issuedAt + REFRESH_TOKEN_LIFETIME_MS) {
      clearAuthCookies(cookies);
      return null;
    }
  }

  const expiresAtMs = parseCookieTimestamp(expiresAt);
  if (
    accessToken &&
    expiresAtMs !== null &&
    Date.now() < expiresAtMs - EXPIRY_BUFFER_MS
  ) {
    return accessToken;
  }

  const result = await getSharedRefresh(refreshToken);

  if (result.status === 'invalid_grant') {
    clearAuthCookies(cookies);
    return null;
  }
  if (result.status !== 'ok') {
    return null;
  }

  setTokenCookies(cookies, result.data);
  return result.data.access_token;
};
