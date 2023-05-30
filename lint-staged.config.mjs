export default {
  '*.{svelte,ts}': () => [
    'pnpm lint:fix',
    'pnpm check:format',
    'pnpm check:types',
  ],
};
