/* eslint-disable unicorn/prefer-module */
import is from '@sindresorhus/is';
import { camelCase, kebabCase } from 'case-anything';
import merge from 'deepmerge';
import { template } from 'lodash-es';
import fs from 'node:fs/promises';
import path from 'node:path';
import { Transform } from 'node:stream';
import { readPackageUpSync } from 'read-pkg-up';
import copy from 'recursive-copy';

/**
 * Removes all undefined values from an object. Neither Firestore nor the RealtimeDB allow `undefined` as a value.
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
export function deepMerge<Type = any>(...objects: Array<object | unknown[]>): Type {
  return merge.all<Type>(objects as any, { isMergeableObject: is.plainObject });
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
 * @param rootDirectory - the root directory to use
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

export async function copyTemplate(props: CopyTemplateProps) {
  const { input, output, variables } = props;

  const variablesWithCasing = {
    ...variables,
    camelCaseName: camelCase(variables.name),
    kebabCaseName: kebabCase(variables.name),
  };

  await copy(input, output, {
    dot: true,
    rename: (filename) => template(filename)(variablesWithCasing).replace(/.template$/, ''),
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
}

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
