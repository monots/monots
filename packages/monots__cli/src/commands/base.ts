import { Command } from 'clipanion';
import dargs from 'dargs';
import { isAbsolute, resolve } from 'path';

import { BaseCommandProps, CommandContext } from '../types';

export abstract class BaseCommand extends Command<CommandContext> implements BaseCommandProps {
  /**
   * Wrap the specified command to be attached to the given path on the command line.
   * The first path thus attached will be considered the "main" one, and all others will be aliases.
   * @param path The command path.
   */
  public static Path(command: keyof AvailableCommands) {
    return Command.Path(...command.split(' '));
  }

  /**
   * Set the current working directory from the command line.
   */
  @Command.String('--cwd', { hidden: true })
  private readonly _cwd: string = '';

  /**
   * Get the current working directory for this command.
   */
  get cwd(): CommandString {
    return this._cwd ? (isAbsolute(this._cwd) ? this._cwd : resolve(this._cwd)) : process.cwd();
  }

  /**
   * Set whether the command should use verbose logging from the command line.
   */
  @Command.Boolean('--verbose')
  public verbose: CommandBoolean = false;

  /**
   * Run the a sub command with the command line arguments transformed automatically.
   */
  public async run<GCommand extends keyof AvailableCommands>(
    command: GCommand,
    { positional = [], ...other }: RunSubCommandParams<AvailableCommands[GCommand]>,
  ) {
    const _ = [...(command ? command.split(' ') : []), ...positional];
    const args = dargs({ _, verbose: this.verbose, cwd: this.cwd, ...other }, {});

    return this.cli.run(args, { internal: true });
  }
}

export interface FlaggedCommand {
  __cmdProperty?: never;
}

type Annotate<GType> = GType & FlaggedCommand;

export type CommandString = Annotate<string>;
export type CommandBoolean = Annotate<boolean>;
export type CommandArray<GType = string> = Annotate<GType[]>;
export type CommandEnum<GType extends string> = Annotate<GType>;

type ConditionalKeys<Base, Condition> = NonNullable<
  {
    [Key in keyof Base]: Base[Key] extends Condition ? Key : never;
  }[keyof Base]
>;

type ConditionalPick<Base, Condition> = Pick<Base, ConditionalKeys<Base, Condition>>;

export type GetShapeOfCommandData<GCommand extends BaseCommand> = ConditionalPick<
  GCommand,
  FlaggedCommand
>;

export type RunSubCommandParams<CommandData extends GetShapeOfCommandData<BaseCommand>> = {
  positional?: string[];
} & Partial<CommandData>;

declare global {
  namespace monots {
    interface CliCommands {}
  }
}
