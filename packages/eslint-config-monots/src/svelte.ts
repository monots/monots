/* eslint-disable unicorn/prefer-module */
import '@rushstack/eslint-patch/modern-module-resolution';

import type { Linter } from 'eslint';

const config: Linter.Config = {
  extends: ['monots'],
  plugins: ['svelte3'],
  settings: {
    'svelte3/typescript': () => require('typescript'),
  },
  overrides: [{ files: ['*.svelte'], processor: 'svelte3/svelte3' }],
};

export = config;
