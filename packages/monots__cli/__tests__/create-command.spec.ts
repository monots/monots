import test from 'ava';
import { loadJsonFile } from 'load-json-file';

import { cli } from '../src/setup';
import { setupFixtures } from './helpers';

test('`monots create` should create package with a description', async (t) => {
  const { context, getPath, cleanup } = await setupFixtures('pnpm-with-packages');
  const result = await cli.run(['create', '--description', 'DDD', '@scoped/d'], context);
  const json = await loadJsonFile<any>(getPath('packages/scoped__d/package.json'));

  t.is(result, 0);
  t.is(json.name, '@scoped/d');
  t.is(json.description, 'DDD');
  t.deepEqual(json.exports, {
    '.': {
      browser: './dist/index.browser.esm.js',
      import: './dist/index.esm.js',
      types: './dist/index.d.ts',
    },
    './index.js': {
      browser: './dist/index.browser.esm.js',
      import: './dist/index.esm.js',
      types: './dist/index.d.ts',
    },
    './package.json': './package.json',
    './types/*': './dist/*.d.ts',
  });

  await cleanup();
});

test('`monots create` should not overwrite existing packages', async (t) => {
  const { cleanup, context } = await setupFixtures('pnpm-with-packages');
  const result = await cli.run(['create', '--description', 'C', '@scoped/c'], context);

  t.is(result, 1);

  await cleanup();
});
