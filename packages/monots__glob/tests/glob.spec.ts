import { glob } from '@monots/glob';
import { describe, it } from 'vitest';

const cwd = new URL('./', import.meta.url).pathname;

describe('glob', () => {
  it('should return all entries by default', async ({ expect }) => {
    const gathered: string[] = [];

    for await (const entry of glob({ cwd, includeDirectories: false })) {
      gathered.push(entry.path);
    }

    expect(gathered).toMatchInlineSnapshot(`
      [
        "fixtures/file.md",
        "fixtures/first/file.md",
        "fixtures/first/nested/directory/file.json",
        "fixtures/first/nested/directory/file.md",
        "fixtures/first/nested/file.md",
        "fixtures/second/file.md",
        "fixtures/second/nested/directory/file.md",
        "fixtures/second/nested/file.md",
        "glob.spec.ts",
        "tsconfig.json",
      ]
    `);
  });

  it('should accept a function as a matcher', async ({ expect }) => {
    const gathered: string[] = [];

    for await (const entry of glob({
      include: (f) => !f.startsWith('fix'),
      cwd,
      includeDirectories: false,
    })) {
      gathered.push(entry.path);
    }

    expect(gathered).toMatchInlineSnapshot(`
      [
        "glob.spec.ts",
        "tsconfig.json",
      ]
    `);
  });

  it('should return no entries with empty array', async ({ expect }) => {
    const gathered: string[] = [];

    for await (const entry of glob({ include: [], cwd })) {
      gathered.push(entry.path);
    }

    expect(gathered).toMatchInlineSnapshot(`[]`);
  });

  it('returns the filtered entries when `include` option provided', async ({ expect }) => {
    const gathered: string[] = [];
    const include = ['fixtures/**/*/*.md'];

    for await (const entry of glob({ include, cwd, includeDirectories: false })) {
      gathered.push(entry.path);
    }

    expect(gathered).toMatchInlineSnapshot(`
      [
        "fixtures/first/file.md",
        "fixtures/first/nested/directory/file.md",
        "fixtures/first/nested/file.md",
        "fixtures/second/file.md",
        "fixtures/second/nested/directory/file.md",
        "fixtures/second/nested/file.md",
      ]
    `);
  });

  it('should support returning `onlyDirectories`', async ({ expect }) => {
    const gathered: string[] = [];

    for await (const entry of glob({ includeFiles: false, cwd })) {
      gathered.push(entry.path);
    }

    expect(gathered).toMatchInlineSnapshot(`
      [
        "fixtures/",
        "fixtures/first/",
        "fixtures/first/nested/",
        "fixtures/first/nested/directory/",
        "fixtures/second/",
        "fixtures/second/nested/",
        "fixtures/second/nested/directory/",
      ]
    `);
  });

  it('can be run concurrently', async ({ expect }) => {
    const concurrent: string[] = [];
    const gathered: string[] = [];

    for await (const entry of glob({ concurrent: true, cwd, includeDirectories: false })) {
      concurrent.push(entry.path);
    }

    for await (const entry of glob({ cwd, includeDirectories: false })) {
      gathered.push(entry.path);
    }

    expect([...concurrent].sort()).toEqual(gathered);
  });
});
