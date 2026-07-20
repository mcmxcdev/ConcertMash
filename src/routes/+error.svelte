<script lang="ts">
  import { page } from '$app/stores';
  import { resolve } from '$app/paths';

  $: isNotFound = $page.status === 404;
  $: errorMessage = isNotFound ? 'Page Not Found' : 'Something Went Wrong';
</script>

<svelte:head>
  <title>{$page.status} - {errorMessage} | ConcertMash</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<section class="img-bg flex flex-1 items-center">
  <div class="gradient-bg flex w-full items-center self-stretch">
    <div class="container mx-auto px-3">
      <div
        class="mx-auto flex max-w-lg flex-col items-center py-24 text-center text-white"
      >
        <h1 class="mb-2 text-7xl font-bold md:text-8xl">{$page.status}</h1>
        <h2 class="mb-6 text-2xl font-semibold md:text-3xl">
          {errorMessage}
        </h2>
        <p class="mb-10 text-lg text-gray-100">
          {isNotFound
            ? "We couldn't find the page you're looking for. It might have been moved, deleted, or never existed."
            : 'An unexpected error occurred on our end. Please try again in a moment.'}
        </p>

        <a href={resolve('/')} class="btn-spotify inline-block">
          Back to Home
        </a>
      </div>
    </div>
  </div>
</section>
