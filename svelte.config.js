import sveltePreprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-static';

const preprocess = [
  sveltePreprocess({
    postcss: true,
    preserve: ['ld+json'],
  }),
];

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: preprocess,
  kit: {
    adapter: adapter(),
    csp: {
      mode: 'auto',
      directives: {
        'default-src': ['none'],
        'script-src': ['self'],
        'connect-src': [
          'self',
          'ws://localhost:3000',
          'https://api.spotify.com',
        ],
        'img-src': ['self', 'data:', 'blob:'],
        'style-src': ['self', 'unsafe-inline', 'https://fonts.googleapis.com'],
        'base-uri': ['self'],
        'font-src': ['self', 'https://fonts.gstatic.com'],
        'child-src': ['self', 'blob:'],
        'form-action': ['self'],
      },
    },
  },
};

export default config;
