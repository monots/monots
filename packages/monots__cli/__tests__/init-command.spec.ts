import { loadJsonFile } from 'load-json-file';
import { expect, test } from 'vitest';

import { cli } from '../src/setup';
import { setupFixtures } from './helpers';

test('`monots init` should run without error in a pnpm project', async () => {
  const { cleanup, context, getPath } = await setupFixtures('init-pnpm-with-package-json');
  const result = await cli.run(['init'], context);
  const json = await loadJsonFile(getPath('package.json'));

  expect(result, 'exit with 0 when running `monots init`').toBe(0);
  expect(json).toMatchSnapshot();

  await cleanup();
});

test('`monots init` errors when no package.json file available', async () => {
  const { cleanup, context, getPath } = await setupFixtures('init-without-package-json');
  const result = await cli.run(['init'], context);

  expect(result, 'The result should be a failure').toBe(1);
  await expect(
    loadJsonFile(getPath('package.json')),
    'No package.json file created',
  ).rejects.toThrow();

  await cleanup();
});

test('`monots init` fails outside a workspace', async () => {
  const { cleanup, context, getPath } = await setupFixtures('init-without-workspace');
  const result = await cli.run(['init'], context);
  const json = await loadJsonFile(getPath('package.json'));

  expect(result, 'The result should be a failure').toBe(1);
  expect(json, 'The package.json file should be untouched').toEqual({});

  await cleanup();
});
