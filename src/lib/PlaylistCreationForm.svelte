<script lang="ts">
  import { toast } from '@zerodevx/svelte-toast';
  import pLimit from 'p-limit';
  import { createForm } from 'svelte-forms-lib';
  import Select from 'svelte-select';
  import Modal from 'svelte-simple-modal';
  import * as yup from 'yup';

  import {
    addCustomPlaylistCoverImage,
    addTracksToPlaylist,
    createPlaylist,
    getAlbumTracks,
    getArtistAlbums,
    getArtistTopTracks,
    MAXIMUM_LIMIT,
    MAXIMUM_OFFSET,
    searchArtists,
  } from '../api';
  import { storedUser } from '../stores';
  import type { FormFields, SelectValues } from '../utils/types';
  import ImageUpload from './ImageUpload.svelte';
  import ModalContent from './ModalContent.svelte';
  import RandomFactsOverlay from './RandomFactsOverlay.svelte';

  const plimit = pLimit(1);

  let playlistId = '';
  let playlistImage = '';
  let allAlbumUris: string[] = [];
  let allTrackUris: string[] = [];
  let isGenerationDone = false;
  let playlistCreationPending = false;

  const MOST_RECENT_RELEASE_LIMIT = 1;

  const handleSearchArtist = async (filterText: string) => {
    if (filterText === '') {
      return [];
    }

    try {
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
    } catch (error) {
      // Access token expired
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error.status === 401) {
        toast.push('Hello world!', {
          theme: {
            '--toastColor': '#FFFFFF',
            '--toastBackground': '#BB2124',
            '--toastBarBackground': '#0000004D',
          },
        });
        window.location.reload();
      }
    }
  };

  const fetchArtistAlbumsPaginated = async (
    artistId: string,
    albumType: string,
    offset = 0,
    limit = MAXIMUM_LIMIT,
  ) => {
    const albumsFromArtist = await getArtistAlbums(
      artistId,
      albumType,
      offset,
      limit,
    );
    const albumUris = albumsFromArtist.items.map((album) => album.id);

    if (albumUris && albumUris.length > 0) {
      allAlbumUris = [...allAlbumUris, ...albumUris];
    }

    // Whenever the selected songs per artist mode is "top10-and-most-recent-release",
    // we need to opt out the recursive behavior based on the limit parameter to avoid fetching more albums than one
    if (albumsFromArtist.next && limit !== MOST_RECENT_RELEASE_LIMIT) {
      offset = offset + MAXIMUM_OFFSET;
      await fetchArtistAlbumsPaginated(artistId, albumType, offset);
    }

    return allAlbumUris;
  };

  const excludeCertainTracks = (trackName: string) => {
    const lowercasedTrackName = trackName.toLowerCase();

    let shouldExcludeTrack = false;

    if ($form.excludedSongTypes.includes('live')) {
      const liveExclusionCriteria = [
        ' (Live)',
        ' [Live]',
        ' - Live',
        ' - Audiotree Live Version',
      ];

      if (
        liveExclusionCriteria.some((criteria) =>
          lowercasedTrackName.includes(criteria),
        )
      ) {
        shouldExcludeTrack = true;
      }
    }

    if ($form.excludedSongTypes.includes('instrumentals')) {
      const instrumentalExclusionCriteria = 'instrumental';

      if (lowercasedTrackName.includes(instrumentalExclusionCriteria)) {
        shouldExcludeTrack = true;
      }
    }

    if ($form.excludedSongTypes.includes('commentary')) {
      const commentaryExclusionCriteria = 'commentary';

      if (lowercasedTrackName.includes(commentaryExclusionCriteria)) {
        shouldExcludeTrack = true;
      }
    }

    if ($form.excludedSongTypes.includes('demo')) {
      // We want to include the hypen in the check,
      // since there could be song titles like "Demons" or similar
      const demoExclusionCriteria = ' - demo';

      if (lowercasedTrackName.includes(demoExclusionCriteria)) {
        shouldExcludeTrack = true;
      }
    }

    if ($form.excludedSongTypes.includes('remix')) {
      const remixExclusionCriteria = 'remix';

      if (lowercasedTrackName.includes(remixExclusionCriteria)) {
        shouldExcludeTrack = true;
      }
    }

    return shouldExcludeTrack;
  };

  const fetchAlbumTracksPaginated = async (albumUri: string, offset = 0) => {
    const albumTracks = await getAlbumTracks(albumUri, offset);
    const albumTrackUris = albumTracks.items
      .filter((track) => !excludeCertainTracks(track.name))
      .map((track) => track.uri);

    if (albumTrackUris && albumTrackUris.length > 0) {
      allTrackUris = [...allTrackUris, ...albumTrackUris];
    }

    if (albumTracks.next) {
      offset = offset + MAXIMUM_OFFSET;
      await fetchAlbumTracksPaginated(albumUri, offset);
    }

    return allTrackUris;
  };

  const fetchAllArtistSongs = async (
    artistIds: string[],
    albumType: string,
    offset = 0,
    limit = MAXIMUM_LIMIT,
  ) => {
    const throttledArtistAlbumRequests: Promise<string[]>[] = [];
    artistIds.map((artistId) => {
      throttledArtistAlbumRequests.push(
        plimit(() =>
          fetchArtistAlbumsPaginated(artistId, albumType, offset, limit),
        ),
      );
    });
    await Promise.all(throttledArtistAlbumRequests);

    const throttledAlbumTracksRequests: Promise<string[]>[] = [];
    allAlbumUris.map((albumUri) => {
      throttledAlbumTracksRequests.push(
        plimit(() => fetchAlbumTracksPaginated(albumUri)),
      );
    });
    await Promise.all(throttledAlbumTracksRequests);
  };

  const fetchArtistTop10Songs = async (artistIds: string[]) => {
    const throttledArtistTopTracksRequests: Promise<SpotifyApi.ArtistsTopTracksResponse>[] =
      [];
    artistIds.map((artistId) => {
      throttledArtistTopTracksRequests.push(
        plimit(() => getArtistTopTracks(artistId)),
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

  const handlePlaylistCreation = async (values: FormFields) => {
    try {
      playlistCreationPending = true;

      const artistIds = values.artists.map((artist: SelectValues) => artist.id);

      switch (values.songsPerArtist) {
        case 'top10': {
          await fetchArtistTop10Songs(artistIds);
          break;
        }
        case 'top10-and-most-recent-release': {
          await fetchArtistTop10Songs(artistIds);

          await fetchAllArtistSongs(
            artistIds,
            values.albumType,
            undefined,
            MOST_RECENT_RELEASE_LIMIT,
          );
          break;
        }
        case 'all': {
          await fetchAllArtistSongs(artistIds, values.albumType);
          break;
        }
      }

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
          plimit(() => addTracksToPlaylist(playlistId, trackUris)),
        ),
      );
      await Promise.all(throttledAddTracksToPlaylistRequests);

      handleReset();
      playlistImage = '';
      allAlbumUris = [];
      allTrackUris = [];
      isGenerationDone = true;
      playlistCreationPending = false;
    } catch (error) {
      playlistCreationPending = false;
      console.error(error);

      // Access token expired
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error.status === 401) {
        window.location.reload();
      } else {
        toast.push("Couldn't create playlist. Please try again.", {
          theme: {
            '--toastColor': '#FFFFFF',
            '--toastBackground': '#BB2124',
            '--toastBarBackground': '#0000004D',
          },
        });
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
  } = createForm<FormFields>({
    initialValues: {
      playlistTitle: '',
      playlistDescription: '',
      playlistVisibility: 'private',
      songsPerArtist: 'top10-and-most-recent-release',
      albumType: 'both',
      artists: [],
      excludedSongTypes: [
        'live',
        'instrumentals',
        'commentary',
        'demo',
        'remix',
      ],
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
        .oneOf(['top10', 'top10-and-most-recent-release', 'all'])
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
        .min(1, 'Artists is a required field.')
        .typeError('Artists is a required field.')
        .required('Artists is a required field.'),
      excludedSongTypes: yup
        .array()
        .of(
          yup
            .string()
            .oneOf(['live', 'instrumentals', 'commentary', 'demo', 'remix']),
        ),
    }),
    onSubmit: async (values) => {
      await handlePlaylistCreation(values);
    },
  });

  const handleSelect = (event: Event & { detail: SelectValues }) => {
    // Open issue for $errors not updating without handleChange
    // See: https://github.com/tjinauyeung/svelte-forms-lib/issues/110
    form.set({ ...$form, artists: [...$form.artists, event.detail] });
    errors.set({ ...$errors, artists: '' });
  };

  const handleClear = (event: Event & { detail: SelectValues }) => {
    const filteredArtists = $form.artists.filter(
      (artist) => artist.id !== event.detail.id,
    );

    form.set({ ...$form, artists: filteredArtists });
    errors.set({ ...$errors, artists: '' });
  };
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
            <div class="col-span-3 row-span-6 lg:col-span-1">
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
                    could fail with "All" mode for artists with lots of albums or
                    compilations. This is due to request limitations with the Spotify
                    API.</span
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
                  value="top10-and-most-recent-release"
                  on:keyup={handleChange}
                  bind:group={$form.songsPerArtist}
                />
                Top 10 + Most recent release
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

            {#if $form.songsPerArtist !== 'top10'}
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
              <div class="input-label">Excluded song types</div>
              <label class="my-3 mr-3 block lg:my-0 lg:inline">
                <input
                  type="checkbox"
                  name="excludedSongTypes"
                  value="live"
                  on:keyup={handleChange}
                  bind:group={$form.excludedSongTypes}
                />
                Live</label
              >
              <label class="my-3 mr-3 block lg:my-0 lg:inline">
                <input
                  type="checkbox"
                  name="excludedSongTypes"
                  value="instrumentals"
                  on:keyup={handleChange}
                  bind:group={$form.excludedSongTypes}
                />
                Instrumentals
              </label>
              <label class="my-3 mr-3 block lg:my-0 lg:inline">
                <input
                  type="checkbox"
                  name="excludedSongTypes"
                  value="commentary"
                  on:keyup={handleChange}
                  bind:group={$form.excludedSongTypes}
                />
                Commentary
              </label>
              <label class="my-3 mr-3 block lg:my-0 lg:inline">
                <input
                  type="checkbox"
                  name="excludedSongTypes"
                  value="demo"
                  on:keyup={handleChange}
                  bind:group={$form.excludedSongTypes}
                />
                Demo
              </label>
              <label class="my-3 mr-3 block lg:my-0 lg:inline">
                <input
                  type="checkbox"
                  name="excludedSongTypes"
                  value="remix"
                  on:keyup={handleChange}
                  bind:group={$form.excludedSongTypes}
                />
                Remix
              </label>
            </div>

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
                on:select={handleSelect}
                on:clear={handleClear}
                multiple
                hasError={$errors.artists.length > 0}
                placeholder="Coldplay"
                hideEmptyState
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
