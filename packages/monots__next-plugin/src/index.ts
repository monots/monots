/* eslint-disable unicorn/prefer-module */
import { type NextConfig } from 'next';
import { type Configuration, type RuleSetRule } from 'webpack';

const hookLoader = require.resolve('@monots/next-plugin/hook');

/**
 * The monots plugin for next.js to support loading non-transpiled files on the
 * server and browser.
 */
function monotsNextPlugin(nextConfig: NextConfig = {}) {
  const originalWebpack = nextConfig.webpack;

  nextConfig.webpack = (webpackConfig: Configuration, options) => {
    let hasFoundRule = false;
    options.defaultLoaders.babel.options.rootMode = 'upward-optional';

    const foundRule = (rule: RuleSetRule | '...') => {
      if (rule === '...') {
        return;
      }

      if (
        rule.use === options.defaultLoaders.babel ||
        (Array.isArray(rule.use) && rule.use.includes(options.defaultLoaders.babel))
      ) {
        hasFoundRule = true;
        delete rule.include;
      }

      for (const childRule of rule.oneOf ?? []) {
        foundRule(childRule);
      }
    };

    // Look at top level rules
    for (const rule of webpackConfig.module?.rules ?? []) {
      foundRule(rule);
    }

    if (!hasFoundRule) {
      throw new Error(
        'If you see this error, please open an issue with your Next.js version and @monots/next-plugin version. The Next Default loader could not be found',
      );
    }

    webpackConfig.module?.rules?.unshift({
      test: /\/node_modules\/@swc\/register\/lib\/index\.js$/,
      use: hookLoader,
    });

    return originalWebpack ? originalWebpack(webpackConfig, options) : webpackConfig;
  };

  return nextConfig;
}

export = monotsNextPlugin;
