import { ProjectEntity } from '@monots/core';
import type { Usage } from '@monots/types';
import chalk from 'chalk';
import ora from 'ora';

import { BaseCommand } from './base-command.js';

/**
 * This command is used to prepare the project by setting up all the entrypoints
 * and the typescript configuration.
 *
 * Each package will have it's own tsconfig. Public folders will
 *
 * It should be run on `postinstall`.
 *
 * @category CliCommand
 */
export class PrepareCommand extends BaseCommand {
  static override paths = [['prepare']];
  static override usage: Usage = {
    description: 'Prepare the development files for each entrypoint in your project',
    category: 'Build',
    details: `
      Create files and symlinks in the dist folders of entrypoints which map to
      the appropriate source file so that the package can be imported from Node
      and in bundlers and the source file will be imported.
    `,
    examples: [
      ['Add this command to your "postinstall" hook in the root package.json', '$0 prepare'],
    ],
  };

  override async execute() {
    super.execute();

    const spinner = ora(chalk`Preparing project for development`).start();

    try {
      const project = await ProjectEntity.create({ cwd: this.cwd, version: this.context.version });

      spinner.info('cleaning dist files');
      await project.cleanDist('*.js');

      spinner.info('preparing development files');
      await project.prepare();
      spinner.succeed('Your project is now ready for development.');
      return 0;
    } catch (error: any) {
      spinner.fail(`Something went wrong: ${error.message}.`);
      return 1;
    }
  }
}
