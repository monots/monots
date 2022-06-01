import type {
  MonotsConfig,
  PluginProps,
  PluginTransformers,
  ResolvedMonotsConfig,
  ResolvedPlugin,
} from '@monots/types';
import { deepMerge, Emitter, is, normalizePath } from '@monots/utils';
import type { LoadEsmConfigOptions } from 'load-esm-config';
import { loadEsmConfig } from 'load-esm-config';
import * as path from 'node:path';
import type { AnyFunction } from 'superstruct-extra';
import { objectEntries } from 'ts-extras';
import type { Except } from 'type-fest';

import type { MonotsEmitter } from '../types.js';

/**
 * Load the monots configuration object.
 */
export async function loadConfig(
  options?: Except<LoadEsmConfigOptions, 'name' | 'getArgument'>,
): Promise<ResolvedMonotsConfig> {
  const emitter: MonotsEmitter = new Emitter();
  const getArgument = () => ({ on: emitter.on });
  type Argument = ReturnType<typeof getArgument>;

  const result = await loadEsmConfig<MonotsConfig, Argument>({
    name: 'monots',
    ...options,
    getArgument,
  });

  if (!result) {
    throw new Error('no configuration file found');
  }

  // Load the plugins.
  const transformers: PluginTransformers = Object.create(null);
  const plugins = [...(result.config.plugins ?? [])];
  const transformedPlugins: ResolvedPlugin[] = [];
  const pluginProps: PluginProps = {
    ...result,
    getPath: (relativePath: string) => path.join(result.root, normalizePath(relativePath)),
  };

  // Find all the plugins with a transformer. Register these transformers and
  // then apply them to the plugins.
  for (const plugin of plugins) {
    if (!plugin.transformers) {
      continue;
    }

    for (const [type, transformer] of objectEntries(plugin.transformers)) {
      if (!transformer || type === 'resolved') {
        continue;
      }

      transformers[type] = transformer as AnyFunction;
    }
  }

  for (const plugin of plugins) {
    const transformedPlugin: ResolvedPlugin =
      plugin.type === 'resolved'
        ? plugin
        : {
            name: plugin.name,
            original: plugin,
            type: 'resolved',
            plugin: transformers[plugin.type](plugin as any),
          };

    transformedPlugins.push(transformedPlugin);
    const maybePromise = transformedPlugin.plugin(pluginProps);

    if (is.promise(maybePromise)) {
      await maybePromise;
    }
  }

  // Generate the resolved configuration from plugins.
  const resolved = await emitter.emit({
    event: 'config:pre:resolve',
    async: true,
    args: [result],
    transformer: (values) =>
      deepMerge<ResolvedMonotsConfig>([...values, result, { plugins: transformedPlugins }]),
  });

  await emitter.emit({
    event: 'config:post:resolve',
    async: true,
    args: [resolved],
    parallel: true,
  });

  return resolved;
}
