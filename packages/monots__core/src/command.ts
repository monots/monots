import type { PluginProps } from '@monots/types';
import chalk from 'chalk';
import type { BaseContext, Command as CliCommand, Usage } from 'clipanion';
import { Command, Option as CommandOption } from 'clipanion';
import type { Consola } from 'consola';
import { LogLevel } from 'load-esm-config';
import * as path from 'node:path';
import { objectKeys } from 'ts-extras';
import type { LooseTest } from 'typanion';
import { isEnum } from 'typanion';
import type { ConditionalPick } from 'type-fest';

export abstract class MonotsCommand
  extends Command<MonotsCommandContext>
  implements MonotsCommandProps
{
  /**
   * Set the current working directory from the command line.
   */
  cwd: CommandString = CommandOption.String('--cwd', {
    description: 'Set the current working directory from which the command should be run',
    hidden: false,
  }) as CommandString;

  /**
   * Set whether the command should use verbose logging from the command line.
   */
  logLevel?: CommandEnum<keyof typeof LogLevel> = CommandOption.String('--log-level', {
    validator: isEnum(objectKeys(LogLevel)),
    description: `Set the log level to any of the following: ${objectKeys(LogLevel)
      .map((name) => chalk.cyan(`"${name}"`))
      .join(' | ')}`,
  });

  silent?: CommandBoolean = CommandOption.Boolean('--silent', {
    description: 'Sets the log level to `silent`.',
    hidden: true,
  });

  async execute(): Promise<number | void> {
    this.cwd = this.cwd ? path.resolve(this.cwd) : this.context.cwd;
    return this.run();
  }

  /**
   * Run the command. This method is required on every `monots` command.
   */
  abstract run(): Promise<number | void>;
}

export interface MonotsCommandClass {
  paths?: string[][];
  schema?: Array<
    LooseTest<{
      [key: string]: unknown;
    }>
  >;
  usage?: Usage;
  new (): MonotsCommand;
}

export interface MonotsCommand {
  constructor: MonotsCommandClass;
}

export interface MonotsCommandContext extends BaseContext, monots.CommandContext {
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

  /**
   * The log level that was used.
   */
  logLevel: LogLevel;

  /**
   * The logger to use when printing messages.
   */
  logger: Consola;
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

type AnnotatedPropsFromCommand<Command extends CliCommand<MonotsCommandContext>> = ConditionalPick<
  Command,
  FlaggedCommand
>;

/**
 * Get the properties from a clipanion command.
 */
export type PropsFromCommand<Command extends CliCommand<MonotsCommandContext>> = {
  [Key in keyof AnnotatedPropsFromCommand<Command>]: RemoveAnnotation<
    AnnotatedPropsFromCommand<Command>[Key]
  >;
};

export { type Usage, Option as CommandOption } from 'clipanion';

/**
 * This stores the available monots commands.
 */
export interface MonotsCommands extends monots.Commands {}

declare global {
  namespace monots {
    interface Commands {
      [key: string]: MonotsCommand;
    }

    interface Events {
      /**
       * This command can be used to register new commands. Commands are
       * registered using the npm library `clipanion` and documentation is
       * available
       */
      'commands:register': (props: PluginProps) => MonotsCommandClass[];
    }

    interface ResolvedConfig {
      /**
       * All the registered commands from the configured plugins.
       */
      commands: MonotsCommandClass[];
    }

    interface CommandContext {}
  }
}
