import type { BaseContext, Command as CliCommand } from 'clipanion';
import type { ConditionalPick } from 'type-fest';

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
   * @defaultValue false
   */
  internal: boolean;
}

export interface BaseCommandProps {
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

declare global {
  namespace monots {
    interface CliCommands {}
  }
}
