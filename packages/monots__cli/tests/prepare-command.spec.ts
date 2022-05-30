import { createSetupFixtures } from '@monots/test';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { afterAll, expect, test } from 'vitest';

import { cli, context } from '../src/setup';

const setupFixtures = createSetupFixtures({ context, fileUrl: import.meta.url });

afterAll(async () => {
  setupFixtures.cleanup();
});

test('`monots prepare` should create development dist files', async () => {
  const { context, getPath } = await setupFixtures('pnpm-with-packages');
  const result = await cli.run(['prepare'], context);
  const options = { encoding: 'utf8' } as const;

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

  expect(result, 'The result is successful').toBe(0);
  expect(main).toMatchSnapshot();
  expect(types).toMatchSnapshot();
  expect(typesWithDefault).toMatchSnapshot();
  expect(symlinkTargets.map((file) => path.relative(getPath(), file))).toMatchSnapshot();
});
