import { NAME } from '@monots/core';
import type { CommandContext } from '@monots/types';
import { getPackageJsonSync } from '@monots/utils';
import { Builtins, Cli } from 'clipanion';

import {
  BuildCommand,
  CheckCommand,
  CreateCommand,
  FixCommand,
  InitCommand,
  PrepareCommand,
} from './commands/index.js';

const { version, description = '', name } = getPackageJsonSync();

export const cli = new Cli<CommandContext>({
  binaryLabel: description,
  binaryName: NAME,
  binaryVersion: version,
});

cli.register(Builtins.HelpCommand);
cli.register(Builtins.VersionCommand);
cli.register(InitCommand);
cli.register(PrepareCommand);
cli.register(FixCommand);
cli.register(BuildCommand);
cli.register(CheckCommand);
cli.register(CreateCommand);

/**
 * Loads the `monots` configuration and uses it to register all commands.
 */
export function registerCommands() {}

export const context: CommandContext = {
  internal: false,
  version,
  description,
  name,
  colorDepth: 256,
  env: process.env,
  cwd: process.cwd(),
  stdin: process.stdin,
  stdout: process.stdout,
  stderr: process.stderr,
};
