import { loadJsonFile } from 'load-json-file';
import * as path from 'node:path';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

import { baseDir } from '../scripts/helpers.js';

const referenceTsConfig = await loadJsonFile<{ references: Array<{ path: string }> }>(
  baseDir('tsconfig.json'),
);

const projects = referenceTsConfig.references.map((reference) =>
  path.join(reference.path, 'tsconfig.json'),
);

export default defineConfig({
  plugins: [tsconfigPaths({ projects })],
  test: {
    include: ['**/*.spec.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],

    // rename `__snapshots__` to `snapshots`
    resolveSnapshotPath(testPath, snapExtension) {
      return path.join(
        path.dirname(testPath),
        'snapshots',
        `${path.basename(testPath)}${snapExtension}`,
      );
    },
  },
});
