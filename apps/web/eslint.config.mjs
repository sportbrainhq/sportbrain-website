import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';
import config from '@sportbrain/config-eslint/next';

// eslint-config-next still ships a legacy-shaped config, so it is bridged
// into flat config with FlatCompat.
const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) });

export default [
  ...config,
  // core-web-vitals adds the rules that catch the common performance mistakes:
  // unoptimised <img>, sync scripts, missing next/font.
  ...compat.extends('next/core-web-vitals'),
  {
    ignores: ['.next/**', 'next-env.d.ts'],
  },
];
