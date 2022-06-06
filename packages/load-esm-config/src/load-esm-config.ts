import { isFunction } from 'is-what';
import { findUp } from 'find-up';
import * as path from 'node:path';
import normalizePath from 'normalize-path';

import { DEFAULT_GET_ARGUMENT, DEFAULT_GET_PATTERN } from './constants.js';
import { loadEsmFile } from './load-esm-file.js';
import type { ExportedConfig, LoadEsmConfigOptions, LoadEsmConfigResult } from './types.js';
import { createLogger, deepMerge, generateLookupFiles } from './utils.js';

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
    getPattern = DEFAULT_GET_PATTERN,
    disableUpwardLookup = false,
    mergeOptions,
    exportKeys = { esm: ['default'], cjs: ['', 'default'] },
    logLevel,
    alias,
  } = options;

  const logger = createLogger(logLevel); // track the performance of loading the file.
  const argument = getArgument(options);
  const LOOKUP_FILES = generateLookupFiles({ name, extensions, dirs, getPattern }); // lookup the configuration file from the provided `cwd`.
  const stopAt = disableUpwardLookup ? cwd : undefined;
  let root = cwd;
  let filepath: string | undefined;

  for (const relativeFile of LOOKUP_FILES) {
    const file = await findUp(relativeFile, { cwd, stopAt });

    if (!file) {
      continue;
    }

    filepath = file;
    root = normalizePath(filepath.replace(new RegExp(`/${relativeFile}$`), ''));
    break;
  }

  if (!filepath) {
    logger.info(`no configuration file found for ${name}`);
    return;
  }

  const result = await loadEsmFile(filepath, { logLevel: logger, alias });

  if (!result) {
    logger.info(`no configuration file found for ${name}`);
    return;
  }

  const { dependencies, exported, isEsModule } = result;
  // const exportedConfig = isEsModule ? exported.default : exported;
  let exportedConfig: ExportedConfig<Config> | undefined;

  // eslint-disable-next-line unicorn/prefer-ternary
  if (isEsModule) {
    for (const key of exportKeys.esm) {
      if (key === '') {
        const error = new Error(
          'Invalid config: Cannot use an empty string as export key for esm.',
        );
        logger.error(error);
        throw error;
      }

      if (exported[key]) {
        exportedConfig = exported[key];
        break;
      }
    }
  } else {
    for (const key of exportKeys.cjs) {
      const value = key === '' ? exported : exported[key];

      if (value) {
        exportedConfig = value;
        break;
      }
    }

    exportedConfig = exported;
  }

  const config = await (isFunction(exportedConfig) ? exportedConfig(argument) : exportedConfig);

  if (typeof config !== 'object') {
    const error = new Error(`the provided configuration must export or return an object.`);
    logger.error(error);
    throw error;
  }

  return {
    config: deepMerge([defaultConfig, config], mergeOptions),
    dependencies: dependencies.map((name) => normalizePath(path.resolve(name))),
    path: normalizePath(filepath),
    root,
  };
}
