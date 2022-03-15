<script>
  import LoginWithSpotify from '$lib/LoginWithSpotify.svelte';
  import PlaylistCreationForm from '$lib/PlaylistCreationForm.svelte';

  import { storedToken } from '../stores';
</script>

<svelte:head>
  <title>ConcertMash</title>
  <meta
    name="description"
    content="Easily generate a playlist for your upcoming concerts based on selected artists!"
  />
</svelte:head>

{#if $storedToken}
  <PlaylistCreationForm />
{:else}
  <LoginWithSpotify />
{/if}
