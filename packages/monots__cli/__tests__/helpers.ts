/* eslint-disable unicorn/prefer-module */
import del from 'del';
import { nanoid } from 'nanoid';
import path from 'node:path';
import copy from 'recursive-copy';

import { context as defaultContext } from '../src/setup';

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

export async function setupFixtures(...paths: string[]) {
  const root = path.join(DIRNAME, '../__fixtures__');
  const source = path.join(root, ...paths);
  const target = path.join(root, 'tmp', nanoid());

  await copy(source, target);

  function getPath(...paths: string[]) {
    return path.join(target, ...paths);
  }

  return {
    getPath,
    cleanup: async () => del(target, { force: true }),
    context: { ...defaultContext, cwd: getPath() },
  };
}
