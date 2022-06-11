import type { MonotsEvents, Plugin } from '@monots/types';
import type { Unsubscribe } from '@monots/utils';
import { loadJsonFile } from 'load-json-file';

import type { EmitterProps } from './types.js';

export interface BaseCorePlugin extends Plugin {
  /**
   * Return an object with properties to populate the resolved configuration resolved configuration.
   */
  onPrepare?: MonotsEvents['core:prepare'];

  /**
   * A handler for after the monots configuration has been resolved.
   */
  onReady?: MonotsEvents['core:ready'];

  /**
   * A handler for when monots is disposed.
   */
  onDispose?: MonotsEvents['core:dispose'];
}

export interface CorePlugin extends BaseCorePlugin {
  type: 'core';
}

/**
 * This plugin provides some of the core functionality and should always be
 * loaded in the configuration.
 */
export function corePlugin(): CorePlugin {
  return {
    type: 'core',
    name: 'core',
    onPrepare: async (props) => {
      return { loadJsonFile: (relativePath) => loadJsonFile(props.getPath(relativePath)) };
    },
    transformers: {
      core: (plugin) => (props) => {
        handleCorePluginEvents({ plugin, on: props.on });
      },
    },
  };
}

interface HandleCorePluginEventsProps extends Pick<EmitterProps, 'on'> {
  plugin: BaseCorePlugin;
}

/**
 * @internal
 */
export function handleCorePluginEvents(props: HandleCorePluginEventsProps) {
  const { on, plugin } = props;
  const dispose: Unsubscribe[] = [];
  const { onDispose, onPrepare, onReady } = plugin;

  if (onPrepare) {
    const handler = on('core:prepare', onPrepare);
    dispose.push(handler);
  }

  if (onReady) {
    const handler = on('core:ready', onReady);
    dispose.push(handler);
  }

  if (onDispose) {
    const handler = on('core:dispose', (config) => {
      onDispose(config);

      for (const unsubscribe of dispose) {
        unsubscribe();
      }
    });
    dispose.push(handler);
  }
}

declare global {
  namespace monots {
    interface Plugins {
      core: CorePlugin;
    }

    interface ResolvedConfig {
      /**
       * Load a json file file relative to the root of this monorepo.
       */
      loadJsonFile: <Type>(path: string) => Promise<Type>;
    }
  }
}
