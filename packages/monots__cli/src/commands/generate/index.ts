import chalk from 'chalk';
import { Command } from 'clipanion';

import { colors } from '../../utils';
import { BaseCommand, CommandBoolean, GetShapeOfCommandData } from '../base';

export class GenerateCommand extends BaseCommand {
  public static usage = Command.Usage({
    category: 'Generate',
    description: chalk.hex(colors.lightBlue)('Generate auto created files for the project.'),
  });

  /**
   * Sets this as an interactive command.
   */
  @Command.Boolean('-i,--interactive')
  public interactive: CommandBoolean = false;

  @Command.Path('generate')
  public async execute() {
    if (this.interactive) {
      console.log('interactive stuff');
    }
    console.log('generating something');
  }
}

export { GenerateTypescriptCommand } from './typescript';

declare global {
  interface AvailableCommands {
    generate: GetShapeOfCommandData<GenerateCommand>;
  }
}
