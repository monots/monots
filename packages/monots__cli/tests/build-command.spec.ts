import { createSetupFixtures } from '@monots/test';
import { afterAll, expect, test } from 'vitest';

import { cli, context } from '../src/setup';

const setupFixtures = createSetupFixtures({ context, fileUrl: import.meta.url });

afterAll(async () => {
  setupFixtures.cleanup();
});

test('`monots build` should create build files', async () => {
  const { context } = await setupFixtures('pnpm-to-build');
  await cli.run(['prepare'], context);
  await cli.run(['fix'], context);

  const result = await cli.run(['build'], context);
  expect(result).toBe(0);
});
