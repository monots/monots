import type {
  CommandBoolean,
  CommandContext,
  CommandString,
  MonotsCommandProps,
} from '@monots/types';
import { Command, Option } from 'clipanion';
import * as path from 'node:path';

export abstract class MonotsCommand extends Command<CommandContext> implements MonotsCommandProps {
  /**
   * Set the current working directory from the command line.
   */
  cwd: CommandString = Option.String('--cwd', {
    description: 'Set the current working directory from which the command should be run',
    hidden: false,
  }) as CommandString;

  /**
   * Set whether the command should use verbose logging from the command line.
   */
  verbose: CommandBoolean =
    Option.Boolean('--verbose', {
      description: 'Set logging to verbose.',
    }) ?? false;

  async execute(): Promise<number | void> {
    this.cwd = this.cwd ? path.resolve(this.cwd) : this.context.cwd;
  }
}

declare module '@monots/types' {
  export interface MonotsEvents {
    /**
     * This command can be used to register new commands. Commands are registered using the npm library `clipanion` and documentation is available
     */
    'register:commands': () => MonotsCommand[];
  }
}
