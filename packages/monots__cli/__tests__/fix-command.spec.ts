import test from 'ava';
import { loadJsonFile } from 'load-json-file';

import { cli } from '../src/setup';
import { setupFixtures } from './helpers';

test('`monots fix` should update the package.json files', async (t) => {
  const { cleanup, context, getPath } = await setupFixtures('pnpm-with-packages');
  const result = await cli.run(['fix'], context);
  const json = await loadJsonFile(getPath('packages/scoped__b/package.json'));

  t.is(result, 0, 'The result is successful');
  t.snapshot(json);

  await cleanup();
});

test('`monots fix` should update the tsconfig files', async (t) => {
  const { cleanup, context, getPath } = await setupFixtures('pnpm-with-packages');
  const result = await cli.run(['fix'], context);
  const json = await loadJsonFile(getPath('packages/scoped__b/src/tsconfig.json'));

  t.is(result, 0, 'The result is successful');
  t.snapshot(json);

  await cleanup();
});
