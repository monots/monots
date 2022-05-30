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
      files: ['./packages/{create-monots,monots__cli}/src/**/*.ts', './.monots/**'],
      rules: { 'no-console': 'off', 'unicorn/no-process-exit': 'off' },
    },
    {
      files: ['**/{vite,vitest}.config.{js,ts}'],
      rules: { 'import/no-default-export': 'off' },
    },
  ],
};
