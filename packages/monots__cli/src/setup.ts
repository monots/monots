import { NAME } from '@monots/core';
import type { CommandContext } from '@monots/types';
import { Builtins, Cli } from 'clipanion';

import { BuildCommand, CheckCommand, FixCommand, InitCommand, PrepareCommand } from './commands';
import { getPackageJson } from './helpers';

const { version, description = '', name } = getPackageJson();

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

export const context: CommandContext = {
  internal: false,
  version,
  description,
  name,
  cwd: process.cwd(),
  stdin: process.stdin,
  stdout: process.stdout,
  stderr: process.stderr,
};
