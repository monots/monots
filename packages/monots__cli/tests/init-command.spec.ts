import { createSetupFixtures } from '@monots/test';
import { afterAll, test } from 'vitest';

import { cli, context } from './test-setup.js';

const setupFixtures = createSetupFixtures({ context, fileUrl: import.meta.url });

afterAll(async () => {
  await setupFixtures.cleanup();
});

test.concurrent('`monots init` should run without error in a pnpm project', async ({ expect }) => {
  const { loadJsonFile, context } = await setupFixtures('init-pnpm-with-package-json');
  const result = await cli.run(['init'], context);
  const json = await loadJsonFile('package.json');

  expect(result, 'exit with 0 when running `monots init`').toBe(0);
  expect(json).toMatchSnapshot();
});

test.concurrent('`monots init` errors when no package.json file available', async ({ expect }) => {
  const { loadJsonFile, context } = await setupFixtures('init-without-package-json');
  const result = await cli.run(['init'], context);

  expect(result, 'The result should be a failure').toBe(1);
  await expect(loadJsonFile('package.json'), 'No package.json file created').rejects.toThrow();
});

test.concurrent('`monots init` fails outside a workspace', async ({ expect }) => {
  const { loadJsonFile, context } = await setupFixtures('init-without-workspace');
  const result = await cli.run(['init'], context);
  const json = await loadJsonFile('package.json');

  expect(result, 'The result should be a failure').toBe(1);
  expect(json, 'The package.json file should be untouched').toEqual({});
});
