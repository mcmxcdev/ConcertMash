<script lang="ts">
  import '../app.css';

  import { SvelteToast } from '@zerodevx/svelte-toast';

  import BreakpointHelper from '$lib/BreakpointHelper.svelte';
  import Footer from '$lib/Footer.svelte';
  import Nav from '$lib/Nav.svelte';

  const options = {
    duration: 3000,
  };
</script>

<BreakpointHelper />

<Nav />

<main class="flex-1">
  <slot />
</main>

<Footer />

<SvelteToast {options} />
