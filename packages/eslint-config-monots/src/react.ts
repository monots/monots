import type { Linter } from 'eslint';

const config: Linter.Config = {
  parser: '@typescript-eslint/parser',
  ignorePatterns: ['*.d.ts'],
  plugins: ['react-hooks', 'react', 'jsx-a11y', '@kyleshevlin'],
  extends: ['plugin:react/recommended'],

  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    'react/no-multi-comp': 'off',
    'react/jsx-uses-react': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react/display-name': 'warn',
    'react/no-unescaped-entities': 'error',
    'react/no-unused-state': 'error',
    'react/no-children-prop': 'error',
    'react/self-closing-comp': 'error',

    // React Hooks

    'react-hooks/exhaustive-deps': 'error',
    'react-hooks/rules-of-hooks': 'error',

    // See https://kyleshevlin.com/use-encapsulation
    '@kyleshevlin/prefer-custom-hooks': 'warn',
  },
};

export = config;
