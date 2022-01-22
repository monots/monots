import { ProjectEntity } from '@monots/core';
import type { Usage } from '@monots/types';
import chalkTemplate from 'chalk-template';
import ora from 'ora';

import { BaseCommand } from './base-command.js';

/**
 * Initialize the current directory to use `monots`.
 *
 * @category CliCommand
 */
export class InitCommand extends BaseCommand {
  static override paths = [['init']];
  static override usage: Usage = {
    description: 'Init the current directory to be the root for a monots project',
    category: 'Create',
    details: `
      Initialize the current directory as a root for a monots project.
    `,
  };

  override async execute() {
    super.execute();
    const spinner = ora(chalkTemplate`Reading local {bold package.json}`).start();
    let project: ProjectEntity;

    try {
      project = await ProjectEntity.create({ cwd: this.cwd, skipPackages: true });
      spinner.succeed('Found local package.json file');
    } catch (error: any) {
      spinner.fail(error.message);

      return 1;
    }

    spinner.info('Saving the monots configuration to the package.json');

    try {
      const changed = await project.saveJson();

      if (changed) {
        spinner.succeed('Successfully initialized project');
      } else {
        spinner.warn('Skipping initialization since the project has already been initialized');
      }
    } catch (error: any) {
      spinner.fail(error.message);
      return 1;
    }

    return 0;
  }
}
