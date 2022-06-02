import type { MonotsEvents, Plugin } from '@monots/types';
import type { Unsubscribe } from '@monots/utils';
import { loadJsonFile } from 'load-json-file';

export interface CorePlugin extends Plugin {
  type: 'core';

  /**
   * Return an object with properties to populate the resolved configuration resolved configuration.
   */
  onPrepare?: MonotsEvents['core:prepare'];

  /**
   * A handler for after
   */
  onReady?: MonotsEvents['core:ready'];
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
        const dispose: Unsubscribe[] = [];

        if (plugin.onPrepare) {
          dispose.push(props.on('core:prepare', plugin.onPrepare));
        }

        if (plugin.onReady) {
          dispose.push(props.on('core:ready', plugin.onReady));
        }
      },
    },
  };
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
