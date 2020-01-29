import { Command } from 'clipanion';

import { BaseCommand } from './base';

export class HelpCommand extends BaseCommand {
  @Command.Path('--help')
  @Command.Path('-h')
  public async execute() {
    this.context.stdout.write(this.cli.usage(null, { detailed: this.verbose }));
  }
}

export class VersionCommand extends BaseCommand {
  @Command.Path('--version')
  @Command.Path('-v')
  public async execute() {
    const { version, name, stdout } = this.context;
    if (this.verbose) {
      stdout.write(
        `${name}: ${version}\nnode: ${process.version}\nos: ${process.platform} ${process.arch}}\n`,
      );
    } else {
      stdout.write(`${version}\n`);
    }
  }
}

export { GenerateTypescriptCommand, GenerateCommand } from './generate';
