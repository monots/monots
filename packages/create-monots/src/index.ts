#!/usr/bin/env node

import { getPackageJson, notifyUpdate } from '@monots/core';
import chalk from 'chalk';
import Commander from 'commander';
import path from 'node:path';
import prompts from 'prompts';

import { createApp, DownloadError } from './create-monots';
import { validateNpmName } from './helpers/validate-pkg';

let projectPath = '';

const packageJson = getPackageJson();

const program = new Commander.Command(packageJson.name)
  .version(packageJson.version)
  .arguments('<project-directory>')
  .usage(`${chalk.green('<project-directory>')} [options]`)
  .action((name) => {
    projectPath = name;
  })
  .option(
    '--ts, --typescript',
    `

  Initialize as a TypeScript project.
`,
  )
  .option(
    '--use-npm',
    `

  Explicitly tell the CLI to bootstrap the app using npm
`,
  )
  .option(
    '-e, --example [name]|[github-url]',
    `

  An example to bootstrap the app with. You can use an example name
  from the official Next.js repo or a GitHub URL. The URL can use
  any branch and/or subdirectory
`,
  )
  .option(
    '--example-path <path-to-example>',
    `

  In a rare case, your GitHub URL might contain a branch name with
  a slash (e.g. bug/fix-1) and the path to the example (e.g. foo/bar).
  In this case, you must specify the path to the example separately:
  --example-path foo/bar
`,
  )
  .allowUnknownOption()
  .parse(process.argv);

async function run(): Promise<void> {
  if (typeof projectPath === 'string') {
    projectPath = projectPath.trim();
  }

  if (!projectPath) {
    const res = await prompts({
      type: 'text',
      name: 'path',
      message: 'What is your project named?',
      initial: 'my-app',
      validate: (name) => {
        const validation = validateNpmName(path.basename(path.resolve(name)));

        if (validation.valid) {
          return true;
        }

        return `Invalid project name: ${validation.problems![0]}`;
      },
    });

    if (typeof res.path === 'string') {
      projectPath = res.path.trim();
    }
  }

  if (!projectPath) {
    console.log();
    console.log('Please specify the project directory:');
    console.log(`  ${chalk.cyan(program.name())} ${chalk.green('<project-directory>')}`);
    console.log();
    console.log('For example:');
    console.log(`  ${chalk.cyan(program.name())} ${chalk.green('my-next-app')}`);
    console.log();
    console.log(`Run ${chalk.cyan(`${program.name()} --help`)} to see all options.`);
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

    for (const p of problems!) {
      console.error(`    ${chalk.red.bold('*')} ${p}`);
    }

    process.exit(1);
  }

  if (program.example === true) {
    console.error('Please provide an example name or url, otherwise remove the example option.');
    process.exit(1);
    return;
  }

  const example = typeof program.example === 'string' && program.example.trim();
  try {
    await createApp({
      appPath: resolvedProjectPath,
      useNpm: !!program.useNpm,
      example: example && example !== 'default' ? example : undefined,
      examplePath: program.examplePath,
      typescript: program.typescript,
    });
  } catch (error) {
    if (!(error instanceof DownloadError)) {
      throw error;
    }

    const res = await prompts({
      type: 'confirm',
      name: 'builtin',
      message:
        `Could not download "${example}" because of a connectivity issue between your machine and GitHub.\n` +
        `Do you want to use the default template instead?`,
      initial: true,
    });

    if (!res.builtin) {
      throw error;
    }

    await createApp({
      appPath: resolvedProjectPath,
      useNpm: !!program.useNpm,
      typescript: program.typescript,
    });
  }
}

run()
  .then(() =>
    notifyUpdate({ name: packageJson.name, version: packageJson.version, internal: false }),
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

    await notifyUpdate();

    process.exit(1);
  });
