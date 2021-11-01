module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:import/typescript',
    'plugin:@typescript-eslint/recommended',
    'plugin:unicorn/recommended',
    'plugin:promise/recommended',
    'prettier',
  ],
  plugins: ['svelte3', '@typescript-eslint', 'unicorn', 'promise'],
  ignorePatterns: ['*.cjs'],
  overrides: [{ files: ['*.svelte'], processor: 'svelte3/svelte3' }],
  settings: {
    'svelte3/typescript': () => require('typescript'),
  },
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2019,
  },
  env: {
    browser: true,
    es2017: true,
    node: true,
  },
  rules: {
    //
    // @typescript-eslint
    //
    '@typescript-eslint/no-explicit-any': 'off',
    //
    // eslint-plugin-unicorn
    //
    'unicorn/filename-case': 'off',
    'unicorn/no-null': 'off',
    'unicorn/no-useless-undefined': 'off',
    'unicorn/prevent-abbreviations': 'off',
    'unicorn/no-array-reduce': 'off',
    'unicorn/prefer-object-from-entries': 'off',
    //
    // eslint-plugin-promise
    //
    'promise/always-return': 'off',
    'promise/catch-or-return': ['error', { allowFinally: true }],
  },
};
