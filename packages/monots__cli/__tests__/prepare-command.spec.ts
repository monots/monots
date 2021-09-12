import test from 'ava';
import fs from 'node:fs/promises';
import path from 'node:path';

import { cli } from '../src/setup';
import { setupFixtures } from './helpers';

test('`monots prepare` should create development dist files', async (t) => {
  const { cleanup, context, getPath } = await setupFixtures('pnpm-with-packages');
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
    ].map((file) => fs.readlink(file)),
  );

  t.is(result, 0, 'The result is successful');
  t.snapshot(main);
  t.snapshot(types);
  t.snapshot(typesWithDefault);
  t.snapshot(symlinkTargets.map((file) => path.relative(getPath(), file)));

  await cleanup();
});
