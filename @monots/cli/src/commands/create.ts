import { Command } from 'clipanion';
import terminalLink from 'terminal-link';

import { BaseCommand, CommandArray, CommandString, GetShapeOfCommandData } from './base';

/**
 * Create a new monorepo project.
 */
export class CreateCommand extends BaseCommand {
  public static usage = Command.Usage({
    description: 'Create a new TypeScript monorepo project.',
    category: 'Create',
    details: `
      Getting started with a TypeScript monorepo can be difficult.

      This command will scaffold a project which provides the following:

      - Automatic typechecking in the editor (without the need for a build step).
      - One command to build the project.
      - ${terminalLink(
        'Project References',
        'https://www.typescriptlang.org/docs/handbook/project-references.html',
      )} for faster incremental builds.
      - Unit testing commands built in.
      - Linting and formatting built in (with configuration options)
      - The combination of a full TypeScript build with babel plugins as well.
    `,
    examples: [
      [
        'Quickly create a new monorepo project called awesome with all the default options',
        '$0 create awesome',
      ],
      [
        'Specify a that you would like to use the minimal template',
        '$0 create awesome --template minimal',
      ],
    ],
  });

  @Command.String({ required: true })
  public name!: CommandString;

  @Command.String('--template')
  public template: CommandString = 'minimal';

  /**
   * Specify the names and types of packages you would like to build.
   *
   * For example the following would create three packages within the awesome monorepo.
   *
   * ```bash
   * monots create awesome --package @awesome/cli,cli --package @awesome/core,minimal \
   *     --package @awesome/core,react-ui
   * ```
   *
   */
  @Command.Array('--package')
  public packages: CommandArray = [];

  /**
   * The template library to default to using.
   *
   * @remarks
   *
   * The template library allows for customisation of the templates available.
   *
   * Multiple can be specified.
   */
  @Command.Array('--template-library')
  public templateLibraries: CommandArray = [];

  @BaseCommand.Path('create')
  public async execute() {
    this.context.stdout.write(this.cli.usage(null, { detailed: this.verbose }));
  }
}

declare global {
  interface AvailableCommands {
    create: GetShapeOfCommandData<CreateCommand>;
  }
}
