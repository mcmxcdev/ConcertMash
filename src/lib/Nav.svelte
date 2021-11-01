<script lang="ts">
  import { storedUser } from '../stores';
</script>

<header class="w-full bg-white">
  <div class="container py-3 mx-auto">
    <div class="flex justify-between">
      <a sveltekit:prefetch href="/" class="text-xl font-semibold">
        ConcertMash
      </a>
      {#if $storedUser}
        <p>Hey, {$storedUser.display_name}!</p>
      {/if}
    </div>
  </div>
</header>
