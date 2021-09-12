import type {
  BaseCommandProps,
  CommandBoolean,
  CommandContext,
  CommandString,
} from '@monots/types';
import { Command, Option } from 'clipanion';
import path from 'node:path';

export abstract class BaseCommand extends Command<CommandContext> implements BaseCommandProps {
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
