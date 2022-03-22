<script lang="ts">
  import { notifier } from '@beyonk/svelte-notifications';
  import pLimit from 'p-limit';
  import { createForm } from 'svelte-forms-lib';
  import Select from 'svelte-select';
  import Modal from 'svelte-simple-modal';
  import * as yup from 'yup';

  import { goto } from '$app/navigation';

  import {
    addCustomPlaylistCoverImage,
    addTracksToPlaylist,
    createPlaylist,
    getAlbumTracks,
    getArtistAlbums,
    getArtistTopTracks,
    searchArtists,
  } from '../api';
  import { storedUser } from '../stores';
  import ImageUpload from './ImageUpload.svelte';
  import ModalContent from './ModalContent.svelte';
  import RandomFactsOverlay from './RandomFactsOverlay.svelte';

  type Artist = { id: string; label: string; value: string };

  var limit = pLimit(1);

  let playlistId = '';
  let playlistImage = '';
  let allAlbumUris: string[] = [];
  let allTrackUris: string[] = [];
  let isGenerationDone = false;
  let playlistCreationPending = false;

  const handleSearchArtist = async (filterText: string) => {
    if (!filterText) {
      return [];
    }

    const response = await searchArtists(filterText);

    const artistSelecton = (response?.artists.items || []).map((artist) => {
      const artistGenre =
        artist.genres.length > 0 ? ` | ${artist.genres[0]}` : '';

      return {
        id: artist.id,
        label: artist.name + artistGenre,
        value: artist.name,
      };
    });

    return artistSelecton;
  };

  const fetchArtistAlbumsPaginated = async (
    artistId: string,
    albumType: string,
    offset = 0,
  ) => {
    const albumsFromArtist = await getArtistAlbums(artistId, albumType, offset);
    const albumUris = albumsFromArtist?.items.map((album) => album.id);

    if (albumUris && albumUris.length > 0) {
      allAlbumUris = [...allAlbumUris, ...albumUris];
    }

    if (albumsFromArtist?.next) {
      offset = offset + 50;
      await fetchArtistAlbumsPaginated(artistId, albumType, offset);
    }

    return allAlbumUris;
  };

  const fetchAlbumTracksPaginated = async (albumUri: string, offset = 0) => {
    const albumTracks = await getAlbumTracks(albumUri, offset);
    const albumTrackUris = albumTracks?.items.map((track) => track.uri);

    if (albumTrackUris && albumTrackUris.length > 0) {
      allTrackUris = [...allTrackUris, ...albumTrackUris];
    }

    if (albumTracks?.next) {
      offset = offset + 50;
      await fetchAlbumTracksPaginated(albumUri, offset);
    }

    return allTrackUris;
  };

  const fetchAllArtistSongs = async (
    artistIds: string[],
    albumType: string,
  ) => {
    const throttledArtistAlbumRequests: Promise<string[]>[] = [];
    artistIds.map((artistId) => {
      throttledArtistAlbumRequests.push(
        limit(() => fetchArtistAlbumsPaginated(artistId, albumType)),
      );
    });

    await Promise.all(throttledArtistAlbumRequests);

    const throttledAlbumTracksRequests: Promise<string[]>[] = [];
    allAlbumUris.map((albumUri) => {
      throttledAlbumTracksRequests.push(
        limit(() => fetchAlbumTracksPaginated(albumUri)),
      );
    });
    await Promise.all(throttledAlbumTracksRequests);
  };

  const fetchArtistTop10Songs = async (artistIds: string[]) => {
    const throttledArtistTopTracksRequests: Promise<SpotifyApi.ArtistsTopTracksResponse>[] =
      [];
    artistIds.map((artistId) => {
      throttledArtistTopTracksRequests.push(
        limit(() => getArtistTopTracks(artistId)),
      );
    });
    const allArtistTopTracks: SpotifyApi.ArtistsTopTracksResponse[] =
      await Promise.all(throttledArtistTopTracksRequests);
    const artistTopTrackUris = allArtistTopTracks.flatMap((tracks) =>
      tracks.tracks.map((track) => track.uri),
    );

    if (artistTopTrackUris.length > 0) {
      allTrackUris = [...allTrackUris, ...artistTopTrackUris];
    }
  };

  const handlePlaylistCreation = async (values: {
    playlistTitle: string;
    playlistDescription: string;
    songsPerArtist: string;
    playlistVisibility: string;
    artists: Artist[] | undefined;
    albumType: string;
  }) => {
    try {
      playlistCreationPending = true;

      const artistIds = (values.artists || []).map(
        (artist: Artist) => artist.id,
      );

      await (values.songsPerArtist === 'all'
        ? fetchAllArtistSongs(artistIds, values.albumType)
        : fetchArtistTop10Songs(artistIds));

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const createdPlaylist = await createPlaylist($storedUser!, values);
      if (createdPlaylist) {
        playlistId = createdPlaylist.id;
      }

      if (playlistImage && createdPlaylist) {
        await addCustomPlaylistCoverImage(playlistId, playlistImage);
      }

      const batchedTrackUris = [];
      const maxTracksPerRequestAllowed = 100;

      // Since the Spotify API can only handle 100 track URIs at a time,
      // we split up allTrackUris into size-limited arrays
      while (allTrackUris.length > 0) {
        batchedTrackUris.push(
          allTrackUris.splice(0, maxTracksPerRequestAllowed),
        );
      }

      const throttledAddTracksToPlaylistRequests: Promise<SpotifyApi.AddTracksToPlaylistResponse>[] =
        [];

      batchedTrackUris.map((trackUris) =>
        throttledAddTracksToPlaylistRequests.push(
          limit(() => addTracksToPlaylist(playlistId, trackUris)),
        ),
      );
      await Promise.all(throttledAddTracksToPlaylistRequests);

      handleReset();
      playlistImage = '';
      allAlbumUris = [];
      allTrackUris = [];
      isGenerationDone = true;
      playlistCreationPending = false;
    } catch (error: any) {
      playlistCreationPending = false;
      console.error(error);

      // Access token expired
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error.response.status === 401) {
        await goto('/');
      } else {
        notifier.danger("Couldn't create playlist. Please try again.", 3000);
      }
    }
  };

  const {
    form,
    errors,
    isValid,
    isSubmitting,
    handleChange,
    handleSubmit,
    handleReset,
  } = createForm({
    initialValues: {
      playlistTitle: '',
      playlistDescription: '',
      playlistVisibility: 'private',
      songsPerArtist: 'top10',
      albumType: 'both',
      artists: undefined,
    },
    validationSchema: yup.object().shape({
      playlistTitle: yup
        .string()
        .required('Playlist title is a required field.'),
      playlistDescription: yup.string(),
      playlistVisibility: yup
        .string()
        .required('Playlist visibility is a required field.'),
      songsPerArtist: yup
        .string()
        .required('Songs per artist is a required field.'),
      albumType: yup
        .string()
        .oneOf(['single', 'album', 'both'])
        .required('Album type is a required field.'),
      artists: yup
        .array()
        .of(
          yup.object().shape({
            id: yup.string(),
            label: yup.string(),
            value: yup.string(),
          }),
        )
        .typeError('Artists is a required field.')
        .required('Artists is a required field.'),
    }),
    onSubmit: async (values) => {
      await handlePlaylistCreation(values);
    },
  });

  type DropdownSelection = { id: string; label: string; value: string };

  const handleSelect = (event: Event & { detail: DropdownSelection }) => {
    // Open issue for $errors not updating without handleChange
    // See: https://github.com/tjinauyeung/svelte-forms-lib/issues/110
    // @ts-expect-error Type '{ id: string; label: string; value: string; }' is missing the following properties from type 'never[]': length, pop, push, concat, and 29 more.
    form.set({ ...$form, artists: event.detail });
    errors.set({ ...$errors, artists: '' });
  };

  const getSelectionLabel = (option: DropdownSelection) => option.value;
</script>

{#if playlistCreationPending}
  <RandomFactsOverlay />
{/if}

<section class="img-bg">
  <div class="gradient-bg">
    <div class="container mx-auto px-3 py-10">
      <div class="rounded-md bg-white px-4 py-8 md:p-12">
        <form method="post" on:submit={handleSubmit} name="playlistCreation">
          <h2 class="mb-10 text-3xl font-bold">Playlist Info</h2>

          <div class="grid grid-cols-3 gap-8">
            <div class="col-span-3 row-span-5 lg:col-span-1">
              <label for="playlistImage" class="input-label"
                >Playlist image <span class="text-xs text-gray-400"
                  >(jpeg, maximum 256kb)</span
                ></label
              >
              <ImageUpload bind:playlistImage />
            </div>
            <div class="col-span-3 lg:col-span-2">
              <label for="playlistTitle" class="input-label field-required"
                >Playlist title</label
              >
              <input
                type="text"
                name="playlistTitle"
                id="playlistTitle"
                class="input-field"
                class:!border-red-600={$errors.playlistTitle}
                on:keyup={handleChange}
                bind:value={$form.playlistTitle}
                placeholder="Coldplay Tour"
              />
              {#if $errors.playlistTitle}
                <small class="form-validation-error"
                  >{$errors.playlistTitle}</small
                >
              {/if}
            </div>

            <div class="col-span-3 lg:col-span-2">
              <label for="playlistDescription" class="input-label"
                >Playlist description</label
              >
              <input
                type="text"
                name="playlistDescription"
                id="playlistDescription"
                class="input-field"
                class:!border-red-600={$errors.playlistDescription}
                on:keyup={handleChange}
                bind:value={$form.playlistDescription}
                placeholder="Playlist for the Coldplay concert"
              />
              {#if $errors.playlistDescription}
                <small class="form-validation-error"
                  >{$errors.playlistDescription}</small
                >
              {/if}
            </div>

            <div class="col-span-3 lg:col-span-2">
              <div class="input-label field-required">Songs per artist</div>
              {#if $form.songsPerArtist === 'all'}
                <div
                  class="relative mb-3 rounded border border-gray-400 bg-gray-100 px-2 py-1 text-gray-700"
                  role="alert"
                >
                  <span class="block text-xs sm:inline"
                    ><span class="font-bold">Note: </span> The playlist generation
                    can fail with "All" mode for artists with lots of albums or compilations.
                    This is due to request limitations with the Spotify API.</span
                  >
                </div>
              {/if}
              <label class="my-3 mr-3 block lg:my-0 lg:inline">
                <input
                  type="radio"
                  name="songsPerArtist"
                  value="top10"
                  on:keyup={handleChange}
                  bind:group={$form.songsPerArtist}
                />
                Top 10
              </label>
              <label class="my-3 mr-3 block lg:my-0 lg:inline">
                <input
                  type="radio"
                  name="songsPerArtist"
                  value="all"
                  on:keyup={handleChange}
                  bind:group={$form.songsPerArtist}
                />
                All
              </label>
            </div>

            {#if $form.songsPerArtist === 'all'}
              <div class="col-span-3 lg:col-span-2">
                <div class="input-label field-required">Album type</div>
                <label class="my-3 mr-3 block lg:my-0 lg:inline">
                  <input
                    type="radio"
                    name="albumType"
                    value="both"
                    on:keyup={handleChange}
                    bind:group={$form.albumType}
                  />
                  Both</label
                >
                <label class="my-3 mr-3 block lg:my-0 lg:inline">
                  <input
                    type="radio"
                    name="albumType"
                    value="single"
                    on:keyup={handleChange}
                    bind:group={$form.albumType}
                  />
                  Singles and EPs
                </label>
                <label class="my-3 mr-3 block lg:my-0 lg:inline">
                  <input
                    type="radio"
                    name="albumType"
                    value="album"
                    on:keyup={handleChange}
                    bind:group={$form.albumType}
                  />
                  Albums</label
                >
              </div>
            {/if}

            <div class="col-span-3 lg:col-span-2">
              <div class="input-label field-required">Playlist visibility</div>
              <label class="my-3 mr-3 block lg:my-0 lg:inline">
                <input
                  type="radio"
                  name="playlistVisibility"
                  value="private"
                  on:keyup={handleChange}
                  bind:group={$form.playlistVisibility}
                />
                Private</label
              >
              <label class="my-3 mr-3 block lg:my-0 lg:inline">
                <input
                  type="radio"
                  name="playlistVisibility"
                  value="public"
                  on:keyup={handleChange}
                  bind:group={$form.playlistVisibility}
                />
                Public
              </label>
            </div>

            <div class="col-span-3">
              <label for="artists" class="input-label field-required"
                >Selected artists
              </label>
              <Select
                id="artists"
                value={$form.artists}
                loadOptions={handleSearchArtist}
                {getSelectionLabel}
                on:select={handleSelect}
                isMulti
                hasError={$errors.artists.length > 0}
                placeholder="Coldplay"
              />
              {#if $errors.artists.length > 0}
                <small class="form-validation-error">{$errors.artists}</small>
              {/if}
            </div>

            <div class="col-span-3 text-right">
              <button
                type="submit"
                class="btn-spotify disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!$isValid || $isSubmitting}
              >
                Create new playlist
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</section>

<Modal>
  <ModalContent {playlistId} {isGenerationDone} />
</Modal>

<style>
  :global(#artists) {
    /* Remove box shadow from @tailwindcss/forms on svelte-select */
    box-shadow: none;
    /* Fix ios zoom-in behavior */
    font-size: 16px;
  }
</style>
