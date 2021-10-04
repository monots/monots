import { ProjectEntity } from '@monots/core';
import type { Usage } from '@monots/types';
import chalk from 'chalk';
import ora from 'ora';

import { BaseCommand } from './base-command.js';

/**
 * Fixes all the visible project files.
 *
 * @category CliCommand
 */
export class FixCommand extends BaseCommand {
  static override paths = [['fix']];
  static override usage: Usage = {
    description: 'Fix all the issues found within the editor.',
    category: 'Lint',
    details: `
      This command updates all the \`package.json\` files and creates tsconfig files.
    `,
    examples: [['Run this to ensure that all files are up to date', '$0 fix']],
  };

  override async execute() {
    super.execute();

    const spinner = ora(chalk`fixing the monots project`).start();

    try {
      const project = await ProjectEntity.create({ cwd: this.cwd });
      spinner.info('updating package.json files');
      await project.savePackagesJson();

      spinner.info('saving tsconfig files');
      await project.saveTsConfigFiles();

      spinner.succeed('boom! your project is up to date!');
      return 0;
    } catch (error: any) {
      spinner.fail(`oops, something went wrong: ${chalk.red(error.message)}`);
      return 1;
    }
  }
}
