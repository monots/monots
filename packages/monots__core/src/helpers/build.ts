import { bundle } from '@swc/core';
import type { BundleOptions } from '@swc/core/spack';
import fs from 'node:fs/promises';

import { builtins } from './rollup.js';

export interface BundleItem {
  /**
   * Set to true for a commonJS build.
   */
  commonjs?: boolean;

  /**
   * The external modules from the dependencies and devDependencies.
   */
  externalModules: string[];

  entries: {
    [destination: string]: string;
  };

  outputDirectory: string;
}

/**
 * This function uses parcel to build. With the current version the build is
 * difficult to use.
 */
export async function bundleWithSwc(items: BundleItem[]): Promise<void> {
  const inputs: BundleOptions[] = [];
  let promises: Array<Promise<void>> = [];

  for (const item of items) {
    const { entries, commonjs, externalModules, outputDirectory } = item;

    // Create the inputs for bundling.
    inputs.push({
      entry: entries,
      output: { path: outputDirectory, name: '' },
      module: {},
      target: commonjs ? 'node' : 'browser',
      options: {
        module: commonjs ? { type: 'commonjs' } : undefined,
        env: { targets: ['since 2020'] },
        jsc: {},
      },
      externalModules: [...externalModules, ...builtins],
    });
  }
  // promises = [];
  // const values = await Promise.all(inputs.map(input => bundle(input)));

  await Promise.all(promises);
  const output = await bundle(inputs);
  promises = [];

  for (const [destination, { code }] of Object.entries(output)) {
    // Create the file with the code.
    promises.push(fs.writeFile(destination, code));
  }

  // Write the files
  await Promise.all(promises);
}
