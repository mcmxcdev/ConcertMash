<script lang="ts">
  import { faMusic } from '@fortawesome/free-solid-svg-icons';
  import SpotifyApi from 'spotify-web-api-js';
  import { onMount } from 'svelte';
  import Icon from 'svelte-awesome';

  import { goto } from '$app/navigation';

  import { getMe } from '../api';
  import { storedToken, storedUser } from '../stores';
  import SpotifyButton from './SpotifyButton.svelte';
  import { SvelteURL } from 'svelte/reactivity';
  import { resolve } from '$app/paths';

  const spotifyApi = new SpotifyApi();
  const authEndpoint = new SvelteURL('https://accounts.spotify.com/authorize');
  const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_APP_BASE_URL;
  const scopes =
    'playlist-modify-public playlist-modify-private ugc-image-upload';

  const generateRandomString = (length: number) => {
    const possible =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const values = crypto.getRandomValues(new Uint8Array(length));
    return values.reduce((acc, x) => acc + possible[x % possible.length], '');
  };

  const sha256 = (plain: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    return globalThis.crypto.subtle.digest('SHA-256', data);
  };

  const base64encode = (input: ArrayBuffer) => {
    return btoa(String.fromCodePoint(...new Uint8Array(input)))
      .replaceAll('=', '')
      .replaceAll('+', '-')
      .replaceAll('/', '_');
  };

  const authorizeWithSpotify = async () => {
    const codeVerifier = generateRandomString(64);
    const state = generateRandomString(16);

    const hashed = await sha256(codeVerifier);
    const codeChallenge = base64encode(hashed);

    globalThis.localStorage.setItem('code_verifier', codeVerifier);
    globalThis.localStorage.setItem('state', state);

    const params = {
      response_type: 'code',
      client_id: clientId,
      scope: scopes,
      code_challenge_method: 'S256',
      code_challenge: codeChallenge,
      redirect_uri: redirectUri,
      state: state,
    };

    authEndpoint.search = new URLSearchParams(params).toString();
    globalThis.location.href = authEndpoint.toString();
  };

  const getToken = async (code: string, state: string) => {
    const storedState = globalThis.localStorage.getItem('state');
    const codeVerifier = globalThis.localStorage.getItem('code_verifier');

    // Verify state parameter to prevent CSRF attacks
    if (state !== storedState) {
      console.error('State parameter mismatch');
      return;
    }

    if (!codeVerifier) {
      console.error('No code verifier found');
      return;
    }

    const url = 'https://accounts.spotify.com/api/token';
    const payload = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      }),
    };

    try {
      const response = await fetch(url, payload);

      if (!response.ok) {
        throw new Error(`Token exchange failed: ${response.statusText}`);
      }

      const tokenData = (await response.json()) as {
        access_token: string;
        refresh_token?: string;
        expires_in?: number;
      };

      localStorage.setItem('access_token', tokenData.access_token);

      if (tokenData.refresh_token) {
        localStorage.setItem('refresh_token', tokenData.refresh_token);
      }

      if (tokenData.expires_in) {
        const expiresAt = Date.now() + tokenData.expires_in * 1000;
        localStorage.setItem('expires_at', expiresAt.toString());
      }

      // Set token in store and API
      storedToken.set(tokenData.access_token);
      spotifyApi.setAccessToken(tokenData.access_token);

      // Clean up stored PKCE data
      localStorage.removeItem('code_verifier');
      localStorage.removeItem('state');

      // Get user information
      await getUserInformation();
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      // Clean up on error
      localStorage.removeItem('code_verifier');
      localStorage.removeItem('state');
    }
  };

  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem('refresh_token');

    if (!refreshToken) {
      console.error('No refresh token available');
      return false;
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

    try {
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

      // Update store and API
      storedToken.set(tokenData.access_token);
      spotifyApi.setAccessToken(tokenData.access_token);

      return true;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return false;
    }
  };

  const checkAndRefreshToken = async () => {
    const expiresAt = localStorage.getItem('expires_at');
    const accessToken = localStorage.getItem('access_token');

    if (!accessToken) {
      return false;
    }

    // Check if token is expired or will expire in the next 5 minutes
    if (expiresAt && Date.now() > Number.parseInt(expiresAt) - 300_000) {
      const refreshed = await refreshAccessToken();

      if (!refreshed) {
        // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('expires_at');
        storedToken.set(null);
        storedUser.set(undefined);
        return false;
      }
    }

    return true;
  };

  const getUserInformation = async () => {
    try {
      const response = await getMe();
      storedUser.set(response);
    } catch (error) {
      console.error('Error getting user information:', error);
      // If getting user info fails, try to refresh token
      const refreshed = await refreshAccessToken();

      if (refreshed) {
        // Retry getting user info with new token
        try {
          const response = await getMe();
          storedUser.set(response);
        } catch {
          storedToken.set(null);
          storedUser.set(undefined);
          await goto(resolve('/'));
        }
      } else {
        storedToken.set(null);
        storedUser.set(undefined);
        await goto(resolve('/'));
      }
    }
  };

  onMount(() => {
    // Check for authorization code in URL (callback from Spotify)
    const urlParams = new URLSearchParams(globalThis.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');

    if (error) {
      console.error('Authorization error:', error);
      // Clean up URL parameters
      // eslint-disable-next-line svelte/no-navigation-without-resolve
      void goto(globalThis.location.pathname, { replaceState: true });
      return;
    }

    if (code && state) {
      // Handle authorization callback
      void getToken(code, state);
      // Clean up URL parameters
      // eslint-disable-next-line svelte/no-navigation-without-resolve
      void goto(globalThis.location.pathname, { replaceState: true });
    } else {
      // Check for existing valid token
      const accessToken = localStorage.getItem('access_token');

      if (accessToken) {
        storedToken.set(accessToken);
        spotifyApi.setAccessToken(accessToken);

        // Check if token needs refresh
        void checkAndRefreshToken().then((isValid) => {
          if (isValid) {
            void getUserInformation();
          }
        });
      }
    }
  });
</script>

<section class="img-bg">
  <div class="gradient-bg">
    <div class="container mx-auto px-3">
      <div class="grid grid-cols-2 items-center gap-6 py-20 md:py-44">
        <div class="col-span-2 text-white md:col-span-1">
          <h1
            class="mb-10 inline-flex items-center text-3xl font-bold md:text-5xl"
          >
            <img
              src="/favicon.svg"
              alt="ConcertMash Logo"
              class="mr-3 h-10 w-10"
            />

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

<section class="relative overflow-hidden py-16">
  <div class="container mx-auto px-3">
    <h2 class="mb-3 text-center text-3xl font-bold">How it works</h2>

    <div class="mb-10 grid h-full grid-cols-3 gap-6">
      <div class="col-span-3 flex flex-col md:col-span-1 md:flex-row">
        <div class="rounded-md border bg-white px-5 py-10 shadow-lg">
          <div class="green-dot"></div>
          <div class="blue-dot"></div>
          <Icon data={faMusic} class="mb-3" scale={1.5} />
          <h3 class="text-spotify-hover-green mb-3 text-xl font-bold">
            Step 1
          </h3>
          <p>Log in with Spotify to provide access</p>
        </div>
      </div>
      <div class="col-span-3 flex flex-col md:col-span-1 md:flex-row">
        <div class="rounded-md border bg-white px-5 py-10 shadow-lg">
          <Icon data={faMusic} class="mb-3" scale={1.5} />
          <h3 class="text-spotify-hover-green mb-3 text-xl font-bold">
            Step 2
          </h3>
          <p>Generate your desired playlist by filling out a simple form</p>
        </div>
      </div>
      <div class="col-span-3 flex flex-col md:col-span-1 md:flex-row">
        <div class="rounded-md border bg-white px-5 py-10 shadow-lg">
          <div class="green-dot-2"></div>
          <div class="blue-dot-2"></div>
          <Icon data={faMusic} class="mb-3" scale={1.5} />
          <h3 class="text-spotify-hover-green mb-3 text-xl font-bold">
            Step 3
          </h3>
          <p>Open up Spotify and listen to your newly-created playlist!</p>
        </div>
      </div>
    </div>

    <div class="w-full text-center">
      <SpotifyButton {authorizeWithSpotify} />
    </div>
  </div>
</section>
