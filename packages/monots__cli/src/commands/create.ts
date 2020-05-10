import { CommitType } from '@monots/templates';
import terminalLink from 'terminal-link';

import {
  BaseCommand,
  CommandArray,
  CommandEnum,
  CommandString,
  GetShapeOfCommandData,
} from './base';

/**
 * Create a new monorepo project.
 */
export class CreateCommand extends BaseCommand {
  public static usage = BaseCommand.Usage({
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

  /**
   * The name of the created monorepo.
   */
  @BaseCommand.String({ required: true })
  public name: CommandString = '';

  /**
   * The monorepo template to use.
   */
  @BaseCommand.String('--template,-t')
  public template: CommandString = 'minimal';

  /**
   * The license to use for the monorepo.
   */
  @BaseCommand.String('--license,-l')
  public license: CommandString = 'MIT';

  /**
   * Specify the names and types of packages you would like to build.
   *
   * For example the following would create three packages within the `awesome` monorepo.
   *
   * ```bash
   * monots create awesome --pkg @awesome/cli,cli --pkg @awesome/core,minimal \
   *     --pkg @awesome/core,react-ui
   * ```
   */
  @BaseCommand.Array('--pkg,-p', {})
  public pkg: CommandArray = [];

  /**
   * The template library to default to using.
   *
   * @remarks
   *
   * The template library allows for customisation of the templates available.
   *
   * Multiple can be specified.
   */
  @BaseCommand.Array('--template-library,-T', {})
  public templateLibrary: CommandArray = [];

  @BaseCommand.Array('--commit-type')
  public commitType: CommandEnum<CommitType> = 'conventional';

  @BaseCommand.Path('create')
  public async execute() {
    this.context.stdout.write(
      JSON.stringify({
        name: this.name,
        templateLibrary: this.templateLibrary,
        pkg: this.pkg,
        template: this.template,
      }),
    );
  }
}

declare global {
  interface AvailableCommands {
    create: GetShapeOfCommandData<CreateCommand>;
  }
}
