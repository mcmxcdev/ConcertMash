<script lang="ts">
  import '../app.css';

  import { Toaster } from 'svelte-sonner';

  import BreakpointHelper from '$lib/BreakpointHelper.svelte';
  import Footer from '$lib/Footer.svelte';
  import Nav from '$lib/Nav.svelte';

  export let data: { user: SpotifyApi.CurrentUsersProfileResponse | null };
</script>

<BreakpointHelper />

<Nav user={data.user} />

<main class="flex flex-1 flex-col">
  <slot />
</main>

<Footer />

<Toaster theme="dark" duration={3000} />
