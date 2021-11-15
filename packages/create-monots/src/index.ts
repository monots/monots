#!/usr/bin/env node

import { notifyUpdate } from '@monots/core';
import chalk from 'chalk';
import meow from 'meow';
import path from 'node:path';
import prompts from 'prompts';

import { createMonotsProject, DownloadError } from './create-monots';
import { validateNpmName } from './helpers/validate-pkg';

const cli = meow(
  `
        Usage
          $ create-monots <input>

        Options
          --example, -e [name]|[github-url]

          An example to bootstrap the app with. You can use an example name
          from the official monots repo or a GitHub URL. The URL can use
          any branch and/or subdirectory.

          --example-path <path-to-example>

          In a rare case, your GitHub URL might contain a branch name with
          a slash (e.g. bug/fix-1) and the path to the example (e.g. foo/bar).
          In this case, you must specify the path to the example separately:
          --example-path foo/bar.

        Examples
          $ create-monots my-awesome-package
`,
  {
    autoHelp: true,
    autoVersion: true,
    importMeta: import.meta,
    flags: {
      example: { alias: 'e', type: 'string' },
      examplePath: { type: 'string' },
    },
  },
);

async function run(): Promise<void> {
  let projectPath = cli.input[0];

  if (typeof projectPath === 'string') {
    projectPath = projectPath.trim();
  }

  if (!projectPath) {
    const res = await prompts({
      type: 'text',
      name: 'path',
      message: 'What is your project named?',
      initial: 'awesome-project',
      validate: (name) => {
        const validation = validateNpmName(path.basename(path.resolve(name)));

        if (validation.valid) {
          return true;
        }

        return `Invalid project name: ${validation.problems?.[0]}`;
      },
    });

    if (typeof res.path === 'string') {
      projectPath = res.path.trim();
    }
  }

  if (!projectPath) {
    console.log();
    console.log('Please specify the project directory:');
    console.log(`  ${chalk.cyan(cli.pkg.name)} ${chalk.green('<project-directory>')}`);
    console.log();
    console.log('For example:');
    console.log(`  ${chalk.cyan(cli.pkg.name)} ${chalk.green('my-awesome-package')}`);
    console.log();
    console.log(`Run ${chalk.cyan(`${cli.pkg.name} --help`)} to see all options.`);
    process.exit(1);
  }

  const resolvedProjectPath = path.resolve(projectPath);
  const projectName = path.basename(resolvedProjectPath);

  const { valid, problems } = validateNpmName(projectName);

  if (!valid) {
    console.error(
      `Could not create a project called ${chalk.red(
        `"${projectName}"`,
      )} because of npm naming restrictions:`,
    );

    for (const problem of problems ?? []) {
      console.error(`    ${chalk.red.bold('*')} ${problem}`);
    }

    process.exit(1);
  }

  const example = cli.flags.example;

  try {
    await createMonotsProject({
      appPath: resolvedProjectPath,
      example: example && example !== 'default' ? example : undefined,
      examplePath: cli.flags.examplePath,
    });
  } catch (error) {
    if (!(error instanceof DownloadError)) {
      throw error;
    }

    const response = await prompts({
      type: 'confirm',
      name: 'builtin',
      message:
        `Could not download "${example}" because of a connectivity issue between your machine and GitHub.\n` +
        `Do you want to use the default template instead?`,
      initial: true,
    });

    if (!response.builtin) {
      throw error;
    }

    await createMonotsProject({
      appPath: resolvedProjectPath,
    });
  }
}

run()
  .then(() =>
    notifyUpdate({ name: cli.pkg.name ?? '', version: cli.pkg.version ?? '', internal: false }),
  )
  .catch(async (error) => {
    console.log();
    console.log('Aborting installation.');

    if (error.command) {
      console.log(`  ${chalk.cyan(error.command)} has failed.`);
    } else {
      console.log(chalk.red('Unexpected error. Please report it as a bug:'));
      console.log(error);
    }

    console.log();

    notifyUpdate({
      name: cli.pkg.name ?? '',
      version: cli.pkg.version ?? '',
      internal: false,
    });

    process.exit(1);
  });
