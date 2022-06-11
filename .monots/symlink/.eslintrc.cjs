module.exports = {
  extends: ['monots'],
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      extends: ['monots/full'],
      parserOptions: {
        project: [
          './.monots/tsconfig.lint.json',
          './tsconfig.json',
          './.monots/scripts/tsconfig.json',
        ],
      },
    },
    { files: ['*.tsx'], extends: ['monots/react'] },
    {
      files: [
        './packages/{create-monots,monots__cli,monots__binary-install}/src/**/*.ts',
        './.monots/**',
        './packages/monots__logger/src/logger.ts',
      ],
      rules: { 'no-console': 'off', 'unicorn/no-process-exit': 'off' },
    },
    {
      files: ['**/*.config.{js,ts}', './packages/monots__logger/src/index.ts'],
      rules: { 'import/no-default-export': 'off' },
    },
  ],
};
