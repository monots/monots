import is from '@sindresorhus/is';
import merge from 'deepmerge';
import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * A typesafe implementation of `Object.keys()`
 */
export function keys<Type extends object, Key extends Extract<keyof Type, string>>(
  value: Type,
): Key[] {
  return Object.keys(value) as Key[];
}

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
 * A more lenient typed version of `Array.prototype.includes` which allow less
 * specific types to be checked.
 */
export function includes<Type>(
  array: Type[] | readonly Type[],
  item: unknown,
  fromIndex?: number,
): item is Type {
  return array.includes(item as Type, fromIndex);
}

/**
 * A typesafe implementation of `Object.entries()`
 *
 * Taken from
 * https://github.com/biggyspender/ts-entries/blob/master/src/ts-entries.ts
 */
export function entries<
  Type extends object,
  Key extends Extract<keyof Type, string>,
  Value extends Type[Key],
  Entry extends [Key, Value],
>(value: Type): Entry[] {
  return Object.entries(value) as Entry[];
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
