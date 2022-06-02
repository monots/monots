import { loadConfig, NAME } from '@monots/core';
import type { CommandContext } from '@monots/types';
import { getPackageJsonSync } from '@monots/utils';
import { Builtins, Cli } from 'clipanion';
import parser from 'yargs-parser';

const { version, description = '', name } = getPackageJsonSync();

/**
 * Loads the `monots` configuration and uses it to register all commands.
 */
export async function createCli() {
  const argv = parser(process.argv.slice(2));
  const logLevel = argv.logLevel || argv.l;
  const result = await loadConfig();

  if (!result) {
    throw new Error('No configuration found for `monots`');
  }

  const cli = new Cli<CommandContext>({
    binaryLabel: description,
    binaryName: NAME,
    binaryVersion: version,
  });

  cli.register(Builtins.HelpCommand);
  cli.register(Builtins.VersionCommand);

  // Gather commands
}

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
