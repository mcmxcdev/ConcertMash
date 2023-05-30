import SpotifyWebApi from 'spotify-web-api-js';

import type { FormFields } from './utils/types';

const spotifyApi = new SpotifyWebApi();

export const MAXIMUM_LIMIT = 50;
export const MAXIMUM_OFFSET = 50;

export const getMe = async () => {
  const response = await spotifyApi.getMe();
  return response;
};

export const createPlaylist = async (
  user: { id: string },
  values: FormFields,
) => {
  const { playlistTitle, playlistDescription, playlistVisibility } = values;

  const response = await spotifyApi.createPlaylist(user.id, {
    name: playlistTitle,
    description: playlistDescription,
    public: playlistVisibility === 'public' ? true : false,
  });
  return response;
};

export const searchArtists = async (searchValue: string) => {
  const response = await spotifyApi.searchArtists(searchValue, {
    type: 'artist',
    limit: 5,
  });
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

  const response = await spotifyApi.getArtistAlbums(artistId, {
    limit: limit,
    offset: offset,
    include_groups: filterAlbumType(),
  });
  return response;
};

export const getArtistTopTracks = async (
  artistId: string,
  countryCode = 'US',
) => {
  const response = await spotifyApi.getArtistTopTracks(artistId, countryCode);
  return response;
};

export const getAlbumTracks = async (albumId: string, offset: number) => {
  const response = await spotifyApi.getAlbumTracks(albumId, {
    limit: MAXIMUM_LIMIT,
    offset: offset,
  });
  return response;
};

export const addTracksToPlaylist = async (
  playlistId: string,
  trackUris: string[],
) => {
  const response = await spotifyApi.addTracksToPlaylist(playlistId, trackUris);
  return response;
};

export const addCustomPlaylistCoverImage = async (
  playlistId: string,
  imageData: string,
) => {
  const response = await spotifyApi.uploadCustomPlaylistCoverImage(
    playlistId,
    imageData,
  );
  return response;
};
