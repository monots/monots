#!/usr/bin/env node

import './side-effects';

import { Cli } from 'clipanion';

import {
  CreateCommand,
  GenerateCommand,
  GenerateTypescriptCommand,
  HelpCommand,
  VersionCommand,
} from './commands';
import { CommandContext } from './types';
import { getPackageJson } from './utils';

const { version, description, name } = getPackageJson();

const cli = new Cli<CommandContext>({
  binaryLabel: description,
  binaryName: `monots`,
  binaryVersion: version,
});

cli.register(HelpCommand);
cli.register(VersionCommand);
cli.register(GenerateCommand);
cli.register(GenerateTypescriptCommand);
cli.register(CreateCommand);

cli.runExit(process.argv.slice(2), {
  internal: false,
  version,
  description,
  name,
  cwd: process.cwd(),
  stdin: process.stdin,
  stdout: process.stdout,
  stderr: process.stderr,
});
