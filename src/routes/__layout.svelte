<script lang="ts">
  import '../app.css';

  import { NotificationDisplay } from '@beyonk/svelte-notifications';

  import BreakpointHelper from '$lib/BreakpointHelper.svelte';
  import Footer from '$lib/Footer.svelte';
  import Nav from '$lib/Nav.svelte';
</script>

<BreakpointHelper />

<Nav />

<main>
  <slot />
</main>

<Footer />

<NotificationDisplay />
