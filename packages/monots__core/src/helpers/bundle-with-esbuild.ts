import { build } from 'esbuild';
import * as path from 'node:path';

import type { PackageEntity } from '../entities/index.js';
import { builtins } from './build-with-rollup.js';

/**
 * This bundles all the files into one exportable with all dependencies
 * included.
 *
 * This is primarily used for cli packages.
 */
export async function bundleWithEsbuild(pkg: PackageEntity) {
  const promises: Array<() => Promise<void>> = [];

  for (const entrypoint of pkg.entrypoints) {
    promises.push(async () => {
      await build({
        entryPoints: [entrypoint.source],
        outfile: path.join(pkg.output, `${entrypoint.baseName || 'index'}.js`),
        minify: false,
        sourcemap: false,
        bundle: true,
        external: [...builtins, 'esbuild', 'fsevents', ...Object.keys(pkg.json.dependencies ?? [])],
        target: 'node16.10.0',
        platform: 'node',
        format: pkg.json.type === 'module' ? 'esm' : 'cjs',
      });
    });
  }

  await Promise.all(promises.map((p) => p()));
}
