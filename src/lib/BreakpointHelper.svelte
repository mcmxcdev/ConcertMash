<script lang="ts">
  import { dev } from '$app/environment';
</script>

{#if dev}
  <!-- Display current tailwind breakpoint in dev -->
  <div class="fixed top-0 z-50 p-2 text-xs font-bold text-black">
    <span class="rounded-sm bg-yellow-400 p-1 px-1 sm:hidden">XS</span>
    <span class="hidden rounded-sm bg-yellow-400 px-1 sm:inline-block md:hidden"
      >SM</span
    >
    <span
      class="hidden rounded-sm bg-yellow-400 px-1 sm:hidden md:inline-block lg:hidden"
      >MD</span
    >
    <span class="hidden rounded-sm bg-yellow-400 px-1 lg:inline-block xl:hidden"
      >LG</span
    >
    <span
      class="hidden rounded-sm bg-yellow-400 px-1 xl:inline-block 2xl:hidden"
      >XL</span
    >
    <span class="hidden rounded-sm bg-yellow-400 px-1 2xl:inline-block"
      >2XL</span
    >
  </div>
{/if}
