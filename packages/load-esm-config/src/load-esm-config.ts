import type { DeepMergeOptions } from '@monots/utils';
import { createDebugger, deepMerge, normalizePath } from '@monots/utils';
import is from '@sindresorhus/is';
import { build } from 'esbuild';
import { findUpMultiple } from 'find-up';
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { pathToFileURL } from 'node:url';
import { readPackageUp } from 'read-pkg-up';
import invariant from 'tiny-invariant';
import type { PartialDeep } from 'type-fest';

import type { SupportedExtensions } from './constants.js';
import { DEFAULT_GET_ARGUMENT, SUPPORTED_EXTENSIONS } from './constants.js';

const debug = createDebugger('monots:load-esm-config');

type ConfigAsFunction<Config extends object, Argument = unknown> = (
  argument: Argument,
) => Config | Promise<Config>;
export type ExportedConfig<Config extends object, Argument = unknown> =
  | Config
  | Promise<Config>
  | ConfigAsFunction<Config, Argument>;

/**
 * @template Config - the type of configuration that will be loaded.
 * @template Argument - the argument that is passed to the configuration if is
 * supports being called.
 */
export interface LoadEsmConfig<Config extends object = object, Argument = unknown> {
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
   * provided configuration.
   */
  config?: PartialDeep<Config>;

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
  getArgument?: (options: LoadEsmConfig<Config>) => Argument;

  /**
   * Overwrite the way certain properties are merged.
   *
   * @see https://github.com/TehShrike/deepmerge#custommerge
   */
  mergeOptions?: DeepMergeOptions;

  /**
   * When looking for the configuration file set this to true to keep looking
   * for the file all the way to the root.
   *
   * @default false
   */
  lookupFilesToRoot?: boolean;
}

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
}

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
  options: LoadEsmConfig<Config, Argument>,
): Promise<LoadEsmConfigResult<Config> | undefined> {
  const {
    name,
    config: defaultConfig = {},
    cwd = process.cwd(),
    dirs = ['.config', ''],
    extensions = ['.ts', '.mts', '.cts', '.js', '.mjs', '.cjs'],
    getArgument = DEFAULT_GET_ARGUMENT,
    lookupFilesToRoot = false,
    mergeOptions,
  } = options;
  const argument = getArgument(options);
  const config = defaultConfig as Config;
  const result = await loadFromFile({ name, argument, cwd, dirs, extensions, lookupFilesToRoot });

  if (!result) {
    return;
  }

  return {
    config: deepMerge([config, result.config], mergeOptions),
    dependencies: result.dependencies.map((name) => normalizePath(path.resolve(name))),
    path: normalizePath(result.path),
  };
}

interface LoadFromFile<Argument = unknown> {
  name: string;
  argument: Argument;
  cwd: string;
  extensions: SupportedExtensions[];
  dirs: string[];
  lookupFilesToRoot: boolean;
}

/**
 * @template Config - the type of configuration that will be loaded.
 * @template Argument - the argument that is passed to the configuration if is
 * supports being called.
 */
async function loadFromFile<Config extends object, Argument = unknown>(
  options: LoadFromFile<Argument>,
): Promise<LoadEsmConfigResult | undefined> {
  // track the performance of loading the file.
  const start = performance.now();
  const getTime = () => `${(performance.now() - start).toFixed(2)}ms`;

  let isTypeScript = false;
  let isEsModule = false;
  let dependencies: string[] = [];

  // check package.json for type: "module" and set `isEsModule` to true
  try {
    const pkg = await readPackageUp({ cwd: options.cwd });

    if (pkg?.packageJson.type === 'module') {
      isEsModule = true;
    }
  } catch {
    // ignoring any errors here
  }

  // lookup the configuration file from the provided `cwd`.
  const LOOKUP_FILES = generateLookupFiles(options);
  const stopAt = options.lookupFilesToRoot ? undefined : options.cwd;
  const files = await findUpMultiple(LOOKUP_FILES, { stopAt, cwd: options.cwd });
  const resolvedPath = files.at(0);

  if (!resolvedPath) {
    debug(`no configuration file found for ${options.name}`);
    return;
  }

  if (isEsModuleFile(resolvedPath)) {
    isEsModule = true;
  }

  if (isTypeScriptFile(resolvedPath)) {
    isTypeScript = true;
  }

  if (isCommonJsFile(resolvedPath)) {
    isEsModule = false;
  }

  let exportedConfig: ExportedConfig<Config, Argument> | undefined;

  if (isEsModule) {
    const fileUrl = pathToFileURL(resolvedPath);
    const bundled = await bundleConfigFile({ fileName: resolvedPath, isEsModule });
    const now = Date.now();
    dependencies = bundled.dependencies;

    if (isTypeScript) {
      const tmpFile = `${resolvedPath}.js`;
      // before we can register loaders without requiring users to run node
      // with --experimental-loader themselves, we have to do a hack here:
      // bundle the config file w/ ts transforms first, write it to disk,
      // load it with native Node ESM, then delete the file.
      await fs.writeFile(tmpFile, bundled.code);
      ({ default: exportedConfig } = await import(`${fileUrl}.js?t=${now}`));
      await fs.unlink(tmpFile);
      debug(`TS + native esm config loaded in ${getTime()}`, fileUrl);
    } else {
      // using Function to avoid this from being compiled away by TS/Rollup
      // append a query so that we force reload fresh config in case of
      // server restart
      ({ default: exportedConfig } = await import(`${fileUrl}?t=${now}`));
      debug(`native esm config loaded in ${getTime()}`, fileUrl);
    }
  }

  if (!exportedConfig) {
    // bundle config file and transpile to cjs using esbuild
    const bundled = await bundleConfigFile({ fileName: resolvedPath });
    dependencies = bundled.dependencies;
    exportedConfig = await loadFromBundledFile<Config, Argument>(resolvedPath, bundled.code);
    debug(`bundled config file loaded in ${getTime()}`);
  }

  const config = await (is.function_(exportedConfig)
    ? exportedConfig(options.argument)
    : exportedConfig);

  if (!is.object(config)) {
    debug('configuration file did not return an object');
    throw new Error(`config must export or return an object.`);
  }

  return { path: resolvedPath, config, dependencies };
}

interface BundleConfigFile {
  fileName: string;
  isEsModule?: boolean;
}

/**
 * Adapted from  https://github.com/vitejs/vite/blob/80dd2dfd8049c39e516e19ad5cfdaa1c5f02e4a3/packages/vite/src/node/config.ts#L774-L830
 */
async function bundleConfigFile(
  options: BundleConfigFile,
): Promise<{ code: string; dependencies: string[] }> {
  const { fileName, isEsModule = false } = options;
  const result = await build({
    absWorkingDir: process.cwd(),
    entryPoints: [fileName],
    outfile: 'out.js',
    write: false,
    platform: 'node',
    bundle: true,
    format: isEsModule ? 'esm' : 'cjs',
    sourcemap: 'inline',
    metafile: true,
    plugins: [
      {
        name: 'externalize-deps',
        setup(build) {
          build.onResolve({ filter: /.*/ }, (args) => {
            if (args.path[0] === '.' || path.isAbsolute(args.path)) {
              return;
            }

            return { external: true };
          });
        },
      },
      {
        name: 'replace-import-meta',
        setup(build) {
          build.onLoad({ filter: /\.[jt]s$/ }, async (args) => {
            const contents = await fs.readFile(args.path, 'utf8');

            return {
              loader: isTypeScriptFile(args.path) ? 'ts' : 'js',
              contents: contents
                .replace(/\bimport\.meta\.url\b/g, JSON.stringify(pathToFileURL(args.path).href))
                .replace(/\b__dirname\b/g, JSON.stringify(path.dirname(args.path)))
                .replace(/\b__filename\b/g, JSON.stringify(args.path)),
            };
          });
        },
      },
    ],
  });

  const output = result.outputFiles[0];
  invariant(output, 'Bundling the output file failed');

  return {
    code: output.text,
    dependencies: result.metafile ? Object.keys(result.metafile.inputs) : [],
  };
}

function isTypeScriptFile(filename: string): boolean {
  return SUPPORTED_EXTENSIONS.filter((ext) => ext.endsWith('ts')).some((ext) =>
    filename.endsWith(ext),
  );
}

/**
 * Check if the file is an esmodule file.
 */
function isEsModuleFile(filename: string): boolean {
  return SUPPORTED_EXTENSIONS.filter((ext) => ['.mjs', '.mts'].includes(ext)).some((ext) =>
    filename.endsWith(ext),
  );
}

/**
 * Check if the file is an esmodule file.
 */
function isCommonJsFile(filename: string): boolean {
  return SUPPORTED_EXTENSIONS.filter((ext) => ['.cjs', '.cts'].includes(ext)).some((ext) =>
    filename.endsWith(ext),
  );
}

interface GenerateLookupFiles {
  name: string;
  extensions: SupportedExtensions[];
  dirs: string[];
}

/**
 * Generate the files to load the configuration from.
 */
function generateLookupFiles(options: GenerateLookupFiles): string[] {
  const { name, extensions, dirs } = options;
  const files: string[] = [];

  for (const dir of dirs) {
    for (const ext of extensions) {
      files.push(path.join(dir, `${name}.config${ext}`));
    }
  }

  return files;
}

const _require = createRequire(import.meta.url);

/**
 * Taken from https://github.com/vitejs/vite/blob/80dd2dfd8049c39e516e19ad5cfdaa1c5f02e4a3/packages/vite/src/node/config.ts#L837-L857
 */
async function loadFromBundledFile<Config extends object, Argument = unknown>(
  fileName: string,
  bundledCode: string,
): Promise<ExportedConfig<Config, Argument>> {
  const extension = path.extname(fileName);
  const realFileName = await fs.realpath(fileName);
  const defaultLoader = _require.extensions[extension];

  _require.extensions[extension] = (module: NodeModule, filename: string) => {
    if (filename === realFileName) {
      (module as NodeModuleWithCompile)._compile(bundledCode, filename);
    } else {
      defaultLoader?.(module, filename);
    }
  };

  // clear cache in case of server restart
  Reflect.deleteProperty(_require.cache, _require.resolve(fileName));

  const raw = _require(fileName);
  const config = raw.__esModule ? raw.default : raw;
  _require.extensions[extension] = defaultLoader;
  return config;
}

/**
 * Taken from https://github.com/vitejs/vite/blob/80dd2dfd8049c39e516e19ad5cfdaa1c5f02e4a3/packages/vite/src/node/config.ts#L832-L834
 */
interface NodeModuleWithCompile extends NodeModule {
  _compile: (code: string, filename: string) => any;
}
