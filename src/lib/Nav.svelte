<script lang="ts">
  import { resolve } from '$app/paths';

  export let user: SpotifyApi.CurrentUsersProfileResponse | null = null;
</script>

<header class="border-spotify-green w-full border-b-4 bg-white">
  <div class="container mx-auto px-3 py-3">
    <div class="flex items-center justify-between">
      <a href={resolve('/')} class="text-xl font-semibold"> ConcertMash </a>

      {#if user}
        <form method="POST" action="/auth/logout">
          <button
            type="submit"
            class="text-sm text-gray-600 hover:text-gray-900"
          >
            Log out
          </button>
        </form>
      {/if}
    </div>
  </div>
</header>
