<script lang="ts">
  // eslint-disable-next-line unicorn/consistent-boolean-name
  export let showModal: boolean;
  export let playlistId: string;

  let dialog: HTMLDialogElement | undefined;

  $: if (dialog && showModal) {
    dialog.showModal();
  }
</script>

<dialog
  bind:this={dialog}
  on:close={() => (showModal = false)}
  on:click|self={() => {
    dialog?.close();
  }}
>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="p-6" on:click|stopPropagation>
    <div
      class="bg-spotify-green/15 mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full text-2xl"
    >
      🎉
    </div>
    <h2 class="mb-4 text-3xl font-extrabold tracking-tight text-white">
      Success!
    </h2>
    <p class="text-muted mb-2">
      You successfully created your Spotify playlist!
    </p>
    <p class="text-muted mb-4">
      You can find the new playlist at the top of the playlist sidebar.
    </p>
    <a
      href={`https://open.spotify.com/playlist/${playlistId}`}
      target="_blank"
      rel="noopener noreferrer"
      class="text-spotify-hover-green mb-6 block font-semibold underline underline-offset-4"
      >Open the Spotify app to listen</a
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
    border-radius: 1rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: #1c1c20;
    color: #ffffff;
    padding: 0;
    box-shadow: 0 30px 60px -15px rgba(0, 0, 0, 0.8);
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    margin: 0;
  }

  dialog::backdrop {
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
  }

  dialog[open] {
    animation: zoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  dialog[open]::backdrop {
    animation: fade 0.2s ease-out;
  }

  @keyframes zoom {
    from {
      transform: translate(-50%, -50%) scale(0.95);
    }
    to {
      transform: translate(-50%, -50%) scale(1);
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
