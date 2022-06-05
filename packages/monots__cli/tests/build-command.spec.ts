import { createSetupFixtures } from '@monots/test';
import { afterAll, test } from 'vitest';

import { cli, context } from '../src/setup.js';

const setupFixtures = createSetupFixtures({ context, fileUrl: import.meta.url });

afterAll(async () => {
  await setupFixtures.cleanup();
});

test.concurrent('`monots build` should create build files', async ({ expect }) => {
  const { context } = await setupFixtures('pnpm-to-build');
  await cli.run(['prepare'], context);
  await cli.run(['fix'], context);

  const result = await cli.run(['build'], context);
  expect(result).toBe(0);
});
