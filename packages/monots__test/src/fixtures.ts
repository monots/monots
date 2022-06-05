import del from 'del';
import { loadJsonFile } from 'load-json-file';
import * as crypto from 'node:crypto';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import copy from 'recursive-copy';

interface CreateSetupFixtures<Context extends object> {
  /**
   * The current directory for the file.
   *
   * Set to `import.meta.url`.
   */
  fileUrl: string;

  /**
   * The context to use.
   */
  context: Context;

  /**
   * The name of the directory containing the fixtures.
   *
   * @default `fixtures`
   */
  fixturesDirectory?: string;
}

/**
 * Create a helper for interacting with a test fixtures directory.
 */
export function createSetupFixtures<Context extends object>(options: CreateSetupFixtures<Context>) {
  const { fileUrl, fixturesDirectory = 'fixtures', context } = options;
  let cleanups: Array<() => Promise<void>> = [];
  const root = path.join(path.dirname(new URL(fileUrl).pathname), fixturesDirectory);
  const tmp = path.join(root, '..', 'tmp');

  async function setupFixtures(dir: string) {
    const target = path.join(tmp, `${dir}-${crypto.randomBytes(5).toString('hex')}`);
    const source = path.join(root, dir);

    // in case of name-clash override the previous directory.
    await copy(source, target, { overwrite: true, dot: true, junk: true });

    function getPath(...paths: string[]) {
      return path.join(target, ...paths);
    }

    const cleanupTargets = [target];

    async function cleanup() {
      await del(cleanupTargets, { force: true });
    }

    cleanups.push(cleanup);

    return {
      getPath,
      cleanup,
      /**
       * Don't clean up the fixtures directory when using `setupFixtures.cleanup()`
       */
      skipCleanup: () => {
        cleanups = cleanups.filter((cleanup) => cleanup !== cleanup);
      },
      loadJsonFile: async <Json = any>(...paths: string[]) => loadJsonFile<Json>(getPath(...paths)),
      context: { ...context, cwd: getPath() },
      readFile: async (path: string, encoding?: BufferEncoding) =>
        fs.readFile(getPath(path), { encoding }),
      /**
       * Create a temporary folder to use adjacent to the initial that
       * will automatically be cleaned up when cleaning up the fixtures.
       */
      tmp: (name?: string) => {
        const prefix = name ? `${name}-` : '';
        const folder = path.join(tmp, `${prefix}${dir}-${crypto.randomBytes(5).toString('hex')}`);
        cleanupTargets.push(folder);

        function getPath(...paths: string[]) {
          return path.join(folder, ...paths);
        }

        return {
          getPath,
          loadJsonFile: async <Json = any>(...paths: string[]) =>
            loadJsonFile<Json>(getPath(...paths)),
          readFile: async (path: string, encoding?: BufferEncoding) =>
            fs.readFile(getPath(path), { encoding }),
        };
      },
    };
  }

  setupFixtures.cleanup = async () => {
    await Promise.all(cleanups.map((cleanup) => cleanup()));
  };

  return setupFixtures;
}
