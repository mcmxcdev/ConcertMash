<script lang="ts">
  import { faMusic } from '@fortawesome/free-solid-svg-icons';
  import Icon from 'svelte-awesome';

  import SpotifyButton from './SpotifyButton.svelte';

  const authorizeWithSpotify = () => {
    globalThis.location.assign('/auth/login');
  };
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
