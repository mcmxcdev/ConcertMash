<script>
  import { faGithub } from '@fortawesome/free-brands-svg-icons';
  import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
  import Icon from 'svelte-awesome';
</script>

<footer class="w-full bg-black">
  <div class="py-24 container mx-auto flex justify-between items-center">
    <div class="py-3">
      <a sveltekit:prefetch href="/" class="text-white text-xl font-semibold">
        ConcertMash
      </a>
    </div>
    <div class="py-3">
      <a href="mailto:markus_hatvan@aon.at" class="text-white">
        <Icon data={faEnvelope} class="m-3" scale={2} />
      </a>
      <a
        href="https://github.com/mhatvan/spotify-concert-playlist-generator"
        target="_blank"
        rel="noopener noreferrer"
        class="text-white"
      >
        <Icon data={faGithub} class="m-3" scale={2} />
      </a>
    </div>
  </div>
</footer>
