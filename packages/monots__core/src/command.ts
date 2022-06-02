import type { BaseContext, Command as CliCommand } from 'clipanion';
import { Command, Option } from 'clipanion';
import * as path from 'node:path';
import type { ConditionalPick } from 'type-fest';

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
  logLevel: CommandBoolean =
    Option.String('--log-level', {
      description: 'Set the log level .',
    }) ?? false;

  async execute(): Promise<number | void> {
    this.cwd = this.cwd ? path.resolve(this.cwd) : this.context.cwd;
  }
}

export interface CommandContext extends BaseContext {
  /**
   * The current working directory.
   */
  cwd: string;

  /**
   * The CLI version
   */
  version: string;

  /**
   * The CLI description
   */
  description: string;

  /**
   * The cli name as defined in the package.json.
   */
  name: string;

  /**
   * - `false` when this command is being run directly from the command line
   * - `true` when it is run from another command.
   *
   * @default false
   */
  internal: boolean;
}

export interface MonotsCommandProps {
  verbose?: boolean;
  cwd?: string;
}

export interface FlaggedCommand {
  __cmdProperty?: never;
}

type Annotate<Type> = Type & FlaggedCommand;
type RemoveAnnotation<Type> = Type extends Annotate<infer T> ? T : Type;

export type CommandString = Annotate<string>;
export type CommandBoolean = Annotate<boolean>;
export type CommandArray<Type = string> = Annotate<Type[]>;
export type CommandEnum<Type extends string> = Annotate<Type>;

type AnnotatedPropsFromCommand<Command extends CliCommand<CommandContext>> = ConditionalPick<
  Command,
  FlaggedCommand
>;

/**
 * Get the properties from a clipanion command.
 */
export type PropsFromCommand<Command extends CliCommand<CommandContext>> = {
  [Key in keyof AnnotatedPropsFromCommand<Command>]: RemoveAnnotation<
    AnnotatedPropsFromCommand<Command>[Key]
  >;
};

export type { Usage } from 'clipanion';

/**
 * This stores the available monots commands.
 */
export interface MonotsCommands extends monots.Commands {}

declare global {
  namespace monots {
    interface Events {
      /**
       * This command can be used to register new commands. Commands are registered using the npm library `clipanion` and documentation is available
       */
      'register:commands': () => MonotsCommand[];
    }
    interface Commands {
      [key: string]: MonotsCommand;
    }
  }
}
