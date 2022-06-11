import type { CorePlugin } from '@monots/core';
import type { BaseContext, PluginProps } from '@monots/types';
import { deepMerge } from '@monots/utils';
import * as process from 'node:process';
import createOra, { type Ora } from 'ora';

import {
  BuildCommand,
  CheckCommand,
  CreateCommand,
  FixCommand,
  InitCommand,
  PrepareCommand,
} from './commands/index.js';

export interface CommandPluginProps extends Partial<BaseContext> {}

export function commandPlugin(props: CommandPluginProps = {}): CorePlugin {
  const { stderr = process.stderr, stdin = process.stdin, stdout = process.stdout } = props;

  return {
    name: 'command',
    type: 'core',
    onPrepare: (props) => {
      const { on, emit, logger } = props;
      const isSilent = logger.level < 0;

      const commands = props.emit({
        event: 'commands:register',
        args: [props],
        transformer: (values) => values.flat(),
      });

      const ora = createOra({ isSilent, stream: stderr });
      const cliContext = props.emit({
        event: 'commands:context',
        args: [props],
        transformer: (values) => {
          return deepMerge<monots.CommandContext>([
            ...values,
            { ora, on, emit, stderr, stdin, stdout },
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

    interface CommandContext extends BaseContext {
      /**
       * Provide the ora
       */
      ora: Ora;
    }
  }
}
