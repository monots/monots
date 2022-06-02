import type { CorePlugin } from '@monots/core';
import { corePlugin, defineConfig, loadConfig } from '@monots/core';
import type { PluginProps } from '@monots/types';
import { tmpdir } from 'node:os';
import path from 'node:path/posix';
import { test, vi } from 'vitest';

test('`CorePlugin` hooks are correctly called', async ({ expect }) => {
  const cwd = tmpdir();
  const onPrepare = vi.fn<[PluginProps]>(() => ({ customTestKey: 'abc' }));
  const onReady = vi.fn();
  const customPlugin: CorePlugin = { name: 'custom', type: 'core', onPrepare, onReady };
  const config = defineConfig({ plugins: [corePlugin(), customPlugin] });
  const resolved = await loadConfig({ cwd, skipLookup: true, config });

  expect(onPrepare).toHaveBeenCalledTimes(1);
  expect(onPrepare.mock.lastCall?.[0].path).toBe(path.join(cwd, 'monots.config.js'));
  expect(onPrepare.mock.lastCall?.[0].root).toBe(cwd);
  expect(onPrepare.mock.lastCall?.[0].getPath('package.json')).toBe(path.join(cwd, 'package.json'));
  expect(onPrepare.mock.lastCall?.[0].getPath('nested\\package\\package.json')).toBe(
    path.join(cwd, 'nested', 'package', 'package.json'),
  );

  // @ts-expect-error custom test key is purely for testing
  expect(resolved.customTestKey).toBe('abc');
  expect(onReady).toHaveBeenCalledTimes(1);
  expect(resolved).toBe(onReady.mock.lastCall?.[0]);
});
