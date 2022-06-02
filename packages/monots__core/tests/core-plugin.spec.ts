import type { CorePlugin } from '@monots/core';
import { corePlugin, defineConfig, loadConfig } from '@monots/core';
import type { PluginProps } from '@monots/types';
import { tmpdir } from 'node:os';
import path from 'node:path/posix';
import { test, vi } from 'vitest';

test('`CorePlugin` hooks are correctly called', async ({ expect }) => {
  const cwd = tmpdir();
  const setup = vi.fn<[PluginProps]>(() => ({ customTestKey: 'abc' }));
  const ready = vi.fn();
  const customPlugin: CorePlugin = { name: 'custom', type: 'core', setup, ready };
  const config = defineConfig({ plugins: [corePlugin(), customPlugin] });
  const resolved = await loadConfig({ cwd, skipLookup: true, config });

  expect(setup).toHaveBeenCalledTimes(1);
  expect(setup.mock.lastCall?.[0].path).toBe(path.join(cwd, 'monots.config.js'));
  expect(setup.mock.lastCall?.[0].root).toBe(cwd);
  expect(setup.mock.lastCall?.[0].getPath('package.json')).toBe(path.join(cwd, 'package.json'));
  expect(setup.mock.lastCall?.[0].getPath('nested\\package\\package.json')).toBe(
    path.join(cwd, 'nested', 'package', 'package.json'),
  );

  // @ts-expect-error custom test key is purely for testing
  expect(resolved.customTestKey).toBe('abc');
  expect(ready).toHaveBeenCalledTimes(1);
  expect(resolved).toBe(ready.mock.lastCall?.[0]);
});
