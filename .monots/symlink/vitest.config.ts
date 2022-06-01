/// <reference types="vitest" />
import * as path from 'node:path';
import { defineConfig } from 'vite';

const config = defineConfig(async () => {
  return {
    test: {
      open: true,
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
