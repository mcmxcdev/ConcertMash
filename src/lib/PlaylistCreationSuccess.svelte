<script lang="ts">
  import { getContext } from 'svelte';

  type ContextProps = {
    close: (
      callbacks: MouseEvent & {
        currentTarget: EventTarget & HTMLButtonElement;
      },
    ) => void;
  };

  const { close } = getContext<ContextProps>('simple-modal');

  export let playlistId: string;
</script>

<h2 class="mb-5 text-3xl font-bold">Success!</h2>
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

<div class="text-right">
  <button type="button" class="btn-spotify" on:click={close}
    >Create another playlist</button
  >
</div>
