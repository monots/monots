import type { Linter } from 'eslint';

const config: Linter.Config = {
  // Apply the markdown plugin
  plugins: ['markdown'],

  // Only apply markdown rules when not in TypeScript mode, since they are
  // currently incompatible.
  overrides: [
    { files: ['*.mdx', '*.md'], processor: 'markdown/markdown' },
    {
      // Lint code blocks in markdown
      files: ['**/*.{md,mdx}/*.{ts,tsx,js}'],

      // Set up rules to be excluded in the markdown blocks.
      rules: {
        '@kyleshevlin/prefer-custom-hooks': 'off',
        'simple-import-sort/exports': 'warn',
        'simple-import-sort/imports': 'warn',
        'unicorn/filename-case': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-unused-vars-experimental': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
      },
    },
  ],
};

export = config;
