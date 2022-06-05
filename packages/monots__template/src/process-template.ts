import { deepMerge, is, resolvePath } from '@monots/utils';
import { execa as baseExeca } from 'execa';
import { prompt } from 'inquirer';
import type { LoadEsmConfigOptions } from 'load-esm-config';
import { loadEsmConfig } from 'load-esm-config';
import type { GetPattern } from 'load-esm-config/src/constants.js';
import * as path from 'node:path';
import type { CopyOperation } from 'recursive-copy';
import type { Except } from 'type-fest';

import { copyTemplate } from './copy-template.js';
import type { InstallCommand, MonotsTemplateConfig, MonotsTemplateProps } from './types.js';

export interface LoadTemplateProps
  extends Except<
      LoadEsmConfigOptions,
      'name' | 'getArgument' | 'getPattern' | 'disableUpwardLookup'
    >,
    Pick<MonotsTemplateProps, 'source' | 'destination' | 'cliArguments'> {
  /**
   * The template props added to the argument.
   */
  templateProps: monots.TemplateProps;

  /**
   * The install command that will be called after the template is copied to the
   * destination.
   */
  install: InstallCommand<{ execa: typeof baseExeca }>;

  /**
   * Whether to overwrite destination files.
   */
  overwrite?: boolean;
}

/**
 * Load the template file from the source and process the template.
 */
export async function processTemplate(props: LoadTemplateProps) {
  const execa = createExeca(props.destination);
  const templateProps = {
    ...props.templateProps,
    cliArguments: props.cliArguments,
    source: props.source,
    destination: props.destination,
    execa,
    cwd: props.cwd ?? process.cwd(),
  };
  const getArgument = (): MonotsTemplateProps => templateProps;

  const result = (await loadEsmConfig<MonotsTemplateConfig, MonotsTemplateProps>({
    getPattern,
    getArgument,
    cwd: props.source,
    dirs: [''],
    config: props.config,
    logLevel: props.logLevel,
    name: 'monots',
    alias: {
      // '@monots/template': await resolvePath('@monots/template', {
      //   url: import.meta.url,
      //   extensions: ['.ts', '.tsx', '.mts', '.cts', '.mjs', '.cjs', '.js', '.json'],
      // }),
      '@monots/template': await resolvePath('@monots/template', import.meta.url),
      ...props.alias,
    },
    disableUpwardLookup: true,
  })) ?? {
    config: deepMerge([DEFAULT_CONFIG, props.config ?? {}]),
    dependencies: [],
    path: undefined,
    root: undefined,
  };

  let variables = result.config.defaultVariables ?? {};
  variables = result.config.gatherVariables
    ? await result.config.gatherVariables({
        ...templateProps,
        defaultVariables: variables,
        prompt,
      })
    : variables;
  const { rename = {}, ignore = [] } = result.config.renamePaths
    ? await result.config.renamePaths({ ...templateProps, variables })
    : {};

  if (result.path && result.root) {
    // todo probably shouldn't mutate the result: change if issue is raised
    ignore.push(path.relative(result.root, result.path));
  }

  const results = await copyTemplate({
    destination: props.destination,
    source: props.source,
    rename,
    ignore,
    variables,
    customTemplateFiles: result.config.customTemplateFiles,
    overwrite: props.overwrite,
  });

  const install = getInstallCommand({
    templateProps,
    results,
    variables,
    custom: result.config.installCommand,
    filepath: result.path,
    initial: props.install,
  });

  if (result.config.preInstall) {
    await result.config.preInstall({ ...templateProps, results, variables, filepath: result.path });
  }

  await install();

  if (result.config.postInstall) {
    await result.config.postInstall({
      ...templateProps,
      results,
      variables,
      filepath: result.path,
      install,
    });
  }
}

const DEFAULT_CONFIG: MonotsTemplateConfig = {
  customTemplateFiles: {},
  defaultVariables: {},
  gatherVariables: async () => ({}),
};

const getPattern: GetPattern = (props) => {
  return [path.join(props.directory, `${props.name}.template${props.extension}`)];
};

interface GetInstallCommand {
  results: CopyOperation[];
  variables: Record<string, any>;
  templateProps: MonotsTemplateProps;
  initial: InstallCommand<{ execa: typeof baseExeca }>;
  custom: MonotsTemplateConfig['installCommand'];
  filepath?: string;
}

/**
 * Get the installation command.
 */
function getInstallCommand(props: GetInstallCommand): () => Promise<void> {
  const { custom, initial, templateProps, variables, filepath, results } = props;
  let install: () => Promise<void>;
  const { execa } = templateProps;

  if (is.array(initial)) {
    const [file, rest = []] = initial;

    install = async () => {
      await execa(file, rest, { stdio: 'inherit' });
    };
  } else {
    install = async () => {
      await initial({ execa });
    };
  }

  if (is.array(custom)) {
    const [file, rest = []] = custom;

    return async () => {
      await execa(file, rest, { stdio: 'inherit' });
    };
  }

  if (is.function_(custom)) {
    return async () => {
      await custom({ ...templateProps, variables, filepath, install, results });
    };
  }

  return install;
}

function createExeca(cwd: string): typeof baseExeca {
  const defaultOptions = { cwd };

  return function execa(...args: any[]) {
    const [file, segments, options] = args;

    if (args.length === 1) {
      return baseExeca(file, defaultOptions);
    }

    if (args.length === 2 && is.plainObject(segments)) {
      return baseExeca(file, { ...defaultOptions, ...segments });
    }

    return baseExeca(file, segments, { ...defaultOptions, ...options });
  } as any;
}
