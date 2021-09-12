import del from 'del';
import { nanoid } from 'nanoid';
import path from 'node:path';
import url from 'node:url';
import copy from 'recursive-copy';

import { context as defaultContext } from '../src/setup';

export async function setupFixtures(...paths: string[]) {
  const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
  const root = path.join(__dirname, '../__fixtures__');
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
