import type { MonotsEvents, Plugin } from '@monots/types';
import type { Unsubscribe } from '@monots/utils';
import { loadJsonFile } from 'load-json-file';

export interface CorePlugin extends Plugin {
  type: 'core';

  /**
   * Return an object with properties to populate the resolved configuration resolved configuration.
   */
  setup?: MonotsEvents['setup'];

  /**
   * A handler for after
   */
  ready?: MonotsEvents['ready'];
}

/**
 * This plugin provides some of the core functionality and should always be
 * loaded in the configuration.
 */
export function corePlugin(): CorePlugin {
  return {
    type: 'core',
    name: 'core',
    setup: async (props) => {
      return { loadJsonFile: (relativePath) => loadJsonFile(props.getPath(relativePath)) };
    },
    transformers: {
      core: (plugin) => (props) => {
        const dispose: Unsubscribe[] = [];

        if (plugin.setup) {
          dispose.push(props.on('setup', plugin.setup));
        }

        if (plugin.ready) {
          dispose.push(props.on('ready', plugin.ready));
        }
      },
    },
  };
}

declare module '@monots/types' {
  export interface MonotsPlugins {
    core: CorePlugin;
  }

  export interface ResolvedMonotsConfig {
    /**
     * Load a json file file relative to the root of this monorepo.
     */
    loadJsonFile: <Type>(path: string) => Promise<Type>;
  }
}
