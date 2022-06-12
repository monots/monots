import { fs } from '@monots/fs';
import { test } from 'vitest';
import { diffJson, diffArrays } from 'diff';
import {} from '@monots/test';

test('can switch between native and memory', async ({ expect }) => {
  expect(fs.backend).toBe('native');
  fs.useMemory();
  expect(fs.backend).toBe('memory');
});

test.only('populate from file system and apply changes back', async ({ expect }) => {
  await fs.useMemory().populateFromFileSystem({
    from: new URL('fixtures', import.meta.url),
    target: '/custom/path',
  });
  const snapshot = fs.loadJsonFromMemory();
  expect(snapshot).toMatchSnapshot();
  await fs.appendFile(new URL('/custom/path/file.md', import.meta.url), 'hello world');
  await fs.writeFile(new URL('/custom/path/files.md', import.meta.url), 'hello world');
  await fs.rm(new URL('/custom/path/.file', import.meta.url));
  expect(fs.loadJsonFromMemory()).toMatchSnapshot();
});
