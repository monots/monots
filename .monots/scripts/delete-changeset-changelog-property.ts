/**
 * @script
 *
 * This script edits the `/.changeset/config.json` file so that it doesn't need
 * the GITHUB_TOKEN to be available in order to build the changeset.
 *
 * This allows PR's which don't have access to the `GITHUB_TOKEN` to still pass.
 */

import chalk from 'chalk';
import { loadJsonFile } from 'load-json-file';
import { writeJsonFile } from 'write-json-file';

import { baseDir } from './helpers.js';

async function main() {
  if (!process.env.CI) {
    console.log(chalk.red('Attempted to edit the changeset config in a non CI environment.'));
    console.log('Exiting...');

    return;
  }

  const changesetConfig = await loadJsonFile<object>(baseDir('.changeset', 'config.json'));

  Reflect.deleteProperty(changesetConfig, 'changelog');
  await writeJsonFile(baseDir('.changeset', 'config.json'), changesetConfig);

  console.log(chalk.green.bold('Successfully updated the CI configuration.'));
}

main();
