import '@rushstack/eslint-patch/modern-module-resolution';

const config: import('eslint').Linter.Config = {
  plugins: ['import'],
  extends: ['plugin:import/typescript'],
  settings: {
    'import/parsers': {
      ['@typescript-eslint/parser']: ['.ts', '.tsx', '.d.ts', '.cjs', '.mjs'],
    },
    'import/resolver': {
      ['eslint-import-resolver-node']: {
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.cjs', '.mjs'],
      },
      ['eslint-import-resolver-typescript']: {
        alwaysTryTypes: true,
      },
    },
  },
  rules: {
    '@typescript-eslint/prefer-readonly': 'warn',
    '@typescript-eslint/consistent-type-exports': ['error'],
    '@typescript-eslint/await-thenable': 'warn',
    '@typescript-eslint/no-unnecessary-type-arguments': 'warn',
    '@typescript-eslint/restrict-plus-operands': 'warn',
    '@typescript-eslint/no-misused-promises': 'warn',
    '@typescript-eslint/no-unnecessary-type-assertion': 'error',
    'import/no-default-export': 'warn',
    'import/first': 'error',
    'import/no-duplicates': 'error',
    'import/no-cycle': 'error',
    'import/no-self-import': 'error',
    'import/newline-after-import': 'error',
  },
};

export = config;
