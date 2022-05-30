import { deepMerge, is, normalizePath } from '@monots/utils';
import { findUpMultiple } from 'find-up';
import * as path from 'node:path';

import { debug, DEFAULT_GET_ARGUMENT } from './constants.js';
import { loadEsmFile } from './load-esm-file.js';
import type { LoadEsmConfigOptions, LoadEsmConfigResult } from './types.js';
import { generateLookupFiles } from './utils.js';

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
    extensions = ['.ts', '.tsx', '.mts', '.cts', '.js', '.jsx', '.mjs', '.cjs'],
    getArgument = DEFAULT_GET_ARGUMENT,
    disableUpwardLookup = false,
    mergeOptions,
  } = options;
  // track the performance of loading the file.

  const argument = getArgument(options);

  // lookup the configuration file from the provided `cwd`.
  const LOOKUP_FILES = generateLookupFiles({ name, extensions, dirs });
  const stopAt = disableUpwardLookup ? cwd : undefined;
  const files = await findUpMultiple(LOOKUP_FILES, { stopAt, cwd: cwd });
  const filepath = files.at(0);

  if (!filepath) {
    debug(`no configuration file found for ${name}`);
    return;
  }

  const result = await loadEsmFile(filepath);

  if (!result) {
    debug(`no configuration file found for ${name}`);
    return;
  }

  const { dependencies, exported, isEsModule } = result;
  const exportedConfig = isEsModule ? exported.default : exported;
  const config = await (is.function_(exportedConfig) ? exportedConfig(argument) : exportedConfig);

  if (typeof config !== 'object') {
    debug('configuration file did not return an object');
    throw new Error(`the provided configuration must export or return an object.`);
  }

  return {
    config: deepMerge([defaultConfig, config], mergeOptions),
    dependencies: dependencies.map((name) => normalizePath(path.resolve(name))),
    path: normalizePath(filepath),
  };
}
