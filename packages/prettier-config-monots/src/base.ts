/* eslint-disable unicorn/prefer-module */
export const baseConfig = {
  useTabs: false,
  // Tab formatting
  tabWidth: 2,

  bracketSameLine: false,
  bracketSpacing: true,
  printWidth: 100,
  semi: true,
  trailingComma: 'all',
  proseWrap: 'never',
  endOfLine: 'lf',

  // Use single quotes
  singleQuote: true,
  jsxSingleQuote: true,

  // Add `package.json` formatting and import sorting.
  plugins: [require.resolve('prettier-plugin-packagejson')],
};
