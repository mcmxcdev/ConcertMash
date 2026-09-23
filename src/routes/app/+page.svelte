<script lang="ts">
  import { browser } from '$app/environment';
  import { replaceState } from '$app/navigation';
  import { resolve } from '$app/paths';
  import PlaylistCreationForm from '$lib/PlaylistCreationForm.svelte';

  export let data: {
    user: SpotifyApi.CurrentUsersProfileResponse;
  };

  // Clean up OAuth parameters from URL if they somehow made it here
  // This is a fallback to ensure clean URLs after OAuth callback
  if (browser && typeof globalThis !== 'undefined') {
    const url = new URL(globalThis.location.href);
    if (url.searchParams.has('code') || url.searchParams.has('state')) {
      replaceState(resolve('/app'), {});
    }
  }
</script>

<svelte:head>
  <title>Create Playlist | ConcertMash</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<PlaylistCreationForm user={data.user} />
