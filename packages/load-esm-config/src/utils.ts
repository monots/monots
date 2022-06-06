import { isNumber, isPlainObject, isString } from 'is-what';
import consola from 'consola';
import merge, { type Options as DeepMergeOptions } from 'deepmerge';

import { LogLevel, SUPPORTED_EXTENSIONS } from './constants.js';
import type { GenerateLookupFiles } from './types.js';

const { Consola } = consola as unknown as typeof import('consola');

/**
 * Create a logger from the provided log level.
 */
export function createLogger(logLevel?: LogLevel): import('consola').Consola {
  return !logLevel
    ? new Consola({ level: LogLevel.log })
    : isString(logLevel)
    ? new Consola({ level: LogLevel[logLevel] ?? 2 })
    : isNumber(logLevel)
    ? new Consola({
        level:
          logLevel < 0
            ? Number.NEGATIVE_INFINITY
            : logLevel > 5
            ? Number.POSITIVE_INFINITY
            : logLevel,
      })
    : logLevel;
}

/**
 * Check that the file is a TypeScript file.
 */
export function isTypeScriptFile(filename: string): boolean {
  return SUPPORTED_EXTENSIONS.filter((ext) => ['.tsx', '.ts', '.cts', '.mts'].includes(ext)).some(
    (ext) => filename.endsWith(ext),
  );
}

/**
 * Check if the file is an esmodule file. `false` doesn't that the file won't be loaded as an esmodule.
 */
export function isEsModuleFile(filename: string): boolean {
  return SUPPORTED_EXTENSIONS.filter((ext) => ['.mjs', '.mts'].includes(ext)).some((ext) =>
    filename.endsWith(ext),
  );
}

/**
 * Check if the file is an esmodule file.
 */
export function isCommonJsFile(filename: string): boolean {
  return SUPPORTED_EXTENSIONS.filter((ext) => ['.cjs', '.cts'].includes(ext)).some((ext) =>
    filename.endsWith(ext),
  );
}

/**
 * Generate the files to load the configuration from.
 */
export function generateLookupFiles(options: GenerateLookupFiles): string[] {
  const { name, extensions, dirs, getPattern } = options;
  const files: string[] = [];

  for (const directory of dirs) {
    for (const extension of extensions) {
      files.push(...getPattern({ name, extension, directory }));
    }
  }

  return files;
}

export { type Options as DeepMergeOptions } from 'deepmerge';

/**
 * A deep merge which only merges plain objects and Arrays. It clones the object
 * before the merge so will not mutate any of the passed in values.
 *
 * To completely remove a key you can use the `Merge` helper class which
 * replaces it's key with a completely new object
 */
export function deepMerge<Type = any>(
  objects: Array<object | unknown[]>,
  options?: DeepMergeOptions,
): Type {
  return merge.all<Type>(objects as any, { isMergeableObject: isPlainObject, ...options });
}
