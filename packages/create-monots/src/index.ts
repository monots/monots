#!/usr/bin/env node
/* eslint-disable unicorn/prefer-module */

import chalk from 'chalk';
import chalkTemplate from 'chalk-template';
import meow from 'meow';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import prompts from 'prompts';

import { createMonotsProject, DownloadError } from './create-monots.js';
import { validateNpmName } from './helpers/validate-pkg.js';

let IMPORT_META: ImportMeta;
let DIRNAME: string;

try {
  DIRNAME = path.dirname(new URL(import.meta.url).pathname);
} catch (error) {
  if (typeof __dirname === 'string') {
    DIRNAME = __dirname;
  } else {
    throw error;
  }
}

try {
  IMPORT_META =
    typeof import.meta === 'object' && typeof import.meta.url === 'string'
      ? import.meta
      : {
          url: pathToFileURL(DIRNAME).href,
        };
} catch {
  IMPORT_META = {
    url: pathToFileURL(DIRNAME).href,
  };
}

const cli = meow(
  chalkTemplate`
        {bold Usage}
          {grey $} {blue create-monots} {grey <}input{grey >}

        {bold Options}
          {magenta {grey --}example}{grey ,} {magenta {grey -}e} {grey [}NAME{grey ]|[}GITHUB_URL{grey ]}

          An example to bootstrap the app with. You can use an example name
          from the official monots repo or a GitHub URL. The URL can use
          any branch and/or subdirectory.

          {magenta {grey --}example-path} {grey <}path-to-example{grey >}

          In a rare case, your GitHub URL might contain a branch name with
          a slash (e.g. bug/fix-1) and the path to the example (e.g. foo/bar).
          In this case, you must specify the path to the example separately:
          --example-path foo/bar.

        {bold Examples}
          {grey $} {blue create-monots} my-awesome-package
`,
  {
    importMeta: IMPORT_META,
    flags: {
      example: { alias: 'e', type: 'string' },
      examplePath: { type: 'string' },
      help: { alias: 'h', type: 'boolean' },
      version: { alias: 'v', type: 'boolean' },
    },
  },
);

async function run(): Promise<void> {
  let projectPath = cli.input[0];
  console.log(cli.flags);

  if (cli.flags.help) {
    console.log(cli.help);
    return;
  }

  if (cli.flags.version) {
    console.log(cli.pkg.version);
    return;
  }

  if (typeof projectPath === 'string') {
    projectPath = projectPath.trim();
  }

  if (!projectPath) {
    const res = await prompts([
      {
        type: 'text',
        name: 'path',
        message: 'What is your project named?',
        initial: 'my-project',
        validate: (name) => {
          const validation = validateNpmName(path.basename(path.resolve(name)));

          if (validation.valid) {
            return true;
          }

          return `Invalid project name: ${validation.problems?.[0]}`;
        },
      },
    ]);

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
    console.log(`  ${chalk.cyan(cli.pkg.name)} ${chalk.green('my-package')}`);
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

run().catch(async (error) => {
  console.log();
  console.log('Aborting installation.');

  if (error.command) {
    console.log(`  ${chalk.cyan(error.command)} has failed.`);
  } else {
    console.log(chalk.red('Unexpected error. Please report it as a bug:'));
    console.log(error);
  }

  console.log();

  process.exit(1);
});
