import { loadJsonFile } from 'load-json-file';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

import { baseDir } from '../scripts/helpers.js';

const tsconfig = await fs.readFile(baseDir('tsconfig.json'), { encoding: 'utf8' });
const referenceTsConfig: { references: Array<{ path: string }> } = JSON.parse(tsconfig);

const projects = referenceTsConfig.references.map((reference) =>
  path.join(reference.path, 'tsconfig.json'),
);

export default defineConfig({
  plugins: [tsconfigPaths({ projects })],
  test: {
    include: ['**/*.spec.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    resolveSnapshotPath,
  },
});

/** rename `__snapshots__` to `snapshots` */
function resolveSnapshotPath(testPath: string, snapExtension: string) {
  return path.join(
    path.dirname(testPath),
    'snapshots',
    `${path.basename(testPath)}${snapExtension}`,
  );
}
