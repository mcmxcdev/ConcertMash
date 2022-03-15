<script>
  import { faGithub } from '@fortawesome/free-brands-svg-icons';
  import Icon from 'svelte-awesome';
</script>

<footer class="w-full bg-black">
  <div class="container mx-auto flex items-center justify-between px-3 py-10">
    <a sveltekit:prefetch href="/" class="text-xl font-semibold text-white">
      ConcertMash
    </a>
    <a
      href="https://github.com/mcmxcdev/spotify-concert-playlist-generator"
      target="_blank"
      rel="noopener noreferrer"
      class="text-white"
    >
      <Icon data={faGithub} class="m-3" scale={2} />
    </a>
  </div>
</footer>
