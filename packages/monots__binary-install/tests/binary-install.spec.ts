import { Binary } from '@monots/binary-install';
import { createMockServer } from '@monots/test';
import * as fs from 'node:fs/promises';
import { objectEntries } from 'ts-extras';
import { afterAll, afterEach, beforeAll, test, vi } from 'vitest';

const files = {
  unix: {
    tar: {
      remote: 'https://github.com/hello/world/releases/download/latest/hello-world-unix.tar.gz',
      fixture: new URL('fixtures/unix/hello-world.tar.gz', import.meta.url),
      name: 'hello-world',
      nested: false,
    },
    zip: {
      remote: 'https://github.com/hello/world/releases/download/latest/hello-world-unix.zip',
      fixture: new URL('fixtures/unix/hello-world.zip', import.meta.url),
      name: 'hello-world',
      nested: false,
    },
  },
  win: {
    tar: {
      remote: 'https://github.com/hello/world/releases/download/latest/hello-world-win.tar.gz',
      fixture: new URL('fixtures/win/hello-world.tar.gz', import.meta.url),
      name: 'hello-world.exe',
      nested: false,
    },
    zip: {
      remote: 'https://github.com/hello/world/releases/download/latest/hello-world-win.zip',
      fixture: new URL('fixtures/win/hello-world.zip', import.meta.url),
      name: 'hello-world.exe',
      nested: false,
    },
  },
};

interface BinaryProps {
  platform: 'unix' | 'win';
  type: 'tar' | 'zip';
  url: string;
  name: string;
  nested: boolean;
}

const BINARIES: BinaryProps[] = [];

const hooks = createMockServer(({ rest }) => {
  const handlers: Array<ReturnType<typeof rest.get>> = [];

  for (const [platform, formats] of objectEntries(files)) {
    for (const [type, { remote, fixture, name, nested }] of objectEntries(formats)) {
      BINARIES.push({ platform, type, url: remote, nested, name });
      const handler = rest.get(remote, async (_, res, ctx) => {
        const buffer = await fs.readFile(fixture);

        return res(
          ctx.set('content-length', `${buffer.byteLength}`),
          ctx.set('content-type', 'application/octet-stream'),
          ctx.body(buffer),
        );
      });

      handlers.push(handler);
    }
  }

  return handlers;
});

beforeAll(hooks.beforeAll);
afterAll(hooks.afterAll);
afterEach(hooks.afterEach);

vi.spyOn(process, 'exit').mockImplementation((code) => {
  if (code) {
    throw new Error('Overriding process.exit');
  }

  return undefined as never;
});

for (const { platform, type, url, name, nested } of BINARIES) {
  test(`binary install for ${platform} with ${type}`, async ({ expect }) => {
    const binary = new Binary({ name, url, type, nested });
    await binary.install();

    if (process.platform !== 'win32' && platform === 'win') {
      return;
    }

    const stdout = await binary.run({ stdout: false });
    expect(stdout.trim()).toBe('Hello, World!');
  });
}
