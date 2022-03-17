import sveltePreprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-static';

const preprocess = [
  sveltePreprocess({
    postcss: true,
    preserve: ['ld+json'],
  }),
];

const config = {
  preprocess: preprocess,
  kit: {
    adapter: adapter(),
    trailingSlash: 'ignore',
    vite: {
      optimizeDeps: {
        // INFO: without the exclude, notifications don't show up
        exclude: ['@beyonk/svelte-notifications'],
      },
      ssr: {
        noExternal: ['@beyonk/svelte-notifications'],
      },
    },
    prerender: { default: true },
  },
};

export default config;
