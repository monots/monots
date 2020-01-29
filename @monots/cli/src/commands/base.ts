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

export type CommandString = string & FlaggedCommand;
export type CommandBoolean = boolean & FlaggedCommand;
export type CommandArray<GType = string> = GType[] & FlaggedCommand;

type ExtractShapeKeys<Base, Condition, Ignored = undefined> = {
  [Key in keyof Base]: Base[Key] extends Condition | (Condition | Ignored) ? Key : never;
}[keyof Base];

type ExtractSubType<Base, Condition, Ignored = undefined> = Pick<
  Base,
  ExtractShapeKeys<Base, Condition, Ignored>
>;

export type GetShapeOfCommandData<GCommand extends BaseCommand> = ExtractSubType<
  GCommand,
  FlaggedCommand
>;

export type RunSubCommandParams<CommandData extends GetShapeOfCommandData<BaseCommand>> = {
  positional?: string[];
} & Partial<CommandData>;

declare global {
  interface AvailableCommands {}
}
