import { MonotsCommand, ProjectEntity } from '@monots/core';
import type { Usage } from '@monots/types';
import chalk from 'chalk-template';

/**
 * Fixes all the visible project files.
 *
 * @category CliCommand
 */
export class FixCommand extends MonotsCommand {
  static override paths = [['fix']];
  static override usage: Usage = {
    description: 'Fix all the issues found within the editor.',
    category: 'Lint',
    details: `
      This command updates all the \`package.json\` files and creates tsconfig files.
    `,
    examples: [['Run this to ensure that all files are up to date', '$0 fix']],
  };

  override async run() {
    const { ora } = this.context;

    ora.start(chalk`fixing the monots project`);

    try {
      const project = await ProjectEntity.create({ cwd: this.cwd });
      ora.info('updating package.json files');
      await project.savePackagesJson();

      ora.info('saving tsconfig files');
      await project.saveTsconfigFiles();

      ora.succeed('boom! your project is up to date!');
      return 0;
    } catch (error: any) {
      ora.fail(chalk`oops, something went wrong: {red ${error.message} }`);
      return 1;
    }
  }
}
