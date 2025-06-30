import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';

/** @type {import('vite').UserConfig} */
const config = {
  plugins: [tailwindcss(), sveltekit()],
  server: {
    port: 3000,
  },
  preview: {
    port: 3000,
  },
  ssr: {
    noExternal: ['@fortawesome/*'],
  },
};

export default config;
