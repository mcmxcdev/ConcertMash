import type { FormFields } from './utils/types';

export const MAXIMUM_LIMIT = 50;
export const MAXIMUM_OFFSET = 50;

const spotifyRequest = async (
  path: string,
  options?: RequestInit,
): Promise<Response> => {
  const response = await fetch(`/api/spotify/${path}`, options);
  if (!response.ok) {
    if (response.status === 401) {
      globalThis.location.assign('/auth/login');
      throw new Error('Unauthenticated');
    }
    const err = Object.assign(
      new Error(`Spotify error: ${response.statusText}`),
      { status: response.status },
    );
    throw err;
  }
  return response;
};

const spotifyFetch = async <T>(
  path: string,
  options?: RequestInit,
): Promise<T> => {
  const response = await spotifyRequest(path, options);
  return response.json() as Promise<T>;
};

const filterAlbumType = (albumType: string) => {
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

export const getMe = () =>
  spotifyFetch<SpotifyApi.CurrentUsersProfileResponse>('me');

export const createPlaylist = (user: { id: string }, values: FormFields) => {
  const { playlistTitle, playlistDescription, playlistVisibility } = values;
  return spotifyFetch<SpotifyApi.CreatePlaylistResponse>(
    `users/${user.id}/playlists`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: playlistTitle,
        description: playlistDescription,
        public: playlistVisibility === 'public',
      }),
    },
  );
};

export const searchArtists = (searchValue: string) =>
  spotifyFetch<SpotifyApi.ArtistSearchResponse>(
    `search?q=${encodeURIComponent(searchValue)}&type=artist&limit=5`,
  );

export const getArtistAlbums = (
  artistId: string,
  albumType: string,
  offset: number,
  limit = MAXIMUM_LIMIT,
) =>
  spotifyFetch<SpotifyApi.ArtistsAlbumsResponse>(
    `artists/${artistId}/albums?limit=${String(limit)}&offset=${String(offset)}&include_groups=${filterAlbumType(albumType)}`,
  );

export const getArtistTopTracks = (artistId: string, countryCode = 'US') =>
  spotifyFetch<SpotifyApi.ArtistsTopTracksResponse>(
    `artists/${artistId}/top-tracks?market=${countryCode}`,
  );

export const getAlbumTracks = (albumId: string, offset: number) =>
  spotifyFetch<SpotifyApi.AlbumTracksResponse>(
    `albums/${albumId}/tracks?limit=${String(MAXIMUM_LIMIT)}&offset=${String(offset)}`,
  );

export const addTracksToPlaylist = (playlistId: string, trackUris: string[]) =>
  spotifyFetch<SpotifyApi.AddTracksToPlaylistResponse>(
    `playlists/${playlistId}/tracks`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uris: trackUris }),
    },
  );

export const addCustomPlaylistCoverImage = (
  playlistId: string,
  imageData: string,
) =>
  spotifyRequest(`playlists/${playlistId}/images`, {
    method: 'PUT',
    headers: { 'Content-Type': 'image/jpeg' },
    body: imageData,
  });
