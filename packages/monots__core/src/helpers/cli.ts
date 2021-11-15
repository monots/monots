/* eslint-disable unicorn/prefer-module */
import path from 'node:path';
import { readPackageUpSync } from 'read-pkg-up';

const SEPARATOR = '__';
let DIRNAME: string;

try {
  DIRNAME = path.dirname(new URL(import.meta.url).pathname);
} catch (error) {
  if (typeof __dirname === 'string') {
    DIRNAME = __dirname;
  } else {
    throw error;
  }
}

export function getPackageJson() {
  const packageJson = readPackageUpSync({ cwd: DIRNAME })?.packageJson;

  if (!packageJson) {
    throw new Error('Invalid installation of `monots`');
  }

  return packageJson;
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
