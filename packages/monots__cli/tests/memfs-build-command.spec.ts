/*
 * This is an example of where using `memfs` can make tests faster.
 *
 * Problems are that vitest mocking doesn't do deep mocking. It seems that
 * nested packages with the `fs` usage are not mocked and as a result tests
 * fail.
 */

import { vol } from 'memfs';
import path from 'node:path';
import { beforeEach, test, vi } from 'vitest';

import { cli, context } from '../src/setup.js';
import fileJson from './fixtures/pnpm-to-build.js';

vi.mock('node:fs/promises');
vi.mock('node:fs');
vi.mock('fs/promises');
vi.mock('fs');

beforeEach(() => {
  vol.reset();
});

test.concurrent.skip('`monots build` should create build files', async ({ expect }) => {
  const cwd = '/test';
  vol.fromJSON(fileJson, cwd);
  await cli.run(['prepare'], { ...context, cwd });
  await cli.run(['fix'], { ...context, cwd });
  expect(vol.toJSON('/test')).not.toStrictEqual(
    Object.fromEntries(
      Object.entries(fileJson).map(([filepath, content]) => [path.join(cwd, filepath), content]),
    ),
  );

  const result = await cli.run(['build'], { ...context, cwd });
  expect(result).toBe(0);
});
