import path from 'node:path';
import url from 'node:url';
import { readPackageUpSync } from 'read-pkg-up';
import updateNotifier from 'update-notifier';

import type { CommandContext } from './types.js';

const SEPARATOR = '__';
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

/**
 * Notify the user of available updates to the CLI.
 */
export function notifyUpdate(context: CommandContext) {
  const { name, internal, version } = context;

  if (internal) {
    return;
  }

  updateNotifier({ pkg: { name, version } }).notify();
}

export function getPackageJson() {
  const packageJson = readPackageUpSync({ cwd: __dirname })?.packageJson;

  if (!packageJson) {
    throw new Error('Invalid installation of `monots`');
  }

  return packageJson;
}

/**
 * Get the absolute path within this package.
 */
export function getPackagePath(...paths: string[]) {
  return path.join(__dirname, '..', ...paths);
}

/**
 * Convert a mangled name to its unmangled version.
 *
 * `babel__types` => `@babel/types`.
 */
export function unmangleScopedPackage(mangledName: string): string {
  return mangledName.includes(SEPARATOR) ? `@${mangledName.replace(SEPARATOR, '/')}` : mangledName;
}

/**
 * Mangle a scoped package name. Which removes the `@` symbol and adds a `__`
 * separator.
 *
 * `@babel/types` => `babel__types`
 */
export function mangleScopedPackageName(packageName: string): string {
  if (packageName.indexOf('@') === 0 && packageName.includes('/')) {
    // we have a scoped module, e.g. @bla/foo
    // which should be converted to   bla__foo
    packageName = packageName.slice(1).replace('/', '__');
  }

  return packageName;
}
