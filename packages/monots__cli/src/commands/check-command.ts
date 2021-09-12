import { ProjectEntity } from '@monots/core';
import type { Usage } from '@monots/types';
import chalk from 'chalk';
import ora from 'ora';

import { BaseCommand } from './base-command';

/**
 * Fixes all the visible project files.
 *
 * @category CliCommand
 */
export class CheckCommand extends BaseCommand {
  static override paths = [['check']];
  static override usage: Usage = {
    description: 'Check for configuration and validation errors in the project.',
    category: 'Lint',
    details: chalk`
      This command checks all the package.json files to see if they need updating.
      Use {cyan monots fix} to fix the errors.
    `,
    examples: [['Run this to check whether the project has', '$0 check']],
  };

  override async execute() {
    super.execute();

    const spinner = ora(chalk`loading the monots project`).start();

    try {
      const project = await ProjectEntity.create({ cwd: this.cwd });
      spinner.text = 'validating package.json files';
      await project.validate();

      spinner.succeed('whoop! your project validated successfully!');
      return 0;
    } catch (error: any) {
      spinner.fail(chalk`${error.message}\n\nUse {cyan monots fix} to fix the errors.`);
      return 1;
    }
  }
}
