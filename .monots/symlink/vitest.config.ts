/// <reference types="vitest" />
import { getPackages } from '@manypkg/get-packages';
import * as path from 'node:path';
import { defineConfig } from 'vite';

const config = defineConfig(async () => {
  const alias: Record<string, string> = Object.create(null);
  const { packages } = await getPackages(process.cwd());

  for (const { packageJson, dir } of packages) {
    alias[packageJson.name] = path.join(dir, 'src/index.ts');
  }

  return {
    resolve: { alias },
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
  };
});

export default config;
