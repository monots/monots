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

import { debug, SUPPORTED_EXTENSIONS } from './config-constants.js';
import type {
  BundleConfigFile,
  ExportedConfig,
  GenerateLookupFiles,
  LoadEsmConfigResult,
  LoadFromFile,
  NodeModuleWithCompile,
} from './config-types.js';

/**
 * @template Config - the type of configuration that will be loaded.
 * @template Argument - the argument that is passed to the configuration if is
 * supports being called.
 */
export async function loadFromFile<Config extends object, Argument = unknown>(
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
  const stopAt = options.disableUpwardLookup ? options.cwd : undefined;
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
    // Target the current version of node.
    target: `node${process.versions.node}`,
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
