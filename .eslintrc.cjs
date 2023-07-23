module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/strict',
    'plugin:@typescript-eslint/strict-type-checked',
    'plugin:@typescript-eslint/stylistic-type-checked',
    'plugin:svelte/recommended',
    'plugin:import/typescript',
    'plugin:unicorn/recommended',
    'plugin:promise/recommended',
    'plugin:prettier/recommended'
  ],
  plugins: [
    '@typescript-eslint',
    'simple-import-sort',
    'import',
    'unicorn',
    'promise',
  ],
  ignorePatterns: ['*.cjs'],
  overrides: [
    {
      files: ['*.svelte'],
      parser: 'svelte-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser',
      },
    },
  ],
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2022,
    project: ['./tsconfig.json'],
    extraFileExtensions: ['.svelte'],
  },
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  globals: {
    SpotifyApi: 'readonly',
  },
  rules: {
    //
    // eslint
    //
    eqeqeq: 'error',
    'no-console': ['error', { allow: ['warn', 'error', 'info'] }],
    //
    // @typescript-eslint
    //
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/consistent-type-definitions': 'off',
    //
    // eslint-plugin-import
    //
    'import/newline-after-import': 'error',
    'import/no-duplicates': 'error',
    //
    // eslint-plugin-simple-import-sort
    //
    'simple-import-sort/exports': 'error',
    'simple-import-sort/imports': 'error',
    //
    // eslint-plugin-unicorn
    //
    'unicorn/filename-case': 'off',
    'unicorn/no-null': 'off',
    'unicorn/prevent-abbreviations': 'off',
    'unicorn/no-array-reduce': 'off',
    //
    // eslint-plugin-promise
    //
    'promise/always-return': 'off',
    'promise/catch-or-return': ['error', { allowFinally: true }],
  },
};
