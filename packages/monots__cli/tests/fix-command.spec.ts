import { createSetupFixtures } from '@monots/test';
import { afterAll, test } from 'vitest';

import { cli, context } from '../src/setup';

const setupFixtures = createSetupFixtures({ context, fileUrl: import.meta.url });

afterAll(async () => {
  await setupFixtures.cleanup();
});

test.concurrent('`monots fix` should update the package.json files', async ({ expect }) => {
  const { context, loadJsonFile } = await setupFixtures('pnpm-with-packages');
  const result = await cli.run(['fix'], context);
  const jsonA = await loadJsonFile('packages/scoped__a/package.json');
  const jsonB = await loadJsonFile('packages/scoped__b/package.json');
  const jsonC = await loadJsonFile('packages/scoped__c/package.json');
  const jsonTs = await loadJsonFile('packages/scoped__ts/package.json');

  expect(result, 'The result is successful').toBe(0);
  expect(jsonA).toMatchSnapshot();
  expect(jsonB).toMatchSnapshot();
  expect(jsonC).toMatchSnapshot();
  expect(jsonTs).toMatchSnapshot();
});

test.concurrent('`monots fix` should update the tsconfig files', async ({ expect }) => {
  const { context, loadJsonFile } = await setupFixtures('pnpm-with-packages');
  const result = await cli.run(['fix'], context);
  const jsonA = await loadJsonFile('packages/scoped__a/src/tsconfig.json');
  const jsonB = await loadJsonFile('packages/scoped__b/src/tsconfig.json');
  const jsonC = await loadJsonFile('packages/scoped__c/src/tsconfig.json');
  const jsonTs = await loadJsonFile('packages/scoped__ts/tsconfig.json');

  expect(result, 'The result is successful').toBe(0);
  expect(jsonA).toMatchSnapshot();
  expect(jsonB).toMatchSnapshot();
  expect(jsonC).toMatchSnapshot();
  expect(jsonTs).toMatchSnapshot();
});

test.concurrent(
  '`monots fix` should update the relative baseTsconfig files',
  async ({ expect }) => {
    const { context, loadJsonFile } = await setupFixtures('pnpm-with-packages-relative');
    const result = await cli.run(['fix'], context);
    const jsonA = await loadJsonFile('packages/scoped__a/src/tsconfig.json');
    const jsonB = await loadJsonFile('packages/scoped__b/src/tsconfig.json');

    expect(result, 'The result is successful').toBe(0);
    expect(jsonA).toMatchSnapshot();
    expect(jsonB).toMatchSnapshot();
  },
);

test.concurrent('`monots fix` should support ignoring exports', async ({ expect }) => {
  const { context, loadJsonFile } = await setupFixtures('pnpm-ignore-exports');
  await cli.run(['fix'], context);
  const jsonA = await loadJsonFile('packages/scoped__a/package.json');

  expect(jsonA).toMatchSnapshot();
});

test.concurrent('`monots fix` should add exports to entrypoints', async ({ expect }) => {
  const { context, loadJsonFile } = await setupFixtures('pnpm-with-add-exports-to-entrypoints');
  await cli.run(['fix'], context);
  const mainJson = await loadJsonFile('packages/scoped__add/package.json');
  const scopedJson = await loadJsonFile('packages/scoped__add/other/package.json');

  expect(mainJson).toMatchSnapshot();
  expect(scopedJson).toMatchSnapshot();
});
