import { createSetupFixtures } from '@monots/test';
import { processTemplate } from 'process-template.js';
import { afterAll, test } from 'vitest';

const setupFixtures = createSetupFixtures({ fileUrl: import.meta.url, context: {} });

afterAll(async () => {
  await setupFixtures.cleanup();
});

test.concurrent('can process a basic template config', async ({ expect }) => {
  const { getPath, tmp } = await setupFixtures('base');
  const source = getPath();
  const target = tmp('destination');
  const destination = target.getPath();
  await processTemplate({
    source,
    destination,
    templateProps: {},
    cliArguments: { _: [] },
    install: ['pnpm', ['install']], // overriden since this is a slow operation.
  });

  expect(await target.loadJsonFile('package.json')).toMatchSnapshot();
  expect(await target.readFile('installed.txt', 'utf8')).toMatchSnapshot();
  expect(await target.readFile('file', 'utf8')).toMatchInlineSnapshot('"base"');
  expect(await target.loadJsonFile('base.json')).toEqual({});

  // ignores the template file.
  expect(
    target.readFile('monots.template.ts'),
    'the template file should not be copied over',
  ).rejects.toThrowError();

  // Dot file support;
  expect(await target.readFile('.gitignore', 'utf8')).toMatchInlineSnapshot(`"NOTHING"`);
  expect(await target.readFile('.should-include', 'utf8')).toMatchInlineSnapshot('""');

  // renaming and ignoring
  expect(target.readFile('ignore-me.md', 'utf8')).rejects.toThrowError();
  expect(await target.readFile('rename-thee.md', 'utf8')).toMatchInlineSnapshot(
    '"Should be renamed from `rename-me.md` to `rename-thee.md`."',
  );
});
