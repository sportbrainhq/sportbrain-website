import globals from 'globals';
import base from './base.js';

/** ESLint config for the NestJS API. */
export default [
  ...base,
  {
    languageOptions: {
      globals: { ...globals.node },
      ecmaVersion: 2023,
      sourceType: 'module',
    },
    rules: {
      // Nest's DI container instantiates providers by decorator metadata, so
      // empty constructors with only parameter properties are idiomatic.
      '@typescript-eslint/no-extraneous-class': 'off',

      // Deliberately off for the API, where it is actively harmful.
      //
      // `emitDecoratorMetadata` writes constructor parameter types into the
      // emitted JavaScript, and that metadata is how Nest resolves what to
      // inject. A `import type` declaration is erased at compile time, so
      // rewriting an injected class to a type-only import produces
      // `design:paramtypes` entries of `Object` and the container fails at
      // runtime with an unresolvable dependency. The failure is a start-up
      // crash, not a compile error, so the linter cannot be trusted to
      // autofix it.
      '@typescript-eslint/consistent-type-imports': 'off',

      // The logger is the intended output path on the server, not console.
      'no-console': 'error',
    },
  },
];
