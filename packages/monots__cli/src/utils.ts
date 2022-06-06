/* eslint-disable unicorn/prefer-module */
import * as path from 'node:path';
import * as os from 'node:os';
import * as crypto from 'node:crypto';

const DIRNAME = path.dirname(new URL(import.meta.url).pathname);

/**
 * Get the absolute path within this package.
 */
export function getPackagePath(...paths: string[]) {
  return path.join(DIRNAME, '..', ...paths);
}
