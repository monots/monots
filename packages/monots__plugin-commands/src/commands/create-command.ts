import { CommandOption, MonotsCommand } from '@monots/core';
import type { CommandString, Usage } from '@monots/types';
import { createTemporaryFolder } from '@monots/utils';
import chalk from 'chalk-template';
import * as path from 'node:path';
import { InstallCommand, processTemplate, scaffold } from '@monots/template';

/**
 * Create a package / crate or  for the project.
 *
 * @category CliCommand
 */
export class CreateCommand extends MonotsCommand {
  static override paths = [['create']];
  static override usage: Usage = {
    description: 'Create a package for the current project.',
    category: 'Create',
    details: `
      Create a package using the provided template in the specified location.
    `,
    examples: [
      [
        'Create a package using the default simple template',
        '$0 create --description="Awesome package" @monots/new-package',
      ],
    ],
  };

  /**
   * The name of the package / crate / app to create.
   */
  name: CommandString = CommandOption.String({ required: true });

  template?: CommandString = CommandOption.String('--template,-T', {
    description: 'The template to use. This can be a file path or a url for a GitHub project',
  });

  description?: CommandString = CommandOption.String('--description,-D', {
    description: 'Set the description of the package being created',
  });

  override async run() {
    const { ora, emit, logger, logLevel } = this.context;
    const spinner = ora.start(chalk`loading project package`);
    const handlers = emit({
      event: 'command:create:handlers',
      args: [],
      async: false,
      transformer: (handlers) => handlers,
    });

    // track the source string
    let source: string | undefined;
    let matchingHandler: MonotsTemplateHandler['getTemplateProps'] | undefined;

    if (this.template) {
      spinner.info('searching for template in plugins');

      for (const handler of handlers) {
        const handlerSource = handler.templates[this.template];
        if (!handlerSource) {
          continue;
        }

        source = handlerSource;
        matchingHandler = handler.getTemplateProps;
        break;
      }

      if (!source) {
        try {
          spinner.info(`${this.template}: template is not handled by local plugins... downloading`);
          const destination = createTemporaryFolder();
          await scaffold({
            repo: this.template,
            destination,
            onInfo: (info) => {
              logger.info(info.repo, info.message);
              logger.trace(info);
            },
            onWarn: (info) => {
              logger.warn(info.repo, info.message);
              logger.trace(info);
            },
          });

          logger.debug(`template source set to ${destination}`);
          source = destination;
        } catch (error) {
          spinner.fail('invalid template provided');
          return 1;
        }
      }
    }

    let templateProps: GetTemplatePropsResult | undefined;

    for (const handler of handlers) {
      const value = await handler.getTemplateProps({
        source,
        cwd: this.cwd,
        name: this.name,
        template: this.template,
        matched: handler.getTemplateProps === matchingHandler,
      });

      if (!value) {
        continue;
      }

      templateProps = value;
      break;
    }

    if (!templateProps) {
      spinner.fail('no template handler found!');
      return 1;
    }

    try {
      await processTemplate({
        ...templateProps,
        logLevel,
        cwd: this.cwd,
        initialVariables: { name: this.name, description: this.description },
        overwrite: true,
      });
      spinner.succeed('template processed successfully');
    } catch (error) {
      spinner.fail('failed to process template');
      if (error instanceof Error) {
        logger.error(error.message);
      }

      return 1;
    }

    return 0;
  }
}

const DIRNAME = path.dirname(new URL(import.meta.url).pathname);

/**
 * Get the absolute path within this package.
 */
export function getPackagePath(...paths: string[]) {
  return path.join(DIRNAME, '..', ...paths);
}

export interface MonotsTemplateHandlerProps {
  /**
   * The current working directory.
   */
  cwd: string;

  /**
   * The name of the package being created.
   */
  name: string;

  /**
   * The source directory of the template.
   */
  source: string | undefined;

  /**
   * The template provided. If not provided, plugins can provide a default
   * template to use.
   */
  template: string | undefined;

  /**
   * True when a template was matched from the templates.
   */
  matched: boolean;
}

interface GetTemplatePropsResult {
  source: string;
  destination: string;
  install: InstallCommand;
}

export interface MonotsTemplateHandler {
  /**
   * The name of the templates and the source directory. The source is copied to
   * a temporary directory since an installation happens here.
   */
  templates: { [key: string]: string };

  /**
   * This handler is called when the template provided was not found but
   * downloaded to a temporary location via `degit`. Look up the source
   * directory and check if it should be handled with this handler. When it
   * should be handled by this handler return the destination.
   *
   * You can also update the source.
   */
  getTemplateProps: (
    context: MonotsTemplateHandlerProps,
  ) => Promise<GetTemplatePropsResult | undefined>;
}

declare global {
  namespace monots {
    interface Templates {}
    interface Events {
      /**
       * Register template handlers for the provided template.
       */
      'command:create:handlers': () => MonotsTemplateHandler;
    }
  }
}
