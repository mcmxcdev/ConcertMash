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
    <div class="container mx-auto">
      <div class="py-44 flex items-center">
        <div class="w-1/2 text-white">
          <h1 class="text-5xl font-bold mb-10">ConcertMash</h1>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quisquam
            expedita sunt veniam repudiandae. Et magni odio nam atque deserunt
            tempore, debitis voluptatum iste repellat architecto, ad minima qui
            fuga placeat?
          </p>
        </div>

        <div class="w-1/2 text-center">
          <SpotifyButton {authorizeWithSpotify} />
        </div>
      </div>
    </div>
  </div>
</section>

<section class="py-16">
  <div class="container mx-auto">
    <h2 class="text-3xl font-bold mb-3 text-center">How it works</h2>

    <div class="mb-10 grid grid-cols-3 gap-6">
      <div class="col-span-1">
        <div class="px-5 py-10 bg-white shadow-lg rounded-md border">
          <Icon data={faMusic} class="mb-3" scale={1.5} />
          <h3 class="text-xl font-bold mb-3 step-color">Step 1</h3>
          <p>Log in with Spotify & verify your Spotify account</p>
        </div>
      </div>
      <div class="col-span-1">
        <div class="px-5 py-10 bg-white shadow-lg rounded-md border">
          <Icon data={faMusic} class="mb-3" scale={1.5} />
          <h3 class="text-xl font-bold mb-3 step-color">Step 2</h3>
          <p>Generate your Spotify Playlist</p>
        </div>
      </div>
      <div class="col-span-1">
        <div class="px-5 py-10 bg-white shadow-lg rounded-md border">
          <Icon data={faMusic} class="mb-3" scale={1.5} />
          <h3 class="text-xl font-bold mb-3 step-color">Step 3</h3>
          <p>Open up Spotify and listen to your newly created playlist!</p>
        </div>
      </div>
    </div>

    <div class="w-full text-center">
      <SpotifyButton {authorizeWithSpotify} />
    </div>

    <div class="mt-20 w-full">
      <div class="px-5 py-10 bg-white shadow-lg rounded-md border">
        <div class="flex items-center">
          <div class="w-1/2">
            <h2 class="text-3xl font-bold mb-3">Buy me a coffee</h2>
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Qui nemo
              iste neque, ad dicta temporibus tempore odio eius porro autem nisi
              modi perspiciatis at fugit dolorem est laudantium officia cum!
            </p>
          </div>
          <div class="w-1/2 text-center">
            <a
              href="https://www.buymeacoffee.com/mhatvan"
              target="_blank"
              rel="noopener noreferrer"
              class="btn-spotify">Buy me a coffee</a
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<style>
  .step-color {
    color: #1ed760;
  }
</style>
