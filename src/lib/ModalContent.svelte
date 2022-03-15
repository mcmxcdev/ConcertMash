<script lang="ts">
  import { getContext, SvelteComponent } from 'svelte';

  import PlaylistCreationSuccess from './PlaylistCreationSuccess.svelte';

  type ContextProps = {
    open: (
      Component: typeof SvelteComponent,
      props: Record<string, string>,
    ) => void;
    close: (callbacks?: Record<string, string>) => void;
  };

  const { open, close } = getContext<ContextProps>('simple-modal');

  export let playlistId: string;
  export let isGenerationDone: boolean;

  $: if (isGenerationDone) {
    open(PlaylistCreationSuccess, { playlistId: playlistId });
  } else {
    close();
  }
</script>
