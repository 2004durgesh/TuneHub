// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const eslintConfigPrettier = require('eslint-config-prettier/flat');
const pluginQuery = require('@tanstack/eslint-plugin-query');

module.exports = defineConfig([
  expoConfig,
  pluginQuery.configs['flat/recommended'],
  {
    ignores: ['dist/*'],
  },
  {
    rules: {
      // Screens fetch remote data on mount into local loading/data state — a
      // deliberate pattern here, not an accidental cascading render.
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
  {
    // The player service is the only layer allowed to touch nitro-player, and
    // must load it lazily via require() — the module throws at import time on
    // web/Expo Go, so a static import would crash those targets.
    files: ['src/services/player/**/*.ts'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    files: ['scripts/**/*.js'],
    languageOptions: { globals: { __dirname: 'readonly' } },
  },
  eslintConfigPrettier,
]);
