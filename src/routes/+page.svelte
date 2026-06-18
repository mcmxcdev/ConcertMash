<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { toast } from 'svelte-sonner';

  import LoginWithSpotify from '$lib/LoginWithSpotify.svelte';

  export let data: {
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

<LoginWithSpotify />
