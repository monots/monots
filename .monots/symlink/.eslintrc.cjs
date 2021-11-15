module.exports = {
  extends: ['monots'],
  plugins: ['file-progress'],
  rules: {
    'file-progress/activate': 1,
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      extends: ['monots/full'],
      parserOptions: {
        project: ['./.monots/tsconfig.lint.json'],
      },
    },
    { files: ['*.tsx'], extends: ['monots/react'] },
    {
      files: ['./packages/{create-monots,monots__cli}/src/**/*.ts'],
      rules: { 'no-console': 'off', 'unicorn/no-process-exit': 'off' },
    },
  ],
};
