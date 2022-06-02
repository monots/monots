import { loadConfig } from '@monots/core';
import { createSetupFixtures } from '@monots/test';
import { afterAll, test } from 'vitest';

const setupFixtures = createSetupFixtures({ context: {}, fileUrl: import.meta.url });

afterAll(async () => {
  await setupFixtures.cleanup();
});

test('resolves plugins', async ({ expect }) => {
  const { context } = await setupFixtures('core');
  const resolved = await loadConfig({ cwd: context.cwd });
  expect(resolved.plugins).toHaveLength(2);
  expect(resolved.plugins[0]?.original?.type).toBe('core');
});

test('throws when `skipLookup` is provided without a config option', async ({ expect }) => {
  await expect(loadConfig({ skipLookup: true })).rejects.toMatchInlineSnapshot(
    '[Error: when using `skipLookup` you must also provide a config object.]',
  );
});
