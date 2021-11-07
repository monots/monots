import test from 'ava';
import { loadJsonFile } from 'load-json-file';

import { cli } from '../src/setup';
import { setupFixtures } from './helpers';

test('`monots fix` should update the package.json files', async (t) => {
  const { cleanup, context, getPath } = await setupFixtures('pnpm-with-packages');
  const result = await cli.run(['fix'], context);
  const jsonA = await loadJsonFile(getPath('packages/scoped__a/package.json'));
  const jsonB = await loadJsonFile(getPath('packages/scoped__b/package.json'));
  const jsonC = await loadJsonFile(getPath('packages/scoped__c/package.json'));
  const jsonTs = await loadJsonFile(getPath('packages/scoped__ts/package.json'));

  t.is(result, 0, 'The result is successful');
  t.snapshot(jsonA);
  t.snapshot(jsonB);
  t.snapshot(jsonC);
  t.snapshot(jsonTs);

  await cleanup();
});

test('`monots fix` should update the tsconfig files', async (t) => {
  const { cleanup, context, getPath } = await setupFixtures('pnpm-with-packages');
  const result = await cli.run(['fix'], context);
  const jsonA = await loadJsonFile(getPath('packages/scoped__a/src/tsconfig.json'));
  const jsonB = await loadJsonFile(getPath('packages/scoped__b/src/tsconfig.json'));
  const jsonC = await loadJsonFile(getPath('packages/scoped__c/src/tsconfig.json'));
  const jsonTs = await loadJsonFile(getPath('packages/scoped__ts/tsconfig.json'));

  t.is(result, 0, 'The result is successful');
  t.snapshot(jsonA);
  t.snapshot(jsonB);
  t.snapshot(jsonC);
  t.snapshot(jsonTs);

  await cleanup();
});

test('`monots fix` should update the relative baseTsconfig files', async (t) => {
  const { cleanup, context, getPath } = await setupFixtures('pnpm-with-packages-relative');
  const result = await cli.run(['fix'], context);
  const jsonA = await loadJsonFile(getPath('packages/scoped__a/src/tsconfig.json'));
  const jsonB = await loadJsonFile(getPath('packages/scoped__b/src/tsconfig.json'));

  t.is(result, 0, 'The result is successful');
  t.snapshot(jsonA);
  t.snapshot(jsonB);

  await cleanup();
});
