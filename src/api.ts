import SpotifyWebApi from 'spotify-web-api-js';

import type { FormFields } from './utils/types';

const spotifyApi = new SpotifyWebApi();

export const MAXIMUM_LIMIT = 50;
export const MAXIMUM_OFFSET = 50;

// Token refresh function
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refresh_token');
  const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;

  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const url = 'https://accounts.spotify.com/api/token';
  const payload = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  };

  const response = await fetch(url, payload);

  if (!response.ok) {
    throw new Error(`Token refresh failed: ${response.statusText}`);
  }

  const tokenData = (await response.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
  };

  // Store new tokens
  localStorage.setItem('access_token', tokenData.access_token);
  if (tokenData.refresh_token) {
    localStorage.setItem('refresh_token', tokenData.refresh_token);
  }
  if (tokenData.expires_in) {
    const expiresAt = Date.now() + tokenData.expires_in * 1000;
    localStorage.setItem('expires_at', expiresAt.toString());
  }

  // Update API instance
  spotifyApi.setAccessToken(tokenData.access_token);

  return tokenData.access_token;
};

// Wrapper function to handle API calls with automatic token refresh
const apiCallWithRefresh = async <T>(apiCall: () => Promise<T>): Promise<T> => {
  try {
    return await apiCall();
  } catch (error: any) {
    // Check if error is due to expired token (401 status)
    if (error.status === 401) {
      try {
        await refreshAccessToken();
        // Retry the API call with new token
        return await apiCall();
      } catch (refreshError) {
        // If refresh fails, clear tokens and throw error
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('expires_at');
        throw refreshError;
      }
    }
    throw error;
  }
};

export const getMe = async () => {
  return await apiCallWithRefresh(() => spotifyApi.getMe());
};

export const createPlaylist = async (
  user: { id: string },
  values: FormFields,
) => {
  const { playlistTitle, playlistDescription, playlistVisibility } = values;

  const response = await apiCallWithRefresh(() =>
    spotifyApi.createPlaylist(user.id, {
      name: playlistTitle,
      description: playlistDescription,
      public: playlistVisibility === 'public',
    }),
  );
  return response;
};

export const searchArtists = async (searchValue: string) => {
  const response = await apiCallWithRefresh(() =>
    spotifyApi.searchArtists(searchValue, {
      type: 'artist',
      limit: 5,
    }),
  );
  return response;
};

export const getArtistAlbums = async (
  artistId: string,
  albumType: string,
  offset: number,
  limit = MAXIMUM_LIMIT,
) => {
  // We have to take care of filtering album type because Spotify includes "appears_on" album type by default
  // This is A LOT of albums and noise for popular artists like Coldplay for example
  const filterAlbumType = () => {
    switch (albumType) {
      case 'album': {
        return 'album,compilation';
      }
      case 'single': {
        return 'single';
      }
      default: {
        return 'single,album,compilation';
      }
    }
  };

  const response = await apiCallWithRefresh(() =>
    spotifyApi.getArtistAlbums(artistId, {
      limit: limit,
      offset: offset,
      include_groups: filterAlbumType(),
    }),
  );
  return response;
};

export const getArtistTopTracks = async (
  artistId: string,
  countryCode = 'US',
) => {
  const response = await apiCallWithRefresh(() =>
    spotifyApi.getArtistTopTracks(artistId, countryCode),
  );
  return response;
};

export const getAlbumTracks = async (albumId: string, offset: number) => {
  const response = await apiCallWithRefresh(() =>
    spotifyApi.getAlbumTracks(albumId, {
      limit: MAXIMUM_LIMIT,
      offset: offset,
    }),
  );
  return response;
};

export const addTracksToPlaylist = async (
  playlistId: string,
  trackUris: string[],
) => {
  const response = await apiCallWithRefresh(() =>
    spotifyApi.addTracksToPlaylist(playlistId, trackUris),
  );
  return response;
};

export const addCustomPlaylistCoverImage = async (
  playlistId: string,
  imageData: string,
) => {
  const response = await apiCallWithRefresh(() =>
    spotifyApi.uploadCustomPlaylistCoverImage(playlistId, imageData),
  );
  return response;
};
