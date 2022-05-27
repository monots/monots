import del from 'del';
import { loadJsonFile } from 'load-json-file';
import { randomBytes } from 'node:crypto';
import path from 'node:path';
import { URL } from 'node:url';
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

  async function setupFixtures(...paths: string[]) {
    const target = path.join(root, 'tmp', randomBytes(32).toString('hex'));
    const source = path.join(root, ...paths);

    await copy(source, target);

    function getPath(...paths: string[]) {
      return path.join(target, ...paths);
    }

    async function cleanup() {
      await del(target, { force: true });
    }

    cleanups = [...cleanups, cleanup];

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
    };
  }

  setupFixtures.cleanup = async () => {
    await Promise.all(cleanups.map((cleanup) => cleanup()));
  };

  return setupFixtures;
}
