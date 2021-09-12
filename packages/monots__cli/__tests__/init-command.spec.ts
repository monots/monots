import test from 'ava';
import { loadJsonFile } from 'load-json-file';

import { cli } from '../src/setup';
import { setupFixtures } from './helpers';

test('`monots init` should run without error in a pnpm project', async (t) => {
  const { cleanup, context, getPath } = await setupFixtures('init-pnpm-with-package-json');
  const result = await cli.run(['init'], context);
  const json = await loadJsonFile(getPath('package.json'));

  t.is(result, 0, 'exit with 0 when running `monots init`');
  t.snapshot(json);

  await cleanup();
});

test('`monots init` errors when no package.json file available', async (t) => {
  const { cleanup, context, getPath } = await setupFixtures('init-without-package-json');
  const result = await cli.run(['init'], context);

  t.is(result, 1, 'The result should be a failure');
  await t.throwsAsync(
    loadJsonFile(getPath('package.json')),
    undefined,
    'No package.json file created',
  );

  await cleanup();
});

test('`monots init` fails outside a workspace', async (t) => {
  const { cleanup, context, getPath } = await setupFixtures('init-without-workspace');
  const result = await cli.run(['init'], context);
  const json = await loadJsonFile(getPath('package.json'));

  t.is(result, 1, 'The result should be a failure');
  t.deepEqual(json, {}, 'The package.json file is untouched');

  await cleanup();
});
