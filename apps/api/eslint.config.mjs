import config from '@sportbrain/config-eslint/nest';

export default [
  ...config,
  {
    // The migration runner and bootstrap write to stdout/stderr directly:
    // they run before or outside the Nest logger.
    files: ['src/main.ts', 'src/database/migrate.ts'],
    rules: { 'no-console': 'off' },
  },
];
