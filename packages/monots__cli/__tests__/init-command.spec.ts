import { afterAll, expect, test } from '@jest/globals';
import { loadJsonFile } from 'load-json-file';

import { cli } from '../src/setup';
import { setupFixtures } from './helpers';

const cleanupItems: Array<() => Promise<string[]>> = [];

afterAll(async () => {
  await Promise.all(cleanupItems.map((cleanup) => cleanup()));
});

test('`monots init` should run without error in a pnpm project', async () => {
  const { cleanup, context, getPath } = await setupFixtures('init-pnpm-with-package-json');
  cleanupItems.push(cleanup);

  const result = await cli.run(['init'], context);
  const json = await loadJsonFile(getPath('package.json'));

  expect(result).toBe(0);
  expect(json).toMatchSnapshot();
});

test('`monots init` errors when no package.json file available', async () => {
  const { cleanup, context, getPath } = await setupFixtures('init-without-package-json');
  cleanupItems.push(cleanup);

  const result = await cli.run(['init'], context);

  expect(result).toBe(1);
  await expect(loadJsonFile(getPath('package.json'))).rejects.toThrow(
    'No package.json file created',
  );
});

test('`monots init` fails outside a workspace', async () => {
  const { cleanup, context, getPath } = await setupFixtures('init-without-workspace');
  cleanupItems.push(cleanup);

  const result = await cli.run(['init'], context);
  const json = await loadJsonFile(getPath('package.json'));

  expect(result).toBe(1);
  expect(json).toEqual({});
});
