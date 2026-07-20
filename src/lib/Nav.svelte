<script lang="ts">
  import { resolve } from '$app/paths';

  export let user: SpotifyApi.CurrentUsersProfileResponse | null = null;
</script>

<header
  class="bg-ink/80 sticky top-0 z-40 w-full border-b border-white/10 backdrop-blur-md"
>
  <div class="container mx-auto px-3 py-4">
    <div class="flex items-center justify-between">
      <a
        href={resolve(user ? '/app' : '/')}
        class="inline-flex items-center gap-2 text-lg font-bold tracking-tight text-white"
      >
        <img src="/favicon.svg" alt="" class="h-7 w-7" />
        ConcertMash
      </a>

      {#if user}
        <form method="POST" action="/auth/logout">
          <button
            type="submit"
            class="rounded-full border border-white/15 px-4 py-1.5 text-sm font-semibold text-neutral-300 transition hover:border-white/30 hover:text-white"
          >
            Log out
          </button>
        </form>
      {/if}
    </div>
  </div>
</header>
