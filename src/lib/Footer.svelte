<script>
  import { faGithub } from '@fortawesome/free-brands-svg-icons';
  import Icon from 'svelte-awesome';
</script>

<footer class="w-full border-t-4 border-spotify-green bg-black">
  <div class="container mx-auto flex items-center justify-between px-3 py-10">
    <div class="grid w-full grid-cols-3 items-center justify-between gap-3">
      <div class="col-span-3 mx-auto md:col-span-1 md:mx-0">
        <a
          sveltekit:prefetch
          href="/"
          class="inline-flex items-center text-xl font-semibold text-white"
        >
          <img
            src="/favicon.svg"
            alt="ConcertMash Logo"
            class="mr-3 h-8 w-8"
            loading="lazy"
          /> ConcertMash
        </a>
      </div>
      <div class="col-span-3 mx-auto md:col-span-1">
        <p class="inline-flex items-center text-white">
          Powered by <a
            href="https://www.spotify.com/"
            target="_blank"
            rel="noopener noreferrer"
            title="Powered by Spotify"
          >
            <img
              src="/Spotify_Logo_RGB_White.png"
              alt="Spotify Logo"
              class="ml-2 max-w-[100px]"
              loading="lazy"
            />
          </a>
        </p>
      </div>
      <div class="col-span-3 mx-auto md:col-span-1 md:ml-auto md:mr-0">
        <p class="inline-flex items-center text-white">
          Contribute on
          <a
            href="https://github.com/mcmxcdev/ConcertMash"
            target="_blank"
            rel="noopener noreferrer"
            class="text-white"
            title="Contribute on GitHub"
          >
            <Icon data={faGithub} class="m-3" scale={2} />
          </a>
        </p>
      </div>
    </div>
  </div>
</footer>
