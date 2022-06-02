import type { MonotsCommand } from '@monots/core';

export * from './build-command.js';
export * from './check-command.js';
export * from './create-command.js';
export * from './fix-command.js';
export * from './init-command.js';
export * from './prepare-command.js';

declare global {
  namespace monots {
    interface Events {
      /**
       * Load the commands that will be use by `@monots/cli`.
       */
      'commands:load': () => MonotsCommand[];
    }
  }
}
