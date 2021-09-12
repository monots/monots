import '@rushstack/eslint-patch/modern-module-resolution';

import type { Linter } from 'eslint';

const rules = {
  '@typescript-eslint/prefer-readonly': 'warn',
  '@typescript-eslint/await-thenable': 'warn',
  '@typescript-eslint/no-unnecessary-type-arguments': 'warn',
  '@typescript-eslint/restrict-plus-operands': 'warn',
  '@typescript-eslint/no-misused-promises': 'warn',
  '@typescript-eslint/no-unnecessary-type-assertion': 'error',
} as const;

const rulesOff: Linter.RulesRecord = {};

for (const rule of Object.keys(rules)) {
  rulesOff[rule] = 'off';
}

const config: import('eslint').Linter.Config = {
  plugins: ['import'],
  extends: ['plugin:import/typescript'],
  rules: {
    'import/no-default-export': 'warn',
    'import/first': 'error',
    'import/no-duplicates': 'error',
    'import/no-cycle': 'error',
    'import/no-self-import': 'error',
    'import/newline-after-import': 'error',
  },
  overrides: [
    {
      files: ['**/!(*.{md,mdx})/*.ts', '**/!(*.{md,mdx})/*.tsx'],
      rules,
    },
    {
      files: [
        '**/__tests__/**',
        '**/__stories__/**',
        '**/__fixtures__/**',
        'website/**',
        '**/__dts__/**',
        '**/*.(test|spec).(ts|tsx)',
      ],
      // Switch off rules for test files.
      rules: rulesOff,
    },
  ],
};

export = config;
