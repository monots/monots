import { expect, test } from 'vitest';

import { cli } from '../src/setup';
import { setupFixtures } from './helpers';

test('`monots build` should create build files', async () => {
  const { cleanup, context } = await setupFixtures('pnpm-to-build');
  await cli.run(['prepare'], context);
  await cli.run(['fix'], context);

  const result = await cli.run(['build'], context);
  expect(result).toBe(0);

  await cleanup();
});
