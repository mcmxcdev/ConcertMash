import { error, type RequestHandler } from '@sveltejs/kit';
import { getValidAccessToken } from '$lib/server/spotifyCookies';

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

const handler: RequestHandler = async ({ request, params, url, cookies }) => {
  const accessToken = await getValidAccessToken(cookies);

  if (!accessToken) {
    error(401, 'Not authenticated');
  }

  const spotifyUrl = new URL(`${SPOTIFY_API_BASE}/${params.path ?? ''}`);
  if (!spotifyUrl.href.startsWith(SPOTIFY_API_BASE)) {
    error(400, 'Invalid path');
  }
  for (const [key, value] of url.searchParams) {
    spotifyUrl.searchParams.set(key, value);
  }

  const contentType = request.headers.get('Content-Type');
  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
  };
  if (contentType) headers['Content-Type'] = contentType;

  const body =
    request.method !== 'GET' && request.method !== 'HEAD'
      ? await request.arrayBuffer()
      : undefined;

  const response = await fetch(spotifyUrl, {
    method: request.method,
    headers,
    body,
  });
  const responseBody = await response.arrayBuffer();

  return new Response(responseBody, {
    status: response.status,
    headers: {
      'Content-Type':
        response.headers.get('Content-Type') ?? 'application/json',
    },
  });
};

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
