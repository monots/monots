import type { MonotsCommandContext } from '@monots/core';
import { loadConfig, NAME } from '@monots/core';
import type * as _ from '@monots/plugin-commands'; // for the types
import { getPackageJson } from '@monots/utils';
import chalk from 'chalk';
import { Builtins, Cli } from 'clipanion';
import type { LogLevel } from 'load-esm-config';
import { createLogger } from 'load-esm-config';
import parser from 'yargs-parser';

/**
 * Loads the `monots` configuration and uses it to register all commands.
 */
export async function createCli() {
  const [{ version, description = '', name }, result] = await Promise.all([
    getPackageJson(import.meta.url),
    loadConfig(),
  ]);
  const argv = parser(process.argv.slice(2));
  const level: LogLevel = argv.silent ? 'silent' : argv.logLevel ?? 'log';
  const logger = createLogger(level);

  if (!result) {
    logger.error(new Error('No configuration found for `monots`'));
    process.exit(1);
  }

  const logLevel = logger.level;
  const internal = false;
  const cwd = process.cwd();
  const rest = result.cliContext;

  const context = { ...rest, internal, version, description, name, logLevel, logger, cwd };

  const cli = new Cli<MonotsCommandContext>({
    binaryLabel: description,
    binaryName: NAME,
    binaryVersion: version,
  });

  cli.register(Builtins.HelpCommand);
  cli.register(Builtins.VersionCommand);

  for (const command of result.commands) {
    cli.register(command);
  }

  try {
    await cli.runExit(process.argv.slice(2), context);
  } catch (error) {
    logger.error(chalk.red('Unexpected error. Please report it as a bug:'));
    logger.error(error);
  }
}
