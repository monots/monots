import { loadJsonFile } from 'load-json-file';
import * as fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import copy from 'recursive-copy';
import { writeJsonFile } from 'write-json-file';

import type { CopyProps, FileUtils } from './types.js';

export function createFileUtils(directory: string): FileUtils {
  const url = directory.startsWith('file://') ? new URL(directory) : pathToFileURL(directory);

  return {
    copy: async (props: CopyProps) => {
      const { source, destination, ...options } = props;
      await copy(path.resolve(directory, source), path.resolve(directory, destination), options);
    },
    read: (...args) => {
      const [_path, ...rest] = args;
      const filepath = typeof _path === 'string' ? new URL(_path, url).pathname : path;
      return fs.readFile(filepath as any, ...rest) as any;
    },
    write: (...args) => {
      const [_path, ...rest] = args;
      const filepath = typeof _path === 'string' ? new URL(_path, url).pathname : path;
      return fs.writeFile(filepath as any, ...rest) as any;
    },
    loadJson: (...args) => {
      const [filepath, ...rest] = args;
      return loadJsonFile(filepath, ...rest);
    },
    writeJson: (...args) => {
      const [filepath, ...rest] = args;
      return writeJsonFile(filepath, ...rest);
    },
    rm: (target, options) => {
      return fs.rm(new URL(target, url.href), { cwd: url.pathname, ...options });
    },
  };
}
