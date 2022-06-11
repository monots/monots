import { MonotsPriority } from '@monots/constants';
import type {
  AnyFunction,
  MonotsConfig,
  MonotsPlugin,
  NestedMonotsPlugins,
  PluginProps,
  PluginTransformers,
  ResolvedMonotsConfig,
  ResolvedPlugin,
} from '@monots/types';
import { deepMerge, Emitter, sort } from '@monots/utils';
import { isArray, isFunction, isNumber, isPromise, isString } from 'is-what';
import {
  type LoadEsmConfigOptions,
  type LoadEsmConfigResult,
  createLogger,
  loadEsmConfig,
} from 'load-esm-config';
import * as path from 'node:path';
import normalizePath from 'normalize-path';
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

  const { config, root } = result;

  // store the transformers which will map plugins to their resolved version.
  const transformers: PluginTransformers = Object.create(null);

  // flatten the plugins and then sort by priority.
  const plugins = sortPlugins(flattenPlugins(config.plugins), config.priorities);
  const transformedPlugins: ResolvedPlugin[] = [];
  const pluginProps: PluginProps = {
    ...result,
    logger: createLogger(options?.logLevel ?? 'warn'),
    getPath: (...paths: string[]) => normalizePath(path.join(root, ...paths)),
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

      if (!isFunction(fn)) {
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

    if (isPromise(maybePromise)) {
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

/**
 * Get the priority of a plugin as a number.
 */
function getPriority(value: number | MonotsPriority | undefined): number {
  return isNumber(value) ? value : isString(value) ? MonotsPriority[value] : MonotsPriority.Default;
}

/**
 * Flatten the nested plugins into a flat array.
 */
function flattenPlugins(plugins: NestedMonotsPlugins = []): MonotsPlugin[] {
  return plugins.flatMap((plugin) => (isArray(plugin) ? flattenPlugins(plugin) : plugin));
}

/**
 * Sort the plugins by priority.
 */
function sortPlugins(
  plugins: MonotsPlugin[],
  priorities: MonotsConfig['priorities'] = {},
): MonotsPlugin[] {
  return sort(plugins ?? []).desc((plugin) =>
    getPriority(priorities[plugin.name] ?? plugin.priority),
  );
}
