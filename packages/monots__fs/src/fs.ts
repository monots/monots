import type { GlobProps } from '@monots/glob';
import { getPath, glob } from '@monots/glob';
import type { IPromisesAPI } from 'memfs/lib/promises.js';
import type { DirectoryJSON } from 'memfs/lib/volume.js';
import { Volume } from 'memfs/lib/volume.js';
import * as fsPromises from 'node:fs/promises';
import path from 'node:path';

import type { AnyFunction, Method, NativeFsPromises as NativeFsPromises } from './types';
import { METHODS } from './types';

type FileSystem = 'native' | 'memory';

/**
 * Create a file system for use in monots.
 */
export class Fs implements NativeFsPromises {
  #volume: Volume;
  #promises: IPromisesAPI;
  #backend: FileSystem;

  get backend(): FileSystem {
    return this.#backend;
  }

  get volume(): Volume {
    return this.#volume;
  }

  constructor(props: FsProps = {}) {
    this.#backend = props.backend ?? 'native';
    this.#volume = new Volume({});
    this.#promises = this.#volume.promises;

    for (const method of METHODS) {
      this[method] = this.#getMethod(method);
    }
  }

  /**
   * Populate the memory file system from the provide path to the path on the
   * memory file system.
   */
  async populateFromFileSystem(props: PopulateMemory) {
    const { from, target = from, ...rest } = props;
    const promises: Array<Promise<readonly [file: string, contents: string]>> = [];
    const preserve = from === target;
    const targetPath = getPath(target);
    const iterator = glob({
      ...rest,
      cwd: from,
      trailingSlash: true,
      includeDirectories: false,
      dot: props.dot ?? true,
      caseInsensitive: props.caseInsensitive ?? true,
    });

    for await (const file of iterator) {
      const promise = fsPromises.readFile(file.absolute, 'utf8').then((contents) => {
        return [preserve ? file.absolute : path.join(targetPath, file.relative), contents] as const;
      });

      promises.push(promise);
    }

    const entries = await Promise.all(promises);
    this.#volume.fromJSON(Object.fromEntries(entries));

    return this;
  }

  /**
   * Populate the memory file system with the provided json.
   */
  populateFromJson(json: DirectoryJSON) {
    this.#volume.fromJSON(json);
    return this;
  }

  /**
   * Commit the files to the file system.
   */
  async commitToNative() {}

  /**
   * Load the current JSON stored in memory.
   */
  loadJsonFromMemory() {
    this.#volume.createReadStream;
    return this.#volume.toJSON();
  }

  /**
   * Switch to use the native node file system.
   */
  useNative() {
    this.#backend = 'native';
    return this;
  }

  useMemory() {
    this.#backend = 'memory';
    return this;
  }

  #getMethod = (method: Method): AnyFunction => {
    if (this.#backend === 'memory' && ['lutimes', 'opendir', 'watch', 'cp'].includes(method)) {
      throw new Error(`"${method}" is not supported in memory file system`);
    }

    return (...args: any[]) => {
      return this.#backend === 'native'
        ? (fsPromises as any)[method](...args)
        : (this.#promises as any)[method](...args);
    };
  };
}

interface FsProps {
  /**
   * @default 'native'
   */
  backend?: FileSystem;
}

interface PopulateMemory
  extends Pick<GlobProps, 'extensions' | 'exclude' | 'include' | 'dot' | 'caseInsensitive'> {
  /**
   * The absolute path to the file system to populate from.
   */
  from: URL | string;

  /**
   * The absolute path to target. If left undefined then this defaults to using
   * same location as from.
   */
  target?: URL | string;
}

export interface Fs extends NativeFsPromises {}
export const fs = new Fs();
export const {
  access,
  appendFile,
  chmod,
  chown,
  copyFile,
  cp,
  lchown,
  link,
  lstat,
  lutimes,
  mkdir,
  mkdtemp,
  open,
  opendir,
  readdir,
  readFile,
  readlink,
  realpath,
  rename,
  rm,
  rmdir,
  stat,
  symlink,
  truncate,
  unlink,
  utimes,
  watch,
  writeFile,
} = fs;
