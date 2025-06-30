export default {
  '*.{js,cjs,json,ts,svelte}': () => [
    'pnpm format',
    'pnpm lint:fix',
    'pnpm validate',
  ],
};
