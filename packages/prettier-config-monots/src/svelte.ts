/* eslint-disable unicorn/prefer-module */
import { baseConfig } from './base';

const config = {
  ...baseConfig,
  plugins: [...baseConfig.plugins, require.resolve('prettier-plugin-svelte')],
};

export = config;
