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
  ],
};
