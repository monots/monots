import { createSetupFixtures } from '@monots/test';
import type { PackageJson } from 'type-fest';
import { afterAll, test } from 'vitest';

import { cli, context } from '../src/setup';

const setupFixtures = createSetupFixtures({ context, fileUrl: import.meta.url });

afterAll(async () => {
  await setupFixtures.cleanup();
});

test.concurrent('`monots create` should create package with a description', async ({ expect }) => {
  const { context, loadJsonFile } = await setupFixtures('pnpm-with-packages');
  const result = await cli.run(['create', '--description', 'DDD', '@scoped/d'], context);
  const json = await loadJsonFile<PackageJson>('packages/scoped__d/package.json');

  expect(result).toBe(0);
  expect(json.name).toBe('@scoped/d');
  expect(json.description).toBe('DDD');
  expect(json.exports).toEqual({
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
});

test.concurrent('`monots create` should not overwrite existing packages', async ({ expect }) => {
  const { context } = await setupFixtures('pnpm-with-packages');
  const result = await cli.run(['create', '--description', 'C', '@scoped/c'], context);

  expect(result).toBe(1);
});
