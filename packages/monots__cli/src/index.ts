#!/usr/bin/env node

import chalk from 'chalk';

import { cli, context } from './setup.js';

cli.runExit(process.argv.slice(2), context).catch((error) => {
  console.log(chalk.red('Unexpected error. Please report it as a bug:'));
  console.log(error);
  console.log();
});
