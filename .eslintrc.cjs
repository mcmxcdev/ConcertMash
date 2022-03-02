module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:import/typescript',
    'plugin:unicorn/recommended',
    'plugin:promise/recommended',
    'prettier',
  ],
  plugins: [
    'svelte3',
    '@typescript-eslint',
    'simple-import-sort',
    'import',
    'unicorn',
    'promise',
    'prettier',
  ],
  ignorePatterns: ['*.cjs'],
  overrides: [{ files: ['*.svelte'], processor: 'svelte3/svelte3' }],
  settings: {
    'svelte3/typescript': () => require('typescript'),
  },
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2019,
    project: ['./tsconfig.json'],
    extraFileExtensions: ['.svelte'],
  },
  env: {
    browser: true,
    es2017: true,
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
    "no-console": ["error", { allow: ["warn", "error", "info"] }],
    //
    // @typescript-eslint
    //
    '@typescript-eslint/no-explicit-any': 'off',
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
