import { MonotsPriority } from '@monots/constants';
import type {
  MonotsConfig,
  MonotsPlugin,
  NestedMonotsPlugins,
  PluginProps,
  PluginTransformers,
  ResolvedMonotsConfig,
  ResolvedPlugin,
} from '@monots/types';
import { deepMerge, Emitter, is, sort } from '@monots/utils';
import {
  type LoadEsmConfigOptions,
  type LoadEsmConfigResult,
  loadEsmConfig,
  createLogger,
} from 'load-esm-config';
import * as path from 'node:path';
import normalizePath from 'normalize-path';
import type { AnyFunction } from 'superstruct-extra';
import { objectEntries } from 'ts-extras';
import type { Except } from 'type-fest';

import type { DefineConfigArgument, EmitterProps, MonotsEmitter } from '../types.js';

export interface LoadConfigOptions extends Except<LoadEsmConfigOptions, 'name' | 'getArgument'> {
  /**
   * Load directly from the provided `config` property. This is mainly for testing.
   *
   * Will throw an error if no configuration is provided.
   */
  skipLookup?: boolean;
}

/**
 * Load the monots configuration object.
 */
export async function loadConfig(options?: LoadConfigOptions): Promise<ResolvedMonotsConfig> {
  const emitter: MonotsEmitter = new Emitter();
  const emitterProps: EmitterProps = { on: emitter.on, emit: emitter.emit };
  const getArgument = (): DefineConfigArgument => emitterProps;
  let loadedResult: LoadEsmConfigResult<MonotsConfig> | undefined;

  if (options?.skipLookup) {
    if (!options.config) {
      throw new Error('when using `skipLookup` you must also provide a config object.');
    }

    loadedResult = {
      config: options.config,
      dependencies: [],
      path: path.join(options.cwd ?? process.cwd(), 'monots.config.js'),
      root: options.cwd ?? process.cwd(),
    };
  } else {
    loadedResult = await loadEsmConfig<MonotsConfig, DefineConfigArgument>({
      ...options,
      name: 'monots',
      getArgument,
    });
  }

  const result = loadedResult;

  if (!result) {
    throw new Error('no configuration file found');
  }

  // store the transformers which will map plugins to their resolved version.
  const transformers: PluginTransformers = Object.create(null);
  // sort the plugins by priority
  const plugins = sortPlugins(flattenPlugins(result.config.plugins));
  const transformedPlugins: ResolvedPlugin[] = [];
  const pluginProps: PluginProps = {
    ...result,
    logger: createLogger(options?.logLevel ?? 'warn'),
    getPath: (...paths: string[]) => normalizePath(path.join(result.root, ...paths)),
    emit: emitter.emit,
    on: emitter.on,
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
    let transformedPlugin: ResolvedPlugin;

    if (plugin.type === 'resolved') {
      transformedPlugin = plugin;
    } else {
      const fn = transformers[plugin.type]?.(plugin as any);

      if (!is.function_(fn)) {
        throw new Error(`No transformer found for plugin type "${plugin.type}"`);
      }

      transformedPlugin = {
        name: plugin.name,
        original: plugin,
        type: 'resolved',
        plugin: fn,
        priority: plugin.priority ?? MonotsPriority.Default,
      };
    }

    transformedPlugins.push(transformedPlugin);
    const maybePromise = transformedPlugin.plugin(pluginProps);

    if (is.promise(maybePromise)) {
      await maybePromise;
    }
  }

  // Generate the resolved configuration from plugins.
  const resolved = await emitter.emit({
    event: 'core:prepare',
    async: true,
    args: [pluginProps],
    transformer: (values) =>
      deepMerge<ResolvedMonotsConfig>([
        ...values.filter((value): value is object => !!value),
        result,
        { plugins: transformedPlugins, ...emitterProps },
      ]),
  });

  await emitter.emit({ event: 'core:ready', async: true, args: [resolved], parallel: true });

  return resolved;
}

function getPriority(value: number | MonotsPriority | undefined): number {
  return is.number(value)
    ? value
    : is.string(value)
    ? MonotsPriority[value]
    : MonotsPriority.Default;
}

function flattenPlugins(plugins: NestedMonotsPlugins = []): MonotsPlugin[] {
  return plugins.flatMap((plugin) => (is.array(plugin) ? flattenPlugins(plugin) : plugin));
}

function sortPlugins(plugins: MonotsPlugin[]): MonotsPlugin[] {
  return sort(plugins ?? []).desc((plugin) => getPriority(plugin.priority));
}
