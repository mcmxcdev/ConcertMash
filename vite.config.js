import { sveltekit } from '@sveltejs/kit/vite';

/** @type {import('vite').UserConfig} */
const config = {
  plugins: [sveltekit()],
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
