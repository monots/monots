/* eslint-disable unicorn/prefer-module */
// Tab formatting
export const useTabs = false;
export const tabWidth = 2;

export const bracketSameLine = false;
export const bracketSpacing = true;
export const printWidth = 100;
export const semi = true;
export const trailingComma = 'all';
export const proseWrap = 'never';
export const endOfLine = 'lf';

// Use single quotes
export const singleQuote = true;
export const jsxSingleQuote = true;

// Add `package.json` formatting and import sorting.
export const plugins = [require.resolve('prettier-plugin-packagejson')];
