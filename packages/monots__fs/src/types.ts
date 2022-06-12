import type * as nodeFs from 'node:fs/promises';

export type AnyFunction = (...args: any[]) => any;

export type NativeFsPromises = Pick<typeof nodeFs, Method>;
export type Method = typeof METHODS[number];
export const METHODS = [
  'access',
  'appendFile',
  'chmod',
  'chown',
  'copyFile',
  'cp',
  'lchown',
  'link',
  'lstat',
  'lutimes',
  'mkdir',
  'mkdtemp',
  'open',
  'opendir',
  'readdir',
  'readFile',
  'readlink',
  'realpath',
  'rename',
  'rm',
  'rmdir',
  'stat',
  'symlink',
  'truncate',
  'unlink',
  'utimes',
  'watch',
  'writeFile',
] as const;
