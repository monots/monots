import { MonotsPriority } from '@monots/constants';
import { type BaseCorePlugin, type CorePlugin, handleCorePluginEvents } from '@monots/core';
import type { Unsubscribe } from '@monots/utils';
import * as fs from 'node:fs/promises';

import type { NpmPlugin } from './types.js';

/**
 * Add your inline documentation
 */
export function npmPlugin(): NpmPlugin {
  return {
    type: 'npm',
    name: 'npm',
    priority: MonotsPriority.Medium,
    onPrepare: async ({ config }) => {
      // return {}
    },
    transformers: {
      npm: (plugin) => (props) => {
        handleCorePluginEvents({ plugin, on: props.on });
      },
    },
  };
}
