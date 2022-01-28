import { loadJsonFile } from 'load-json-file';
import { expect, test } from 'vitest';

import { cli } from '../src/setup';
import { setupFixtures } from './helpers';

test('`monots fix` should update the package.json files', async () => {
  const { cleanup, context, getPath } = await setupFixtures('pnpm-with-packages');
  const result = await cli.run(['fix'], context);
  const jsonA = await loadJsonFile(getPath('packages/scoped__a/package.json'));
  const jsonB = await loadJsonFile(getPath('packages/scoped__b/package.json'));
  const jsonC = await loadJsonFile(getPath('packages/scoped__c/package.json'));
  const jsonTs = await loadJsonFile(getPath('packages/scoped__ts/package.json'));

  expect(result, 'The result is successful').toBe(0);
  expect(jsonA).toMatchSnapshot();
  expect(jsonB).toMatchSnapshot();
  expect(jsonC).toMatchSnapshot();
  expect(jsonTs).toMatchSnapshot();

  await cleanup();
});

test('`monots fix` should update the tsconfig files', async () => {
  const { cleanup, context, getPath } = await setupFixtures('pnpm-with-packages');
  const result = await cli.run(['fix'], context);
  const jsonA = await loadJsonFile(getPath('packages/scoped__a/src/tsconfig.json'));
  const jsonB = await loadJsonFile(getPath('packages/scoped__b/src/tsconfig.json'));
  const jsonC = await loadJsonFile(getPath('packages/scoped__c/src/tsconfig.json'));
  const jsonTs = await loadJsonFile(getPath('packages/scoped__ts/tsconfig.json'));

  expect(result, 'The result is successful').toBe(0);
  expect(jsonA).toMatchSnapshot();
  expect(jsonB).toMatchSnapshot();
  expect(jsonC).toMatchSnapshot();
  expect(jsonTs).toMatchSnapshot();

  await cleanup();
});

test('`monots fix` should update the relative baseTsconfig files', async () => {
  const { cleanup, context, getPath } = await setupFixtures('pnpm-with-packages-relative');
  const result = await cli.run(['fix'], context);
  const jsonA = await loadJsonFile(getPath('packages/scoped__a/src/tsconfig.json'));
  const jsonB = await loadJsonFile(getPath('packages/scoped__b/src/tsconfig.json'));

  expect(result, 'The result is successful').toBe(0);
  expect(jsonA).toMatchSnapshot();
  expect(jsonB).toMatchSnapshot();

  await cleanup();
});

test('`monots fix` should support ignoring exports', async () => {
  const { cleanup, context, getPath } = await setupFixtures('pnpm-ignore-exports');
  await cli.run(['fix'], context);
  const jsonA = await loadJsonFile(getPath('packages/scoped__a/package.json'));

  expect(jsonA).toMatchSnapshot();

  await cleanup();
});
