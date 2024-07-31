import eslint from '@eslint/js';
import prettier from 'eslint-config-prettier';
import eslintPluginSvelte from 'eslint-plugin-svelte';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import eslintPluginPromise from 'eslint-plugin-promise';
import tseslint from 'typescript-eslint';
import svelteConfig from './svelte.config.js';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  ...eslintPluginSvelte.configs['flat/recommended'],
  eslintPluginPromise.configs['flat/recommended'],
  // @ts-expect-error Not sure why it throws TS errors, but the config itself does work as expected
  eslintPluginUnicorn.configs['flat/recommended'],
  prettier,
  ...eslintPluginSvelte.configs['flat/prettier'],
  {
    languageOptions: {
      globals: {
        SpotifyApi: 'readonly',
      },
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 'latest',
        extraFileExtensions: ['.svelte'],
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['**/*.svelte'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        svelteConfig,
      },
    },
  },
  {
    rules: {
      //
      // eslint
      //
      eqeqeq: 'error',
      'no-console': ['error', { allow: ['warn', 'error', 'info'] }],
      'no-undef': 'off',
      //
      // @typescript-eslint
      //
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/consistent-type-definitions': 'off',
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
  },
  {
    ignores: [],
  },
);
