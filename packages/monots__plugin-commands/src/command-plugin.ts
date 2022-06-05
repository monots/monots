import type { CorePlugin } from '@monots/core';
import type { PluginProps } from '@monots/types';
import { deepMerge } from '@monots/utils';
import type { Ora } from 'ora';
import ora from 'ora';

import {
  BuildCommand,
  CheckCommand,
  CreateCommand,
  FixCommand,
  InitCommand,
  PrepareCommand,
} from './commands/index.js';

export interface CommandPluginProps {}

export function commandPlugin(_props?: CommandPluginProps): CorePlugin {
  return {
    name: 'command',
    type: 'core',
    onPrepare: (props) => {
      const isSilent = props.logger.level < 0;

      const commands = props.emit({
        event: 'commands:register',
        args: [props],
        transformer: (values) => values.flat(),
      });

      const cliContext = props.emit({
        event: 'commands:context',
        args: [props],
        transformer: (values) => {
          return deepMerge<monots.CommandContext>([
            ...values,
            { ora: ora({ isSilent }), on: props.on, emit: props.emit },
          ]);
        },
      });

      props.on('commands:register', () => [
        BuildCommand,
        CheckCommand,
        CreateCommand,
        FixCommand,
        InitCommand,
        PrepareCommand,
      ]);
      return { commands, cliContext };
    },
  };
}

declare global {
  namespace monots {
    interface Events {
      /**
       * Provide command context to all commands. Available in the
       * `MonotsCommand` via `this.ctx`.
       */
      'commands:context': (props: PluginProps) => Partial<monots.CommandContext>;
    }

    interface ResolvedConfig {
      /**
       * The CLI context.
       */
      cliContext: monots.CommandContext;
    }

    interface CommandContext {
      /**
       * Provide the ora
       */
      ora: Ora;
    }
  }
}
