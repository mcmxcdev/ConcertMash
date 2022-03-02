<script lang="ts">
  import { notifier } from '@beyonk/svelte-notifications';
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
    searchArtists,
  } from '../api';
  import { storedUser } from '../stores';
  import ImageUpload from './ImageUpload.svelte';
  import ModalContent from './ModalContent.svelte';

  type Artist = { id: string; label: string; value: string };

  var limit = pLimit(1);

  let playlistId = '';
  let playlistImage = '';
  let allAlbumUris: string[] = [];
  let allTrackUris: string[] = [];
  let isGenerationDone = false;

  const handleSearchArtist = async (filterText: string) => {
    const response = await searchArtists(filterText);

    const artistSelecton = (response?.artists.items || []).map((artist) => {
      return {
        id: artist.id,
        label: artist.name,
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
    artists: Artist[];
    albumType: string;
  }) => {
    if ($storedUser) {
      try {
        const createdPlaylist = await createPlaylist($storedUser, values);
        if (createdPlaylist) {
          playlistId = createdPlaylist.id;
        }

        if (playlistImage && createdPlaylist) {
          await addCustomPlaylistCoverImage(playlistId, playlistImage);
        }

        const artistIds = values.artists.map((artist: Artist) => artist.id);

        await (values.songsPerArtist === 'all'
          ? fetchAllArtistSongs(artistIds, values.albumType)
          : fetchArtistTop10Songs(artistIds));

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
      } catch (error) {
        console.error(error);
        notifier.danger("Couldn't create playlist.", 3000);
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
    validateField,
  } = createForm({
    initialValues: {
      playlistTitle: '',
      playlistDescription: '',
      playlistVisibility: 'private',
      songsPerArtist: 'top10',
      albumType: 'both',
      artists: [],
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
        .strict()
        .min(1, 'Artists is a required field.')
        .typeError('Artists is a required field.'),
    }),
    onSubmit: async (values) => {
      await handlePlaylistCreation(values);
    },
  });

  const handleSelect = async (
    event: Event & { detail: { id: string; label: string; value: string } },
  ) => {
    // Open issue for $errors not updating without handleChange
    // See: https://github.com/tjinauyeung/svelte-forms-lib/issues/110
    // @ts-expect-error Type '{ id: string; label: string; value: string; }' is missing the following properties from type 'never[]': length, pop, push, concat, and 29 more.
    form.set({ ...$form, artists: event.detail });
    errors.set({ ...$errors, artists: '' });
    await validateField('artists');
  };
</script>

<svelte:head>
  <title>Playlist Info | ConcertMash</title>
</svelte:head>

<section class="img-bg">
  <div class="gradient-bg">
    <div class="py-10 container mx-auto">
      <div class="p-12 bg-white rounded-md">
        <form method="post" on:submit={handleSubmit} name="playlistCreation">
          <h2 class="text-3xl font-bold mb-10">Playlist Info</h2>

          <div class="grid grid-cols-3 gap-8">
            <div class="row-span-5 col-span-3 md:col-span-1">
              <label for="playlistImage" class="input-label"
                >Playlist Image (optional)</label
              >
              <ImageUpload bind:playlistImage />
            </div>
            <div class="col-span-3 md:col-span-2">
              <label for="playlistTitle" class="input-label"
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
                placeholder="e.g. Coldplay Tour"
              />
              {#if $errors.playlistTitle}
                <small class="form-validation-error"
                  >{$errors.playlistTitle}</small
                >
              {/if}
            </div>

            <div class="col-span-3 md:col-span-2">
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
                placeholder="e.g. Playlist for the Coldplay concert"
              />
              {#if $errors.playlistDescription}
                <small class="form-validation-error"
                  >{$errors.playlistDescription}</small
                >
              {/if}
            </div>

            <div class="col-span-3 md:col-span-2">
              <label for="songsPerArtist" class="block input-label mb-0">
                Songs per artist
              </label>
              <label class="mr-3">
                <input
                  type="radio"
                  name="songsPerArtist"
                  value="all"
                  on:keyup={handleChange}
                  bind:group={$form.songsPerArtist}
                />
                All
              </label>
              <label>
                <input
                  type="radio"
                  name="songsPerArtist"
                  value="top10"
                  on:keyup={handleChange}
                  bind:group={$form.songsPerArtist}
                />
                Top 10
              </label>
            </div>

            <div class="col-span-3 md:col-span-2">
              <label for="playlistVisibility" class="block input-label mb-0">
                Playlist visibility
              </label>
              <label class="mr-3">
                <input
                  type="radio"
                  name="playlistVisibility"
                  value="public"
                  on:keyup={handleChange}
                  bind:group={$form.playlistVisibility}
                />
                Public
              </label>
              <label>
                <input
                  type="radio"
                  name="playlistVisibility"
                  value="private"
                  on:keyup={handleChange}
                  bind:group={$form.playlistVisibility}
                />
                Private</label
              >
            </div>

            <div class="col-span-3 md:col-span-2">
              <label for="albumType" class="block input-label mb-0">
                Album type
              </label>
              <label class="mr-3">
                <input
                  type="radio"
                  name="albumType"
                  value="single"
                  on:keyup={handleChange}
                  bind:group={$form.albumType}
                />
                Singles and EPs
              </label>
              <label class="mr-3">
                <input
                  type="radio"
                  name="albumType"
                  value="album"
                  on:keyup={handleChange}
                  bind:group={$form.albumType}
                />
                Albums</label
              >
              <label>
                <input
                  type="radio"
                  name="albumType"
                  value="both"
                  on:keyup={handleChange}
                  bind:group={$form.albumType}
                />
                Both</label
              >
            </div>

            <div class="col-span-3">
              <label for="artists" class="input-label">Artists</label>
              <Select
                id="artists"
                value={$form.artists}
                loadOptions={handleSearchArtist}
                on:select={handleSelect}
                isMulti
                hasError={$errors.artists.length > 0}
                placeholder="e.g. Coldplay"
              />
              {#if $errors.artists.length > 0}
                <small class="form-validation-error">{$errors.artists}</small>
              {/if}
            </div>

            <div class="col-span-3 text-right">
              <button
                type="submit"
                class="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
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
  /* Remove box shadow from @tailwindcss/forms on svelte-select */
  :global(#artists) {
    box-shadow: none;
  }
</style>
