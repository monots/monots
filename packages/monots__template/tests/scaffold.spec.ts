import { createSetupFixtures } from '@monots/test';
import { afterAll, test, vi } from 'vitest';

import { scaffold } from '../';

vi.mock('degit', () => {
  // eslint-disable-next-line unicorn/consistent-function-scoping
  function degit() {
    return {
      clone: vi.fn(async (destination: string) => {
        const { default: copy } = await import('recursive-copy');
        const { join, dirname } = await import('node:path');
        await copy(
          join(dirname(new URL(import.meta.url).pathname), 'fixtures', 'base'),
          destination,
          { dot: true, junk: true, overwrite: true },
        );
      }),
    };
  }

  degit.default = degit;

  return degit;
});

const setupFixtures = createSetupFixtures({ fileUrl: import.meta.url, context: {} });

afterAll(async () => {
  await setupFixtures.cleanup();
});

test.concurrent('scaffold an app', async ({ expect }) => {
  const { tmp } = await setupFixtures('base');
  const dest = tmp('destination');
  await scaffold({ repo: 'Rich-Harris/degit', destination: dest.getPath() });
  expect(await dest.loadJsonFile('package.json.template')).toMatchInlineSnapshot(`
    {
      "dependencies": {
        "asdf": "file:./asdf",
      },
      "description": "<%= name %>",
      "name": "<%= name %>",
      "version": "<%= version %>",
    }
  `);
});
