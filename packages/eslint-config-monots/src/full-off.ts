import fullConfig = require('./full.js');

/**
 * This config can be used to turn slow rules off.
 */
const config: import('eslint').Linter.Config = {
  rules: {
    ...Object.fromEntries(Object.keys(fullConfig.rules ?? {}).map((current) => [current, 'off'])),
  },
};

export = config;
