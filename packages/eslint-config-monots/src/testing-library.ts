import '@rushstack/eslint-patch/modern-module-resolution';

import type { Linter } from 'eslint';

const config: Linter.Config = {
  plugins: ['testing-library'],
  extends: ['plugin:testing-library/dom'],
};

export = config;
