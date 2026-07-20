<script lang="ts">
  import { onMount } from 'svelte';
  import { replaceState } from '$app/navigation';
  import { resolve } from '$app/paths';
  import PlaylistCreationForm from '$lib/PlaylistCreationForm.svelte';

  export let data: {
    user: SpotifyApi.CurrentUsersProfileResponse;
  };

  onMount(() => {
    if (new URL(globalThis.location.href).searchParams.has('code')) {
      replaceState(resolve('/app'), {});
    }
  });
</script>

<svelte:head>
  <title>Create Playlist | ConcertMash</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<PlaylistCreationForm user={data.user} />
