import { createSetupFixtures } from '@monots/test';
import { afterAll, expect, test } from 'vitest';

import { loadEsmConfig } from '../';

export const setupFixtures = createSetupFixtures({ context: {}, fileUrl: import.meta.url });

afterAll(async () => {
  await setupFixtures.cleanup();
});

test.each([
  ['.js', 'simple'],
  ['.mjs', 'simple2'],
  ['.ts', 'simple3'],
  ['.mts', 'simple4'],
])('can load simple `%s` config in commonjs environment', async (extension, name) => {
  const { context, getPath } = await setupFixtures('cjs');
  const { config, path, root } = await loadEsmConfig({ name, cwd: context.cwd });

  expect(path.endsWith(`${name}.config${extension}`)).toBe(true);
  expect(config).toMatchSnapshot();
  expect(getPath()).toBe(root);
});

test.each([
  ['.js', 'simple'],
  ['.mjs', 'simple2'],
  ['.ts', 'simple3'],
  ['.mts', 'simple4'],
])('can load simple `%s` config in nested commonjs environment', async (extension, name) => {
  const { context, getPath } = await setupFixtures('nested-cjs');
  const { config, path, root } = await loadEsmConfig({ name, cwd: context.cwd });

  expect(path.endsWith(`${name}.config${extension}`)).toBe(true);
  expect(config).toMatchSnapshot();
  expect(getPath()).toBe(root);
});

test.each([
  ['.js', 'simple'],
  ['.cjs', 'simple2'],
  ['.ts', 'simple3'],
  ['.cts', 'simple4'],
])('can load simple `%s` config in esm environment', async (extension, name) => {
  const { context } = await setupFixtures('esm');
  const { config, path } = await loadEsmConfig({ name, cwd: context.cwd });

  expect(path.endsWith(`${name}.config${extension}`)).toBe(true);
  expect(config).toMatchSnapshot();
});
