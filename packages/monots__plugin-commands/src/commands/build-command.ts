import { MonotsCommand, ProjectEntity } from '@monots/core';
import type { Usage } from '@monots/types';
import chalk from 'chalk-template';

/**
 * This command is used to prepare the project by setting up all the entrypoints
 * and the typescript configuration.
 *
 * It should be run on `postinstall`.
 *
 * @category CliCommand
 */
export class BuildCommand extends MonotsCommand {
  static override paths = [['build']];
  static override usage: Usage = {
    description: 'Build all your packages and their entrypoints.',
    category: 'Build',
    details: `
      Build each public entrypoint within your project.
      This will not create the TypeScript types. For that you will need to use \`tsc -b\`
    `,
    examples: [['Build your files', '$0 build']],
  };

  async run() {
    const { ora } = this.context;
    const spinner = ora.start(chalk`loading project`);

    try {
      const project = await ProjectEntity.create({ cwd: this.cwd });
      spinner.text = 'cleaning dist files';
      await project.cleanDist('*.js');

      spinner.text = 'building project';
      await project.build();

      spinner.succeed(chalk`{bold yay!} your project was built successfully!`);
      return 0;
    } catch (error: any) {
      spinner.fail(`oops, something went wrong: ${error.message}`);
      return 1;
    }
  }
}
