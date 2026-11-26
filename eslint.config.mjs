import js from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript';
import { importX } from 'eslint-plugin-import-x';
import prettier from 'eslint-config-prettier/flat';
import globals from 'globals';

export default defineConfigWithVueTs(
  {
    // Only the app's TypeScript and Vue sources are linted, as before the flat config
    ignores: [
      '**/*.js',
      '**/*.cjs',
      '**/*.mjs',
      '**/*.mts',
      '**/*.d.ts',
      'dist/**',
      'dev-dist/**',
      'coverage/**',
      'storybook-static/**',
      '.vrt/**'
    ]
  },
  js.configs.recommended,
  pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,
  {
    plugins: { 'import-x': importX },
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: globals.browser
    },
    rules: {
      'no-var': 'error',
      'prefer-const': 'error',
      'no-use-before-define': ['error', { variables: false, functions: false }],
      'prefer-arrow-callback': 'error',
      eqeqeq: 'error',
      'prefer-template': 'error',
      'import-x/no-commonjs': 'warn',
      'import-x/no-default-export': 'warn'
    }
  },
  {
    // Vue single-file components are default exports by design
    files: ['**/*.vue'],
    rules: {
      'import-x/no-default-export': 'off'
    }
  },
  {
    // Storybook and Playwright read their configuration and stories from default exports
    files: ['.storybook/**/*.ts', 'src/stories/**/*.stories.ts', 'vrt/playwright.config.ts'],
    rules: {
      'import-x/no-default-export': 'off'
    }
  },
  {
    files: ['src/tests/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-ts-comment': 'off'
    }
  },
  prettier
);
