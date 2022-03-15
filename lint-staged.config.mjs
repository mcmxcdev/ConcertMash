export default {
  '*.{svelte,ts}': () => [
    'npm run lint:fix',
    'npm run check:format',
    'npm run check:types'
  ],
};
