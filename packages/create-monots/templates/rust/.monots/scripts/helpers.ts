import path from 'node:path';
import url from 'node:url';
import { Package } from '@manypkg/get-packages';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

/**
 * Resolve a path relative to the base directory.
 *
 * @param {string[]} paths
 */
export function baseDir(...paths: string[]) {
  return path.resolve(__dirname, '../..', ...paths);
}

export type Pkg = Package['packageJson'] & {
  location: string;
};
