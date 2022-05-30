import * as path from 'node:path';

import { SUPPORTED_EXTENSIONS } from './constants.js';
import type { GenerateLookupFiles } from './types.js';

/**
 * Check that the file is a TypeScript file.
 */
export function isTypeScriptFile(filename: string): boolean {
  return SUPPORTED_EXTENSIONS.filter((ext) => ['.tsx', '.ts', '.cts', '.mts'].includes(ext)).some(
    (ext) => filename.endsWith(ext),
  );
}

/**
 * Check if the file is an esmodule file. `false` doesn't that the file won't be loaded as an esmodule.
 */
export function isEsModuleFile(filename: string): boolean {
  return SUPPORTED_EXTENSIONS.filter((ext) => ['.mjs', '.mts'].includes(ext)).some((ext) =>
    filename.endsWith(ext),
  );
}

/**
 * Check if the file is an esmodule file.
 */
export function isCommonJsFile(filename: string): boolean {
  return SUPPORTED_EXTENSIONS.filter((ext) => ['.cjs', '.cts'].includes(ext)).some((ext) =>
    filename.endsWith(ext),
  );
}

/**
 * Generate the files to load the configuration from.
 */
export function generateLookupFiles(options: GenerateLookupFiles): string[] {
  const { name, extensions, dirs } = options;
  const files: string[] = [];

  for (const dir of dirs) {
    for (const ext of extensions) {
      files.push(path.join(dir, `${name}.config${ext}`));
    }
  }

  return files;
}
