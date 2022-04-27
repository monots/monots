import '@rushstack/eslint-patch/modern-module-resolution';

import type { Linter } from 'eslint';

const config: Linter.Config = {
  plugins: ['jest', 'jest-formatting'],
  extends: ['plugin:jest/recommended', 'plugin:jest/style', 'plugin:jest-formatting/recommended'],

  settings: {
    jest: { version: 28 },
  },
  rules: {
    'jest/prefer-strict-equal': 'off',
    'jest/no-jest-import': ['off'],
    'jest/no-conditional-in-test': ['error'],
    'jest/consistent-test-it': ['error'],
    'jest/prefer-spy-on': ['warn'],
    'jest/prefer-todo': ['warn'],
    'jest/prefer-hooks-on-top': ['error'],
    'jest/no-large-snapshots': ['warn', { maxSize: 20 }],
    'jest/no-duplicate-hooks': ['error'],
    'jest/no-if': ['error'],
    'jest/prefer-expect-resolves': ['error'],
    'jest/prefer-lowercase-title': ['error'],
    'jest/prefer-snapshot-hint': ['error', 'always'],
    'jest/no-restricted-matchers': [
      'error',
      { toBeTruthy: 'Avoid `toBeTruthy`', toBeFalsy: 'Avoid `toBeFalsy`' },
    ],
  },
};

export = config;
