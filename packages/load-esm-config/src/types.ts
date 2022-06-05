import type { PartialDeep } from 'type-fest';

import type { GetPattern, LogLevel, SupportedExtensions } from './constants.js';
import type { DeepMergeOptions } from './utils.js';

/**
 * The configuration as a function.
 */
type ConfigAsFunction<Config extends object, Argument = unknown> = (
  argument: Argument,
) => Config | Promise<Config>;

/**
 * The exported configuration type.
 */
export type ExportedConfig<Config extends object, Argument = unknown> =
  | Config
  | Promise<Config>
  | ConfigAsFunction<Config, Argument>;

/**
 * Taken from
 * https://github.com/vitejs/vite/blob/80dd2dfd8049c39e516e19ad5cfdaa1c5f02e4a3/packages/vite/src/node/config.ts#L832-L834
 */
export interface NodeModuleWithCompile extends NodeModule {
  _compile: (code: string, filename: string) => any;
}

/**
 * @template Config - the type of configuration that will be loaded.
 * @template Argument - the argument that is passed to the configuration if is
 * supports being called.
 */
export interface LoadEsmConfigOptions<Config extends object = object, Argument = unknown> {
  /**
   * The name of the configuration object to search for.
   *
   * ### Example
   *
   * The following will search for the files from the provided current working
   * directory.
   *
   * - `monots.config.js`
   * - `monots.config.ts`
   *
   * ```
   * await loadEsmConfig({name: 'monots'});
   * ```
   */
  name: string;

  /**
   * The directory to search from.
   *
   * @default process.cwd()
   */
  cwd?: string;

  /**
   * The initial configuration which will be used to set the defaults for the
   * eventually returned configuration.
   */
  config?: PartialDeep<Config>;

  /**
   * The export keys to find the configuration object. The first key in each
   * array will take priority.
   *
   * The empty string refers to a direct import and is only valid for `cjs`
   * `module.exports`.
   *
   * @default { esm: ['default'], cjs: ['', 'default'] }
   */
  exportKeys?: {
    esm: string[];
    cjs: string[];
  };

  /**
   * The file patterns to search for.
   *
   * @default
   *
   * ```ts
   * import * as path from 'node:path';
   *
   * function getPattern(props: GetPatternProps) {
   *   return [ path.join(props.directory, `${props.name}.config${props.extension}`)];
   * }
   * ```
   */
  getPattern?: GetPattern;

  /**
   * The extensions to support.
   *
   * @default ['.ts', '.mts', '.cts', '.js', '.mjs', '.cjs']
   */
  extensions?: SupportedExtensions[];

  /**
   * The same level configuration directories which should also be searched.
   *
   * The order of the directories determines the priority. By default
   * `.config/name.config.js` is preferred to `name.config.ts`.
   *
   * @default ['.config', '']
   */
  dirs?: string[];

  /**
   * If your configuration object supports being called with an argument, this
   * is used to generate the argument.
   *
   * It takes the options passed to `loadEsmConfig` and returns your desired
   * configuration.
   *
   * @default () => {}
   */
  getArgument?: (options: LoadEsmConfigOptions<Config>) => Argument;

  /**
   * Overwrite the way certain properties are merged.
   *
   * @see https://github.com/TehShrike/deepmerge#custommerge
   */
  mergeOptions?: DeepMergeOptions;

  /**
   * By default the configuration file is searched from the provided working
   * directory, but if not found, each parent directory will also be searched,
   * all the way to the root directory.
   *
   * If this behaviour is not desired, set this to `false`.
   *
   * @default false
   */
  disableUpwardLookup?: boolean;

  /**
   * The log level to use. Optionally you can provide your own instance of
   * `consola` with it's log level already set.
   */
  logLevel?: LogLevel;

  /**
   * Alias certain dependencies.
   *
   * This is helpful when the file being loaded will not be loaded in the
   * context of the imported dependencies.
   *
   * The format is identical to the `tsconfig.json > compilerOptions.paths` property.
   */
  alias?: Record<string, string>;
}

/**
 * @template Config - the type of configuration that will be loaded.
 */
export interface LoadEsmConfigResult<Config extends object = any> {
  /**
   * The absolute path to the resolved configuration file.
   */
  path: string;

  /**
   * The configuration object that was loaded.
   */
  config: Config;

  /**
   * All the dependencies encountered while loading the file.
   */
  dependencies: string[];

  /**
   * The root directory of the configuration file. For nested configuration
   * files, it will show parent folder.
   */
  root: string;
}

export interface BundleConfigFile {
  fileName: string;
  isEsModule?: boolean;
  cwd: string;
  alias?: Record<string, string>;
}

export interface GenerateLookupFiles
  extends Pick<Required<LoadEsmConfigOptions>, 'name' | 'extensions' | 'dirs' | 'getPattern'> {}

export type { Consola } from 'consola';
