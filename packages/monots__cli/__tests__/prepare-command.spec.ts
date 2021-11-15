import { afterAll, expect, test } from '@jest/globals';
import fs from 'node:fs/promises';
import path from 'node:path';

import { cli } from '../src/setup';
import { setupFixtures } from './helpers';

const cleanupItems: Array<() => Promise<string[]>> = [];

afterAll(async () => {
  await Promise.all(cleanupItems.map((cleanup) => cleanup()));
});

test('`monots prepare` should create development dist files', async () => {
  const { cleanup, context, getPath } = await setupFixtures('pnpm-with-packages');
  cleanupItems.push(cleanup);

  const result = await cli.run(['prepare'], context);
  const options = { encoding: 'utf-8' } as const;

  const [main, types, typesWithDefault] = await Promise.all(
    [
      getPath('packages/scoped__a/dist/index.cjs.js'),
      getPath('packages/scoped__a/dist/index.d.ts'),
      getPath('packages/scoped__c/dist/other.d.ts'),
    ].map((file) => fs.readFile(file, options)),
  );

  const symlinkTargets = await Promise.all(
    [
      getPath('packages/scoped__a/dist/index.esm.js'),
      getPath('packages/scoped__a/dist/index.browser.esm.js'),
      getPath('packages/scoped__c/dist/and-another.esm.js'),
      getPath('packages/scoped__c/dist/and-another/nested.esm.js'),
      getPath('packages/scoped__c/dist/and-another/nested/cool.esm.js'),
    ].map((file) => fs.readlink(file)),
  );

  expect(result).toBe(0);
  expect(main).toMatchSnapshot();
  expect(types).toMatchSnapshot();
  expect(typesWithDefault).toMatchSnapshot();
  expect(symlinkTargets.map((file) => path.relative(getPath(), file))).toMatchSnapshot();
});
