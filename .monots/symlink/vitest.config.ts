/// <reference types="vitest" />
import * as path from 'node:path';
import { defineConfig } from 'vite';
import { baseDir } from '../scripts/helpers.js';
import { loadJsonFile } from 'load-json-file';
import tsconfigPaths from 'vite-tsconfig-paths';

const referenceTsConfig = await loadJsonFile<{ references: Array<{ path: string }> }>(
  baseDir('tsconfig.json'),
);

const projects = referenceTsConfig.references.map((reference) =>
  path.join(reference.path, 'tsconfig.json'),
);

export default defineConfig({
  plugins: [tsconfigPaths({ projects })],
  test: {
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
