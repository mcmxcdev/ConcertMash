<script lang="ts">
  import { isDev } from '../stores';
</script>

{#if $isDev}
  <!-- Display current tailwind breakpoint in dev -->
  <div class="fixed top-0 z-50 p-2 text-xs font-bold text-black">
    <span class="rounded bg-yellow-400 p-1 px-1 sm:hidden">XS</span>
    <span class="hidden rounded bg-yellow-400 px-1 sm:inline-block md:hidden"
      >SM</span
    >
    <span
      class="hidden rounded bg-yellow-400 px-1 sm:hidden md:inline-block lg:hidden"
      >MD</span
    >
    <span class="xl:hidden hidden rounded bg-yellow-400 px-1 lg:inline-block"
      >LG</span
    >
    <span class="xl:inline-block 2xl:hidden hidden rounded bg-yellow-400 px-1"
      >XL</span
    >
    <span class="2xl:inline-block hidden rounded bg-yellow-400 px-1">2XL</span>
  </div>
{/if}
