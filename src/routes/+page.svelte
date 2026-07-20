<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { toast } from 'svelte-sonner';

  import LoginWithSpotify from '$lib/LoginWithSpotify.svelte';
  import {
    canonical,
    OG_IMAGE,
    OG_IMAGE_HEIGHT,
    OG_IMAGE_WIDTH,
    SITE_DESCRIPTION,
    SITE_NAME,
    SITE_TITLE,
  } from '$lib/seo';

  export let data: {
    oauthError: string | null;
  };

  const url = canonical('/');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        name: SITE_NAME,
        url,
        description: SITE_DESCRIPTION,
        applicationCategory: 'MultimediaApplication',
        operatingSystem: 'Any',
        browserRequirements: 'Requires JavaScript and a Spotify account',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        image: OG_IMAGE,
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'What is ConcertMash?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'ConcertMash is a free web app that generates a Spotify playlist from the artists playing your upcoming concert or festival, so you can learn every song before the show.',
            },
          },
          {
            '@type': 'Question',
            name: 'Is ConcertMash free?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes. ConcertMash is completely free and open source. You only need a Spotify account to create playlists.',
            },
          },
          {
            '@type': 'Question',
            name: 'Do I need Spotify Premium?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'No. Any Spotify account works. ConcertMash uses the official Spotify Web API to create playlists in your own library.',
            },
          },
          {
            '@type': 'Question',
            name: 'How does ConcertMash build the playlist?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Enter the artists on the line-up and choose the top songs per artist (great for festivals) or their full catalogue (great for concerts). ConcertMash assembles the playlist in your Spotify account in seconds.',
            },
          },
        ],
      },
    ],
  };

  // Controlled, static structured data — inlined as raw HTML in the head.
  // The tag name is assembled from parts so the raw script open/close tags
  // never appear literally in source (they would confuse the parsers).
  const jsonLdScript = [
    '<',
    'script type="application/ld+json">',
    JSON.stringify(jsonLd),
    '</',
    'script>',
  ].join('');

  onMount(() => {
    if (!data.oauthError) {
      return;
    }

    toast.error(`Spotify login failed: ${data.oauthError}`);
    void goto(resolve('/'), { replaceState: true });
  });
</script>

<svelte:head>
  <title>{SITE_TITLE}</title>
  <meta name="description" content={SITE_DESCRIPTION} />
  <link rel="canonical" href={url} />

  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content={SITE_NAME} />
  <meta property="og:title" content={SITE_TITLE} />
  <meta property="og:description" content={SITE_DESCRIPTION} />
  <meta property="og:url" content={url} />
  <meta property="og:image" content={OG_IMAGE} />
  <meta property="og:image:width" content={String(OG_IMAGE_WIDTH)} />
  <meta property="og:image:height" content={String(OG_IMAGE_HEIGHT)} />
  <meta property="og:image:alt" content="ConcertMash" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={SITE_TITLE} />
  <meta name="twitter:description" content={SITE_DESCRIPTION} />
  <meta name="twitter:image" content={OG_IMAGE} />

  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html jsonLdScript}
</svelte:head>

<LoginWithSpotify />
