<script lang="ts">
  export let showModal: boolean;
  export let playlistId: string;

  let dialog: HTMLDialogElement | undefined;

  $: if (dialog && showModal) {
    dialog.showModal();
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
<dialog
  bind:this={dialog}
  on:close={() => (showModal = false)}
  on:click|self={() => {
    dialog?.close();
  }}
>
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="p-4" on:click|stopPropagation>
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

    <div class="flex justify-end">
      <button
        type="button"
        class="btn-spotify"
        on:click={() => {
          dialog?.close();
        }}>Create another playlist</button
      >
    </div>
  </div>
</dialog>

<style>
  dialog {
    max-width: 32em;
    border-radius: 0.25em;
    border: none;
    padding: 0;
  }

  dialog::backdrop {
    background: rgba(0, 0, 0, 0.75);
  }

  dialog[open] {
    animation: zoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  dialog[open]::backdrop {
    animation: fade 0.2s ease-out;
  }

  @keyframes zoom {
    from {
      transform: scale(0.95);
    }
    to {
      transform: scale(1);
    }
  }

  @keyframes fade {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
</style>
