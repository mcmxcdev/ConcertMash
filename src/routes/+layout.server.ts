import type { LayoutServerLoad } from './$types';
import { getValidAccessToken } from '$lib/server/spotifyCookies';

export const load: LayoutServerLoad = async ({ cookies }) => {
  const accessToken = await getValidAccessToken(cookies);

  if (!accessToken) {
    return { user: null };
  }

  try {
    const response = await fetch('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) return { user: null };
    return {
      user: (await response.json()) as SpotifyApi.CurrentUsersProfileResponse,
    };
  } catch {
    return { user: null };
  }
};
