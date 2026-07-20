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
      <div class="grid grid-cols-2 items-center gap-10 py-24 md:py-40">
        <div class="col-span-2 text-white md:col-span-1">
          <span class="eyebrow">Concerts &amp; festivals</span>
          <h1 class="mb-6 text-4xl font-extrabold tracking-tight md:text-6xl">
            Turn any line-up into a
            <span class="text-spotify-hover-green">Spotify playlist</span>
          </h1>
          <p class="text-muted mb-8 max-w-md text-lg">
            Enter the artists, pick the song types, and get a ready-to-play
            playlist in seconds. Learn every song before the show.
          </p>

          <SpotifyButton {authorizeWithSpotify} />
        </div>

        <div class="col-span-2 hidden md:col-span-1 md:block">
          <div
            class="relative mx-auto flex aspect-square max-w-sm items-center justify-center"
          >
            <div
              class="bg-spotify-green/25 absolute inset-8 rounded-full blur-3xl"
            ></div>
            <img
              src="/favicon.svg"
              alt="ConcertMash logo"
              class="relative h-40 w-40 drop-shadow-2xl"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="relative overflow-hidden py-20">
  <div class="container mx-auto px-3">
    <div class="mb-12 text-center">
      <span class="eyebrow">How it works</span>
      <h2 class="text-3xl font-extrabold tracking-tight md:text-4xl">
        Three steps to your playlist
      </h2>
    </div>

    <div class="mb-12 grid grid-cols-3 gap-6">
      <div class="surface-card col-span-3 px-6 py-10 md:col-span-1">
        <div class="green-dot"></div>
        <div class="blue-dot"></div>
        <div class="relative">
          <div
            class="bg-spotify-green/15 text-spotify-hover-green mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl"
          >
            <Icon data={faMusic} scale={1.4} />
          </div>
          <div class="mb-2 text-sm font-bold tracking-widest text-neutral-500">
            STEP 1
          </div>
          <p class="text-lg text-white">Log in with Spotify to grant access.</p>
        </div>
      </div>
      <div class="surface-card col-span-3 px-6 py-10 md:col-span-1">
        <div class="relative">
          <div
            class="bg-spotify-green/15 text-spotify-hover-green mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl"
          >
            <Icon data={faMusic} scale={1.4} />
          </div>
          <div class="mb-2 text-sm font-bold tracking-widest text-neutral-500">
            STEP 2
          </div>
          <p class="text-lg text-white">
            Enter your line-up and fill out a simple form.
          </p>
        </div>
      </div>
      <div class="surface-card col-span-3 px-6 py-10 md:col-span-1">
        <div class="green-dot-2"></div>
        <div class="blue-dot-2"></div>
        <div class="relative">
          <div
            class="bg-spotify-green/15 text-spotify-hover-green mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl"
          >
            <Icon data={faMusic} scale={1.4} />
          </div>
          <div class="mb-2 text-sm font-bold tracking-widest text-neutral-500">
            STEP 3
          </div>
          <p class="text-lg text-white">
            Open Spotify and listen to your new playlist!
          </p>
        </div>
      </div>
    </div>

    <div class="w-full text-center">
      <SpotifyButton {authorizeWithSpotify} />
    </div>
  </div>
</section>

<section class="border-y border-white/5 bg-white/2 py-20">
  <div class="container mx-auto px-3">
    <div class="mb-12 text-center">
      <span class="eyebrow">Why ConcertMash</span>
      <h2 class="mb-4 text-3xl font-extrabold tracking-tight md:text-4xl">
        Stop copying songs album by album
      </h2>
      <p class="text-muted mx-auto max-w-2xl text-lg">
        ConcertMash builds a complete concert or festival playlist in your
        Spotify account in seconds.
      </p>
    </div>

    <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      <div class="surface-card px-6 py-8">
        <h3 class="mb-2 text-lg font-bold text-white">
          Line-up to playlist in seconds
        </h3>
        <p class="text-muted">
          Enter every artist on the bill and get one ready-to-play Spotify
          playlist automatically.
        </p>
      </div>
      <div class="surface-card px-6 py-8">
        <h3 class="mb-2 text-lg font-bold text-white">
          Festival or concert mode
        </h3>
        <p class="text-muted">
          Pick the top songs per artist for festivals, or full discographies for
          a handful of concert acts.
        </p>
      </div>
      <div class="surface-card px-6 py-8">
        <h3 class="mb-2 text-lg font-bold text-white">Fine-tune the details</h3>
        <p class="text-muted">
          Set songs per artist, album types, a custom name, description, cover
          image and playlist visibility.
        </p>
      </div>
      <div class="surface-card px-6 py-8">
        <h3 class="mb-2 text-lg font-bold text-white">Free and open source</h3>
        <p class="text-muted">
          No cost, no ads. Works with any Spotify account and uses the official
          Spotify Web API.
        </p>
      </div>
    </div>
  </div>
</section>

<section class="py-20">
  <div class="container mx-auto max-w-3xl px-3">
    <div class="mb-12 text-center">
      <span class="eyebrow">FAQ</span>
      <h2 class="text-3xl font-extrabold tracking-tight md:text-4xl">
        Frequently asked questions
      </h2>
    </div>

    <div class="space-y-4">
      <div class="surface-card px-6 py-6">
        <h3 class="mb-2 text-xl font-bold text-white">What is ConcertMash?</h3>
        <p class="text-muted">
          ConcertMash is a free web app that generates a Spotify playlist from
          the artists playing your upcoming concert or festival, so you can
          learn every song before the show.
        </p>
      </div>
      <div class="surface-card px-6 py-6">
        <h3 class="mb-2 text-xl font-bold text-white">Is ConcertMash free?</h3>
        <p class="text-muted">
          Yes. ConcertMash is completely free and open source. You only need a
          Spotify account to create playlists.
        </p>
      </div>
      <div class="surface-card px-6 py-6">
        <h3 class="mb-2 text-xl font-bold text-white">
          Do I need Spotify Premium?
        </h3>
        <p class="text-muted">
          No. Any Spotify account works. ConcertMash uses the official Spotify
          Web API to create playlists in your own library.
        </p>
      </div>
      <div class="surface-card px-6 py-6">
        <h3 class="mb-2 text-xl font-bold text-white">
          How does ConcertMash build the playlist?
        </h3>
        <p class="text-muted">
          Enter the artists on the line-up and choose the top songs per artist
          (great for festivals) or their full catalogue (great for concerts).
          ConcertMash assembles the playlist in your Spotify account in seconds.
        </p>
      </div>
    </div>

    <div class="mt-12 w-full text-center">
      <SpotifyButton {authorizeWithSpotify} />
    </div>
  </div>
</section>
