import { build } from 'esbuild';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { pathToFileURL } from 'node:url';
import { readPackageUp } from 'read-pkg-up';
import invariant from 'tiny-invariant';
import { objectKeys } from 'ts-extras';
import { parse } from 'tsconfck';

import { debug } from './constants.js';
import { loadFromBundledFile } from './load-from-bundled-file';
import type { BundleConfigFile } from './types.js';
import { isCommonJsFile, isEsModuleFile, isTypeScriptFile } from './utils';

export interface LoadEsmFileResult {
  /**
   * The exports loaded from the file.
   */
  exported: any;

  /**
   * The dependencies within the file.
   */
  dependencies: string[];

  /**
   * Whether the file is a TypeScript file.
   */
  isTypeScript: boolean;

  /**
   * The EsModule file name.
   */
  isEsModule: boolean;
}

/**
 * Load all the exports from the requested file. This will check the nearest
 * package.json for whether to load the file as an esm module.
 *
 * If the closest parent `package.json` file has a `"type": "module"` then this
 * will be loaded as an esm module.
 */
export async function loadEsmFile(filepath: string): Promise<LoadEsmFileResult | undefined> {
  const cwd = path.dirname(filepath);
  const start = performance.now();
  const getDuration = () => `${(performance.now() - start).toFixed(2)}ms`;

  let isTypeScript = false;
  let isEsModule = false;
  let dependencies: string[] = [];

  // check package.json for type: "module" and set `isEsModule` to true
  try {
    const pkg = await readPackageUp({ cwd });

    if (pkg?.packageJson.type === 'module') {
      isEsModule = true;
    }
  } catch {
    // ignoring any errors here
  }

  isEsModule = isEsModuleFile(filepath) ? true : isCommonJsFile(filepath) ? false : isEsModule;
  isTypeScript = isTypeScriptFile(filepath);

  let exported: any;

  if (isEsModule) {
    const fileUrl = pathToFileURL(filepath);
    const bundled = await bundleConfigFile({ fileName: filepath, isEsModule, cwd });
    const now = Date.now();
    dependencies = bundled.dependencies;

    if (isTypeScript) {
      const tmpFile = `${filepath}.js`;
      // before we can register loaders without requiring users to run node
      // with --experimental-loader themselves, we have to do a hack here:
      // bundle the config file w/ ts transforms first, write it to disk,
      // load it with native Node ESM, then delete the file.
      try {
        await fs.writeFile(tmpFile, bundled.code);
        exported = await import(`${fileUrl}.js?t=${now}`);
        debug(`TS + native esm config loaded in ${getDuration()}`, fileUrl);
      } finally {
        await fs.unlink(tmpFile);
      }
    } else {
      exported = await import(`${fileUrl}?t=${now}`);
      debug(`native esm config loaded in ${getDuration()}`, fileUrl);
    }
  }

  if (!exported) {
    // bundle config file and transpile to cjs using esbuild
    const bundled = await bundleConfigFile({ fileName: filepath, cwd });
    dependencies = bundled.dependencies;
    exported = await loadFromBundledFile(filepath, bundled.code);
    debug(`bundled config file loaded in ${getDuration()}`);
  }

  if (!exported) {
    return;
  }

  return { exported, dependencies, isTypeScript, isEsModule };
}

/**
 * Adapted from  https://github.com/vitejs/vite/blob/80dd2dfd8049c39e516e19ad5cfdaa1c5f02e4a3/packages/vite/src/node/config.ts#L774-L830
 */
async function bundleConfigFile(
  options: BundleConfigFile,
): Promise<{ code: string; dependencies: string[] }> {
  const { fileName, cwd, isEsModule = false } = options;
  const { tsconfig } = await parse(fileName);
  const tsconfigPaths = objectKeys(tsconfig?.compilerOptions?.paths ?? {}).map(
    (path) => new RegExp(`^${path.replace('*', '[a-zA-Z-_\\$\\[\\]]*')}`),
  );

  const result = await build({
    absWorkingDir: cwd,
    entryPoints: [fileName],
    outfile: 'out.js',
    write: false,
    platform: 'node',
    bundle: true,

    // logLevel: 'verbose',
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
            if (
              args.path[0] === '.' ||
              path.isAbsolute(args.path) ||
              tsconfigPaths.some((regex) => regex.test(args.path ?? ''))
            ) {
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
