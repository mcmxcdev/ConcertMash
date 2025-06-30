import adapter from '@sveltejs/adapter-static';
import path from 'path';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter(),
    alias: {
      $src: path.resolve('./src'),
      $lib: path.resolve('./src/lib'),
    },
    csp: {
      mode: 'auto',
      directives: {
        'default-src': ['none'],
        'script-src': ['self'],
        'connect-src': [
          'self',
          'ws://localhost:3000',
          'https://api.spotify.com',
          'https://accounts.spotify.com',
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
