import { deepMerge, normalizePath } from '@monots/utils';
import * as path from 'node:path';

import { DEFAULT_GET_ARGUMENT } from './config-constants.js';
import type { LoadEsmConfigOptions, LoadEsmConfigResult } from './config-types.js';
import { loadFromFile } from './load-from-file.js';

/**
 * Load a configuration file with the given name.
 *
 * The configuration file is a typescript or javascript file.
 *
 * The following extensions are supported: `.ts` | `.mts` | `.cts` | `.js` |
 * `.mjs` | `.cjs`.
 *
 * @template Config - the type of configuration that will be loaded.
 * @template Argument - the argument that is passed to the configuration if is
 * supports being called.
 */
export async function loadEsmConfig<Config extends object = any, Argument = unknown>(
  options: LoadEsmConfigOptions<Config, Argument>,
): Promise<LoadEsmConfigResult<Config> | undefined> {
  const {
    name,
    config: defaultConfig = {},
    cwd = process.cwd(),
    dirs = ['.config', ''],
    extensions = ['.ts', '.mts', '.cts', '.js', '.mjs', '.cjs'],
    getArgument = DEFAULT_GET_ARGUMENT,
    disableUpwardLookup = false,
    mergeOptions,
  } = options;
  const argument = getArgument(options);
  const config = defaultConfig as Config;
  const result = await loadFromFile({ name, argument, cwd, dirs, extensions, disableUpwardLookup });

  if (!result) {
    return;
  }

  return {
    config: deepMerge([config, result.config], mergeOptions),
    dependencies: result.dependencies.map((name) => normalizePath(path.resolve(name))),
    path: normalizePath(result.path),
  };
}
