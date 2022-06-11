import { ProjectEntity } from '@monots/core';
import type { Usage } from '@monots/types';
import chalkTemplate from 'chalk-template';
import ora from 'ora';

import { BaseCommand } from './base-command.js';

/**
 * This command is used to prepare the project by setting up all the entrypoints
 * and the typescript configuration.
 *
 * It should be run on `postinstall`.
 *
 * @category CliCommand
 */
export class BuildCommand extends BaseCommand {
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

  override async execute() {
    super.execute();

    const spinner = ora(chalkTemplate`loading project`).start();

    try {
      const project = await ProjectEntity.create({ cwd: this.cwd });
      spinner.text = 'cleaning dist files';
      await project.cleanDist('*.js');

      spinner.text = 'building project';
      await project.build();

      spinner.succeed(chalkTemplate`{bold yay!} your project was built successfully!`);
      return 0;
    } catch (error: any) {
      spinner.fail(`oops, something went wrong: ${error.message}`);
      return 1;
    }
  }
}
