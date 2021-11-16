/* eslint-disable unicorn/prefer-module */
import { copyTemplate } from '@monots/utils';
import retry from 'async-retry';
import chalk from 'chalk';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import {
  downloadAndExtractExample,
  downloadAndExtractRepo,
  getRepoInfo,
  hasExample,
  hasRepo,
  RepoInfo,
} from './helpers/examples.js';
import { tryGitInit } from './helpers/git.js';
import { pnpmInstall } from './helpers/install.js';
import { isFolderEmpty } from './helpers/is-folder-empty.js';
import { isWriteable } from './helpers/is-writeable.js';
import { makeDir } from './helpers/make-dir.js';

export class DownloadError extends Error {}

interface CreateMonotsProjectProps {
  appPath: string;
  example?: string;
  examplePath?: string;
}

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

export async function createMonotsProject(props: CreateMonotsProjectProps): Promise<void> {
  const { appPath, example, examplePath } = props;
  let repoInfo: RepoInfo | undefined;

  if (example) {
    let repoUrl: URL | undefined;

    try {
      repoUrl = new URL(example);
    } catch (error: any) {
      if (error.code !== 'ERR_INVALID_URL') {
        console.error(error);
        process.exit(1);
      }
    }

    if (repoUrl) {
      if (repoUrl.origin !== 'https://github.com') {
        console.error(
          `Invalid URL: ${chalk.red(
            `"${example}"`,
          )}. Only GitHub repositories are supported. Please use a GitHub URL and try again.`,
        );
        process.exit(1);
      }

      repoInfo = await getRepoInfo(repoUrl, examplePath);

      if (!repoInfo) {
        console.error(
          `Found invalid GitHub URL: ${chalk.red(
            `"${example}"`,
          )}. Please fix the URL and try again.`,
        );
        process.exit(1);
      }

      const found = await hasRepo(repoInfo);

      if (!found) {
        console.error(
          `Could not locate the repository for ${chalk.red(
            `"${example}"`,
          )}. Please check that the repository exists and try again.`,
        );
        process.exit(1);
      }
    } else if (example !== '__internal-testing-retry') {
      const found = await hasExample(example);

      if (!found) {
        console.error(
          `Could not locate an example named ${chalk.red(
            `"${example}"`,
          )}. It could be due to the following:\n`,
          `1. Your spelling of example ${chalk.red(`"${example}"`)} might be incorrect.\n`,
          `2. You might not be connected to the internet.`,
        );
        process.exit(1);
      }
    }
  }

  const root = path.resolve(appPath);

  if (!(await isWriteable(path.dirname(root)))) {
    console.error(
      'The application path is not writable, please check folder permissions and try again.',
    );
    console.error('It is likely you do not have write permissions for this folder.');
    process.exit(1);
  }

  const appName = path.basename(root);

  await makeDir(root);
  const folderEmpty = await isFolderEmpty(root, appName);

  if (!folderEmpty) {
    process.exit(1);
  }

  const displayedCommand = 'pnpm';
  console.log(`Creating a new monots project in ${chalk.green(root)}.`);
  console.log();

  await makeDir(root);
  process.chdir(root);
  const downloadPath = await fs.mkdtemp(path.join(os.tmpdir(), 'create-monots-'));
  const variables = { name: path.basename(appPath), description: 'Created with `create-monots`' };

  if (example) {
    /**
     * If an example repository is provided, clone it.
     */
    try {
      if (repoInfo) {
        const repoInfo2 = repoInfo;
        console.log(
          `Downloading files from repo ${chalk.cyan(example)}. This might take a moment.`,
        );
        console.log();
        await retry(() => downloadAndExtractRepo(root, repoInfo2), { retries: 3 });
      } else {
        console.log(
          `Downloading files for example ${chalk.cyan(example)}. This might take a moment.`,
        );
        console.log();
        await retry(() => downloadAndExtractExample(downloadPath, example), {
          retries: 3,
        });
      }
    } catch (error) {
      throw new DownloadError(isErrorLike(error) ? error.message : `${error}`);
    }

    await copyTemplate({
      input: downloadPath,
      output: root,
      variables,
    });
  } else {
    /**
     * Otherwise, if an example repository is not provided for cloning, proceed
     * by installing from a template.
     */
    console.log(chalk.bold(`Using ${displayedCommand} to install.`));
    const templatePath = path.join(DIRNAME, '../templates', 'default');
    await copyTemplate({
      input: templatePath,
      output: root,
      variables,
    });
  }

  if (await tryGitInit(root)) {
    console.log('Initialized a git repository.');
    console.log();
  }

  console.log('Installing packages. This might take a couple of minutes.');
  console.log();
  await pnpmInstall(root);
  console.log();

  console.log(`${chalk.green('Success!')} Created ${appName} at ${appPath}`);
  console.log('Inside that directory, you can run all the monots commands:');
  console.log();
  console.log('We suggest that you begin by typing:');
  console.log();
  console.log(chalk.cyan('  cd'), appName);
  console.log(`  ${chalk.cyan(`${displayedCommand} install`)}`);
  console.log();
  console.log(
    chalk`Currently {blue \`create-monots\`} requires either a global installation of {bold pnpm} {blue \`npm i -g pnpm\`} or {bold corepack} {blue \`corepack enable \`} to be installed and enabled.`,
  );
  console.log();
}

function isErrorLike(err: unknown): err is { message: string } {
  return (
    typeof err === 'object' &&
    err !== null &&
    typeof (err as { message?: unknown }).message === 'string'
  );
}
