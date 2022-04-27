import '@rushstack/eslint-patch/modern-module-resolution';

import type { Linter } from 'eslint';

const config: Linter.Config = {
  parser: 'espree',
  plugins: ['eslint-plugin-markdown'],
  processor: 'markdown/markdown',
  overrides: [
    {
      // Lint code blocks in markdown
      files: ['**/*.{md,mdx}/*.{ts,tsx,js,jsx,svelte}'],

      // Set up rules to be excluded in the markdown blocks.
      rules: {
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
