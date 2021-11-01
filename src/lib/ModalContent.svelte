<script lang="ts">
  import { getContext } from 'svelte';
  import PlaylistCreationSuccess from './PlaylistCreationSuccess.svelte';

  const { open, close } = getContext('simple-modal');

  export let playlistId: string;
  export let isGenerationDone: boolean;

  $: if (isGenerationDone) {
    open(PlaylistCreationSuccess, { playlistId: playlistId });
  } else {
    close();
  }
</script>
