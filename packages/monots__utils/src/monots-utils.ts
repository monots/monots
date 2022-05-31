import is from '@sindresorhus/is';
import { camelCaseIt, kebabCaseIt } from 'case-it';
import debug from 'debug';
import merge, { type Options as DeepMergeOptions } from 'deepmerge';
import { template } from 'lodash-es';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { Transform } from 'node:stream';
import { readPackageUp, readPackageUpSync } from 'read-pkg-up';
import copy from 'recursive-copy';

/**
 * Removes all undefined values from an object. Neither Firestore nor the
 * RealtimeDB allow `undefined` as a value.
 *
 * @param data The object to clean
 */
export function removeUndefined<Shape extends object>(data: Shape) {
  const transformed = Object.create({});

  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) {
      continue;
    }

    transformed[key] = value;
  }

  return transformed;
}

/**
 * Check if a file exists for the provided `filePath` the provided target.
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    const stat = await fs.lstat(filePath);
    return stat.isFile();
  } catch {
    return false;
  }
}

/**
 * Check if a folder exists for the provided `folderPath` the provided target.
 */
export async function folderExists(folderPath: string): Promise<boolean> {
  try {
    const stat = await fs.lstat(folderPath);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

/**
 * A deep merge which only merges plain objects and Arrays. It clones the object
 * before the merge so will not mutate any of the passed in values.
 *
 * To completely remove a key you can use the `Merge` helper class which
 * replaces it's key with a completely new object
 */
export function deepMerge<Type = any>(
  objects: Array<object | unknown[]>,
  options?: DeepMergeOptions,
): Type {
  return merge.all<Type>(objects as any, { isMergeableObject: is.plainObject, ...options });
}

/**
 * An object containing the returned `InstallerType` values.
 */
export const Installer = {
  PNPM: 'pnpm',
  YARN: 'yarn',
  NPM: 'npm',
} as const;

/**
 * The available installer available as a type.
 */
export type InstallerType = typeof Installer[keyof typeof Installer];

/**
 * Get the installer for the provided folder, synchronously.
 *
 * @param cwd - the root directory to use
 */
export async function getInstaller(cwd: string): Promise<InstallerType> {
  if (await fileExists(path.resolve(cwd, 'pnpm-lock.yaml'))) {
    return 'pnpm';
  }

  if (await fileExists(path.resolve(cwd, 'yarn.lock'))) {
    return 'yarn';
  }

  return 'npm';
}

// function normalizeRename

export async function copyTemplate(props: CopyTemplateProps) {
  const { input, output, variables, rename = {} } = props;

  const variablesWithCasing = {
    ...variables,
    camelCaseName: camelCaseIt(variables.name),
    kebabCaseName: kebabCaseIt(variables.name),
  };

  await copy(input, output, {
    dot: true,
    rename: (filename) => {
      const renamedFileName = rename[filename];

      return renamedFileName
        ? renamedFileName
        : template(filename)(variablesWithCasing).replace(/.template$/, '');
    },
    transform: (filename) => {
      if (path.extname(filename) !== '.template') {
        // eslint-disable-next-line unicorn/no-null
        return null as any;
      }

      return new Transform({
        transform: (chunk, _encoding, done) => {
          const output = template(chunk.toString())(variablesWithCasing);
          done(undefined, output);
          // render(chunk.toString(), variables, {}, (error, ouput) => {
          // });
        },
      });
    },
  });
}

export interface TemplateVariables {
  description?: string;
  name: string;
}

export interface CopyTemplateProps {
  input: string;
  output: string;
  variables: TemplateVariables;

  /**
   * Name of the relative source file and the desired relative destination. For
   * example `npm` doesn't allow publishing a .gitignore file or `.npmrc` so we
   * can add the following to rename the files.
   *
   * ```
   * copyTemplate({
   *   rename: {
   *     gitignore: '.gitignore',
   *     npmrc: '.npmrc'
   *   },
   *   input
   *   output,
   *   variables
   * });
   * ```
   */
  rename?: Record<string, string>;
}

const SEPARATOR = '__';
const DIRNAME = path.dirname(new URL(import.meta.url).pathname);

export function getPackageJsonSync() {
  const packageJson = readPackageUpSync({ cwd: DIRNAME })?.packageJson;

  if (!packageJson) {
    throw new Error('Invalid installation of `monots`');
  }

  return packageJson;
}

/**
 * ```ts
 * const dirname = getDirname(import.meta.url);
 * ```
 */
export function getDirname(fileUrl: string) {
  const { pathname } = new URL(fileUrl);
  return path.dirname(slash(pathname));
}

/**
 * Get the closest package.json.
 */
export async function getPackageJson(fileUrl: string) {
  const result = await readPackageUp({ cwd: getDirname(fileUrl) });

  if (!result?.packageJson) {
    throw new Error('No package.json found for `monots`');
  }

  return result.packageJson;
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
    // we have a scoped module, e.g. @bla/foo which should be converted to
    // bla__foo
    packageName = packageName.slice(1).replace('/', '__');
  }

  return packageName;
}

const filter = process.env.MONOTS_DEBUG_FILTER;
const DEBUG = process.env.DEBUG;

interface DebuggerOptions {
  onlyWhenFocused?: boolean | string;
}

export type MonotsDebugScope = `monots:${string}`;

/**
 * Use the `debug` package to create a debug instance.
 *
 * Use with `DEBUG="monots:*"`
 */
export function createDebugger(namespace: MonotsDebugScope, options: DebuggerOptions = {}) {
  const log = debug(namespace);
  const { onlyWhenFocused } = options;
  const focus = typeof onlyWhenFocused === 'string' ? onlyWhenFocused : namespace;
  return (msg: string, ...args: any[]) => {
    if (filter && !msg.includes(filter)) {
      return;
    }

    if (onlyWhenFocused && !DEBUG?.includes(focus)) {
      return;
    }

    log(msg, ...args);
  };
}

export const isWindows = os.platform() === 'win32';

/**
 * Normalize the path for posix systems.
 */
export function normalizePath(id: string): string {
  return path.posix.normalize(isWindows ? slash(id) : id);
}

function slash(p: string): string {
  return p.replace(/\\/g, '/');
}

export { default as is } from '@sindresorhus/is';
export { camelCaseIt as camelCase, kebabCaseIt as kebabCase } from 'case-it';
export { type Options as DeepMergeOptions } from 'deepmerge';
export { default as invariant } from 'tiny-invariant';
