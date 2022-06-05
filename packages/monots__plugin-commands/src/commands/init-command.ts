import { MonotsCommand, ProjectEntity } from '@monots/core';
import type { Usage } from '@monots/types';
import chalk from 'chalk-template';

/**
 * Initialize the current directory to use `monots`.
 *
 * @category CliCommand
 */
export class InitCommand extends MonotsCommand {
  static override paths = [['init']];
  static override usage: Usage = {
    description: 'Init the current directory to be the root for a monots project',
    category: 'Create',
    details: `
      Initialize the current directory as a root for a monots project.
    `,
  };

  override async run() {
    const { ora } = this.context;
    ora.start(chalk`reading local {bold package.json}`);
    let project: ProjectEntity;

    try {
      project = await ProjectEntity.create({ cwd: this.cwd, skipPackages: true });
      ora.succeed('found local package.json file');
    } catch (error: any) {
      ora.fail(error.message);

      return 1;
    }

    ora.info('saving the monots configuration to the package.json');

    try {
      const changed = await project.saveJson();

      if (changed) {
        ora.succeed('successfully initialized project');
      } else {
        ora.warn('skipping initialization since the project has already been initialized');
      }
    } catch (error: any) {
      ora.fail(error.message);
      return 1;
    }

    return 0;
  }
}
