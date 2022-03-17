<script lang="ts">
  import { faMusic } from '@fortawesome/free-solid-svg-icons';
  import SpotifyApi from 'spotify-web-api-js';
  import { onMount } from 'svelte';
  import Icon from 'svelte-awesome';

  import { goto } from '$app/navigation';

  import { getMe } from '../api';
  import { storedToken, storedUser } from '../stores';
  import SpotifyButton from './SpotifyButton.svelte';

  const spotifyApi = new SpotifyApi();
  const authEndpoint = 'https://accounts.spotify.com/authorize';
  const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_APP_BASE_URL;
  const scopes = [
    'playlist-modify-private',
    'user-library-modify',
    'ugc-image-upload',
  ];

  const authorizeWithSpotify = () => {
    const spotifyAuthURL = `${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join(
      '%20',
    )}&response_type=token&show_dialog=true`;

    window.location.href = spotifyAuthURL;
  };

  const setAccessToken = () => {
    const hashFromURL: {
      access_token: string;
      expires_in: string;
      token_type: string;
    } = window.location.hash
      .slice(1)
      .split('&')
      .reduce(
        function (
          initial: {
            access_token: string;
            expires_in: string;
            token_type: string;
          },
          item,
        ) {
          if (item) {
            var parts = item.split('=');
            // @ts-expect-error Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ access_token: string; expires_in: string; token_type: string; }'.
            initial[parts[0]] = decodeURIComponent(parts[1]);
          }
          return initial;
        },
        { access_token: '', expires_in: '', token_type: '' },
      );

    storedToken.set(hashFromURL.access_token);
    spotifyApi.setAccessToken($storedToken);
  };

  const getUserInformation = async () => {
    try {
      const response = await getMe();
      storedUser.set(response);
    } catch {
      storedToken.set(null);
      storedUser.set(undefined);
      await goto('/');
    }
  };

  onMount(() => {
    setAccessToken();

    if ($storedToken) {
      void getUserInformation();
    }
  });
</script>

<svelte:head>
  <title>Home | ConcertMash</title>
</svelte:head>

<section class="img-bg">
  <div class="gradient-bg">
    <div class="container mx-auto px-3">
      <div class="grid grid-cols-2 items-center gap-6 py-20 md:py-44">
        <div class="col-span-2 text-white md:col-span-1">
          <h1
            class="mb-10 inline-flex items-center text-3xl font-bold md:text-5xl"
          >
            <img src="/favicon.svg" alt="" class="mr-3 h-10 w-10" />

            ConcertMash
          </h1>
          <p class="mb-3">
            Are you tired of creating your playlists for upcoming concerts or
            festivals manually?
          </p>
          <p class="mb-3">
            With ConcertMash, you simply enter the artists, choose which song
            types should be included, and your playlist will be ready in
            seconds.
          </p>
          <p>Just login with Spotify and get started right away!</p>
        </div>

        <div class="col-span-2 text-center md:col-span-1">
          <SpotifyButton {authorizeWithSpotify} />
        </div>
      </div>
    </div>
  </div>
</section>

<section class="py-16">
  <div class="container mx-auto px-3 ">
    <h2 class="mb-3 text-center text-3xl font-bold">How it works</h2>

    <div class="mb-10 grid h-full grid-cols-3 gap-6">
      <div class="col-span-3 flex flex-col md:col-span-1 md:flex-row">
        <div class="relative rounded-md border bg-white px-5 py-10 shadow-lg">
          <div class="green-dot" />
          <div class="blue-dot" />
          <Icon data={faMusic} class="mb-3" scale={1.5} />
          <h3 class="step-color mb-3 text-xl font-bold">Step 1</h3>
          <p>Log in with Spotify to provide access</p>
        </div>
      </div>
      <div class="col-span-3 flex flex-col md:col-span-1 md:flex-row">
        <div class="rounded-md border bg-white px-5 py-10 shadow-lg">
          <Icon data={faMusic} class="mb-3" scale={1.5} />
          <h3 class="step-color mb-3 text-xl font-bold">Step 2</h3>
          <p>Generate your desired playlist by filling out a simple form</p>
        </div>
      </div>
      <div class="col-span-3 flex flex-col md:col-span-1 md:flex-row">
        <div class="relative rounded-md border bg-white px-5 py-10 shadow-lg">
          <div class="green-dot-2" />
          <div class="blue-dot-2" />
          <Icon data={faMusic} class="mb-3" scale={1.5} />
          <h3 class="step-color mb-3 text-xl font-bold">Step 3</h3>
          <p>Open up Spotify and listen to your newly-created playlist!</p>
        </div>
      </div>
    </div>

    <div class="w-full text-center">
      <SpotifyButton {authorizeWithSpotify} />
    </div>
  </div>
</section>

<style lang="postcss">
  .step-color {
    @apply text-spotify-hover-green;
  }
</style>
