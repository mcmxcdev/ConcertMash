<script lang="ts">
  import { getContext } from 'svelte';
  const { close } = getContext('simple-modal');

  export let playlistId: string;
</script>

<h2 class="text-3xl font-bold mb-5">Success!</h2>
<p class="mb-3">You sucessfully created your Spotify playlist!</p>
<p class="mb-3">
  You can find the new playlist at the top of the playlist sidebar.
</p>
<a
  href={`https://open.spotify.com/playlist/${playlistId}`}
  target="_blank"
  rel="noopener noreferrer"
  class="mb-6 block underline">Open the Spotify app to listen</a
>

<button type="button" class="btn-primary" on:click={close}
  >Create another playlist</button
>
