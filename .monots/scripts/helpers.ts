import type { Package } from '@manypkg/get-packages';
import * as path from 'node:path';

const DIRNAME = path.dirname(new URL(import.meta.url).pathname);

/**
 * Resolve a path relative to the base directory.
 *
 * @param {string[]} paths
 */
export function baseDir(...paths: string[]) {
  return path.resolve(DIRNAME, '../..', ...paths);
}

export type Pkg = Package['packageJson'] & {
  location: string;
};
