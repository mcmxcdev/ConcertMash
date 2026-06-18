<script lang="ts">
  import PlaylistCreationForm from '$lib/PlaylistCreationForm.svelte';

  export let data: {
    user: SpotifyApi.CurrentUsersProfileResponse;
  };
</script>

<svelte:head>
  <title>Create Playlist | ConcertMash</title>
</svelte:head>

<PlaylistCreationForm user={data.user} />
