import {
  generateBaseTsConfig,
  generateMainTsConfig,
  generatePackageTsConfigs,
  GenerateTypeScriptReturn,
} from '@monots/core';
import chalk from 'chalk';
import { Command } from 'clipanion';

import { GenerateTypeScriptProps, renderGenerateTs } from '../../components';
import { colors, notifyUpdate } from '../../utils';
import { BaseCommand, CommandBoolean, GetShapeOfCommandData } from '../base';

export class GenerateTypescriptCommand extends BaseCommand {
  public static usage = Command.Usage({
    description: chalk.hex(colors.lightBlue)('Generate tsconfig files for your project.'),
    details: `
        This command generates the typescript configuration files used throughout the project.

        - It creates the base tsconfig file which includes a 'paths' field. This file should be referenced in the 'extends' field of your main 'tsconfig.json' file. The paths property means that editors can understand your interlinked dependency tree without building.
        - With \`--packages-build,-p\` it can optionally create the package level build files for the project using composite types.
        - With \`--base,-b\` it creates a top level tsconfig.build.json file for building the whole project.
    `,
    examples: [
      [
        'Generate the default base file at `./support/tsconfig.base.json`',
        chalk.hex(colors.pink).italic('$0 generate typescript'),
      ],
      [
        'Generate the default the package and main build tsconfig files.',
        chalk.hex(colors.pink).italic('$0 generate typescript --main-build --packages-build'),
      ],
      [
        'Disable the base tsconfig.',
        chalk.hex(colors.pink).italic('$0 generate typescript --no-base --packages-build'),
      ],
    ],
  });

  /**
   * When true it should generate the base configuration.
   */
  @Command.Boolean('--base,-b')
  public base: CommandBoolean = true;

  /**
   * When true this command should generate the package level build configs.
   */
  @Command.Boolean('--packages-build')
  public packagesBuild: CommandBoolean = false;

  /**
   * When true, it should generate the top level build file.
   */
  @Command.Boolean('--main-build')
  public mainBuild: CommandBoolean = false;

  @BaseCommand.Path('generate ts')
  @BaseCommand.Path('generate typescript')
  public async execute() {
    await renderGenerateTs({ generate: this.generate, verbose: this.verbose, cwd: this.cwd });
    notifyUpdate(this.context);
  }

  /**
   * Generate the typescript json configuration files.
   */
  private readonly generate: GenerateTypeScriptProps['generate'] = async () => {
    let packagesBuildConfig: GenerateTypeScriptReturn | undefined;
    let mainBuildConfig: GenerateTypeScriptReturn | undefined;
    let baseConfig: GenerateTypeScriptReturn | undefined;

    if (this.packagesBuild) {
      packagesBuildConfig = await generatePackageTsConfigs();
    }

    if (this.base) {
      baseConfig = await generateBaseTsConfig();
    }

    if (this.mainBuild) {
      mainBuildConfig = await generateMainTsConfig();
    }

    return async () => {
      await Promise.all([
        mainBuildConfig?.write(),
        packagesBuildConfig?.write(),
        baseConfig?.write(),
      ]);

      return { packagesBuildConfig, mainBuildConfig, baseConfig };
    };
  };
}

declare global {
  interface AvailableCommands {
    'generate ts': GetShapeOfCommandData<GenerateTypescriptCommand>;
    'generate typescript': GetShapeOfCommandData<GenerateTypescriptCommand>;
  }
}
