import { build } from 'esbuild';
import path from 'node:path';

import type { PackageEntity } from '../entities/index.js';

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
        outfile: path.join(pkg.output, `${entrypoint.baseName ?? 'index'}.js`),
        minify: true,
        sourcemap: false,
        bundle: true,
        external: [],
        target: 'node14.13.0',
        platform: 'node',
        format: 'esm',
      });
    });
  }

  await Promise.all(promises.map((p) => p()));
}
