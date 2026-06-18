<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { toast } from 'svelte-sonner';

  import LoginWithSpotify from '$lib/LoginWithSpotify.svelte';
  import PlaylistCreationForm from '$lib/PlaylistCreationForm.svelte';

  export let data: {
    user: SpotifyApi.CurrentUsersProfileResponse | null;
    oauthError: string | null;
  };

  onMount(() => {
    if (!data.oauthError) {
      return;
    }

    toast.error(`Spotify login failed: ${data.oauthError}`);
    void goto(resolve('/'), { replaceState: true });
  });
</script>

<svelte:head>
  <title>ConcertMash</title>
  <meta
    name="description"
    content="Easily generate a playlist for your upcoming concerts based on selected artists!"
  />
</svelte:head>

{#if data.user}
  <PlaylistCreationForm user={data.user} />
{:else}
  <LoginWithSpotify />
{/if}
