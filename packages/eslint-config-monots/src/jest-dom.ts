import '@rushstack/eslint-patch/modern-module-resolution';

import type { Linter } from 'eslint';

const config: Linter.Config = {
  plugins: ['jest-dom'],
  extends: ['plugin:jest-dom/recommended'],
};

export = config;
