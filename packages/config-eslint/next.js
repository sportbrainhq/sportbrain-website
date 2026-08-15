import globals from 'globals';
import base from './base.js';

/**
 * ESLint config for the Next.js web app.
 *
 * The Next-specific rules (`next/core-web-vitals`) are wired in the app's own
 * eslint.config.mjs via FlatCompat, because eslint-config-next still ships a
 * legacy-shaped config.
 */
export default [
  ...base,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      ecmaVersion: 2023,
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
];
