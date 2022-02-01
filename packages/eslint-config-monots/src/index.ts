import '@rushstack/eslint-patch/modern-module-resolution';

import type { Linter } from 'eslint';

const config: Linter.Config = {
  parser: '@typescript-eslint/parser',
  ignorePatterns: ['*.d.ts'],
  plugins: ['@typescript-eslint', 'unicorn', 'simple-import-sort', 'file-progress'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:unicorn/recommended',
    'prettier',
  ],

  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    extraFileExtensions: ['.mjs', '.json', '.cjs'],
  },
  env: {
    browser: true,
    node: true,
  },
  rules: {
    'file-progress/activate': 1,
    'prefer-const': ['error', { destructuring: 'all' }],

    'unicorn/no-keyword-prefix': 'off',
    'unicorn/no-unsafe-regex': 'off',
    'unicorn/no-unused-properties': 'off',
    'unicorn/string-content': 'off',
    'unicorn/custom-error-definition': 'off',
    'unicorn/empty-brace-spaces': 'off',
    'unicorn/prevent-abbreviations': 'off',
    'unicorn/no-nested-ternary': 'off',
    'unicorn/no-null': 'off',
    'no-nested-ternary': 'off',

    'sort-imports': 'off',

    // Use nice import and export rules
    'simple-import-sort/exports': ['warn'], // TODO switch on after release
    'simple-import-sort/imports': ['warn'],

    '@typescript-eslint/no-unused-expressions': [
      'error',
      { allowTernary: true, allowShortCircuit: true },
    ],

    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-namespace': 'off',
    '@typescript-eslint/no-unused-vars': ['off'],
    '@typescript-eslint/naming-convention': [
      'warn',
      { selector: 'typeParameter', format: ['StrictPascalCase'] },
    ],
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/no-inferrable-types': 'warn',
    '@typescript-eslint/consistent-type-imports': ['error', { disallowTypeAnnotations: false }],
    '@typescript-eslint/ban-types': [
      'warn',
      {
        extendDefaults: false,
        types: {
          String: {
            message: 'Use string instead',
            fixWith: 'string',
          },
          Boolean: {
            message: 'Use boolean instead',
            fixWith: 'boolean',
          },
          Number: {
            message: 'Use number instead',
            fixWith: 'number',
          },
          Symbol: {
            message: 'Use symbol instead',
            fixWith: 'symbol',
          },
          Function: {
            message: [
              'The `Function` type accepts any function-like value.',
              'It provides no type safety when calling the function, which can be a common source of bugs.',
              'It also accepts things like class declarations, which will throw at runtime as they will not be called with `new`.',
              'If you are expecting the function to accept certain arguments, you should explicitly define the function shape.',
            ].join('\n'),
          },

          // object typing
          Object: {
            message: [
              'The `Object` type actually means "any non-nullish value", so it is marginally better than `unknown`.',
              '- If you want a type meaning "any object", you probably want `Record<string, unknown>` instead.',
              '- If you want a type meaning "any value", you probably want `unknown` instead.',
            ].join('\n'),
          },
          '{}': {
            message: [
              '`{}` actually means "any non-nullish value".',
              '- If you want a type meaning "object", you probably want `object` instead.',
              '- If you want a type meaning "any value", you probably want `unknown` instead.',
            ].join('\n'),
            fixWith: 'object',
          },
        },
      },
    ],

    /**
     * @todo Set `explicit-module-boundary-types` lint rule to `error` once all
     * issues are resolved
     * @block All exported methods that are exposed to end users should be
     * explicitly typed. It makes for better readability when contributing since
     * inference requires more work to determine the return types, and also it
     * forces deliberate planning.
     */
    '@typescript-eslint/explicit-module-boundary-types': 'off',

    // Turning off as it leads to code with bad patterns, where implementation
    // details are placed before the actual meaningful code.
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/member-ordering': [
      'warn',
      { default: ['signature', 'static-field', 'static-method', 'field', 'constructor', 'method'] },
    ],
    '@typescript-eslint/method-signature-style': 'warn',
    '@typescript-eslint/prefer-function-type': 'error',
    '@typescript-eslint/array-type': [
      'error',
      { default: 'array-simple', readonly: 'array-simple' },
    ],

    // Built in eslint rules
    'no-constant-condition': 'off', // To many false positives
    'no-empty': 'warn',
    'no-else-return': 'warn',
    'no-useless-escape': 'warn',
    'default-case': 'off',
    'default-case-last': 'error',
    'prefer-template': 'warn',
    'guard-for-in': 'warn',
    'prefer-object-spread': 'warn',
    curly: ['warn', 'all'],
    'no-invalid-regexp': 'error',
    'no-multi-str': 'error',
    'no-extra-boolean-cast': 'error',
    radix: 'error',
    'no-return-assign': ['error', 'except-parens'],
    eqeqeq: ['error', 'always', { null: 'ignore' }],
    'prefer-exponentiation-operator': 'error',
    'prefer-arrow-callback': ['error', { allowNamedFunctions: true }],
    'padding-line-between-statements': [
      'warn',
      {
        blankLine: 'always',
        prev: '*',
        next: ['if', 'switch', 'for', 'do', 'while', 'class', 'function'],
      },
      {
        blankLine: 'always',
        prev: ['if', 'switch', 'for', 'do', 'while', 'class', 'function'],
        next: '*',
      },
    ],
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        '@typescript-eslint/no-extra-non-null-assertion': ['error'],
        '@typescript-eslint/prefer-optional-chain': ['error'],
        '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
        '@typescript-eslint/no-dynamic-delete': ['error'],
        '@typescript-eslint/no-var-requires': 'error',
      },
    },

    // Rules exclusive to published packages.
    {
      files: ['packages/*/src/**'],
      rules: {
        'no-console': 'error',
      },
    },
    {
      files: ['*.(spec|test).{ts,tsx}*', '**/__types__/**'],
      rules: {
        'unicorn/consistent-destructuring': 'off',
        '@typescript-eslint/await-thenable': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/ban-ts-ignore': 'off', // Often you need to use @ts-ignore in tests
        '@typescript-eslint/no-non-null-assertion': 'off', // Makes writing tests more convenient
        '@typescript-eslint/no-use-before-define': 'off',
        'react/display-name': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
      },
    },
  ],
};

export = config;
